import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AutoTestConfig } from '../types/config.js';
import { GeminiService } from './gemini-service.js';

export interface AIService {
  generateTests(filePath: string, fileContent: string, config: AutoTestConfig): Promise<string>;
}

export class OpenAIService implements AIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateTests(filePath: string, fileContent: string, config: AutoTestConfig): Promise<string> {
    try {
      const prompt = this.buildPrompt(filePath, fileContent, config);
      const response = await this.client.chat.completions.create({
        model: config.model || 'gpt-4-turbo',
        messages: [
          { 
            role: "system", 
            content: "You are an expert test engineer specializing in creating comprehensive test suites. Your task is to generate tests for the provided code." 
          },
          { role: "user", content: prompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4096
      });
      
      return response.choices[0]?.message?.content || 'No test could be generated';
    } catch (error) {
      console.error('Error generating tests with OpenAI:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private buildPrompt(filePath: string, fileContent: string, config: AutoTestConfig): string {
    return `
Generate comprehensive tests for the following ${filePath.endsWith('.ts') ? 'TypeScript' : 'JavaScript'} code:

FILE PATH: ${filePath}

FILE CONTENT:
\`\`\`
${fileContent}
\`\`\`

REQUIREMENTS:
- Use ${config.testRunner} as the test runner
- Create tests with a focus on ${config.testDataStrategy} test data
- ${config.generateMocks ? 'Generate mocks for dependencies' : 'Use real dependencies when possible'}
- Use ${config.testNamingConvention} naming convention for test functions
- ${config.includeComments ? 'Include detailed comments explaining test strategies' : 'Keep comments minimal'}
- Test file should use the .${config.testFileExtension} extension with "${config.testFileSuffix}" suffix

The test file should be comprehensive and follow best practices for testing this type of code.
Output only the test code without explanations.
`;
  }
}

export class AnthropicService implements AIService {
  private client: Anthropic;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  async generateTests(filePath: string, fileContent: string, config: AutoTestConfig): Promise<string> {
    try {
      const prompt = this.buildPrompt(filePath, fileContent, config);
      
      // Using appropriate Anthropic API methods based on the actual SDK
      const response = await this.client.beta.messages.create({
        model: config.model || process.env.DEFAULT_ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.7,
        messages: [
          { role: "user", content: prompt }
        ],
        system: "You are an expert test engineer specializing in creating comprehensive test suites. Your task is to generate tests for the provided code."
      });
      
      return response.content[0]?.text || 'No test could be generated';
    } catch (error) {
      console.error('Error generating tests with Anthropic:', error);
      throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private buildPrompt(filePath: string, fileContent: string, config: AutoTestConfig): string {
    return `
Generate comprehensive tests for the following ${filePath.endsWith('.ts') ? 'TypeScript' : 'JavaScript'} code:

FILE PATH: ${filePath}

FILE CONTENT:
\`\`\`
${fileContent}
\`\`\`

REQUIREMENTS:
- Use ${config.testRunner} as the test runner
- Create tests with a focus on ${config.testDataStrategy} test data
- ${config.generateMocks ? 'Generate mocks for dependencies' : 'Use real dependencies when possible'}
- Use ${config.testNamingConvention} naming convention for test functions
- ${config.includeComments ? 'Include detailed comments explaining test strategies' : 'Keep comments minimal'}
- Test file should use the .${config.testFileExtension} extension with "${config.testFileSuffix}" suffix

The test file should be comprehensive and follow best practices for testing this type of code.
Output only the test code without explanations.
`;
  }
}

export function createAIService(config: AutoTestConfig): AIService {
  switch (config.modelProvider) {
    case 'openai':
      return new OpenAIService();
    case 'anthropic':
      return new AnthropicService();
    case 'gemini':
      return new GeminiService();
    default:
      // Default to Gemini as it's a free option
      return new GeminiService();
  }
}

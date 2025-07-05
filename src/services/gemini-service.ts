import { AIService } from './ai-service.js';
import { AutoTestConfig } from '../types/config.js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

export class GeminiService implements AIService {
  private apiKey: string;

  static async validateApiKey(targetDir?: string): Promise<void> {
    // Try loading .env from targetDir if not found in current dir
    let envLoaded = false;
    if (!process.env.GEMINI_API_KEY && targetDir && targetDir !== process.cwd()) {
      const envPath = path.resolve(targetDir, '.env');
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        envLoaded = true;
      }
    }
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      const url = 'https://aistudio.google.com/app/apikey';
      if (process.stdout.isTTY) {
        console.error('\x1b[31mGEMINI_API_KEY is not set.\x1b[0m');
        console.error('To use Gemini, you need an API key.');
        console.error(`You can get one at: \x1b[36m${url}\x1b[0m`);
        const readlineModule = await import('readline');
        const readline = readlineModule.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        // Wrap readline.question in a Promise for async/await
        const answer: string = await new Promise(resolve => {
          readline.question('Open Gemini API key page in your browser now? (Y/n): ', resolve);
        });
        readline.close();
        if (answer.trim().toLowerCase() === '' || answer.trim().toLowerCase() === 'y') {
          const open = (await import('open')).default;
          await open(url);
          console.log('After copying your API key, paste it into a file named .env in your project root:');
          console.log('\nGEMINI_API_KEY=your_gemini_api_key_here\n');
          const envPath = path.resolve(targetDir || process.cwd(), '.env');
          if (!fs.existsSync(envPath)) {
            fs.writeFileSync(envPath, 'GEMINI_API_KEY=\n');
            console.log(`Created .env file at ${envPath}`);
          }
        }
        process.exit(1);
      } else {
        throw new Error('GEMINI_API_KEY is not set. Please set your Gemini API key in your environment or .env file.');
      }
    }
  }

  constructor(targetDir?: string) {
    // Try loading .env from targetDir if not found in current dir
    if (!process.env.GEMINI_API_KEY && targetDir && targetDir !== process.cwd()) {
      const envPath = path.resolve(targetDir, '.env');
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
      }
    }
    this.apiKey = process.env.GEMINI_API_KEY || '';
    // No key check here; handled by validateApiKey()
  }

  async generateTests(filePath: string, fileContent: string, config: AutoTestConfig): Promise<string> {
    try {
      const prompt = this.buildPrompt(filePath, fileContent, config);
      
      // Use Gemini API
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
      const body = JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              }
            ]
          }
        ],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 4096,
        },
      });
      const response = await fetch(`${url}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body).toString(),
        },
        body,
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API request failed with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract text from the response based on Gemini's API structure
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No content returned from Gemini API');
      }
      
      return content;
    } catch (error) {
      console.error('Error generating tests with Gemini:', error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
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

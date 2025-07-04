import { jest } from '@jest/globals';
import { OpenAIService, AnthropicService, createAIService } from '../../services/ai-service';
import { AutoTestConfig } from '../../types/config';

// Mock OpenAI and Anthropic
jest.mock('openai');
jest.mock('@anthropic-ai/sdk');

describe('AI Service Tests', () => {
  const mockConfig: AutoTestConfig = {
    testRunner: 'jest',
    modelProvider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 4096,
    testNamingConvention: 'camelCase',
    testFileExtension: 'ts',
    testFileSuffix: '.spec',
    generateMocks: true,
    testDataStrategy: 'comprehensive',
    includeComments: true,
  };

  const mockFilePath = 'src/utils/formatter.ts';
  const mockFileContent = `
    export function formatString(str: string): string {
      return str.trim().toLowerCase();
    }
  `;

  beforeEach(() => {
    jest.clearAllMocks();
    // Set environment variables for testing
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe('OpenAIService', () => {
    let openAIService: OpenAIService;

    beforeEach(() => {
      openAIService = new OpenAIService();
    });

    test('should generate tests using OpenAI', async () => {
      const testContent = await openAIService.generateTests(mockFilePath, mockFileContent, mockConfig);
      
      expect(testContent).toContain('describe');
      expect(testContent).toContain('it');
      expect(testContent).toContain('expect');
    });

    test('should handle errors from OpenAI API', async () => {
      // Mock the OpenAI client to throw an error
      const openaiModule = await import('openai');
      const mockOpenAI = openaiModule.default();
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error('API error'));

      await expect(openAIService.generateTests(mockFilePath, mockFileContent, mockConfig))
        .rejects
        .toThrow('OpenAI API error: API error');
    });
  });

  describe('AnthropicService', () => {
    let anthropicService: AnthropicService;

    beforeEach(() => {
      anthropicService = new AnthropicService();
    });

    test('should generate tests using Anthropic', async () => {
      const testContent = await anthropicService.generateTests(mockFilePath, mockFileContent, mockConfig);
      
      expect(testContent).toContain('describe');
      expect(testContent).toContain('it');
      expect(testContent).toContain('expect');
    });

    test('should handle errors from Anthropic API', async () => {
      // Mock the Anthropic client to throw an error
      const anthropicModule = await import('@anthropic-ai/sdk');
      const mockAnthropic = anthropicModule.default();
      mockAnthropic.messages.create.mockRejectedValueOnce(new Error('API error'));

      await expect(anthropicService.generateTests(mockFilePath, mockFileContent, mockConfig))
        .rejects
        .toThrow('Anthropic API error: API error');
    });
  });

  describe('createAIService', () => {
    test('should create OpenAI service when modelProvider is openai', () => {
      const config = { ...mockConfig, modelProvider: 'openai' };
      const service = createAIService(config);
      
      expect(service).toBeInstanceOf(OpenAIService);
    });

    test('should create Anthropic service when modelProvider is anthropic', () => {
      const config = { ...mockConfig, modelProvider: 'anthropic' };
      const service = createAIService(config);
      
      expect(service).toBeInstanceOf(AnthropicService);
    });

    test('should default to OpenAI service for unknown modelProvider', () => {
      const config = { ...mockConfig, modelProvider: 'unknown' as any };
      const service = createAIService(config);
      
      expect(service).toBeInstanceOf(OpenAIService);
    });
  });
});

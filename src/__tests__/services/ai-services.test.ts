import { createAIService } from '../../services/ai-service';
import { GeminiService } from '../../services/gemini-service';
import { AutoTestConfig } from '../../types/config';

// Mock fetch
const mockFetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      candidates: [{
        content: {
          parts: [{
            text: 'import { describe, it, expect } from "jest";\n\ndescribe("add", () => {\n  it("should add two numbers", () => {\n    expect(add(1, 2)).toBe(3);\n  });\n});'
          }]
        }
      }]
    })
  })
);

// Mock modules
jest.mock('openai');
jest.mock('@anthropic-ai/sdk');
jest.mock('node-fetch', () => mockFetch);

describe('AI Service Tests', () => {
  const filePath = 'test-file.ts';
  const fileContent = 'function add(a: number, b: number): number { return a + b; }';
  
  // Test config objects with correct types
  const openaiConfig: AutoTestConfig = {
    testRunner: 'jest',
    modelProvider: 'openai',
    model: 'gpt-4',
    testNamingConvention: 'camelCase',
    testFileExtension: 'ts',
    testFileSuffix: '.spec',
    generateMocks: true,
    testDataStrategy: 'comprehensive',
    includeComments: true
  };
  
  const anthropicConfig: AutoTestConfig = {
    ...openaiConfig,
    modelProvider: 'anthropic',
    model: 'claude-3-opus-20240229'
  };
  
  const geminiConfig: AutoTestConfig = {
    ...openaiConfig,
    modelProvider: 'gemini',
    model: 'gemini-pro'
  };
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });
  
  it('should create OpenAI service when provider is openai', () => {
    const service = createAIService(openaiConfig);
    expect(service.constructor.name).toBe('OpenAIService');
  });
  
  it('should create Anthropic service when provider is anthropic', () => {
    const service = createAIService(anthropicConfig);
    expect(service.constructor.name).toBe('AnthropicService');
  });
  
  it('should create Gemini service when provider is gemini', () => {
    const service = createAIService(geminiConfig);
    expect(service.constructor.name).toBe('GeminiService');
  });
  
  it('should default to Gemini service when provider is not specified', () => {
    // Use type assertion for this test case
    const badConfig = { ...openaiConfig, modelProvider: undefined as any };
    const service = createAIService(badConfig);
    expect(service.constructor.name).toBe('GeminiService');
  });
  
  describe('Gemini Service', () => {
    let geminiService: GeminiService;
    
    beforeEach(() => {
      geminiService = new GeminiService();
    });
    
    it('should call Gemini API and return test content', async () => {
      const result = await geminiService.generateTests(filePath, fileContent, geminiConfig);
      
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toContain('describe("add"');
      expect(result).toContain('expect(add(1, 2))');
    });
  });
});

import { jest } from '@jest/globals';
import { GeminiService } from '../../services/gemini-service';
import { AutoTestConfig } from '../../types/config';

// Mock global fetch
const mockFetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);
global.fetch = mockFetch as unknown as typeof fetch;

describe('GeminiService Tests', () => {
  const mockConfig: AutoTestConfig = {
    testRunner: 'jest',
    modelProvider: 'gemini',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 4096,
    testNamingConvention: 'camelCase',
    testFileExtension: 'ts',
    testFileSuffix: '.spec',
    generateMocks: true,
    testDataStrategy: 'comprehensive',
    includeComments: true,
    excludePatterns: [],
  };

  const mockFilePath = 'src/utils/formatter.ts';
  const mockFileContent = 'export function formatString(str) { return str.trim().toLowerCase(); }';

  let consoleWarnMock: jest.Mock;
  let consoleErrorMock: jest.Mock;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnMock = jest.fn();
    consoleErrorMock = jest.fn();
    jest.spyOn(console, 'warn').mockImplementation(consoleWarnMock);
    jest.spyOn(console, 'error').mockImplementation(consoleErrorMock);
    process.env = { ...originalEnv };
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  test('should initialize with API key from environment', () => {
    const geminiService = new GeminiService();
    expect(consoleWarnMock).not.toHaveBeenCalled();
  });

  test('should warn if API key is not set', () => {
    delete process.env.GEMINI_API_KEY;
    const geminiService = new GeminiService();
    expect(consoleWarnMock).toHaveBeenCalledWith(
      'Warning: GEMINI_API_KEY not set. Gemini API will not work properly.'
    );
  });

  test('should generate tests successfully', async () => {
    const geminiService = new GeminiService();
    
    // Mock fetch response
    const mockResponseData = {
      candidates: [{
        content: {
          parts: [{ text: 'import { describe, it, expect } from "jest";\n\ndescribe("formatString", () => {})' }]
        }
      }]
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponseData
    } as Response);

    const result = await geminiService.generateTests(mockFilePath, mockFileContent, mockConfig);
    
    // Verify fetch was called with correct URL and API key
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'),
      expect.anything()
    );
    
    // Verify the result
    expect(result).toBe('import { describe, it, expect } from "jest";\n\ndescribe("formatString", () => {})');
  });

  test('should handle API errors', async () => {
    const geminiService = new GeminiService();
    
    // Mock fetch to return an error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    } as Response);

    await expect(geminiService.generateTests(mockFilePath, mockFileContent, mockConfig))
      .rejects
      .toThrow('Gemini API error: Gemini API request failed with status: 401');
    
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  test('should handle empty response content', async () => {
    const geminiService = new GeminiService();
    
    // Mock fetch with empty response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [] } }]
      })
    } as Response);

    await expect(geminiService.generateTests(mockFilePath, mockFileContent, mockConfig))
      .rejects
      .toThrow('Gemini API error: No content returned from Gemini API');
  });

  test('should handle network errors', async () => {
    const geminiService = new GeminiService();
    
    // Mock fetch to throw network error
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    await expect(geminiService.generateTests(mockFilePath, mockFileContent, mockConfig))
      .rejects
      .toThrow('Gemini API error: Network failure');
    
    expect(consoleErrorMock).toHaveBeenCalled();
  });
});

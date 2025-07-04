import { jest } from '@jest/globals';
import { defaultConfig } from '../../types/config';

describe('Config Types', () => {
  // Save original env
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });
  
  test('defaultConfig should have expected properties', () => {
    expect(defaultConfig).toHaveProperty('testRunner', 'jest');
    expect(defaultConfig).toHaveProperty('modelProvider', 'openai');
    expect(defaultConfig).toHaveProperty('testNamingConvention', 'camelCase');
    expect(defaultConfig).toHaveProperty('testFileExtension', 'ts');
    expect(defaultConfig).toHaveProperty('testFileSuffix', '.spec');
    expect(defaultConfig).toHaveProperty('generateMocks', true);
    expect(defaultConfig).toHaveProperty('testDataStrategy', 'comprehensive');
    expect(defaultConfig).toHaveProperty('includeComments', true);
  });
  
  test('defaultConfig should use environment variables when available', () => {
    // Set environment variables
    process.env.DEFAULT_MODEL = 'test-model';
    process.env.TEMPERATURE = '0.5';
    process.env.MAX_TOKENS = '2048';
    
    // Re-import to get fresh config with new env vars
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const reloadedConfig = require('../../types/config').defaultConfig;
    
    expect(reloadedConfig.model).toBe('test-model');
    expect(reloadedConfig.temperature).toBe(0.5);
    expect(reloadedConfig.maxTokens).toBe(2048);
  });
});

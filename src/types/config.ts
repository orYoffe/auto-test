import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface AutoTestConfig {
  testRunner: 'jest' | 'vitest' | 'mocha' | 'custom';
  customTestRunnerTemplate?: string;
  modelProvider: 'openai' | 'anthropic' | 'gemini';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  testNamingConvention: 'camelCase' | 'snake_case' | 'kebab-case';
  testFileExtension: 'ts' | 'js';
  testFileSuffix: string;
  testDirectory?: string;
  generateMocks: boolean;
  testDataStrategy: 'random' | 'edge-cases' | 'comprehensive';
  includeComments: boolean;
  excludePatterns?: string[];
}

export const defaultConfig: AutoTestConfig = {
  testRunner: 'jest',
  modelProvider: 'gemini', // Default to Gemini as it's free
  model: 'gemini-pro',
  temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
  testNamingConvention: 'camelCase',
  testFileExtension: 'ts',
  testFileSuffix: '.spec',
  generateMocks: true,
  testDataStrategy: 'comprehensive',
  includeComments: true
};

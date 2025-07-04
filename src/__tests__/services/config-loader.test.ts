import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { AutoTestConfig } from '../../types/config';
import { ConfigLoader } from '../../services/config-loader';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;
  let mockConfig: AutoTestConfig;
  
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Create instance
    configLoader = new ConfigLoader();
    
    // Mock config data
    mockConfig = {
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
    
    // Mock path.isAbsolute
    (path.isAbsolute as jest.Mock).mockImplementation((p: string) => p.startsWith('/') || /^[A-Z]:\\/.test(p));
    
    // Mock path.resolve
    (path.resolve as jest.Mock).mockImplementation((dir, file) => `${dir}/${file}`);
    
    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/mock/cwd');
  });
  
  test('should use default config when no configPath is provided', () => {
    const config = configLoader.loadConfig();
    expect(config).toHaveProperty('testRunner', 'jest');
    expect(config).toHaveProperty('modelProvider', 'openai');
  });
  
  test('should load config from absolute path', () => {
    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));
    
    const config = configLoader.loadConfig('/absolute/path/to/config.json');
    
    expect(fs.readFileSync).toHaveBeenCalledWith('/absolute/path/to/config.json', 'utf8');
    expect(config).toEqual(mockConfig);
  });
  
  test('should load config from relative path', () => {
    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));
    
    const config = configLoader.loadConfig('relative/path/to/config.json');
    
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/cwd/relative/path/to/config.json', 'utf8');
    expect(config).toEqual(mockConfig);
  });
  
  test('should use default config when loading fails', () => {
    // Mock fs.readFileSync to throw an error
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });
    
    // Mock console.warn to prevent output during test
    jest.spyOn(console, 'warn').mockImplementation();
    
    const config = configLoader.loadConfig('non-existent.json');
    
    expect(console.warn).toHaveBeenCalled();
    expect(config).toHaveProperty('testRunner', 'jest');
    expect(config).toHaveProperty('modelProvider', 'openai');
  });
});

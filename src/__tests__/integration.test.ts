import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { ConfigLoader } from '../services/config-loader';
import { FileHandler } from '../services/file-handler';
import { createAIService } from '../services/ai-service';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('glob');
jest.mock('../services/ai-service', () => {
  return {
    createAIService: jest.fn().mockImplementation(() => ({
      generateTests: jest.fn().mockImplementation(() => Promise.resolve('test content'))
    }))
  };
});

describe('Integration Tests', () => {
  let configLoader: ConfigLoader;
  let fileHandler: FileHandler;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    configLoader = new ConfigLoader();
    fileHandler = new FileHandler();
    
    // Mock path methods
    (path.parse as jest.Mock).mockReturnValue({
      root: '/',
      dir: '/src/utils',
      base: 'formatter.ts',
      ext: '.ts',
      name: 'formatter'
    });
    
    (path.isAbsolute as jest.Mock).mockReturnValue(true);
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));
    
    // Mock fs methods
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === '/config.json') {
        return JSON.stringify({
          testRunner: 'jest',
          modelProvider: 'openai'
        });
      }
      return 'export function test() { return true; }';
    });
    
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });
  
  test('End-to-end test flow', async () => {
    // Mock findFiles to return a single file
    const findFilesMock = jest.fn().mockImplementation(() => Promise.resolve(['/src/utils/formatter.ts'])) as unknown as typeof fileHandler.findFiles;
    fileHandler.findFiles = findFilesMock;
    
    // 1. Load config
    const config = configLoader.loadConfig('/config.json');
    
    expect(config).toHaveProperty('testRunner', 'jest');
    expect(config).toHaveProperty('modelProvider', 'openai');
    
    // 2. Find files
    const files = await fileHandler.findFiles(['pattern'], config);
    
    expect(files).toEqual(['/src/utils/formatter.ts']);
    
    // 3. Process file
    const file = files[0];
    const fileContent = fileHandler.readFile(file);
    
    expect(fileContent).toBe('export function test() { return true; }');
    
    // 4. Generate tests with AI service
    const aiService = createAIService(config);
    const testContent = await aiService.generateTests(file, fileContent, config);
    
    expect(testContent).toBe('test content');
    
    // 5. Write test file
    const testFilePath = fileHandler.writeTestFile(file, testContent, config);
    
    expect(testFilePath).toBe('/src/utils/formatter.spec.ts');
    expect(fs.writeFileSync).toHaveBeenCalledWith('/src/utils/formatter.spec.ts', 'test content');
  });
});

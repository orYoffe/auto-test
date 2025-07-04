import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { FileHandler } from '../../services/file-handler';
import { AutoTestConfig } from '../../types/config';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('glob');

describe('FileHandler', () => {
  let fileHandler: FileHandler;
  let mockConfig: AutoTestConfig;
  
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Create instance
    fileHandler = new FileHandler();
    
    // Mock config
    mockConfig = {
      testRunner: 'jest',
      modelProvider: 'openai',
      testNamingConvention: 'camelCase',
      testFileExtension: 'ts',
      testFileSuffix: '.spec',
      generateMocks: true,
      testDataStrategy: 'comprehensive',
      includeComments: true,
    };
    
    // Mock path methods
    (path.parse as jest.Mock).mockReturnValue({
      root: '/',
      dir: '/src/utils',
      base: 'formatter.ts',
      ext: '.ts',
      name: 'formatter'
    });
    
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    (path.resolve as jest.Mock).mockImplementation((...args) => args.join('/'));
  });
  
  describe('findFiles', () => {
    test('should find files matching patterns', async () => {
      // Mock glob
      const mockGlob = glob as jest.Mocked<typeof glob>;
      mockGlob.mockResolvedValueOnce(['src/file1.ts']);
      mockGlob.mockResolvedValueOnce(['src/file2.ts', 'src/file3.ts']);
      
      const files = await fileHandler.findFiles(['pattern1', 'pattern2'], mockConfig);
      
      expect(files).toHaveLength(3);
      expect(files).toEqual(['src/file1.ts', 'src/file2.ts', 'src/file3.ts']);
      expect(glob).toHaveBeenCalledWith('pattern1', { ignore: undefined });
      expect(glob).toHaveBeenCalledWith('pattern2', { ignore: undefined });
    });
    
    test('should remove duplicate files', async () => {
      // Mock glob with duplicates
      const mockGlob = glob as jest.Mocked<typeof glob>;
      mockGlob.mockResolvedValueOnce(['src/file1.ts', 'src/file2.ts']);
      mockGlob.mockResolvedValueOnce(['src/file2.ts', 'src/file3.ts']);
      
      const files = await fileHandler.findFiles(['pattern1', 'pattern2'], mockConfig);
      
      expect(files).toHaveLength(3);
      expect(files).toContain('src/file1.ts');
      expect(files).toContain('src/file2.ts');
      expect(files).toContain('src/file3.ts');
    });
    
    test('should respect exclude patterns', async () => {
      // Set exclude patterns in config
      mockConfig.excludePatterns = ['**/*.test.ts'];
      
      // Mock glob - handle the returned Promise correctly
      (jest.mocked(glob) as unknown as jest.Mock).mockImplementationOnce(() => Promise.resolve(['src/file1.ts']));
      
      await fileHandler.findFiles(['pattern1'], mockConfig);
      
      expect(glob).toHaveBeenCalledWith('pattern1', { ignore: ['**/*.test.ts'] });
    });
  });
  
  describe('readFile', () => {
    test('should read file content', () => {
      const mockContent = 'file content';
      (fs.readFileSync as jest.Mock).mockReturnValue(mockContent);
      
      const content = fileHandler.readFile('src/file.ts');
      
      expect(content).toBe(mockContent);
      expect(fs.readFileSync).toHaveBeenCalledWith('src/file.ts', 'utf8');
    });
    
    test('should throw error if reading fails', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Read error');
      });
      
      expect(() => fileHandler.readFile('non-existent.ts')).toThrow(/Error reading file/);
    });
  });
  
  describe('writeTestFile', () => {
    test('should write test file in same directory', () => {
      // Mock fs functions
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      const testContent = 'test content';
      const sourcePath = '/src/utils/formatter.ts';
      
      const testPath = fileHandler.writeTestFile(sourcePath, testContent, mockConfig);
      
      expect(testPath).toBe('/src/utils/formatter.spec.ts');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/src/utils/formatter.spec.ts', testContent);
    });
    
    test('should write test file in custom directory', () => {
      // Set custom test directory
      mockConfig.testDirectory = '/tests';
      
      // Mock fs functions
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const testContent = 'test content';
      const sourcePath = '/src/utils/formatter.ts';
      
      const testPath = fileHandler.writeTestFile(sourcePath, testContent, mockConfig);
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('/tests', { recursive: true });
      expect(testPath).toBe('/tests/formatter.spec.ts');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/tests/formatter.spec.ts', testContent);
    });
    
    test('should respect custom file extension', () => {
      // Set custom file extension
      mockConfig.testFileExtension = 'js';
      
      // Mock fs functions
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      const testContent = 'test content';
      const sourcePath = '/src/utils/formatter.ts';
      
      const testPath = fileHandler.writeTestFile(sourcePath, testContent, mockConfig);
      
      expect(testPath).toBe('/src/utils/formatter.spec.js');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/src/utils/formatter.spec.js', testContent);
    });
    
    test('should throw error if writing fails', () => {
      // Mock fs.writeFileSync to throw an error
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Write error');
      });
      
      expect(() => fileHandler.writeTestFile('/src/file.ts', 'content', mockConfig))
        .toThrow(/Error writing test file/);
    });
  });
});

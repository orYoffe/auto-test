import path from 'path';
import fs from 'fs';
import { FileHandler } from '../../services/file-handler';
import { createAIService } from '../../services/ai-service';
import { defaultConfig } from '../../types/config';

// Mock modules
jest.mock('../../services/ai-service');

describe('Express Framework E2E Tests', () => {
  const fileHandler = new FileHandler();
  const mockAIService = createAIService(defaultConfig);
  
  // Test paths
  const exampleDir = path.join(__dirname, '../../../examples/express-app');
  const srcRoutesDir = path.join(exampleDir, 'src/routes');
  const testDir = path.join(exampleDir, '__tests__');
  
  // Ensure directories exist
  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should generate tests for Express routes', async () => {
    // Get the sample Express route
    const routePath = path.join(srcRoutesDir, 'task.routes.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    
    const fileContent = fileHandler.readFile(routePath);
    expect(fileContent).toContain('express');
    
    // Generate test using the mock AI service
    const testContent = await mockAIService.generateTests(
      routePath, 
      fileContent, 
      {
        ...defaultConfig,
        testRunner: 'jest',
        testDirectory: testDir
      }
    );
    
    // Write the test file
    const testFilePath = fileHandler.writeTestFile(
      routePath,
      testContent,
      {
        ...defaultConfig,
        testRunner: 'jest',
        testDirectory: testDir
      }
    );
    
    // Verify the test file was created
    expect(fs.existsSync(testFilePath)).toBe(true);
    
    // Read the test content
    const generatedTest = fileHandler.readFile(testFilePath);
    
    // Verify it contains expected test patterns for API testing
    expect(generatedTest).toContain('describe');
    expect(generatedTest).toContain('test');
    expect(generatedTest).toContain('expect');
    expect(generatedTest).toContain('request');
    
    // Clean up
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
});

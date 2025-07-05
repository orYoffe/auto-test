import path from 'path';
import fs from 'fs';
import { FileHandler } from '../../services/file-handler';
import { createAIService } from '../../services/ai-service';
import { defaultConfig } from '../../types/config';

// Mock modules
jest.mock('../../services/ai-service', () => {
  return {
    createAIService: jest.fn().mockImplementation(() => ({
      generateTests: jest.fn().mockImplementation(() => Promise.resolve(`
        describe('React Component Tests', () => {
          test('should render correctly', () => {
            expect(true).toBe(true);
          });
        });
      `))
    }))
  };
});

describe('React Framework E2E Tests', () => {
  const fileHandler = new FileHandler();
  const mockAIService = createAIService(defaultConfig);
  
  // Test paths
  const exampleDir = path.join(__dirname, '../../../examples/react-app');
  const srcComponentsDir = path.join(exampleDir, 'src/components');
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
  
  it('should generate tests for React components', async () => {
    // Get the sample React component
    const componentPath = path.join(srcComponentsDir, 'UserList.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    
    const fileContent = fileHandler.readFile(componentPath);
    expect(fileContent).toContain('React');
    
    // Generate test using the mock AI service
    const testContent = await mockAIService.generateTests(
      componentPath, 
      fileContent, 
      {
        ...defaultConfig,
        testRunner: 'jest',
        testDirectory: testDir
      }
    );
    
    // Write the test file
    const testFilePath = fileHandler.writeTestFile(
      componentPath,
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
    
    // Verify it contains expected test patterns
    expect(generatedTest).toContain('describe');
    expect(generatedTest).toContain('test');
    expect(generatedTest).toContain('expect');
    
    // Clean up
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
});

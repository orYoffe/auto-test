import path from 'path';
import fs from 'fs';
import { FileHandler } from '../../services/file-handler';
import { createAIService } from '../../services/ai-service';
import { ConfigLoader } from '../../services/config-loader';

// Mock modules
jest.mock('../../services/ai-service');

describe('Framework Integration Tests', () => {
  const fileHandler = new FileHandler();
  const configLoader = new ConfigLoader();
  
  // Test all supported frameworks
  const frameworks = [
    { name: 'react-app', files: ['src/components/UserList.tsx'] },
    { name: 'nextjs-app', files: ['src/components/SearchForm.tsx'] },
    { name: 'express-app', files: ['src/routes/task.routes.ts'] },
    { name: 'koa-app', files: ['src/routes/user.routes.ts'] },
    { name: 'hapi-app', files: ['src/routes/product.routes.ts'] },
    { name: 'fastify-app', files: ['src/routes/note.routes.ts'] },
    { name: 'hono-app', files: ['src/routes/book.routes.ts'] },
    { name: 'nestjs-app', files: ['src/products/products.controller.ts'] },
    { name: 'graphql-app', files: ['src/resolvers/resolvers.ts'] },
    { name: 'vuejs-app', files: ['src/components/TodoList.vue'] },
    { name: 'svelte-app', files: ['src/Counter.svelte'] },
  ];
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  // Test each framework
  for (const framework of frameworks) {
    it(`should generate tests for ${framework.name}`, async () => {
      // Framework directory
      const frameworkDir = path.join(__dirname, `../../../examples/${framework.name}`);
      expect(fs.existsSync(frameworkDir)).toBe(true);
      
      // Get config for this framework
      const configPath = path.join(frameworkDir, 'auto-test.config.json');
      const config = fs.existsSync(configPath) 
        ? configLoader.loadConfig(configPath) 
        : configLoader.loadConfig();
      
      // Create mock AI service for this framework
      const mockAIService = createAIService(config);
      
      // Create test directory
      const testDir = path.join(frameworkDir, '__tests__');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      
      // Test each file in the framework
      for (const relativeFilePath of framework.files) {
        const filePath = path.join(frameworkDir, relativeFilePath);
        
        // Check file exists
        expect(fs.existsSync(filePath)).toBe(true);
        
        // Read file content
        const fileContent = fileHandler.readFile(filePath);
        
        // Generate test
        const testContent = await mockAIService.generateTests(
          filePath, 
          fileContent, 
          {
            ...config,
            testDirectory: testDir
          }
        );
        
        // Write test file
        const testFilePath = fileHandler.writeTestFile(
          filePath,
          testContent,
          {
            ...config,
            testDirectory: testDir
          }
        );
        
        // Verify test file was created
        expect(fs.existsSync(testFilePath)).toBe(true);
        
        // Read the test content
        const generatedTest = fileHandler.readFile(testFilePath);
        
        // Basic verification
        expect(generatedTest).toContain('describe');
        expect(generatedTest.includes('test') || generatedTest.includes('it')).toBe(true);
        expect(generatedTest).toContain('expect');
        
        // Clean up
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      }
    });
  }
});

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { AutoTestConfig } from '../types/config.js';

export class FileHandler {
  /**
   * Find all files matching the patterns
   */
  findFiles: (patterns: string[], config: AutoTestConfig) => Promise<string[]> = async (patterns, config) => {
    const allFiles: string[] = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, {
        ignore: config.excludePatterns
      });
      
      allFiles.push(...files);
    }
    
    return [...new Set(allFiles)]; // Remove duplicates
  }
  
  /**
   * Read the content of a file
   */
  readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Error reading file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Write test content to a file
   */
  writeTestFile(sourcePath: string, testContent: string, config: AutoTestConfig): string {
    try {
      const parsedPath = path.parse(sourcePath);
      const testFileName = `${parsedPath.name}${config.testFileSuffix}${parsedPath.ext}`;
      
      // Handle test directory option
      let testDir: string;
      if (config.testDirectory) {
        testDir = path.resolve(config.testDirectory);
        
        // Ensure test directory exists
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
      } else {
        testDir = parsedPath.dir;
      }
      
      // Convert to the requested file extension if different
      const finalTestFileName = config.testFileExtension === parsedPath.ext.substring(1)
        ? testFileName 
        : `${parsedPath.name}${config.testFileSuffix}.${config.testFileExtension}`;
      
      const testFilePath = path.join(testDir, finalTestFileName);
      
      // Write the test file
      fs.writeFileSync(testFilePath, testContent);
      
      return testFilePath;
    } catch (error) {
      throw new Error(`Error writing test file for ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

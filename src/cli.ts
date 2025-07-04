#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { ConfigLoader } from './services/config-loader';
import { FileHandler } from './services/file-handler';
import { createAIService } from './services/ai-service';

// Load environment variables
dotenv.config();

// Initialize CLI
const program = new Command();
const configLoader = new ConfigLoader();
const fileHandler = new FileHandler();

// Set up CLI options
program
  .name('auto-test')
  .description('Automatically generate tests for your code using AI')
  .version('0.1.0')
  .option('-c, --config <path>', 'path to configuration file')
  .option('-o, --output <path>', 'path to output JSON file with test generation results')
  .option('-p, --provider <provider>', 'AI provider to use (openai or anthropic)')
  .option('-m, --model <model>', 'specific model to use with the AI provider')
  .option('-t, --test-runner <runner>', 'test runner to use (jest, vitest, mocha)')
  .option('-d, --test-directory <directory>', 'directory where test files will be saved')
  .option('-v, --verbose', 'enable verbose logging')
  .arguments('<patterns...>')
  .action(async (patterns: string[], options: { 
    config?: string;
    output?: string;
    provider?: string;
    model?: string;
    testRunner?: string;
    testDirectory?: string;
    verbose?: boolean;
  }) => {
    try {
      // Load configuration
      const config = configLoader.loadConfig(options.config);
      
      // Override with command line options
      if (options.provider) {
        // Type assertion for valid model providers
        if (options.provider === 'openai' || options.provider === 'anthropic') {
          config.modelProvider = options.provider;
        } else {
          console.warn(`Warning: Invalid provider "${options.provider}". Using default.`);
        }
      }
      
      if (options.model) config.model = options.model;
      
      if (options.testRunner) {
        // Type assertion for valid test runners
        if (['jest', 'vitest', 'mocha', 'custom'].includes(options.testRunner)) {
          config.testRunner = options.testRunner as 'jest' | 'vitest' | 'mocha' | 'custom';
        } else {
          console.warn(`Warning: Invalid test runner "${options.testRunner}". Using default.`);
        }
      }
      
      if (options.testDirectory) config.testDirectory = options.testDirectory;
      
      const verbose = options.verbose;
      const aiService = createAIService(config);
      
      // Find files matching the patterns
      const spinner = ora('Finding files...').start();
      const files = await fileHandler.findFiles(patterns, config);
      
      if (files.length === 0) {
        spinner.fail('No files found matching the patterns.');
        process.exit(1);
      }
      
      spinner.succeed(`Found ${files.length} files to process.`);
      
      // Results to track generated tests
      const results: { 
        source: string; 
        testPath: string; 
        success: boolean;
        error?: string;
      }[] = [];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const filePath = files[i];
        const fileSpinner = ora(`Generating test for ${filePath} (${i + 1}/${files.length})`).start();
        
        try {
          // Read file content
          const fileContent = fileHandler.readFile(filePath);
          
          // Generate test using AI
          if (verbose) {
            fileSpinner.text = `Sending ${path.basename(filePath)} to ${config.modelProvider} API...`;
          }
          
          const testContent = await aiService.generateTests(filePath, fileContent, config);
          
          // Write test file
          if (verbose) {
            fileSpinner.text = `Writing test file for ${path.basename(filePath)}...`;
          }
          
          const testFilePath = fileHandler.writeTestFile(filePath, testContent, config);
          
          // Record result
          results.push({
            source: filePath,
            testPath: testFilePath,
            success: true
          });
          
          fileSpinner.succeed(`Generated test for ${filePath} -> ${testFilePath}`);
        } catch (error) {
          fileSpinner.fail(`Failed to generate test for ${filePath}`);
          
          // Record error
          results.push({
            source: filePath,
            testPath: '',
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          
          if (verbose) {
            console.error(error);
          }
        }
      }
      
      // Write output to JSON file if specified
      if (options.output) {
        const outputPath = path.isAbsolute(options.output) 
          ? options.output 
          : path.resolve(process.cwd(), options.output);
        
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(`Results saved to ${outputPath}`);
      }
      
      // Print summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\nSummary:');
      console.log(`✅ Successfully generated ${successful} test${successful !== 1 ? 's' : ''}`);
      
      if (failed > 0) {
        console.log(`❌ Failed to generate ${failed} test${failed !== 1 ? 's' : ''}`);
      }
      
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      if (options.verbose && error instanceof Error) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Parse command line arguments and run
program.parse(process.argv);

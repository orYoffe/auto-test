#!/usr/bin/env node

import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

import { ConfigLoader } from './services/config-loader.js';
import { FileHandler } from './services/file-handler.js';
import { createAIService } from './services/ai-service.js';
import { GeminiService } from './services/gemini-service.js';

// Load environment variables
dotenv.config();

// Initialize CLI
const program = new Command();
const configLoader = new ConfigLoader();
const fileHandler = new FileHandler();

// Set up CLI options
program
  .name('test-gen')
  .description('Automatically generate tests for your code using AI')
  .version('0.1.0')
  .option('-c, --config <path>', 'path to configuration file')
  .option('-o, --output <path>', 'path to output JSON file with test generation results')
  .option('-p, --provider <provider>', 'AI provider to use (openai, anthropic, or gemini)')
  .option('-m, --model <model>', 'specific model to use with the AI provider')
  .option('-t, --test-runner <runner>', 'test runner to use (jest, vitest, mocha)')
  .option('-d, --test-directory <directory>', 'directory where test files will be saved')
  .option('-v, --verbose', 'enable verbose logging')
  .option('--ci', 'run in CI mode (auto-install dependencies and exit with code 1 on failure)')
  .arguments('[patterns...]')
  .action(async (patterns: string[], options: { 
    config?: string;
    output?: string;
    provider?: string;
    model?: string;
    testRunner?: string;
    testDirectory?: string;
    verbose?: boolean;
    ci?: boolean;
  }) => {
    try {
      // If no patterns are provided, use current directory
      if (patterns.length === 0) {
        patterns = ['**/*.{ts,js,tsx,jsx}'];
        console.log('No file patterns provided. Using current directory with pattern: **/*.{ts,js,tsx,jsx}');
      }
      // Determine target directory for .env (first pattern if it's a directory, else cwd)
      let targetDir = process.cwd();
      if (patterns.length > 0) {
        const firstPattern = patterns[0];
        if (fs.existsSync(firstPattern) && fs.lstatSync(firstPattern).isDirectory()) {
          targetDir = path.resolve(firstPattern);
        }
      }
      // In CI mode, install dependencies if needed
      if (options.ci) {
        console.log('Running in CI mode...');
        const spinner = ora('Installing dependencies...').start();
        
        try {
          // Check if we need to install dependencies
          if (!fs.existsSync('node_modules') || 
              fs.readdirSync('node_modules').length === 0) {
            
            // Try to detect the package manager
            let installCommand = 'npm install';
            if (fs.existsSync('yarn.lock')) {
              installCommand = 'yarn';
            } else if (fs.existsSync('pnpm-lock.yaml')) {
              installCommand = 'pnpm install';
            }
            
            // Run installation in a separate process
            execSync(installCommand, { stdio: 'inherit' });
          }
          spinner.succeed('Dependencies installed');
        } catch (error) {
          spinner.fail('Failed to install dependencies');
          console.error(error);
          process.exit(1);
        }
      }
      
      // Load configuration
      const config = configLoader.loadConfig(options.config);
      
      // Override with command line options
      if (options.provider) {
        // Type assertion for valid model providers
        if (options.provider === 'openai' || options.provider === 'anthropic' || options.provider === 'gemini') {
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
      // --- Gemini API key validation before creating AI service ---
      if ((config.modelProvider === 'gemini' || !config.modelProvider)) {
        await GeminiService.validateApiKey(targetDir);
      }
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
      
      // In CI mode, if any tests failed to generate, exit with code 1
      if (options.ci && failed > 0) {
        console.log('CI mode: Exiting with code 1 due to test generation failures');
        process.exit(1);
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

#!/usr/bin/env node

/**
 * GitHub Actions workflow for test-gen
 * This script specifically creates and runs tests in CI environments
 * It will:
 * 1. Install all dependencies
 * 2. Generate tests for the codebase
 * 3. Run the generated tests
 * 4. Exit with code 0 on success or 1 on failure
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
if (isDryRun) {
  args.splice(args.indexOf('--dry-run'), 1);
}

try {
  // Always run in CI mode
  const ciFlag = '--ci';
  
  // Check if the patterns were provided
  const patterns = args.filter(arg => !arg.startsWith('-'));
  
  // Use current directory if no patterns were provided
  const commandArgs = patterns.length > 0 ? [...args, ciFlag] : [...args, ciFlag, '**/*.{ts,js,tsx,jsx}'];
  
  // Check for a package.json file to detect the test runner
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let testRunner = 'jest';
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.vitest) {
        testRunner = 'vitest';
      } else if (deps.mocha) {
        testRunner = 'mocha';
      }
      
      // Add test runner flag if not already provided
      if (!commandArgs.includes('--test-runner')) {
        commandArgs.push('--test-runner', testRunner);
      }
    } catch (e) {
      const error = e as Error;
      console.warn(`Warning: Could not parse package.json: ${error.message || String(error)}`);
    }
  }
  
  // Build the test generation command
  const genTestsCommand = `node "${path.join(__dirname, 'cli.js')}" ${commandArgs.join(' ')}`;
  
  console.log(`\n=== TEST-GEN CI MODE ===`);
  
  // Step 1: Install dependencies
  console.log(`\n1️⃣ Installing dependencies...`);
  if (!isDryRun) {
    try {
      // Check for yarn.lock or pnpm-lock.yaml to determine package manager
      const useYarn = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
      const usePnpm = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
      
      if (useYarn) {
        execSync('yarn install --frozen-lockfile', { stdio: 'inherit' });
      } else if (usePnpm) {
        execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' });
      } else {
        execSync('npm ci', { stdio: 'inherit' });
      }
    } catch (e) {
      const error = e as Error;
      console.warn(`Warning: Could not install dependencies: ${error.message || String(error)}`);
      console.log(`Continuing anyway...`);
    }
  } else {
    console.log(`[DRY RUN] Would install dependencies`);
  }
  
  // Step 2: Generate tests
  console.log(`\n2️⃣ Generating tests...`);
  if (!isDryRun) {
    console.log(`Executing: ${genTestsCommand}`);
    execSync(genTestsCommand, { stdio: 'inherit' });
  } else {
    console.log(`[DRY RUN] Would execute: ${genTestsCommand}`);
  }
  
  // Step 3: Run tests
  console.log(`\n3️⃣ Running generated tests...`);
  if (!isDryRun) {
    try {
      let testCommand;
      
      switch (testRunner) {
        case 'vitest':
          testCommand = 'npx vitest run';
          break;
        case 'mocha':
          testCommand = 'npx mocha';
          break;
        default:
          testCommand = 'npx jest';
      }
      
      console.log(`Executing: ${testCommand}`);
      execSync(testCommand, { stdio: 'inherit' });
    } catch (e) {
      const error = e as Error;
      console.error(`Error running tests: ${error.message || String(error)}`);
      throw new Error('Tests failed');
    }
  } else {
    console.log(`[DRY RUN] Would run tests with ${testRunner}`);
  }
  
  console.log(`\n✅ test-gen CI process completed successfully`);
  process.exit(0);
} catch (error) {
  console.error(`\n❌ test-gen CI process failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

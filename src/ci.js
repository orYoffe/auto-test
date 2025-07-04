#!/usr/bin/env node

/**
 * GitHub Actions workflow for auto-test
 * This script allows using auto-test as a GitHub Action
 */

import { execSync } from 'child_process';
import path from 'path';

// Parse arguments
const args = process.argv.slice(2);

try {
  // Always run in CI mode
  const ciFlag = '--ci';
  
  // Check if the patterns were provided
  const patterns = args.filter(arg => !arg.startsWith('-'));
  
  // Use current directory if no patterns were provided
  const commandArgs = patterns.length > 0 ? [...args, ciFlag] : [...args, ciFlag, '**/*.{ts,js,tsx,jsx}'];
  
  // Build the command
  const command = `node "${path.join(__dirname, 'cli.js')}" ${commandArgs.join(' ')}`;
  
  // Execute the command
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
  
  console.log('Auto-test completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Auto-test failed:', error);
  process.exit(1);
}

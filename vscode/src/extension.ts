import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createAIService } from '../../src/services/ai-service';
import { ConfigLoader } from '../../src/services/config-loader';
import { FileHandler } from '../../src/services/file-handler';
import { AutoTestConfig } from '../../src/types/config';

export function activate(context: vscode.ExtensionContext) {
  console.log('Auto-Test extension is now active');

  // Register command to generate tests for current file
  const generateTestsDisposable = vscode.commands.registerCommand('auto-test.generateTests', async () => {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active file. Please open a file first.');
        return;
      }

      const filePath = editor.document.uri.fsPath;
      const progress = await showProgress('Generating tests...');
      
      try {
        await generateTest(filePath);
        vscode.window.showInformationMessage('Tests generated successfully!');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to generate tests: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        progress.dispose();
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Register command to generate tests for a directory
  const generateTestsForDirectoryDisposable = vscode.commands.registerCommand('auto-test.generateTestsForDirectory', async (resource: vscode.Uri) => {
    try {
      if (!resource) {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
          vscode.window.showErrorMessage('No workspace folder open.');
          return;
        }
        resource = folders[0].uri;
      }

      const progress = await showProgress('Generating tests for directory...');
      
      try {
        const configLoader = new ConfigLoader();
        const fileHandler = new FileHandler();
        const config = getExtensionConfig();
        
        // Find all relevant files in the directory
        const pattern = path.join(resource.fsPath, '**', '*.{ts,js,tsx,jsx}');
        const files = await fileHandler.findFiles([pattern], config);
        
        if (files.length === 0) {
          vscode.window.showInformationMessage('No files found to generate tests for.');
          progress.dispose();
          return;
        }
        
        // Generate tests for all files
        let successCount = 0;
        let failCount = 0;
        
        for (const file of files) {
          try {
            await generateTest(file);
            successCount++;
          } catch (error) {
            failCount++;
            console.error(`Failed to generate test for ${file}:`, error);
          }
        }
        
        vscode.window.showInformationMessage(
          `Generated ${successCount} tests successfully${failCount > 0 ? `, ${failCount} failed` : ''}.`
        );
      } finally {
        progress.dispose();
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Register command to set AI provider
  const setAIProviderDisposable = vscode.commands.registerCommand('auto-test.setAIProvider', async () => {
    const providers = ['gemini', 'openai', 'anthropic'];
    const selected = await vscode.window.showQuickPick(providers, {
      placeHolder: 'Select AI provider'
    });
    
    if (selected) {
      const config = vscode.workspace.getConfiguration('auto-test');
      await config.update('provider', selected, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`AI provider set to ${selected}`);
    }
  });

  context.subscriptions.push(generateTestsDisposable);
  context.subscriptions.push(generateTestsForDirectoryDisposable);
  context.subscriptions.push(setAIProviderDisposable);
}

async function generateTest(filePath: string): Promise<void> {
  const configLoader = new ConfigLoader();
  const fileHandler = new FileHandler();
  const config = getExtensionConfig();
  const aiService = createAIService(config);
  
  // Read file content
  const fileContent = fileHandler.readFile(filePath);
  
  // Generate test using AI
  const testContent = await aiService.generateTests(filePath, fileContent, config);
  
  // Write test file
  const testFilePath = fileHandler.writeTestFile(filePath, testContent, config);
  
  // Open the generated test file
  const testFileUri = vscode.Uri.file(testFilePath);
  await vscode.window.showTextDocument(testFileUri);
}

function getExtensionConfig(): AutoTestConfig {
  const config = vscode.workspace.getConfiguration('auto-test');
  
  return {
    testRunner: config.get('testRunner') as 'jest' | 'vitest' | 'mocha' | 'custom',
    modelProvider: config.get('provider') as 'openai' | 'anthropic' | 'gemini',
    model: config.get('model'),
    testNamingConvention: 'camelCase',
    testFileExtension: config.get('testFileExtension') as 'ts' | 'js',
    testFileSuffix: config.get('testFileSuffix') as string,
    generateMocks: true,
    testDataStrategy: 'comprehensive',
    includeComments: true
  };
}

async function showProgress(message: string): Promise<{ dispose: () => void }> {
  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: message,
    cancellable: false
  }, async (progress) => {
    progress.report({ increment: 0 });
    
    return new Promise<void>((resolve) => {
      const intervalId = setInterval(() => {
        progress.report({ increment: 1 });
      }, 100);
      
      return {
        dispose: () => {
          clearInterval(intervalId);
          resolve();
        }
      };
    });
  });
}

export function deactivate() {}

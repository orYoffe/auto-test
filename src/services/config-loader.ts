import fs from 'fs';
import path from 'path';
import { AutoTestConfig, defaultConfig } from '../types/config';

export class ConfigLoader {
  /**
   * Load configuration from file or use defaults
   */
  loadConfig(configPath?: string): AutoTestConfig {
    if (!configPath) {
      return defaultConfig;
    }

    try {
      // Try to load from absolute path first
      let configContent: string;
      if (path.isAbsolute(configPath)) {
        configContent = fs.readFileSync(configPath, 'utf8');
      } else {
        // Then try relative path
        configContent = fs.readFileSync(path.resolve(process.cwd(), configPath), 'utf8');
      }
      
      const userConfig = JSON.parse(configContent);
      return { ...defaultConfig, ...userConfig };
    } catch (error) {
      console.warn(`Warning: Could not load config from ${configPath}. Using default config.`);
      console.warn(error instanceof Error ? error.message : String(error));
      return defaultConfig;
    }
  }
}

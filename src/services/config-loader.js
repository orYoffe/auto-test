"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../types/config");
class ConfigLoader {
    /**
     * Load configuration from file or use defaults
     */
    loadConfig(configPath) {
        if (!configPath) {
            return config_1.defaultConfig;
        }
        try {
            // Try to load from absolute path first
            let configContent;
            if (path_1.default.isAbsolute(configPath)) {
                configContent = fs_1.default.readFileSync(configPath, 'utf8');
            }
            else {
                // Then try relative path
                configContent = fs_1.default.readFileSync(path_1.default.resolve(process.cwd(), configPath), 'utf8');
            }
            const userConfig = JSON.parse(configContent);
            return { ...config_1.defaultConfig, ...userConfig };
        }
        catch (error) {
            console.warn(`Warning: Could not load config from ${configPath}. Using default config.`);
            console.warn(error instanceof Error ? error.message : String(error));
            return config_1.defaultConfig;
        }
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config-loader.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class FileHandler {
    constructor() {
        /**
         * Find all files matching the patterns
         */
        this.findFiles = async (patterns, config) => {
            const allFiles = [];
            for (const pattern of patterns) {
                const files = await (0, glob_1.glob)(pattern, {
                    ignore: config.excludePatterns
                });
                allFiles.push(...files);
            }
            return [...new Set(allFiles)]; // Remove duplicates
        };
    }
    /**
     * Read the content of a file
     */
    readFile(filePath) {
        try {
            return fs_1.default.readFileSync(filePath, 'utf8');
        }
        catch (error) {
            throw new Error(`Error reading file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Write test content to a file
     */
    writeTestFile(sourcePath, testContent, config) {
        try {
            const parsedPath = path_1.default.parse(sourcePath);
            const testFileName = `${parsedPath.name}${config.testFileSuffix}${parsedPath.ext}`;
            // Handle test directory option
            let testDir;
            if (config.testDirectory) {
                testDir = path_1.default.resolve(config.testDirectory);
                // Ensure test directory exists
                if (!fs_1.default.existsSync(testDir)) {
                    fs_1.default.mkdirSync(testDir, { recursive: true });
                }
            }
            else {
                testDir = parsedPath.dir;
            }
            // Convert to the requested file extension if different
            const finalTestFileName = config.testFileExtension === parsedPath.ext.substring(1)
                ? testFileName
                : `${parsedPath.name}${config.testFileSuffix}.${config.testFileExtension}`;
            const testFilePath = path_1.default.join(testDir, finalTestFileName);
            // Write the test file
            fs_1.default.writeFileSync(testFilePath, testContent);
            return testFilePath;
        }
        catch (error) {
            throw new Error(`Error writing test file for ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.FileHandler = FileHandler;
//# sourceMappingURL=file-handler.js.map
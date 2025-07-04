"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
exports.defaultConfig = {
    testRunner: 'jest',
    modelProvider: process.env.DEFAULT_PROVIDER || 'gemini',
    model: process.env.DEFAULT_MODEL || 'gemini-pro',
    temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
    testNamingConvention: 'camelCase',
    testFileExtension: 'ts',
    testFileSuffix: '.spec',
    generateMocks: true,
    testDataStrategy: 'comprehensive',
    includeComments: true
};
//# sourceMappingURL=config.js.map
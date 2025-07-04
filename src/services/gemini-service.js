"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            console.warn('Warning: GEMINI_API_KEY not set. Gemini API will not work properly.');
        }
    }
    async generateTests(filePath, fileContent, config) {
        try {
            const prompt = this.buildPrompt(filePath, fileContent, config);
            // Use Gemini API
            const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
            const response = await fetch(`${url}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: prompt,
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: config.temperature || 0.7,
                        maxOutputTokens: config.maxTokens || 4096,
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`Gemini API request failed with status: ${response.status}`);
            }
            const result = await response.json();
            // Extract text from the response based on Gemini's API structure
            const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
                throw new Error('No content returned from Gemini API');
            }
            return content;
        }
        catch (error) {
            console.error('Error generating tests with Gemini:', error);
            throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    buildPrompt(filePath, fileContent, config) {
        return `
Generate comprehensive tests for the following ${filePath.endsWith('.ts') ? 'TypeScript' : 'JavaScript'} code:

FILE PATH: ${filePath}

FILE CONTENT:
\`\`\`
${fileContent}
\`\`\`

REQUIREMENTS:
- Use ${config.testRunner} as the test runner
- Create tests with a focus on ${config.testDataStrategy} test data
- ${config.generateMocks ? 'Generate mocks for dependencies' : 'Use real dependencies when possible'}
- Use ${config.testNamingConvention} naming convention for test functions
- ${config.includeComments ? 'Include detailed comments explaining test strategies' : 'Keep comments minimal'}
- Test file should use the .${config.testFileExtension} extension with "${config.testFileSuffix}" suffix

The test file should be comprehensive and follow best practices for testing this type of code.
Output only the test code without explanations.
`;
    }
}
exports.GeminiService = GeminiService;
//# sourceMappingURL=gemini-service.js.map
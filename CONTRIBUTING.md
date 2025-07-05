# Contributing to AI Test Gen

Thank you for your interest in contributing to AI Test Gen! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct, which is to be respectful, inclusive, and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the bug
- Provide specific examples, such as code snippets or test files
- Describe the behavior you observed and why it's a problem
- Include error messages and stack traces
- Specify which version of AI Test Gen you're using
- Mention your operating system and Node.js version

### Suggesting Enhancements

Enhancement suggestions are welcome! When submitting an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the suggested enhancement
- Specific examples of how this enhancement would be used
- Explanation of why this enhancement would be useful

### Framework Support

We're always looking to improve support for different frameworks. If you're familiar with a framework that could be better supported, consider:

1. Creating example code for the framework
2. Updating the AI instructions for that framework
3. Adding test generation capabilities for that framework

### Pull Requests

Here's how to submit a pull request:

1. Fork the repository
2. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes, adding tests if applicable
4. Run the linters and tests:

   ```bash
   npm run lint
   npm run test
   ```

5. Commit your changes with a descriptive message:

   ```bash
   git commit -am 'Add some feature'
   ```

6. Push to your branch:

   ```bash
   git push origin feature/your-feature
   ```

7. Create a pull request from your branch to the `main` branch

## Development Setup

1. Clone your fork of the repository:

   ```bash
   git clone https://github.com/yourusername/auto-test.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Link the project for local development:

   ```bash
   npm link
   ```

## Project Structure

- `src/` - Source code
  - `__mocks__/` - Jest mocks for testing
  - `__tests__/` - Test files
    - `e2e/` - End-to-end tests
    - `integration/` - Integration tests
    - `services/` - Service-specific tests
  - `services/` - Core services
    - `ai-service.ts` - AI integration service
    - `config-loader.ts` - Configuration handling
    - `file-handler.ts` - File system operations
  - `types/` - TypeScript type definitions
  - `cli.ts` - CLI entry point
  - `ci.ts` - CI mode entry point
  - `index.ts` - Library entry point
- `vscode/` - VS Code extension
- `examples/` - Example projects for different frameworks
- `docs/` - Documentation for GitHub Pages

## Testing

Run all tests:

```bash
npm test
```

Run specific tests:

```bash
npm test -- -t "test name pattern"
```

Run with code coverage:

```bash
npm run test:coverage
```

## Documentation

We use GitHub Pages for documentation. To update the docs:

1. Edit files in the `docs/` directory
2. Commit and push your changes
3. GitHub Actions will automatically deploy the updated documentation

## License

By contributing to AI Test Gen, you agree that your contributions will be licensed under the project's MIT License.

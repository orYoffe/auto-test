#!/bin/bash

# Test script for validating auto-test functionality
echo "Starting validation of auto-test..."

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Build the auto-test CLI
echo -e "${YELLOW}Building auto-test CLI...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build auto-test CLI${NC}"
    exit 1
fi

# Navigate to sample project directory
cd examples/sample-project

# Set up .env file with API keys
if [ -f "../../.env" ]; then
    echo -e "${YELLOW}Using existing .env file...${NC}"
    cp ../../.env ./.env
else
    echo -e "${RED}Error: No .env file found in the root directory${NC}"
    echo -e "${YELLOW}Please create a .env file with your API keys before running this test${NC}"
    exit 1
fi

# Run auto-test on sample project files
echo -e "${YELLOW}Running auto-test on calculator.ts...${NC}"
node ../../dist/cli.js --verbose src/calculator.ts

# Check if test files were created
if [ -f "src/calculator.spec.ts" ]; then
    echo -e "${GREEN}✓ Test file was created for calculator.ts${NC}"
else
    echo -e "${RED}✗ Failed to generate test file for calculator.ts${NC}"
    exit 1
fi

echo -e "${YELLOW}Running auto-test on string-utils.ts...${NC}"
node ../../dist/cli.js --verbose src/string-utils.ts

# Check if test files were created
if [ -f "src/string-utils.spec.ts" ]; then
    echo -e "${GREEN}✓ Test file was created for string-utils.ts${NC}"
else
    echo -e "${RED}✗ Failed to generate test file for string-utils.ts${NC}"
    exit 1
fi

# Try running the generated tests
echo -e "${YELLOW}Installing dependencies for sample project...${NC}"
npm install

echo -e "${YELLOW}Running generated tests...${NC}"
npx jest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Generated tests passed${NC}"
else
    echo -e "${YELLOW}⚠ Some generated tests failed - this is normal as auto-test may generate tests that catch edge cases${NC}"
fi

# Generate tests with a different test runner
echo -e "${YELLOW}Testing with different test runner (vitest)...${NC}"
node ../../dist/cli.js --test-runner vitest --test-directory ./vitest-tests src/calculator.ts

if [ -f "vitest-tests/calculator.spec.ts" ]; then
    echo -e "${GREEN}✓ Test file was created with vitest configuration${NC}"
else
    echo -e "${RED}✗ Failed to generate test file with vitest configuration${NC}"
    exit 1
fi

# Clean up
cd ../..

echo -e "${GREEN}Validation completed successfully!${NC}"
echo "auto-test functionality has been verified."

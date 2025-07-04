#!/bin/bash

# Run tests with coverage
echo "Running tests with coverage..."
npm run test:coverage

# Check if tests were successful
if [ $? -eq 0 ]; then
    echo "All tests passed!"

    # Display coverage report summary
    echo -e "\nCoverage report summary:"
    echo "=========================="
    cat coverage/lcov-report/index.html | grep -o '<span class="strong">[^<]*' | sed 's/<span class="strong">//g' | head -4

    echo -e "\nDetailed coverage report available in ./coverage/lcov-report/index.html"
else
    echo "Tests failed! Fix the issues before committing."
    exit 1
fi

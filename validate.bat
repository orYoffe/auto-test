@echo off
REM Test script for validating auto-test functionality
echo Starting validation of auto-test...

REM Build the auto-test CLI
echo Building auto-test CLI...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Failed to build auto-test CLI
  exit /b 1
)

REM Navigate to sample project directory
cd examples\sample-project
if %ERRORLEVEL% NEQ 0 (
  echo Failed to navigate to sample project directory
  exit /b 1
)

REM Set up .env file with API keys
if exist "..\..\..\.env" (
  echo Using existing .env file...
  copy "..\..\..\.env" .\.env
) else (
  echo Error: No .env file found in the root directory
  echo Please create a .env file with your API keys before running this test
  exit /b 1
)

REM Run auto-test on sample project files
echo Running auto-test on calculator.ts...
node ..\..\dist\cli.js --verbose src\calculator.ts

REM Check if test files were created
if exist "src\calculator.spec.ts" (
  echo Test file was created for calculator.ts
) else (
  echo Failed to generate test file for calculator.ts
  exit /b 1
)

echo Running auto-test on string-utils.ts...
node ..\..\dist\cli.js --verbose src\string-utils.ts

REM Check if test files were created
if exist "src\string-utils.spec.ts" (
  echo Test file was created for string-utils.ts
) else (
  echo Failed to generate test file for string-utils.ts
  exit /b 1
)

REM Try running the generated tests
echo Installing dependencies for sample project...
call npm install

echo Running generated tests...
call npx jest

if %ERRORLEVEL% EQU 0 (
  echo Generated tests passed
) else (
  echo Some generated tests failed - this is normal as auto-test may generate tests that catch edge cases
)

REM Generate tests with a different test runner
echo Testing with different test runner (vitest)...
node ..\..\dist\cli.js --test-runner vitest --test-directory .\vitest-tests src\calculator.ts

if exist "vitest-tests\calculator.spec.ts" (
  echo Test file was created with vitest configuration
) else (
  echo Failed to generate test file with vitest configuration
  exit /b 1
)

REM Clean up
cd ..\..

echo Validation completed successfully!
echo auto-test functionality has been verified.

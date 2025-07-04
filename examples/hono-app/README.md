# Hono Sample App

This is a sample Hono application for the auto-test project.

## Features

- Book and Author API endpoints
- Validation using Zod
- Error handling
- Route organization

## Structure

```
src/
├── index.ts            # Main application entry point
└── routes/
    ├── book.routes.ts      # Book route definitions with handlers
    └── author.routes.ts    # Author route definitions (implementation omitted)
```

## Testing

This project demonstrates auto-test's capability to generate tests for Hono applications, including:

- API endpoint tests
- Route handler tests
- Validation tests
- Error handling tests
- Response structure tests

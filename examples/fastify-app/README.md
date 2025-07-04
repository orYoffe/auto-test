# Fastify Sample App

This is a sample Fastify application for the auto-test project.

## Features

- Note API endpoints
- Swagger documentation
- Request validation
- Error handling
- Route organization

## Structure

```
src/
├── index.ts            # Main application entry point
├── routes/
│   └── note.routes.ts      # Note route definitions with handlers
└── services/
    └── note.service.ts     # Note service (implementation omitted)
```

## Testing

This project demonstrates auto-test's capability to generate tests for Fastify applications, including:

- API endpoint tests
- Route handler tests
- Service mocking
- Request validation tests
- Response structure tests

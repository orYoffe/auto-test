# Koa.js Sample App

This is a sample Koa.js application for the auto-test project.

## Features

- User and Post API endpoints
- MVC architecture with controllers and services
- Error handling middleware
- Route organization

## Structure

```
src/
├── index.ts            # Main application entry point
├── controllers/
│   └── user.controller.ts  # User controller with CRUD operations
├── routes/
│   ├── user.routes.ts      # User route definitions
│   └── post.routes.ts      # Post route definitions
└── services/
    └── user.service.ts     # User service (implementation omitted)
```

## Testing

This project demonstrates auto-test's capability to generate tests for Koa.js applications, including:

- API endpoint tests
- Controller tests
- Service mocking
- Error handling tests
- Request validation tests

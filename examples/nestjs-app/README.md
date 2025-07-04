# NestJS Sample App

This is a sample NestJS application for the auto-test project.

## Features

- Product API endpoints
- Swagger documentation
- DTO validation using class-validator
- MVC architecture with controllers and services
- Dependency injection

## Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root application module
└── products/
    ├── products.module.ts       # Product module definition
    ├── products.controller.ts   # Product controller with CRUD operations
    ├── products.service.ts      # Product service with data access
    └── dto/
        └── product.dto.ts       # Data Transfer Objects for products
```

## Testing

This project demonstrates auto-test's capability to generate tests for NestJS applications, including:

- Controller tests
- Service tests
- DTO validation tests
- End-to-end API tests
- Dependency injection and mocking

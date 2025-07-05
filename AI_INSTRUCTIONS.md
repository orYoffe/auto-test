# AI Instructions for AI Test Gen

AI Test Gen is a powerful CLI tool and VS Code extension that automatically generates tests for your code using AI. This file contains instructions for AI providers on how to generate tests.

## Test Generation Instructions

When generating tests, the AI should follow these guidelines:

1. **Analyze the source code structure** to understand what's being tested
   - Identify functions, classes, methods, components, or endpoints
   - Determine inputs, outputs, and side effects
   - Note any dependencies or imports used

2. **Generate appropriate tests** based on the framework
   - For React: Use React Testing Library with proper component rendering, event simulation, and state checks
   - For Express/Koa/Hapi/Fastify/Hono: Use Supertest for endpoint testing with request/response validation
   - For NestJS: Include controller, service, and e2e tests with proper dependency injection and mocking
   - For GraphQL: Test resolvers, mutations, and queries with proper schema validation
   - For Vue/Svelte: Use component testing tools specific to those frameworks

3. **Include a comprehensive set of test cases**
   - Happy path tests (expected inputs, normal operation)
   - Edge cases (boundary values, empty inputs, special characters)
   - Error handling (invalid inputs, dependency failures)
   - Integration points (how components interact with each other)

4. **Use proper mocking techniques**
   - Mock external APIs, databases, and services
   - Simulate different response scenarios
   - Handle asynchronous operations correctly

5. **Follow the configured test style**
   - Use the appropriate test runner syntax (Jest, Vitest, Mocha)
   - Follow naming conventions (camelCase, snake_case, kebab-case)
   - Include proper comments as specified in the configuration

## Testing Strategy by Framework

### React/Next.js

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  test('displays user information correctly', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('handles edit button click', () => {
    const onEditMock = jest.fn();
    render(<UserProfile user={{ name: 'John' }} onEdit={onEditMock} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEditMock).toHaveBeenCalled();
  });
});
```

### Express/Node.js

```typescript
// API endpoint test example
import request from 'supertest';
import app from './app';
import { createUser, getUserById } from './userService';

jest.mock('./userService');

describe('User API', () => {
  test('GET /users/:id returns user data', async () => {
    (getUserById as jest.Mock).mockResolvedValue({
      id: '123',
      name: 'Jane Doe'
    });
    
    const response = await request(app).get('/users/123');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: '123',
      name: 'Jane Doe'
    });
  });

  test('POST /users creates a new user', async () => {
    (createUser as jest.Mock).mockResolvedValue({
      id: '456',
      name: 'New User'
    });
    
    const response = await request(app)
      .post('/users')
      .send({ name: 'New User' });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBe('456');
  });
});
```

### General TypeScript Utility Functions

```typescript
// Utility function test example
import { formatCurrency, parseDate } from './utils';

describe('formatCurrency', () => {
  test('formats numbers with default USD currency', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000.5)).toBe('$1,000.50');
    expect(formatCurrency(0)).toBe('$0.00');
  });
  
  test('accepts custom currency symbol', () => {
    expect(formatCurrency(1000, '€')).toBe('€1,000.00');
    expect(formatCurrency(1000, '¥')).toBe('¥1,000.00');
  });
});

describe('parseDate', () => {
  test('correctly parses valid date strings', () => {
    expect(parseDate('2023-01-15')).toEqual(new Date(2023, 0, 15));
    expect(parseDate('01/15/2023')).toEqual(new Date(2023, 0, 15));
  });
  
  test('returns null for invalid date strings', () => {
    expect(parseDate('invalid')).toBeNull();
    expect(parseDate('')).toBeNull();
  });
});
```

## Configuration Options

The AI test generation can be customized with these configuration options:

- **testRunner**: Specifies which test framework to use ('jest', 'vitest', 'mocha')
- **modelProvider**: Which AI provider to use ('openai', 'anthropic', 'gemini')
- **testNamingConvention**: Format for test names ('camelCase', 'snake_case', 'kebab-case')
- **testFileExtension**: File extension for test files ('ts', 'js')
- **testFileSuffix**: Suffix for test file names (e.g., '.spec', '.test')
- **generateMocks**: Whether to include mock code in tests (true/false)
- **testDataStrategy**: Approach for generating test data ('random', 'edge-cases', 'comprehensive')
- **includeComments**: Whether to include explanatory comments in tests (true/false)

## Additional Framework Testing Strategies

### Vue.js

```typescript
// Vue component test example
import { mount } from '@vue/test-utils';
import UserCard from './UserCard.vue';

describe('UserCard.vue', () => {
  test('renders user information correctly', () => {
    const user = { name: 'Jane Smith', role: 'Developer' };
    const wrapper = mount(UserCard, {
      props: { user }
    });
    
    expect(wrapper.text()).toContain('Jane Smith');
    expect(wrapper.text()).toContain('Developer');
  });
  
  test('emits update event when edit button is clicked', async () => {
    const wrapper = mount(UserCard, {
      props: { user: { name: 'Jane Smith' } }
    });
    
    await wrapper.find('button.edit').trigger('click');
    
    expect(wrapper.emitted()).toHaveProperty('update');
  });
});
```

### Svelte

```typescript
// Svelte component test example
import { render, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';

describe('Counter.svelte', () => {
  test('renders with default count of 0', () => {
    const { getByText } = render(Counter);
    expect(getByText('Count: 0')).toBeInTheDocument();
  });
  
  test('increments count when button is clicked', async () => {
    const { getByText, getByRole } = render(Counter);
    const button = getByRole('button', { name: /increment/i });
    
    await fireEvent.click(button);
    
    expect(getByText('Count: 1')).toBeInTheDocument();
  });
  
  test('accepts initial count as prop', () => {
    const { getByText } = render(Counter, { props: { initialCount: 5 } });
    expect(getByText('Count: 5')).toBeInTheDocument();
  });
});
```

### NestJS

```typescript
// NestJS tests example
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([
              { id: '1', name: 'John Doe' },
              { id: '2', name: 'Jane Doe' },
            ]),
            create: jest.fn().mockImplementation((dto: CreateUserDto) => 
              Promise.resolve({ id: 'generated-id', ...dto })),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Doe' },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = { name: 'New User', email: 'new@example.com' };
      const result = await controller.create(createUserDto);
      
      expect(result).toEqual({
        id: 'generated-id',
        ...createUserDto,
      });
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
```

### GraphQL

```typescript
// GraphQL resolver test example
import { createTestClient } from 'apollo-server-testing';
import { ApolloServer, gql } from 'apollo-server';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

describe('GraphQL API', () => {
  let query;
  let mutate;
  
  beforeAll(() => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        dataSources: {
          usersAPI: {
            getUsers: jest.fn().mockResolvedValue([
              { id: '1', name: 'Alice', email: 'alice@example.com' },
              { id: '2', name: 'Bob', email: 'bob@example.com' }
            ]),
            getUserById: jest.fn().mockImplementation(id => 
              Promise.resolve({ id, name: 'Alice', email: 'alice@example.com' })),
            createUser: jest.fn().mockImplementation(input => 
              Promise.resolve({ id: 'new-id', ...input }))
          }
        }
      })
    });
    
    const testClient = createTestClient(server);
    query = testClient.query;
    mutate = testClient.mutate;
  });
  
  test('queries all users', async () => {
    const GET_USERS = gql`
      query GetUsers {
        users {
          id
          name
          email
        }
      }
    `;
    
    const res = await query({ query: GET_USERS });
    
    expect(res.data.users).toHaveLength(2);
    expect(res.data.users[0].name).toBe('Alice');
    expect(res.data.users[1].name).toBe('Bob');
  });
  
  test('creates a new user', async () => {
    const CREATE_USER = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;
    
    const res = await mutate({
      mutation: CREATE_USER,
      variables: {
        input: { name: 'Charlie', email: 'charlie@example.com' }
      }
    });
    
    expect(res.data.createUser).toEqual({
      id: 'new-id',
      name: 'Charlie',
      email: 'charlie@example.com'
    });
  });
});
```

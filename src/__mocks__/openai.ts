import { jest } from '@jest/globals';

/**
 * Enhanced mock OpenAI that provides different responses
 * based on the file type being tested. This supports multiple
 * project types including:
 * - React/Next.js components (TSX/JSX)
 * - Express/Node.js API routes
 * - Koa.js API routes
 * - Hapi.js API routes
 * - Fastify API routes
 * - Hono API routes
 * - NestJS controllers and services
 * - GraphQL resolvers
 * - Vue.js components
 * - Svelte components
 * - General TypeScript/JavaScript utilities
 */
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockImplementation(({ messages }) => {
        // Extract file content from messages to determine file type
        const userMessage = messages.find(m => m.role === 'user')?.content || '';
        const fileContent = typeof userMessage === 'string' ? userMessage : '';
        
        // Check file type to determine appropriate test template
        let testContent = '';
        
        if (fileContent.includes('React') || fileContent.includes('useState') || fileContent.includes('JSX')) {
          // React component tests
          testContent = `
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from './UserList';

describe('UserList Component', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  test('renders loading state when no initial users provided', () => {
    render(<UserList />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('renders user list when initial users are provided', () => {
    render(<UserList initialUsers={mockUsers} />);
    expect(screen.getByTestId('user-list')).toBeInTheDocument();
    expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith (jane@example.com)')).toBeInTheDocument();
  });

  test('calls onUserSelect when user is clicked', () => {
    const handleUserSelect = jest.fn();
    render(<UserList initialUsers={mockUsers} onUserSelect={handleUserSelect} />);
    
    fireEvent.click(screen.getByText('John Doe (john@example.com)'));
    expect(handleUserSelect).toHaveBeenCalledWith(mockUsers[0]);
  });

  test('filters users by email when filterByEmail prop is provided', () => {
    render(<UserList initialUsers={mockUsers} filterByEmail="jane" />);
    
    expect(screen.getByText('Jane Smith (jane@example.com)')).toBeInTheDocument();
    expect(screen.queryByText('John Doe (john@example.com)')).not.toBeInTheDocument();
  });

  test('shows error message when API fails', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });
});`;
        } else if (fileContent.includes('express') || fileContent.includes('router') || fileContent.includes('app.get')) {
          // Express.js API tests
          testContent = `
import request from 'supertest';
import app from '../index';
import { TaskService } from '../services/task.service';

// Mock the TaskService
jest.mock('../services/task.service');

describe('Task API Routes', () => {
  const mockTask = {
    id: '123',
    title: 'Test Task',
    description: 'This is a test task',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    test('should return all tasks', async () => {
      const mockTaskService = TaskService as jest.Mocked<typeof TaskService>;
      mockTaskService.prototype.findAll = jest.fn().mockResolvedValue([mockTask]);

      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(mockTask.id);
    });

    test('should handle errors', async () => {
      const mockTaskService = TaskService as jest.Mocked<typeof TaskService>;
      mockTaskService.prototype.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error retrieving tasks');
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const mockTaskService = TaskService as jest.Mocked<typeof TaskService>;
      mockTaskService.prototype.create = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'This is a test task' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', mockTask.id);
      expect(mockTaskService.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          description: 'This is a test task'
        })
      );
    });
  });
});`;
        } else if (fileContent.includes('graphql') || fileContent.includes('typeDefs') || fileContent.includes('resolvers')) {
          // GraphQL tests
          testContent = `
import { ApolloServer } from 'apollo-server';
import { typeDefs } from '../schema/schema';
import { resolvers, Book, Author } from '../resolvers/resolvers';

describe('GraphQL Resolvers', () => {
  let testServer;
  
  beforeAll(() => {
    testServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  describe('Queries', () => {
    test('should get all books', async () => {
      const query = \`
        query {
          books {
            id
            title
            genre
          }
        }
      \`;
      
      const result = await testServer.executeOperation({ query });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.books).toBeInstanceOf(Array);
      expect(result.data?.books.length).toBeGreaterThan(0);
    });
    
    test('should get book by ID', async () => {
      const query = \`
        query {
          book(id: "1") {
            id
            title
            genre
            publishedYear
          }
        }
      \`;
      
      const result = await testServer.executeOperation({ query });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.book).toMatchObject({
        id: '1',
        title: 'The Great Gatsby',
        genre: 'Classic',
        publishedYear: 1925
      });
    });
  });

  describe('Mutations', () => {
    test('should add a new book', async () => {
      const mutation = \`
        mutation {
          addBook(
            title: "New Book"
            authorId: "1"
            genre: "Fantasy"
            publishedYear: 2023
          ) {
            id
            title
            genre
          }
        }
      \`;
      
      const result = await testServer.executeOperation({ query: mutation });
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.addBook).toMatchObject({
        title: 'New Book',
        genre: 'Fantasy'
      });
    });
  });
});`;
        } else if (fileContent.includes('Vue') || fileContent.includes('defineComponent')) {
          // Vue.js component tests
          testContent = `
import { mount } from '@vue/test-utils';
import TodoList from './TodoList.vue';

describe('TodoList.vue', () => {
  test('renders todo items correctly', () => {
    const todos = [
      { id: 1, text: 'Learn Vue', completed: false },
      { id: 2, text: 'Build an app', completed: true }
    ];
    
    const wrapper = mount(TodoList, {
      props: { todos }
    });
    
    expect(wrapper.findAll('li')).toHaveLength(2);
    expect(wrapper.text()).toContain('Learn Vue');
    expect(wrapper.text()).toContain('Build an app');
    
    const completedItem = wrapper.findAll('li')[1];
    expect(completedItem.classes()).toContain('completed');
  });

  test('emits add-todo event when form is submitted', async () => {
    const wrapper = mount(TodoList);
    
    const input = wrapper.find('input[type="text"]');
    await input.setValue('New Todo');
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.emitted('add-todo')).toBeTruthy();
    expect(wrapper.emitted('add-todo')[0][0]).toBe('New Todo');
  });

  test('toggles todo completion status when clicked', async () => {
    const todos = [
      { id: 1, text: 'Learn Vue', completed: false }
    ];
    
    const wrapper = mount(TodoList, {
      props: { todos }
    });
    
    await wrapper.find('li').trigger('click');
    
    expect(wrapper.emitted('toggle-todo')).toBeTruthy();
    expect(wrapper.emitted('toggle-todo')[0][0]).toBe(1);
  });
});`;
        } else if (fileContent.includes('svelte')) {
          // Svelte component tests
          testContent = `
import { render, fireEvent } from '@testing-library/svelte';
import Counter from '../Counter.svelte';

describe('Counter.svelte', () => {
  test('should render with initial count', () => {
    const { getByTestId } = render(Counter, { props: { initialCount: 5 } });
    
    const countValue = getByTestId('count-value');
    expect(countValue.textContent).toBe('5');
  });

  test('should increment count when + button is clicked', async () => {
    const { getByTestId, getByText } = render(Counter, { props: { initialCount: 0 } });
    
    const incrementButton = getByText('+');
    await fireEvent.click(incrementButton);
    
    const countValue = getByTestId('count-value');
    expect(countValue.textContent).toBe('1');
  });

  test('should decrement count when - button is clicked', async () => {
    const { getByTestId, getByText } = render(Counter, { props: { initialCount: 5 } });
    
    const decrementButton = getByText('-');
    await fireEvent.click(decrementButton);
    
    const countValue = getByTestId('count-value');
    expect(countValue.textContent).toBe('4');
  });

  test('should reset count when reset button is clicked', async () => {
    const { getByTestId, getByText } = render(Counter, { props: { initialCount: 10 } });
    
    // First increment to change from initial value
    const incrementButton = getByText('+');
    await fireEvent.click(incrementButton);
    
    // Then reset
    const resetButton = getByText('Reset');
    await fireEvent.click(resetButton);
    
    const countValue = getByTestId('count-value');
    expect(countValue.textContent).toBe('10');
  });

  test('should add new item when button is clicked', async () => {
    const mockItems = [];
    const { getByText, getAllByRole } = render(Counter, { 
      props: { 
        initialCount: 0,
        items: mockItems
      } 
    });
    
    const addButton = getByText('Add Item');
    await fireEvent.click(addButton);
    
    const items = getAllByRole('listitem');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Item 1');
  });

  test('should dispatch events on count change', async () => {
    const { component, getByText } = render(Counter);
    
    const mockHandler = jest.fn();
    component.$on('count', mockHandler);
    
    const incrementButton = getByText('+');
    await fireEvent.click(incrementButton);
    
    expect(mockHandler).toHaveBeenCalled();
    expect(mockHandler.mock.calls[0][0].detail).toEqual({ count: 1 });
  });
});`;
        } else if (fileContent.includes('koa') || fileContent.includes('ctx.body')) {
          // Koa.js tests
          testContent = `
import supertest from 'supertest';
import { server } from '../index';
import { UserService } from '../services/user.service';

// Mock the UserService
jest.mock('../services/user.service');

describe('User API Routes', () => {
  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let request;

  beforeAll(() => {
    request = supertest(server.callback());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    test('should return all users', async () => {
      const mockUserService = UserService.prototype;
      mockUserService.findAll = jest.fn().mockResolvedValue([mockUser]);

      const response = await request.get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(mockUser.id);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const mockUserService = UserService.prototype;
      mockUserService.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request.get('/api/users');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Error retrieving users');
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return user by id', async () => {
      const mockUserService = UserService.prototype;
      mockUserService.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request.get('/api/users/123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', mockUser.id);
      expect(response.body).toHaveProperty('username', mockUser.username);
      expect(mockUserService.findById).toHaveBeenCalledWith('123');
    });

    test('should return 404 when user not found', async () => {
      const mockUserService = UserService.prototype;
      mockUserService.findById = jest.fn().mockResolvedValue(null);

      const response = await request.get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toMatch(/not found/i);
    });
  });
});`;
        } else if (fileContent.includes('@hapi/hapi') || fileContent.includes('handler: (request, h)')) {
          // Hapi.js tests
          testContent = `
import { init } from '../index';
import { ProductHandler } from '../handlers/product.handler';

// Mock the ProductHandler
jest.mock('../handlers/product.handler');

describe('Product API Routes', () => {
  let server;
  
  const mockProduct = {
    id: '123',
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    category: 'Test',
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    server = await init();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    test('should return all products', async () => {
      const mockHandler = ProductHandler.prototype;
      mockHandler.getAllProducts = jest.fn().mockImplementation((request, h) => {
        return h.response([mockProduct]).code(200);
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/products',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toHaveLength(1);
      expect(JSON.parse(response.payload)[0].id).toBe(mockProduct.id);
    });

    test('should handle errors', async () => {
      const mockHandler = ProductHandler.prototype;
      mockHandler.getAllProducts = jest.fn().mockImplementation((request, h) => {
        return h.response({
          message: 'Error retrieving products',
          error: 'Database error',
        }).code(500);
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/products',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toHaveProperty('message', 'Error retrieving products');
    });
  });

  describe('GET /api/products/{id}', () => {
    test('should return product by id', async () => {
      const mockHandler = ProductHandler.prototype;
      mockHandler.getProductById = jest.fn().mockImplementation((request, h) => {
        return h.response(mockProduct).code(200);
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/products/123',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toHaveProperty('id', mockProduct.id);
      expect(JSON.parse(response.payload)).toHaveProperty('name', mockProduct.name);
    });
  });
});`;
        } else if (fileContent.includes('fastify') || fileContent.includes('fastify.get')) {
          // Fastify tests
          testContent = `
import { build } from '../app';
import { NoteService } from '../services/note.service';

// Mock the NoteService
jest.mock('../services/note.service');

describe('Note API Routes', () => {
  let app;
  
  const mockNote = {
    id: '123',
    title: 'Test Note',
    content: 'This is a test note',
    tags: ['test', 'sample'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notes', () => {
    test('should return all notes', async () => {
      const mockNoteService = NoteService.prototype;
      mockNoteService.findAll = jest.fn().mockResolvedValue([mockNote]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/notes',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toHaveLength(1);
      expect(JSON.parse(response.payload)[0].id).toBe(mockNote.id);
      expect(mockNoteService.findAll).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const mockNoteService = NoteService.prototype;
      mockNoteService.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/notes',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toHaveProperty('error', 'Internal Server Error');
    });
  });

  describe('GET /api/notes/:id', () => {
    test('should return note by id', async () => {
      const mockNoteService = NoteService.prototype;
      mockNoteService.findById = jest.fn().mockResolvedValue(mockNote);

      const response = await app.inject({
        method: 'GET',
        url: '/api/notes/123',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toHaveProperty('id', mockNote.id);
      expect(JSON.parse(response.payload)).toHaveProperty('title', mockNote.title);
      expect(mockNoteService.findById).toHaveBeenCalledWith('123');
    });

    test('should return 404 when note not found', async () => {
      const mockNoteService = NoteService.prototype;
      mockNoteService.findById = jest.fn().mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/notes/999',
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toHaveProperty('error', 'Not Found');
    });
  });
});`;
        } else if (fileContent.includes('localStorage') || fileContent.includes('useLocalStorage')) {
          // React hook tests
          testContent = `
import { renderHook, act } from '@testing-library/react-hooks';
import useLocalStorage from './useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock storage event listener
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  test('should use initial value when localStorage is empty', () => {
    window.localStorage.getItem.mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    
    expect(result.current[0]).toBe('initialValue');
    expect(window.localStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  test('should use value from localStorage when available', () => {
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    
    expect(result.current[0]).toBe('storedValue');
    expect(window.localStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  test('should update localStorage when state changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(result.current[0]).toBe('newValue');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  test('should handle storage events from other tabs', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    
    expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    
    // Simulate storage event
    const storageEvent = new StorageEvent('storage', {
      key: 'testKey',
      newValue: JSON.stringify('updatedValue')
    });
    
    act(() => {
      window.dispatchEvent(storageEvent);
    });
    
    expect(result.current[0]).toBe('updatedValue');
  });

  test('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useLocalStorage('testKey', 'initialValue'));
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});`;
        } else if (fileContent.includes('hono') || fileContent.includes('c.json')) {
          // Hono.js tests
          testContent = `
import { describe, expect, test, vi, beforeEach } from 'vitest';
import app from '../index';
import { bookRoutes } from '../routes/book.routes';

describe('Book API Routes', () => {
  const mockBook = {
    id: '1',
    title: 'Test Book',
    authorId: '1',
    genre: 'Test',
    publicationYear: 2023,
    isbn: '123-456-789',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock the global fetch
  global.fetch = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/books', () => {
    test('should return all books', async () => {
      // Mock the response
      const mockResponse = new Response(JSON.stringify([mockBook]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      
      global.fetch.mockResolvedValue(mockResponse);

      const res = await app.request('/api/books');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(mockBook.id);
    });

    test('should handle errors', async () => {
      // Mock a failed response
      global.fetch.mockRejectedValue(new Error('Failed to fetch'));

      const res = await app.request('/api/books');
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/books/:id', () => {
    test('should return book by id', async () => {
      // Mock the response
      const mockResponse = new Response(JSON.stringify(mockBook), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      
      global.fetch.mockResolvedValue(mockResponse);

      const res = await app.request('/api/books/1');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe(mockBook.id);
      expect(data.title).toBe(mockBook.title);
    });

    test('should return 404 when book not found', async () => {
      // Mock a 404 response
      const mockResponse = new Response(JSON.stringify({ message: 'Book with ID 999 not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
      
      global.fetch.mockResolvedValue(mockResponse);

      const res = await app.request('/api/books/999');
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toHaveProperty('message');
    });
  });
});`;
        } else if (fileContent.includes('@nestjs') || fileContent.includes('@Controller')) {
          // NestJS tests
          testContent = `
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop for developers',
    price: 1299.99,
    category: 'Electronics',
    inStock: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCategory: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      mockProductsService.findAll.mockReturnValue([mockProduct]);
      
      const result = controller.findAll();
      
      expect(result).toEqual([mockProduct]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return products filtered by category', async () => {
      mockProductsService.findByCategory.mockReturnValue([mockProduct]);
      
      const result = controller.findAll('Electronics');
      
      expect(result).toEqual([mockProduct]);
      expect(service.findByCategory).toHaveBeenCalledWith('Electronics');
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      mockProductsService.findOne.mockReturnValue(mockProduct);
      
      const result = controller.findOne('1');
      
      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductsService.findOne.mockImplementation(() => {
        throw new NotFoundException('Product not found');
      });
      
      expect(() => controller.findOne('999')).toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith('999');
    });
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      const createDto = {
        name: 'New Product',
        description: 'A new product description',
        price: 99.99,
        category: 'Test',
        inStock: true,
      };
      
      mockProductsService.create.mockReturnValue({
        id: '2',
        ...createDto,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      const result = controller.create(createDto);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toEqual(createDto.name);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });
});`;
        } else {
          // Generic test for utility functions
          testContent = `
import { add, subtract, multiply, divide, power } from './calculator';

describe('Calculator Functions', () => {
  describe('add', () => {
    test('should add two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
      expect(add(2.5, 3.5)).toBe(6);
    });
  });

  describe('subtract', () => {
    test('should subtract two numbers correctly', () => {
      expect(subtract(5, 3)).toBe(2);
      expect(subtract(1, 1)).toBe(0);
      expect(subtract(0, 5)).toBe(-5);
      expect(subtract(-3, -5)).toBe(2);
    });
  });

  describe('multiply', () => {
    test('should multiply two numbers correctly', () => {
      expect(multiply(2, 3)).toBe(6);
      expect(multiply(-1, 1)).toBe(-1);
      expect(multiply(-2, -3)).toBe(6);
      expect(multiply(0, 5)).toBe(0);
    });
  });

  describe('divide', () => {
    test('should divide two numbers correctly', () => {
      expect(divide(6, 3)).toBe(2);
      expect(divide(5, 2)).toBe(2.5);
      expect(divide(0, 5)).toBe(0);
      expect(divide(-6, 2)).toBe(-3);
    });

    test('should throw an error when dividing by zero', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero is not allowed');
    });
  });

  describe('power', () => {
    test('should calculate power correctly', () => {
      expect(power(2, 3)).toBe(8);
      expect(power(5, 0)).toBe(1);
      expect(power(1, 100)).toBe(1);
      expect(power(0, 0)).toBe(1);
    });
  });
});`;
        }

        return {
          choices: [{ 
            message: { 
              content: testContent 
            } 
          }]
        };
      })
    }
  }
};

export default jest.fn(() => mockOpenAI);

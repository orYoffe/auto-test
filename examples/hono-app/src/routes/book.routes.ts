import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// Book interface
interface Book {
  id: string;
  title: string;
  authorId: string;
  genre: string;
  publicationYear: number;
  isbn: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Hono router
const bookRoutes = new Hono();

// Validation schemas
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authorId: z.string().min(1, 'Author ID is required'),
  genre: z.string().optional(),
  publicationYear: z.number().int().positive().optional(),
  isbn: z.string().optional(),
});

// Mock database
const books: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    authorId: '1',
    genre: 'Classic',
    publicationYear: 1925,
    isbn: '9780743273565',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    authorId: '2',
    genre: 'Classic',
    publicationYear: 1960,
    isbn: '9780061120084',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET all books
bookRoutes.get('/', async (c) => {
  try {
    return c.json(books);
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error retrieving books',
      error: error.message,
    });
  }
});

// GET book by ID
bookRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const book = books.find((b) => b.id === id);
    
    if (!book) {
      c.status(404);
      return c.json({
        message: `Book with ID ${id} not found`,
      });
    }
    
    return c.json(book);
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error retrieving book',
      error: error.message,
    });
  }
});

// POST create new book
bookRoutes.post('/', zValidator('json', bookSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    const newBook: Book = {
      id: (books.length + 1).toString(),
      ...data,
      genre: data.genre || 'Unknown',
      publicationYear: data.publicationYear || new Date().getFullYear(),
      isbn: data.isbn || `ISBN-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    books.push(newBook);
    
    c.status(201);
    return c.json(newBook);
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error creating book',
      error: error.message,
    });
  }
});

// PUT update book
bookRoutes.put('/:id', zValidator('json', bookSchema.partial()), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    
    const bookIndex = books.findIndex((b) => b.id === id);
    
    if (bookIndex === -1) {
      c.status(404);
      return c.json({
        message: `Book with ID ${id} not found`,
      });
    }
    
    const updatedBook = {
      ...books[bookIndex],
      ...data,
      updatedAt: new Date(),
    };
    
    books[bookIndex] = updatedBook;
    
    return c.json(updatedBook);
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error updating book',
      error: error.message,
    });
  }
});

// DELETE book
bookRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const bookIndex = books.findIndex((b) => b.id === id);
    
    if (bookIndex === -1) {
      c.status(404);
      return c.json({
        message: `Book with ID ${id} not found`,
      });
    }
    
    books.splice(bookIndex, 1);
    
    return c.json({
      message: `Book with ID ${id} deleted successfully`,
    });
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error deleting book',
      error: error.message,
    });
  }
});

// GET books by author
bookRoutes.get('/author/:authorId', async (c) => {
  try {
    const authorId = c.req.param('authorId');
    const authorBooks = books.filter((b) => b.authorId === authorId);
    
    return c.json(authorBooks);
  } catch (error) {
    c.status(500);
    return c.json({
      message: 'Error retrieving books by author',
      error: error.message,
    });
  }
});

export { bookRoutes };

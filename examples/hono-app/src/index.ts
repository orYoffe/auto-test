import { Hono } from 'hono';
import { logger } from '@hono/logger';
import { serve } from '@hono/node-server';

// Import routes
import { bookRoutes } from './routes/book.routes';
import { authorRoutes } from './routes/author.routes';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());

// Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({
    error: err.message,
    status: err.status || 500,
  }, err.status || 500);
});

// Root route
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to the Hono API',
    version: '1.0.0',
  });
});

// Register routes
app.route('/api/books', bookRoutes);
app.route('/api/authors', authorRoutes);

// Not found handler
app.notFound((c) => {
  return c.json({ 
    message: 'Not Found', 
    status: 404 
  }, 404);
});

// Start server
const port = Number(process.env.PORT || 3000);

if (import.meta.url === import.meta.main) {
  console.log(`Server is running on port ${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;

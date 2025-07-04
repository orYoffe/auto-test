import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';

// Import routes
import { productRoutes } from './routes/product.routes';
import { orderRoutes } from './routes/order.routes';

// Load environment variables
dotenv.config();

const init = async () => {
  // Create server
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register routes
  server.route([
    ...productRoutes,
    ...orderRoutes,
    // Base route
    {
      method: 'GET',
      path: '/',
      handler: (request, h) => {
        return {
          message: 'Welcome to the Hapi.js API',
          version: '1.0.0',
        };
      },
    },
  ]);

  // Error handling
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (response.isBoom) {
      return h
        .response({
          statusCode: response.output.statusCode,
          message: response.output.payload.message,
          error: response.output.payload.error,
        })
        .code(response.output.statusCode);
    }
    return h.continue;
  });

  // Start server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);

  return server;
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Export init for testing purposes
export { init };

// Start the server if this file is run directly
if (!module.parent) {
  init();
}

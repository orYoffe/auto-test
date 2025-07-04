import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';

// Import routes
import { noteRoutes } from './routes/note.routes';
import { healthRoutes } from './routes/health.routes';

// Create Fastify instance
const server: FastifyInstance = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
  },
});

// Register plugins
server.register(cors);
server.register(swagger, {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Fastify API',
      description: 'Testing the Fastify API',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
  exposeRoute: true,
});

// Register routes
server.register(noteRoutes, { prefix: '/api/notes' });
server.register(healthRoutes);

// Root route
server.get('/', async () => {
  return { message: 'Welcome to Fastify API', version: '1.0.0' };
});

// Handle errors
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.name,
    message: error.message,
    statusCode: error.statusCode || 500,
  });
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await server.listen({ port, host });
    
    // Log server address
    server.log.info(`Server listening at ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Run server if file is executed directly
if (require.main === module) {
  start();
}

// Export server for testing
export { server, start };

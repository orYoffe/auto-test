import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import logger from 'koa-logger';

// Import routes
import userRouter from './routes/user.routes';
import postRouter from './routes/post.routes';

const app = new Koa();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser());
app.use(json());
app.use(logger());

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Server Error:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || 'Internal Server Error',
    };
    ctx.app.emit('error', err, ctx);
  }
});

// Routes
app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(postRouter.routes()).use(postRouter.allowedMethods());

// Base route
const router = new Router();
router.get('/', async (ctx) => {
  ctx.body = {
    message: 'Welcome to the Koa API',
    version: '1.0.0',
  };
});

app.use(router.routes()).use(router.allowedMethods());

// Start the server
if (!module.parent) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// For testing purposes
export default app;

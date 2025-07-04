import Router from 'koa-router';
import { PostController } from '../controllers/post.controller';

const router = new Router({
  prefix: '/api/posts'
});

const postController = new PostController();

// Get all posts
router.get('/', postController.getAllPosts);

// Get post by ID
router.get('/:id', postController.getPostById);

// Create new post
router.post('/', postController.createPost);

// Update post
router.put('/:id', postController.updatePost);

// Delete post
router.delete('/:id', postController.deletePost);

// Get posts by user ID
router.get('/user/:userId', postController.getPostsByUserId);

export default router;

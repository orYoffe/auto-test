import Router from 'koa-router';
import { UserController } from '../controllers/user.controller';

const router = new Router({
  prefix: '/api/users'
});

const userController = new UserController();

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

export default router;

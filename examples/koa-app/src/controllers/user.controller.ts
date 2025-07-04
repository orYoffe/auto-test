import { Context } from 'koa';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (ctx: Context): Promise<void> => {
    try {
      const users = await this.userService.findAll();
      ctx.status = 200;
      ctx.body = users;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Error retrieving users',
        error: error.message
      };
    }
  };

  getUserById = async (ctx: Context): Promise<void> => {
    try {
      const id = ctx.params.id;
      const user = await this.userService.findById(id);
      
      if (!user) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: `User with id ${id} not found`
        };
        return;
      }
      
      ctx.status = 200;
      ctx.body = user;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Error retrieving user',
        error: error.message
      };
    }
  };

  createUser = async (ctx: Context): Promise<void> => {
    try {
      const userData = ctx.request.body;
      
      // Validate user data
      if (!userData.username || !userData.email) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Username and email are required'
        };
        return;
      }
      
      const newUser = await this.userService.create(userData);
      ctx.status = 201;
      ctx.body = newUser;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Error creating user',
        error: error.message
      };
    }
  };

  updateUser = async (ctx: Context): Promise<void> => {
    try {
      const id = ctx.params.id;
      const userData = ctx.request.body;
      
      const updatedUser = await this.userService.update(id, userData);
      
      if (!updatedUser) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: `User with id ${id} not found`
        };
        return;
      }
      
      ctx.status = 200;
      ctx.body = updatedUser;
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Error updating user',
        error: error.message
      };
    }
  };

  deleteUser = async (ctx: Context): Promise<void> => {
    try {
      const id = ctx.params.id;
      const result = await this.userService.delete(id);
      
      if (!result) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: `User with id ${id} not found`
        };
        return;
      }
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: `User with id ${id} deleted successfully`
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Error deleting user',
        error: error.message
      };
    }
  };
}

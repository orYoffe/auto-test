import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskController {
  private taskService = new TaskService();

  /**
   * Get all tasks
   */
  getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const tasks = await this.taskService.findAll();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get task by ID
   */
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.taskService.findById(id);
      
      if (!task) {
        res.status(404).json({ message: `Task with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create a new task
   */
  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description } = req.body;
      
      if (!title) {
        res.status(400).json({ message: 'Task title is required' });
        return;
      }
      
      const newTask = await this.taskService.create({ 
        title, 
        description,
        completed: false
      });
      
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error creating task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Update existing task
   */
  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, completed } = req.body;
      
      const taskExists = await this.taskService.findById(id);
      
      if (!taskExists) {
        res.status(404).json({ message: `Task with ID ${id} not found` });
        return;
      }
      
      const updatedTask = await this.taskService.update(id, { 
        title, 
        description,
        completed
      });
      
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete a task
   */
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const taskExists = await this.taskService.findById(id);
      
      if (!taskExists) {
        res.status(404).json({ message: `Task with ID ${id} not found` });
        return;
      }
      
      await this.taskService.delete(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

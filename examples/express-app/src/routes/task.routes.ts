import express from 'express';
import { TaskController } from '../controllers/task.controller';

const router = express.Router();
const taskController = new TaskController();

// GET all tasks
router.get('/', taskController.getAllTasks);

// GET single task by id
router.get('/:id', taskController.getTaskById);

// POST create new task
router.post('/', taskController.createTask);

// PUT update task
router.put('/:id', taskController.updateTask);

// DELETE task
router.delete('/:id', taskController.deleteTask);

export default router;

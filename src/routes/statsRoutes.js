import express from 'express';
import { getDashboardStats } from '../controllers/AuthController.js';
import { protect } from '../middleware/AuthMiddleware.js';

const statsrRouter = express.Router();

statsrRouter.get('/dashboard', protect, getDashboardStats);

export default statsrRouter;
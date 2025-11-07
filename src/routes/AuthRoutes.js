import express from 'express';
import { signup, signin, me, createDefaultAdmin } from '../controllers/AuthController.js';
import {protect} from '../middleware/AuthMiddleware.js';

const authRouter = express.Router();

// Create default admin on server start
createDefaultAdmin();;

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.get('/me', protect, me);

export default authRouter;
import express from 'express';
import { getStaffs, adminCreateStaff, deleteStaff } from '../controllers/StaffController.js';
import { protect } from '../middleware/AuthMiddleware.js';

const staffRoutes = express.Router();

// All routes are protected
staffRoutes.use(protect);

staffRoutes.get('/list', getStaffs);
staffRoutes.post('/create', adminCreateStaff);
staffRoutes.delete('/:id', deleteStaff);

export default staffRoutes;
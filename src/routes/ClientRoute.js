import express from 'express';
import { getClients, adminCreateClient, deleteClient } from '../controllers/ClientController.js';
import { protect } from '../middleware/AuthMiddleware.js';

const clientRoutes = express.Router();

// All routes are protected
clientRoutes.use(protect);

clientRoutes.get('/list', getClients);
clientRoutes.post('/create', adminCreateClient);
clientRoutes.delete('/:id', deleteClient);

export default clientRoutes;
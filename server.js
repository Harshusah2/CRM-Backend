import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/dbConfig/dbConnection.js';
import authRouter from './src/routes/AuthRoutes.js';
import { createDefaultAdmin } from './src/controllers/AuthController.js';
import statsrRouter from './src/routes/statsRoutes.js';
import clientRoutes from './src/routes/ClientRoute.js';
import staffRoutes from './src/routes/StaffRoutes.js';

const app=express();

// Connect to MongoDB
connectDB();

createDefaultAdmin();

// Middleware
app.use(cors());
app.use(express.json());

// Add a root route handler
app.get('/', (req, res) => {
  res.json({ message: 'CRM Backend API is running' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/stats', statsrRouter);
app.use('/api/clients', clientRoutes);
app.use('/api/staffs', staffRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ ststus: 'error', message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
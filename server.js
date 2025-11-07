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

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://crm-frontend-nine-rho.vercel.app',
  'https://crm-frontend-jet-kappa.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser (Postman, server-to-server) requests with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Enable preflight for all routes

app.use(express.json());

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set. Skipping DB connect (deployment may be misconfigured).');
    } else {
      await connectDB();
      console.log('MongoDB connected successfully');
      try {
        await createDefaultAdmin();
      } catch (err) {
        console.warn('createDefaultAdmin failed:', err.message || err);
      }
    }
  } catch (err) {
    console.error('DB initialization error (caught):', err);
  }
})();

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
    console.error('Unhandled error:', err && (err.stack || err));
    res.status(500).json({ ststus: 'error', message: 'Internal Server Error' });
});

// global unhandled exception logging
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/dbConfig/dbConnection.js';
import authRouter from './src/routes/AuthRoutes.js';
import clientRoutes from './src/routes/ClientRoute.js';
import statsrRouter from './src/routes/statsRoutes.js';
import staffRoutes from './src/routes/StaffRoutes.js';

const app = express();

// Allowed origins (update with your frontend URL(s))
const allowedOrigins = [
  'http://localhost:5173',
  'https://crm-frontend-nine-rho.vercel.app',
  'https://crm-frontend-jet-kappa.vercel.app'
];

// CORS middleware: respond to preflight even if DB not connected
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Add a lightweight OPTIONS responder (no path pattern) to handle preflight
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') return next();

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    // mirror requested headers or use a safe default
    const reqHeaders = req.headers['access-control-request-headers'] || 'Content-Type,Authorization';
    res.setHeader('Access-Control-Allow-Origin', origin || '');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', reqHeaders);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }

  return res.sendStatus(403);
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set — skipping DB connect (set it in Vercel env vars).');
      return;
    }
    await connectDB();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connect error (caught):', err);
  }
})();

// Basic root route for health check
app.get('/', (req, res) => {
  res.json({ message: 'CRM Backend API is running' });
});


app.use('/api/auth', authRouter);
app.use('/api/clients', clientRoutes);
app.use('/api/stats', statsrRouter);
app.use('/api/staffs', staffRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && (err.stack || err));
  const status = err?.status || 500;
  res.status(status).json({ status: 'error', message: err?.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
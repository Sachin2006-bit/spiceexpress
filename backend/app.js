import express from 'express';
import cors from 'cors'; 
import annexureRoutes from './routes/annexureRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import lrRoutes from './routes/lrRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import misRoutes from './routes/misRoutes.js';

const app = express();

// CORS configuration for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://spiceexpress.netlify.app',
        'https://spiceexpress-frontend.netlify.app',
        // Add your actual Netlify URL here when you get it
      ]
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Spice Express API is running!', 
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/customers', customerRoutes);
app.use('/api/lr', lrRoutes);
app.use('/api/annexure', annexureRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/mis', misRoutes);

export default app;

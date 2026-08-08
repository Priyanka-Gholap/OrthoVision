import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import healthRouter from './routes/health';
import authRouter from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';

const app = express();

// Express configuration & standard middlewares
app.use(cors({
  origin: 'http://localhost:3000', // Explicit origin required when credentials=true
  credentials: true, // Allow cookies to be shared
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-AI-SERVICE-KEY'],
}));

app.use(express.json({ limit: '10mb' })); // Limit body sizes for landmark array streams
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use(loggerMiddleware);

// API Routing prefixes
app.use('/api', healthRouter); // Mounts GET /api/health

// API V1 versioned routing prefixes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', patientRoutes);
// app.use('/api/v1/doctors', doctorRouter);
// app.use('/api/v1/report', reportRouter);

// Global Catcher Error Handling
app.use(errorHandlerMiddleware);

export default app;

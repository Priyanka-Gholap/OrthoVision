import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import healthRouter from './routes/health';

const app = express();

// Express configuration & standard middlewares
app.use(cors({
  origin: '*', // Allow all origins for local dev integration, tighten in prod
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-AI-SERVICE-KEY'],
}));

app.use(express.json({ limit: '10mb' })); // Limit body sizes for landmark array streams
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use(loggerMiddleware);

// API Routing prefixes
app.use('/api', healthRouter); // Mounts GET /api/health

// API V1 versioned routing prefixes (defined for future controllers in Milestone 2)
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/patients', patientRouter);
// app.use('/api/v1/doctors', doctorRouter);
// app.use('/api/v1/assessment', assessmentRouter);
// app.use('/api/v1/report', reportRouter);

// Global Catcher Error Handling
app.use(errorHandlerMiddleware);

export default app;

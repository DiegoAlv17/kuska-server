import 'dotenv/config';
import './shared/types'; // Importar tipos extendidos de Express
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Request, Response } from 'express';
import authRoutes from './auth/infrastructure/routes/authRoutes';
import projectRoutes from './projects/infrastructure/routes/projectRoutes';
import taskRoutes from './projects/infrastructure/routes/taskRoutes';
import teamRoutes from './tems/infrastructure/routes/teamRoutes';
import channelRoutes from './communication/infrastructure/routes/channelRoutes';
import messageRoutes from './communication/infrastructure/routes/messageRoutes';
import callRoutes from './communication/infrastructure/routes/callRoutes';
import peopleRoutes from './people/infrastructure/routes/peopleRoutes';
import presenceRoutes from './shared/infrastructure/routes/presenceRoutes';
import { errorHandler } from './shared/infrastructure/middlewares/errorHandler';

import templateRoutes from './templates/infrastructure/routes/templateRoutes';


const app = express();

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origin (como Postman o apps móviles)
      if (!origin) return callback(null, true);
      
      // Si CORS_ORIGIN es '*', permitir todos
      if (allowedOrigins.includes('*')) return callback(null, true);
      
      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Kuska Server API is running',
    version: '1.0.0',
  });
});

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/presence', presenceRoutes);

app.use('/api/templates', templateRoutes);


// Swagger UI (OpenAPI)
try {
  const openapiPath = path.join(__dirname, '..', 'docs', 'openapi.json');
  // If running with ts-node the __dirname may point to src; try also src/docs
  const openapiDoc = require(openapiPath);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));
} catch (e) {
  // If docs not found or swagger not installed, skip serving docs
  // console.warn('Swagger UI not mounted:', e.message);
}

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
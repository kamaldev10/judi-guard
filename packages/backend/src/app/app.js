import apiRouter from '#app/api.routes.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '#config/swagger.js';
import errorHandler from '#middlewares/error-handler.js';
import { NotFoundError } from '#shared/utils/errors.js';

const app = express();

// Daftar origin yang diizinkan
const allowedOrigins = [
  'http://localhost:5173',
  'https://judiguard.vercel.app',
  'https://judiguard.kamaldev.web.id',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Akses tidak diizinkan oleh kebijakan CORS'));
    }
  },
  credentials: true, // Penting jika Anda mengirim cookies atau header Authorization
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Metode HTTP yang diizinkan
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires',
  ], // Header yang diizinkan
};

app.use(cors(corsOptions));

// helmet defaults are strong, only relax what Google OAuth needs
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://accounts.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://accounts.google.com'],
        frameSrc: ["'self'", 'https://accounts.google.com'],
      },
    },
  }),
);

// global rate limit, per-IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Terlalu banyak permintaan, coba lagi nanti.' },
});
app.use(globalLimiter);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Judi Guard API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Server Judi Guard is alive! 🚀');
});

app.use((req, res, next) => {
  next(new NotFoundError(`Resource not found at ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;

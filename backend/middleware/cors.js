import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',   // Vite dev
  'http://localhost:4173',   // Vite preview
  process.env.FRONTEND_URL, // producción
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
});

import cors from 'cors';

// Normaliza un origin quitando la barra final (https://x.app/ === https://x.app)
const normalize = (o) => (o ?? '').replace(/\/+$/, '');

const allowedOrigins = [
  'http://localhost:5173',   // Vite dev
  'http://localhost:4173',   // Vite preview
  process.env.FRONTEND_URL,  // producción (URL canónica de Vercel)
].filter(Boolean).map(normalize);

// Permite el dominio configurado y cualquier deploy de Vercel (*.vercel.app),
// para que los preview deploys también funcionen sin reconfigurar el backend.
function isAllowed(origin) {
  const o = normalize(origin);
  if (allowedOrigins.includes(o)) return true;
  try {
    return new URL(o).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, health checks, etc.)
    if (!origin) return callback(null, true);
    if (isAllowed(origin)) return callback(null, true);
    callback(new Error('No permitido por CORS'));
  },
  credentials: true,
});

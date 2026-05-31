import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import router from './router.js';
import { processScheduledReminders } from './jobs/reminderJob.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(corsMiddleware);
app.use(express.json());

// Health check — verifica que el servidor está vivo
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'MedIL Backend API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', router);

// Manejo global de errores (siempre al final)
app.use(errorHandler);

// Job: procesar recordatorios cada 5 minutos
// Solo en producción o si ENABLE_REMINDER_JOB=true
if (process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_REMINDER_JOB === 'true') {
  setInterval(processScheduledReminders, 5 * 60 * 1000);
  console.log('Job de recordatorios activado (cada 5 min)');
} else {
  console.log('Job de recordatorios desactivado en desarrollo');
  console.log('Activar con ENABLE_REMINDER_JOB=true en .env');
}

app.listen(PORT, () => {
  console.log(`MedIL Backend corriendo en http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;

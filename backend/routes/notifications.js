import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/notify/reminder
// Etapa 8: Twilio envía recordatorio por WhatsApp
router.post('/reminder', requireAuth, async (req, res, next) => {
  try {
    // TODO Etapa 8: implementar con Twilio API
    res.status(501).json({ message: 'Disponible en Etapa 8 — WhatsApp integrado' });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/ai/suggest-diagnosis
// Etapa 8: Claude API sugiere diagnósticos basados en síntomas
router.post('/suggest-diagnosis', requireAuth, async (req, res, next) => {
  try {
    // TODO Etapa 8: implementar con Claude API
    res.status(501).json({ message: 'Disponible en Etapa 8 — IA integrada' });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/summarize-history
// Etapa 8: Claude API resume el historial clínico del paciente
router.post('/summarize-history', requireAuth, async (req, res, next) => {
  try {
    // TODO Etapa 8: implementar con Claude API
    res.status(501).json({ message: 'Disponible en Etapa 8 — IA integrada' });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/generate-reminder-message
// Etapa 8: Claude API genera mensaje personalizado de recordatorio
router.post('/generate-reminder-message', requireAuth, async (req, res, next) => {
  try {
    // TODO Etapa 8: implementar con Claude API
    res.status(501).json({ message: 'Disponible en Etapa 8 — IA integrada' });
  } catch (error) {
    next(error);
  }
});

export default router;

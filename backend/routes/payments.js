import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/payments/generate-qr
// Etapa 7: PagoFácil genera QR real de pago
router.post('/generate-qr', requireAuth, async (req, res, next) => {
  try {
    // TODO Etapa 7: implementar con PagoFácil API
    const { amount, appointmentId } = req.body;

    if (!amount || !appointmentId) {
      return res.status(400).json({
        error:   'Datos incompletos',
        message: 'amount y appointmentId son requeridos',
      });
    }

    // Simulación hasta Etapa 7
    res.json({
      qrCode:        'data:image/png;base64,SIMULATED_QR_' + Date.now(),
      transactionId: 'TXN_' + Date.now(),
      amount,
      message:       'QR simulado — conectar PagoFácil en Etapa 7',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/payments/status/:transactionId
// Etapa 7: verifica el estado del pago
router.get('/status/:transactionId', requireAuth, async (req, res, next) => {
  try {
    // TODO Etapa 7: verificar con PagoFácil API
    res.json({
      transactionId: req.params.transactionId,
      status:        'approved',
      message:       'Estado simulado — conectar PagoFácil en Etapa 7',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

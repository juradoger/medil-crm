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

// POST /api/payments/cash
// Registra un pago en efectivo aprobado para una cita
router.post('/cash', requireAuth, async (req, res, next) => {
  try {
    const { appointmentId, amount, branchId } = req.body;

    if (!appointmentId || !amount) {
      return res.status(400).json({
        error:   'Datos incompletos',
        message: 'appointmentId y amount son requeridos',
      });
    }

    const { db } = await import('../infrastructure/insforge.js');
    const { PAYMENT_STATUS, PAYMENT_METHODS } = await import('../core/constants.js');

    const now        = new Date().toISOString();
    const commission = amount * 0.02;

    const { data, error } = await db.from('payments')
      .insert({
        id:            'pay_' + Date.now(),
        appointmentId,
        branchId,
        amount,
        commission,
        totalAmount:   amount + commission,
        paymentMethod: PAYMENT_METHODS.CASH,
        status:        PAYMENT_STATUS.APPROVED,
        createdAt:     now,
        updatedAt:     now,
      })
      .select()
      .single();

    if (error) throw new Error('Error al registrar el pago');

    res.json({
      payment: data,
      message: 'Pago en efectivo registrado correctamente',
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

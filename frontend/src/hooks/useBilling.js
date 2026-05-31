// Hook personalizado para el ciclo de pago QR — Custom hook for QR payment cycle
import { useState, useCallback, useRef } from 'react';
import { billingService } from '../billing/billingService';
import { eventBus } from '../core/eventBus';
import {
  QR_POLLING_INTERVAL_MS,
  QR_MAX_POLLING_ATTEMPTS,
  PAYMENT_STATUS,
} from '../core/constants';

/**
 * Estados del pago — Payment states:
 * idle → loading → polling → success | error
 */
export function useBilling() {
  const [paymentState, setPaymentState] = useState('idle');
  const [qrData, setQrData]             = useState(null);
  const [error, setError]               = useState(null);
  const [loading, setLoading]           = useState(false);

  const pollingRef  = useRef(null);
  const attemptsRef = useRef(0);

  // Detiene el polleo activo — Stops active polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Reinicia todo el estado — Resets all state
  const resetPayment = useCallback(() => {
    stopPolling();
    setPaymentState('idle');
    setQrData(null);
    setError(null);
    setLoading(false);
    attemptsRef.current = 0;
  }, [stopPolling]);

  // Inicia el polleo para verificar el pago — Starts polling to verify payment
  const startPolling = useCallback((transactionId) => {
    attemptsRef.current = 0;

    pollingRef.current = setInterval(async () => {
      attemptsRef.current += 1;

      if (attemptsRef.current >= QR_MAX_POLLING_ATTEMPTS) {
        stopPolling();
        setPaymentState('error');
        setError('Tiempo de espera agotado');
        eventBus.emit('payment:rejected', { transactionId, error: 'Tiempo de espera agotado' });
        return;
      }

      try {
        const statusResult = await billingService.checkPaymentStatus(transactionId);

        if (statusResult.status === PAYMENT_STATUS.APPROVED) {
          stopPolling();
          setPaymentState('success');
          eventBus.emit('payment:approved', { transactionId });
        } else if (statusResult.status === PAYMENT_STATUS.REJECTED) {
          stopPolling();
          setPaymentState('error');
          setError('Pago rechazado');
          eventBus.emit('payment:rejected', { transactionId, error: 'Pago rechazado' });
        }
      } catch {
        // Continúa polleando en errores transitorios — Continue polling on transient errors
      }
    }, QR_POLLING_INTERVAL_MS);
  }, [stopPolling]);

  // Genera el QR e inicia el ciclo de pago — Generates QR and starts payment cycle
  const generateQR = useCallback(async (data) => {
    setPaymentState('loading');
    setLoading(true);
    setError(null);

    try {
      const result = await billingService.generatePaymentQR(data);
      setQrData(result);
      setPaymentState('polling');
      startPolling(result.transactionId);
    } catch (err) {
      setPaymentState('error');
      setError(err.message || 'Error al generar QR');
    } finally {
      setLoading(false);
    }
  }, [startPolling]);

  return { generateQR, paymentState, qrData, error, loading, resetPayment };
}

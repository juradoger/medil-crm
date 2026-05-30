// Modal de pago QR
import React, { useEffect } from 'react';
import { useBilling } from '../../hooks/useBilling';
import { QR_COMMISSION_PERCENTAGE } from '../../core/constants';

/**
 * Modal de pago QR con polleo automático — QR payment modal with automatic polling
 * @param {{ isOpen: boolean, onClose: Function, appointmentId: string,
 *           amount: number, branchId: string, onPaymentSuccess: Function }} props
 */
export function PaymentModal({ isOpen, onClose, appointmentId, amount, branchId, onPaymentSuccess }) {
  const { generateQR, paymentState, qrData, error, loading, resetPayment } = useBilling();

  // Inicia QR al abrir, limpia al cerrar — Starts QR on open, cleans up on close
  useEffect(() => {
    if (isOpen && amount > 0) {
      generateQR({ appointmentId, amount, branchId });
    }
    return () => {
      if (!isOpen) resetPayment();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Notifica éxito al componente padre — Notifies success to parent component
  useEffect(() => {
    if (paymentState === 'success') {
      onPaymentSuccess();
      onClose();
    }
  }, [paymentState, onPaymentSuccess, onClose]);

  if (!isOpen) return null;

  // Cálculo de desglose — Breakdown calculation
  const commission = parseFloat((amount * QR_COMMISSION_PERCENTAGE).toFixed(2));
  const total      = amount + commission;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">

        {/* Encabezado — Header */}
        <h2 className="text-xl font-bold text-[#0E4A8A] mb-4 text-center">
          Pago QR
        </h2>

        {/* Desglose de montos — Amount breakdown */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>Bs. {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Comisión QR (2%)</span>
            <span>Bs. {commission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#0E4A8A] text-base border-t border-gray-200 pt-2">
            <span>Total</span>
            <span>Bs. {total.toFixed(2)}</span>
          </div>
        </div>

        {/* QR o estado — QR or status */}
        <div className="flex flex-col items-center gap-3 my-4 min-h-[160px] justify-center">
          {loading && (
            <div className="text-center text-gray-500">
              <div className="animate-spin h-10 w-10 border-4 border-[#00B4D8] border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm">Generando QR...</p>
            </div>
          )}

          {paymentState === 'polling' && qrData && (
            <>
              <img
                src={qrData.qrCode}
                alt="Código QR de pago"
                className="w-40 h-40 rounded-lg border-2 border-[#00B4D8] object-contain bg-white p-1"
                onError={e => {
                  // Si la imagen falla muestra placeholder visual — If image fails show visual placeholder
                  e.target.style.display = 'none';
                }}
              />
              {/* Placeholder visual cuando el QR es simulado — Visual placeholder when QR is simulated */}
              <div className="w-40 h-40 rounded-lg border-2 border-dashed border-[#00B4D8] flex items-center justify-center bg-[#00B4D8]/5 hidden"
                aria-label="QR placeholder">
                <span className="text-[#00B4D8] text-xs text-center px-2">
                  Escanea el QR
                </span>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Esperando confirmación...
              </p>
            </>
          )}

          {paymentState === 'error' && (
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-600 font-medium text-sm">
                {error || 'Error en el pago'}
              </p>
            </div>
          )}
        </div>

        {/* Botón cancelar — Cancel button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Cancelar pago"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

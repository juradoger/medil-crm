// Compuerta de pago: aparece cuando una cita requiere pago antes de confirmarse
import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { ConfirmModal } from '../molecules/ConfirmModal';
import { PaymentModal } from './PaymentModal';
import { QR_COMMISSION_PERCENTAGE } from '../core/constants';
import { MESSAGES } from '../core/messages';

export function PaymentGate({ isOpen, appointmentData, onPaymentSuccess, onCancel, amount = 0 }) {
  const [showQR, setShowQR]             = useState(false);
  const [showCashConfirm, setShowCash]  = useState(false);

  if (!isOpen) return null;

  const commission = parseFloat((amount * QR_COMMISSION_PERCENTAGE).toFixed(2));
  const total      = parseFloat((amount + commission).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center medil-modal-overlay p-4">
      <div className="medil-modal relative bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-[#0E4A8A]">
          Pago requerido para confirmar la cita
        </h2>

        {/* Info de la cita */}
        <div className="text-sm text-gray-500 space-y-0.5">
          {appointmentData?.patientName  && <p>Paciente: {appointmentData.patientName}</p>}
          {appointmentData?.professional && <p>Profesional: {appointmentData.professional}</p>}
          {appointmentData?.date && <p>Fecha: {appointmentData.date} {appointmentData.time ?? ''}</p>}
        </div>

        {/* Desglose de montos */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <p className="text-3xl font-bold text-[#0E4A8A]">Bs. {amount.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Comisión QR: Bs. {commission.toFixed(2)}</p>
          <p className="text-base font-semibold text-[#0E4A8A]">Total: Bs. {total.toFixed(2)}</p>
        </div>

        {/* Opciones de pago */}
        <div className="flex flex-col gap-2">
          <Button label="Pagar con QR" variant="primary" fullWidth onClick={() => setShowQR(true)} />
          <Button label="Registrar pago en efectivo" variant="ghost" fullWidth onClick={() => setShowCash(true)} />
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancelar
        </button>
      </div>

      {/* Pago por QR */}
      <PaymentModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        appointmentId={appointmentData?.appointmentId}
        amount={amount}
        branchId={appointmentData?.branchId}
        onPaymentSuccess={() => { setShowQR(false); onPaymentSuccess('qr'); }}
      />

      {/* Pago en efectivo */}
      <ConfirmModal
        open={showCashConfirm}
        title="Pago en efectivo"
        description={MESSAGES.confirm.paymentCash}
        onConfirm={() => { setShowCash(false); onPaymentSuccess('cash'); }}
        onCancel={() => setShowCash(false)}
      />
    </div>
  );
}

// Modal de confirmación con variante peligrosa
import React from 'react';
import { Button } from '../atoms/Button';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo semitransparente — click fuera cierra */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {message && <p className="text-sm text-gray-500">{message}</p>}

        <div className="flex justify-end gap-3 mt-2">
          <Button label={cancelLabel} variant="secondary" onClick={onClose} />
          <Button
            label={confirmLabel}
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
}

// Modal de confirmación con variante peligrosa
import React from 'react';
import { Button } from '../atoms/Button';

export function ConfirmModal({
  isOpen,
  open,           // alias backward-compat
  onClose,
  onCancel,       // alias backward-compat
  onConfirm,
  title,
  message,
  description,    // alias backward-compat
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
}) {
  const visible    = isOpen ?? open ?? false;
  const handleClose = onClose ?? onCancel ?? (() => {});
  const text       = message ?? description ?? '';

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo semitransparente — click fuera cierra */}
      <div className="absolute inset-0 medil-modal-overlay" onClick={handleClose} />

      <div className="medil-modal relative bg-white rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {text && <p className="text-sm text-gray-500">{text}</p>}

        <div className="flex justify-end gap-3 mt-2">
          <Button label={cancelLabel} variant="secondary" onClick={handleClose} />
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

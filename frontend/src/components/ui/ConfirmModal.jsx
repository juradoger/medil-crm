// Modal de confirmación
import React from 'react';

export function ConfirmModal({ open, title, description, onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#00B4D8] hover:bg-[#0096B4]'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

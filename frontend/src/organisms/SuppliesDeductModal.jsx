// Modal para descontar insumos sugeridos por la IA tras una consulta
// El organismo solo gestiona la lista editable; la deducción real
// la hace la página vía el hook useSupplies (regla de dependencias).
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';

export function SuppliesDeductModal({ isOpen, suggestions = [], onConfirm, onCancel }) {
  // Lista local editable de insumos sugeridos
  const [items, setItems] = useState([]);

  // Sincroniza la lista local cuando se abre el modal o cambian las sugerencias
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(suggestions.map(s => ({ name: s.name, quantity: Number(s.quantity) || 1 })));
    }
  }, [isOpen, suggestions]);

  if (!isOpen) return null;

  function handleQuantityChange(index, value) {
    setItems(prev => prev.map((it, i) =>
      i === index ? { ...it, quantity: Math.max(0, Number(value) || 0) } : it
    ));
  }

  function handleRemove(index) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    onConfirm(items.filter(it => it.quantity > 0));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 medil-modal-overlay" onClick={onCancel} />

      <div className="medil-modal relative bg-white rounded-xl w-full max-w-md p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            ¿Descontar insumos del inventario?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            La IA sugirió estos insumos según el diagnóstico. Ajustá las cantidades o quitá los que no correspondan.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center bg-gray-50 rounded-lg border border-gray-100">
            No hay insumos para descontar.
          </p>
        ) : (
          <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50"
              >
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{item.name}</span>
                <input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={e => handleQuantityChange(index, e.target.value)}
                  aria-label={`Cantidad de ${item.name}`}
                  className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label={`Quitar ${item.name}`}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <Button label="Omitir" variant="ghost" size="sm" onClick={onCancel} />
          <Button
            label="Confirmar descuento"
            variant="primary"
            size="sm"
            disabled={items.length === 0}
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}

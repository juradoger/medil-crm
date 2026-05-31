// Gestión de insumos (solo admin)
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSupplies } from '../../hooks/useSupplies';
import { DataTable } from '../../organisms/DataTable';
import { StatusBadge } from '../../molecules/StatusBadge';
import { ConfirmModal } from '../../molecules/ConfirmModal';
import { FullPageSpinner } from '../../atoms/Spinner';
import { FormField, inputClass } from '../../molecules/FormField';
import { SUPPLY_STATUS } from '../../core/constants';
import { supplyService } from '../../services/supplyService';


const EMPTY_FORM = { name: '', stockCurrent: 0, stockMinimum: 0, unit: 'unidades' };

function SupplyModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name ?? '',
          stockCurrent: initial.stockCurrent ?? 0,
          stockMinimum: initial.stockMinimum ?? 0,
          unit: initial.unit ?? 'unidades',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    if (form.stockCurrent < 0 || form.stockMinimum < 0) {
      setError('Las cantidades no pueden ser negativas');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const previewStatus = supplyService.calculateStatus(form.stockCurrent, form.stockMinimum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-[#0E4A8A] mb-4">
          {initial ? 'Editar Insumo' : 'Nuevo Insumo'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nombre del insumo">
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Stock actual">
              <input type="number" min="0" className={inputClass} value={form.stockCurrent} onChange={e => set('stockCurrent', Number(e.target.value))} required />
            </FormField>
            <FormField label="Stock mínimo">
              <input type="number" min="0" className={inputClass} value={form.stockMinimum} onChange={e => set('stockMinimum', Number(e.target.value))} required />
            </FormField>
          </div>
          <FormField label="Unidad de medida">
            <input className={inputClass} value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="Ej: cajas, unidades, frascos" required />
          </FormField>
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="text-xs font-medium text-gray-500">Estado resultante:</span>
            <StatusBadge status={previewStatus} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustStockModal({ supply, onSave, onClose }) {
  const [newStock, setNewStock] = useState(supply.stockCurrent);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (newStock < 0) {
      setError('El stock no puede ser negativo');
      return;
    }
    setSaving(true);
    try {
      await onSave(newStock);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const previewStatus = supplyService.calculateStatus(newStock, supply.stockMinimum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-[#0E4A8A] mb-2 font-bold">Ajustar Stock</h2>
        <p className="text-sm text-gray-500 mb-4">{supply.name}</p>
        <form onSubmit={submit} className="space-y-4">
          <FormField label={`Cantidad (${supply.unit})`}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewStock(s => Math.max(0, s - 1))}
                className="w-10 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-gray-600"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                className={`${inputClass} text-center flex-1`}
                value={newStock}
                onChange={e => setNewStock(Number(e.target.value))}
                required
              />
              <button
                type="button"
                onClick={() => setNewStock(s => s + 1)}
                className="w-10 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-gray-600"
              >
                +
              </button>
            </div>
          </FormField>
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="text-xs font-medium text-gray-500">Estado resultante:</span>
            <StatusBadge status={previewStatus} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50 font-medium">
              {saving ? 'Guardando…' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Supplies() {
  const { currentBranchId } = useAuth();
  const { supplies, loading, create, update, adjustStock, remove } = useSupplies(currentBranchId);

  const [modal, setModal]           = useState(null);
  const [adjustTarget, setAdjust]   = useState(null);
  const [deleteTarget, setDelete]   = useState(null);

  const counts = useMemo(() => {
    let ok = 0, low = 0, critical = 0;
    for (const s of supplies) {
      if (s.status === SUPPLY_STATUS.OK) ok++;
      else if (s.status === SUPPLY_STATUS.LOW) low++;
      else if (s.status === SUPPLY_STATUS.CRITICAL) critical++;
    }
    return { ok, low, critical };
  }, [supplies]);

  const sorted = useMemo(() => {
    const priority = { critical: 1, low: 2, ok: 3 };
    return [...supplies].sort((a, b) => {
      const pA = priority[a.status] ?? 4;
      const pB = priority[b.status] ?? 4;
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });
  }, [supplies]);

  const columns = [
    { key: 'name',         label: 'Nombre' },
    { key: 'stockCurrent', label: 'Stock actual', render: r => `${r.stockCurrent} ${r.unit}` },
    { key: 'stockMinimum', label: 'Stock mínimo', render: r => `${r.stockMinimum} ${r.unit}` },
    { key: 'status',       label: 'Estado',       render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-3">
          <button onClick={() => setAdjust(r)} className="text-gray-400 hover:text-[#00B4D8] transition-colors" title="Ajustar stock">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button onClick={() => setModal(r)} className="text-gray-400 hover:text-[#0E4A8A] transition-colors" title="Editar">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => setDelete(r)} className="text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const handleSave = async (form) => {
    if (modal === 'create') {
      await create(form);
    } else {
      await update(modal.id, form);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0E4A8A]">Insumos y Suministros</h1>
          <p className="text-sm text-gray-400 mt-0.5">Control de inventario y alertas de stock de la sucursal</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors"
        >
          + Nuevo insumo
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stock Crítico</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{counts.critical}</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-red-600" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-500 mt-1">{counts.low}</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-orange-500" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Suficiente</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{counts.ok}</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-green-600" />
        </div>
      </div>

      <DataTable columns={columns} rows={sorted} emptyTitle="Sin insumos registrados" />

      {modal && (
        <SupplyModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {adjustTarget && (
        <AdjustStockModal
          supply={adjustTarget}
          onSave={async (newStock) => {
            await adjustStock(adjustTarget.id, newStock, adjustTarget.stockMinimum);
            setAdjust(null);
          }}
          onClose={() => setAdjust(null)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="¿Eliminar insumo?"
        description={`Esta acción eliminará ${deleteTarget?.name} del inventario de forma permanente.`}
        onConfirm={async () => {
          await remove(deleteTarget.id);
          setDelete(null);
        }}
        onCancel={() => setDelete(null)}
      />
    </div>
  );
}

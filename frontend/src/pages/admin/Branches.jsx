// Gestión de sucursales (solo admin)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBranches } from '../../hooks/useBranches';
import { DataTable } from '../../organisms/DataTable';
import { FullPageSpinner } from '../../atoms/Spinner';
import { FormField, inputClass } from '../../molecules/FormField';

const EMPTY_FORM = { name: '', address: '', phone: '', city: '' };

function BranchModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {initial ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nombre">
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormField>
          <FormField label="Ciudad">
            <input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} />
          </FormField>
          <FormField label="Dirección">
            <input className={inputClass} value={form.address} onChange={e => set('address', e.target.value)} />
          </FormField>
          <FormField label="Teléfono">
            <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} />
          </FormField>
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

export default function Branches() {
  const { branches, loading, create, update } = useBranches();
  const [modal, setModal] = useState(null);

  const columns = [
    { key: 'name',    label: 'Nombre' },
    { key: 'city',    label: 'Ciudad' },
    { key: 'address', label: 'Dirección' },
    { key: 'phone',   label: 'Teléfono' },
    {
      key: 'actions', label: '',
      render: r => (
        <button onClick={() => setModal(r)} className="text-gray-400 hover:text-[#00B4D8] transition-colors" title="Editar">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      ),
    },
  ];

  const handleSave = async (form) => {
    if (modal === 'create') { await create(form); }
    else { await update(modal.id, form); }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Sucursales</h1>
        <button onClick={() => setModal('create')} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4]">
          + Nueva
        </button>
      </div>

      <DataTable columns={columns} rows={branches} emptyTitle="Sin sucursales registradas" />

      {modal && (
        <BranchModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

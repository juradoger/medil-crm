// Gestión de pacientes
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatients } from '../hooks/usePatients';
import { DataTable } from '../organisms/DataTable';
import { SearchBar } from '../molecules/SearchBar';
import { StatusBadge } from '../molecules/StatusBadge';
import { ConfirmModal } from '../molecules/ConfirmModal';
import { FullPageSpinner } from '../atoms/Spinner';
import { FormField, inputClass } from '../molecules/FormField';
import { PATIENT_STATUS } from '../core/constants';

const EMPTY_FORM = { name: '', phone: '', email: '' };

function PatientModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial ? { name: initial.name ?? '', phone: initial.phone ?? '', email: initial.email ?? '' } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

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
          {initial ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nombre completo">
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormField>
          <FormField label="Teléfono">
            <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} />
          </FormField>
          <FormField label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
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

export default function Patients() {
  const { currentBranchId } = useAuth();
  const { patients, loading, create, update, remove } = usePatients(currentBranchId);

  const [query, setQuery]         = useState('');
  const [modal, setModal]         = useState(null);
  const [deleteTarget, setDelete] = useState(null);

  const filtered = query.trim()
    ? patients.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()))
    : patients.filter(p => p.status !== PATIENT_STATUS.INACTIVE);

  const columns = [
    { key: 'name',  label: 'Nombre' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Estado', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-2">
          <Link to={`/patients/${r.id}`} className="text-xs text-[#00B4D8] hover:underline">Ver</Link>
          <button onClick={() => setModal(r)} className="text-xs text-gray-500 hover:text-[#0E4A8A]">Editar</button>
          <button onClick={() => setDelete(r)} className="text-xs text-red-400 hover:text-red-600">Desactivar</button>
        </div>
      ),
    },
  ];

  const handleSave = async (form) => {
    if (modal === 'create') { await create(form); }
    else { await update(modal.id, form); }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Pacientes</h1>
        <button onClick={() => setModal('create')} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4]">
          + Nuevo
        </button>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Buscar por nombre…" />

      <DataTable columns={columns} rows={filtered} emptyTitle="Sin pacientes registrados" />

      {modal && (
        <PatientModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="¿Desactivar paciente?"
        description={`${deleteTarget?.name} pasará a estado inactivo`}
        onConfirm={async () => { await remove(deleteTarget.id); setDelete(null); }}
        onCancel={() => setDelete(null)}
      />
    </div>
  );
}

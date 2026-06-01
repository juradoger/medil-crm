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
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-50">
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
    { key: 'phone', label: 'Teléfono', className: 'hidden md:table-cell' },
    { key: 'email', label: 'Email', className: 'hidden md:table-cell' },
    { key: 'status', label: 'Estado', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-3">
          <Link to={`/patients/${r.id}`} className="text-gray-400 hover:text-primary transition-colors" title="Ver detalle">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
          <button onClick={() => setModal(r)} className="text-gray-400 hover:text-navy transition-colors" title="Editar">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => setDelete(r)} className="text-gray-400 hover:text-red-500 transition-colors" title="Desactivar">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </button>
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
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Pacientes</h1>
        <button onClick={() => setModal('create')} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark">
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

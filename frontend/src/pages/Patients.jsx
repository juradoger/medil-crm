// Gestión de pacientes — Patient management
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePatients } from '../hooks/usePatients';
import { DataTable } from '../components/ui/DataTable';
import { SearchBar } from '../components/ui/SearchBar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { FullPageSpinner } from '../components/ui/LoadingSpinner';
import { FormField, inputClass } from '../components/ui/FormField';
import { PATIENT_STATUS } from '../core/constants';

const EMPTY_FORM = { fullName: '', ci: '', phone: '', email: '', birthDate: '' };

function PatientModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.ci.trim()) {
      setError('Nombre y CI son obligatorios — Name and ID are required');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {initial ? 'Editar Paciente — Edit Patient' : 'Nuevo Paciente — New Patient'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nombre completo — Full name">
            <input className={inputClass} value={form.fullName} onChange={e => set('fullName', e.target.value)} />
          </FormField>
          <FormField label="CI / Documento — ID Number">
            <input className={inputClass} value={form.ci} onChange={e => set('ci', e.target.value)} />
          </FormField>
          <FormField label="Teléfono — Phone">
            <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} />
          </FormField>
          <FormField label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </FormField>
          <FormField label="Fecha de nacimiento — Birth date">
            <input className={inputClass} type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
          </FormField>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar — Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar — Save'}
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
  const [modal, setModal]         = useState(null); // null | 'create' | patient object
  const [deleteTarget, setDelete] = useState(null);

  const filtered = query.trim()
    ? patients.filter(p =>
        p.fullName?.toLowerCase().includes(query.toLowerCase()) ||
        p.ci?.toLowerCase().includes(query.toLowerCase())
      )
    : patients.filter(p => p.status !== PATIENT_STATUS.INACTIVE);

  const columns = [
    { key: 'fullName', label: 'Nombre — Name' },
    { key: 'ci', label: 'CI' },
    { key: 'phone', label: 'Teléfono — Phone' },
    { key: 'status', label: 'Estado — Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-2">
          <Link to={`/patients/${r.id ?? r._id}`} className="text-xs text-[#00B4D8] hover:underline">Ver — View</Link>
          <button onClick={() => setModal(r)} className="text-xs text-gray-500 hover:text-[#0E4A8A]">Editar — Edit</button>
          <button onClick={() => setDelete(r)} className="text-xs text-red-400 hover:text-red-600">Desactivar — Deactivate</button>
        </div>
      ),
    },
  ];

  const handleSave = async (form) => {
    if (modal === 'create') {
      await create(form);
    } else {
      await update(modal.id ?? modal._id, form);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Pacientes — Patients</h1>
        <button
          onClick={() => setModal('create')}
          className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors"
        >
          + Nuevo — New
        </button>
      </div>

      <SearchBar value={query} onChange={setQuery} placeholder="Buscar por nombre o CI — Search by name or ID" />

      <DataTable
        columns={columns}
        rows={filtered}
        emptyTitle="Sin pacientes — No patients"
      />

      {modal && (
        <PatientModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="¿Desactivar paciente? — Deactivate patient?"
        description={`${deleteTarget?.fullName} pasará a estado inactivo — will become inactive`}
        onConfirm={async () => { await remove(deleteTarget.id ?? deleteTarget._id); setDelete(null); }}
        onCancel={() => setDelete(null)}
      />
    </div>
  );
}

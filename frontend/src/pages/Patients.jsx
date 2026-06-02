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
import { Button } from '../atoms/Button';
import { FormField, inputClass } from '../molecules/FormField';
import { PATIENT_STATUS, USER_ROLES } from '../core/constants';
import { ArrowLeft, Plus, Eye, Pencil, UserX } from 'lucide-react';

const EMPTY_FORM = { name: '', ci: '', phone: '', email: '' };
const CI_REGEX = /^\d{5,12}(-?\d{0,3}\s?[A-Za-z]{0,2})?$/;

function PatientModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial
      ? { name: initial.name ?? '', ci: initial.ci ?? '', phone: initial.phone ?? '', email: initial.email ?? '' }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    if (!form.ci.trim())   { setError('El CI es obligatorio'); return; }
    if (!CI_REGEX.test(form.ci.trim())) { setError('Ingresá un CI válido (5 a 12 dígitos)'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 medil-modal-overlay" onClick={onClose} />
      <div className="medil-modal relative bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {initial ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nombre completo">
            <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} required />
          </FormField>
          <FormField label="CI (Carnet de Identidad)">
            <input className={inputClass} inputMode="numeric" placeholder="Ej: 8451236 LP"
              value={form.ci} onChange={e => set('ci', e.target.value)} required />
          </FormField>
          <FormField label="Teléfono">
            <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} />
          </FormField>
          <FormField label="Email">
            <input className={inputClass} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </FormField>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button label="Cancelar" variant="secondary" type="button" onClick={onClose} />
            <Button label={saving ? 'Guardando…' : 'Guardar'} type="submit" loading={saving} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Patients() {
  const { currentBranchId, user } = useAuth();
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const { patients, loading, create, update, remove } = usePatients(currentBranchId);

  const [query, setQuery]         = useState('');
  const [modal, setModal]         = useState(null);
  const [deleteTarget, setDelete] = useState(null);

  const filtered = query.trim()
    ? patients.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()))
    : patients.filter(p => p.status !== PATIENT_STATUS.INACTIVE);

  const columns = [
    { key: 'name',  label: 'Nombre' },
    { key: 'ci',    label: 'CI', render: r => r.ci || '—', className: 'hidden sm:table-cell' },
    { key: 'phone', label: 'Teléfono', className: 'hidden md:table-cell' },
    { key: 'email', label: 'Email', className: 'hidden md:table-cell' },
    { key: 'status', label: 'Estado', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-3">
          <Link to={`/patients/${r.id}`} className="text-gray-400 hover:text-primary transition-colors" title="Ver detalle">
            <Eye size={18} strokeWidth={2} />
          </Link>
          <button onClick={() => setModal(r)} className="text-gray-400 hover:text-navy transition-colors" title="Editar">
            <Pencil size={18} strokeWidth={2} />
          </button>
          {/* Solo el admin puede desactivar pacientes; el doctor no */}
          {isAdmin && (
            <button onClick={() => setDelete(r)} className="text-gray-400 hover:text-red-500 transition-colors" title="Desactivar">
              <UserX size={18} strokeWidth={2} />
            </button>
          )}
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
          <ArrowLeft size={16} strokeWidth={2.25} />
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Pacientes</h1>
        <Button label="Nuevo" icon={Plus} onClick={() => setModal('create')} />
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

// Gestión de sucursales (solo admin)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBranches } from '../../hooks/useBranches';
import { DataTable } from '../../organisms/DataTable';
import { BranchPhotoGallery } from '../../organisms/BranchPhotoGallery';
import { FullPageSpinner } from '../../atoms/Spinner';
import { Button } from '../../atoms/Button';
import { FormField, inputClass } from '../../molecules/FormField';
import { Building2, ArrowLeft, Plus, Pencil, X, Check } from 'lucide-react';

const EMPTY_FORM = { name: '', address: '', phone: '', city: '', description: '' };

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
      <div className="absolute inset-0 medil-modal-overlay" onClick={onClose} />
      <div className="medil-modal relative bg-white rounded-xl w-full max-w-3xl p-6 max-h-[92vh] overflow-y-auto">
        <h2 className="medil-modal-title flex items-center gap-2 mb-5">
          <Building2 size={20} className="text-primary" />
          {initial ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </h2>

        <form onSubmit={submit} className="space-y-5">
          {/* Layout horizontal: datos a la izquierda, fotos a la derecha
              Horizontal layout: form on the left, photos on the right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna de datos — Data column */}
            <div className="space-y-4">
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
              <FormField label="Descripción de la clínica">
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description ?? ''}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describí los servicios y especialidades..."
                />
              </FormField>
            </div>

            {/* Columna de fotos — Photos column
                (el backend solo sube a Cloudinary y devuelve la URL; el id del
                path no se usa, por eso funciona con una sucursal aún sin id) */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Fotos de la sucursal</p>
              <BranchPhotoGallery
                branchId={form.id ?? 'new'}
                coverPhoto={form.coverPhoto}
                photo1={form.photo1}
                photo2={form.photo2}
                photo3={form.photo3}
                editable
                onChange={(key, url) => set(key, url)}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
            <Button label="Cancelar" icon={X} variant="secondary" onClick={onClose} />
            <Button
              label={saving ? 'Guardando…' : 'Guardar'}
              icon={Check}
              type="submit"
              loading={saving}
            />
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
        <button onClick={() => setModal(r)} className="text-gray-400 hover:text-primary transition-colors" title="Editar">
          <Pencil size={18} strokeWidth={2} />
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
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          <ArrowLeft size={16} strokeWidth={2.25} />
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Sucursales</h1>
        <Button label="Nueva" icon={Plus} onClick={() => setModal('create')} />
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

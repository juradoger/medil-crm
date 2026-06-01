// Gestión de profesionales médicos (solo admin)
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProfessionals } from '../../hooks/useProfessionals';
import { useBranches } from '../../hooks/useBranches';
import { PhotoUpload } from '../../organisms/PhotoUpload';
import { EmptyState } from '../../organisms/EmptyState';
import { StatusBadge } from '../../molecules/StatusBadge';
import { ConfirmModal } from '../../molecules/ConfirmModal';
import { FormField, inputClass } from '../../molecules/FormField';
import { Button } from '../../atoms/Button';
import { Avatar } from '../../atoms/Avatar';
import { FullPageSpinner } from '../../atoms/Spinner';
import { eventBus } from '../../core/eventBus';
import { MESSAGES } from '../../core/messages';
import { MEDICAL_SPECIALTIES, DEFAULT_COMMISSION_RATE } from '../../core/constants';

const STATUS_FILTERS = ['Todos', 'Activos', 'Inactivos'];

function emptyForm() {
  return {
    fullName: '', specialty: '', phone: '', email: '',
    branchId: '', bio: '', commissionPercent: Math.round(DEFAULT_COMMISSION_RATE * 100),
    photoUrl: null,
  };
}

function ProfessionalModal({ initial, branches, onSave, onClose }) {
  const [form, setForm]   = useState(() => initial ?? emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.specialty || !form.phone.trim() ||
        !form.email.trim() || !form.branchId) {
      setError('Completá nombre, especialidad, teléfono, email y sucursal');
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
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {initial ? 'Editar profesional' : 'Nuevo profesional'}
        </h2>

        <div className="flex justify-center mb-4">
          <PhotoUpload
            currentPhoto={form.photoUrl}
            onUpload={(url) => set('photoUrl', url)}
            entityType="professional"
            entityId={initial?.id || 'temp'}
            label="Foto"
            size="md"
          />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nombre completo" required>
            <input className={inputClass} value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
          </FormField>

          <FormField label="Especialidad" required>
            <select className={inputClass} value={form.specialty} onChange={e => set('specialty', e.target.value)} required>
              <option value="">Seleccionar especialidad…</option>
              {MEDICAL_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Teléfono" required>
              <input type="tel" className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </FormField>
            <FormField label="Email" required>
              <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} required />
            </FormField>
          </div>

          <FormField label="Sucursal" required>
            <select className={inputClass} value={form.branchId} onChange={e => set('branchId', e.target.value)} required>
              <option value="">Seleccionar sucursal…</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </FormField>

          <FormField label="Comisión (%)">
            <input
              type="number" min={0} max={100} step={1}
              className={inputClass}
              value={form.commissionPercent}
              onChange={e => set('commissionPercent', e.target.value)}
              placeholder="Ej: 15"
            />
            <p className="text-xs text-gray-400 mt-1">Porcentaje sobre citas pagadas por pacientes no afiliados</p>
          </FormField>

          <FormField label="Descripción breve">
            <textarea
              className={inputClass}
              rows={3}
              value={form.bio ?? ''}
              onChange={e => set('bio', e.target.value)}
              placeholder="Aparece en el portal público"
            />
          </FormField>

          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button label="Cancelar" variant="secondary" onClick={onClose} />
            <Button label={saving ? 'Guardando…' : 'Guardar'} type="submit" loading={saving} />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Professionals() {
  const { professionals, loading, createProfessional, updateProfessional, deactivateProfessional } = useProfessionals();
  const { branches } = useBranches();

  const [modal, setModal]               = useState(null);   // 'create' | professional | null
  const [branchFilter, setBranchFilter] = useState('');     // '' = todas
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [deactivateTarget, setDeactivate] = useState(null);

  const branchName = (id) => branches.find(b => b.id === id)?.name ?? 'Sin sucursal';

  const filtered = useMemo(() => {
    return professionals.filter(p => {
      if (branchFilter && p.branchId !== branchFilter) return false;
      if (statusFilter === 'Activos'   && p.isActive === false) return false;
      if (statusFilter === 'Inactivos' && p.isActive !== false) return false;
      return true;
    });
  }, [professionals, branchFilter, statusFilter]);

  const handleSave = async (form) => {
    const payload = {
      fullName: form.fullName, specialty: form.specialty,
      phone: form.phone, email: form.email, branchId: form.branchId,
      bio: form.bio, photoUrl: form.photoUrl,
      commissionRate: Number(form.commissionPercent) / 100,
    };
    if (modal === 'create') {
      await createProfessional(payload);
      eventBus.emit('toast:show', { message: MESSAGES.success.professionalCreated(form.email), type: 'success' });
    } else {
      await updateProfessional(modal.id, payload);
    }
  };

  const handleDeactivateConfirmed = async () => {
    if (!deactivateTarget) return;
    await deactivateProfessional(deactivateTarget.id);
    setDeactivate(null);
  };

  const editInitial = (p) => ({
    ...p,
    commissionPercent: Math.round((p.commissionRate ?? DEFAULT_COMMISSION_RATE) * 100),
    bio: p.bio ?? '',
  });

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
        <h1 className="text-2xl font-bold text-navy">Profesionales</h1>
        <Button label="+ Nuevo profesional" onClick={() => setModal('create')} />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <select className={`${inputClass} max-w-xs`} value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="">Todas las sucursales</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={MESSAGES.empty.professionals.noData} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-center">
                <Avatar name={p.fullName} photoUrl={p.photoUrl} size="lg" className="h-16 w-16 text-xl" />
              </div>
              <p className="text-base font-semibold text-navy text-center mt-3">{p.fullName}</p>
              <p className="text-sm text-gray-400 text-center">{p.specialty}</p>
              <p className="text-center mt-1">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{branchName(p.branchId)}</span>
              </p>

              <div className="border-t border-gray-100 my-4" />

              <div className="space-y-1">
                <p className="text-sm text-gray-700">{p.phone || '—'}</p>
                <p className="text-sm text-gray-700 truncate">{p.email || '—'}</p>
                {p.bio && <p className="text-xs text-gray-400 line-clamp-2 mt-2">{p.bio}</p>}
              </div>

              <div className="mt-3">
                <StatusBadge status={p.isActive === false ? 'inactive' : 'active'} />
              </div>

              <div className="flex gap-2 mt-4">
                <Button label="Editar" variant="ghost" size="sm" onClick={() => setModal(editInitial(p))} />
                {p.isActive !== false && (
                  <Button label="Desactivar" variant="danger" size="sm" onClick={() => setDeactivate(p)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProfessionalModal
          initial={modal === 'create' ? null : modal}
          branches={branches}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmModal
        open={!!deactivateTarget}
        danger
        title="Desactivar profesional"
        description={MESSAGES.confirm.deactivateProfessional}
        confirmLabel="Desactivar"
        onConfirm={handleDeactivateConfirmed}
        onCancel={() => setDeactivate(null)}
      />
    </div>
  );
}

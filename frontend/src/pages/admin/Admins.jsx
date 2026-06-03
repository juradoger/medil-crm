// Gestión de administradores por sucursal (solo admin)
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmins } from '../../hooks/useAdmins';
import { useBranches } from '../../hooks/useBranches';
import { EmptyState } from '../../organisms/EmptyState';
import { FormField, inputClass } from '../../molecules/FormField';
import { Button } from '../../atoms/Button';
import { Avatar } from '../../atoms/Avatar';
import { Badge } from '../../atoms/Badge';
import { ArrowLeft, Plus, ShieldCheck } from 'lucide-react';
import { FullPageSpinner } from '../../atoms/Spinner';
import { eventBus } from '../../core/eventBus';
import { MESSAGES } from '../../core/messages';
import { USER_ROLES } from '../../core/constants';

const ROLE_LABEL = {
  [USER_ROLES.ADMIN]:   'Administrador',
  [USER_ROLES.DOCTOR]:  'Médico',
  [USER_ROLES.PATIENT]: 'Paciente',
};

function AdminModal({ branches, onSave, onClose, lookup }) {
  const [form, setForm]     = useState({ email: '', fullName: '', password: '', branchId: '' });
  const [info, setInfo]     = useState(null);     // resultado del lookup por email
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isExistingUser = info?.exists === true;   // cuenta existente → se eleva
  const needsPassword  = !isExistingUser;          // nuevos requieren contraseña

  // Al salir del campo email, busca si la persona ya existe para precargar datos
  const checkEmail = async () => {
    const email = form.email.trim();
    if (!email) { setInfo(null); return; }
    setChecking(true);
    try {
      const result = await lookup(email);
      setInfo(result);
      if (result?.fullName) set('fullName', result.fullName);
    } catch {
      setInfo(null);
    } finally {
      setChecking(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    if (!email || !/.+@.+\..+/.test(email)) { setError(MESSAGES.error.validation.invalidEmail); return; }
    if (!form.branchId) { setError('Seleccioná una sucursal'); return; }
    if (needsPassword) {
      if (!form.fullName.trim()) { setError('El nombre es obligatorio'); return; }
      if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        email,
        fullName: form.fullName.trim(),
        password: form.password,
        branchId: form.branchId,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 medil-modal-overlay" onClick={onClose} />
      <div className="medil-modal relative bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" /> Agregar administrador
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Ingresá el email: si la persona ya tiene cuenta, se elevará al rol de administrador conservando sus datos.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <FormField label="Email" required>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={e => { set('email', e.target.value); setInfo(null); }}
              onBlur={checkEmail}
              placeholder="persona@ejemplo.com"
              required
            />
          </FormField>

          {/* Estado de la búsqueda por email */}
          {checking && <p className="text-xs text-gray-400">Buscando cuenta…</p>}
          {!checking && info?.source === 'user' && (
            <Badge text={`Cuenta existente (${ROLE_LABEL[info.role] ?? info.role}) — se elevará a administrador`} color="aqua" />
          )}
          {!checking && info?.source === 'patient' && (
            <Badge text="Encontramos su ficha de paciente — datos precargados" color="green" />
          )}
          {!checking && info && info.source === null && form.email.trim() && (
            <Badge text="Persona nueva — completá sus datos" color="orange" />
          )}

          <FormField label="Nombre completo" required={needsPassword}>
            <input
              className={inputClass}
              value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              readOnly={isExistingUser}
              required={needsPassword}
            />
          </FormField>

          {needsPassword && (
            <FormField label="Contraseña" required>
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </FormField>
          )}

          <FormField label="Sucursal" required>
            <select className={inputClass} value={form.branchId} onChange={e => set('branchId', e.target.value)} required>
              <option value="">Seleccionar sucursal…</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
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

export default function Admins() {
  const { admins, loading, addAdmin, lookup } = useAdmins();
  const { branches } = useBranches();

  const [modalOpen, setModalOpen]       = useState(false);
  const [branchFilter, setBranchFilter] = useState('');   // '' = todas

  const branchName = (id) => branches.find(b => b.id === id)?.name ?? 'Sin sucursal';

  const filtered = useMemo(() => {
    if (!branchFilter) return admins;
    return admins.filter(a => a.branchId === branchFilter);
  }, [admins, branchFilter]);

  const handleSave = async (form) => {
    const result = await addAdmin(form);
    if (result.elevated) {
      eventBus.emit('toast:show', { message: MESSAGES.success.adminElevated(result.admin?.fullName ?? form.email), type: 'success' });
    } else {
      eventBus.emit('toast:show', { message: MESSAGES.success.adminCreated(form.email), type: 'success' });
    }
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
        <h1 className="text-2xl font-bold text-navy">Administradores</h1>
        <Button label="Agregar admin" icon={Plus} onClick={() => setModalOpen(true)} />
      </div>

      {/* Filtro por sucursal */}
      <select className={`${inputClass} max-w-xs`} value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
        <option value="">Todas las sucursales</option>
        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      {filtered.length === 0 ? (
        <EmptyState title={MESSAGES.empty.admins.noData} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-center">
                <Avatar name={a.fullName || a.email} photoUrl={a.photoUrl} size="lg" className="h-16 w-16 text-xl" />
              </div>
              <p className="text-base font-semibold text-navy text-center mt-3">{a.fullName || 'Administrador'}</p>
              <p className="text-sm text-gray-400 text-center truncate">{a.email}</p>
              <p className="text-center mt-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{branchName(a.branchId)}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AdminModal
          branches={branches}
          lookup={lookup}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

// Página Mi perfil — accesible para todos los roles (/profile)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import { PhotoUpload } from '../organisms/PhotoUpload';
import { FormField, inputClass } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { eventBus } from '../core/eventBus';
import { MESSAGES } from '../core/messages';
import { USER_ROLES, APPOINTMENT_STATUS } from '../core/constants';
import { patientService } from '../services/patientService';
import { professionalService } from '../services/professionalService';
import { userApi } from '../services/backendService';

const ROLE_BADGE = {
  [USER_ROLES.ADMIN]:   { text: 'Administrador', color: 'orange' },
  [USER_ROLES.DOCTOR]:  { text: 'Médico',        color: 'green'  },
  [USER_ROLES.PATIENT]: { text: 'Paciente',      color: 'aqua'   },
};

function toast(message, type = 'success') {
  eventBus.emit('toast:show', { message, type });
}

const cardClass = 'bg-white rounded-xl border border-gray-100 p-6 space-y-4';

export default function UserProfile() {
  const { user, updateUser, currentBranchId } = useAuth();
  const isPatient = user?.role === USER_ROLES.PATIENT;
  const isDoctor  = user?.role === USER_ROLES.DOCTOR;

  // entityType del upload según rol
  const photoEntity = isPatient ? 'patient' : 'professional';
  const roleBadge   = ROLE_BADGE[user?.role] ?? ROLE_BADGE[USER_ROLES.PATIENT];

  // ── Datos personales ──────────────────────────────────────────────
  const [form, setForm] = useState({
    name:  user?.fullName ?? user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
  });
  const [savingData, setSavingData] = useState(false);
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSaveData() {
    setSavingData(true);
    try {
      if (isPatient) {
        await patientService.update(user.id, { name: form.name, phone: form.phone, email: form.email });
      } else {
        await professionalService.update(user.id, { fullName: form.name, phone: form.phone, email: form.email });
      }
      updateUser({ fullName: form.name });
      toast(MESSAGES.success.patientUpdated, 'success');
    } catch (err) {
      toast(err.message || MESSAGES.error.connection.server, 'error');
    } finally {
      setSavingData(false);
    }
  }

  // ── Foto de perfil ────────────────────────────────────────────────
  async function handlePhotoUploaded(url) {
    try {
      if (isPatient) await patientService.update(user.id, { photoUrl: url });
      else           await professionalService.update(user.id, { photoUrl: url });
      updateUser({ photoUrl: url });
      // Sincroniza la foto que muestra el Sidebar
      if (user?.email) localStorage.setItem(`medil_profile_photo_${user.email}`, url);
    } catch (err) {
      toast(err.message || MESSAGES.error.connection.server, 'error');
    }
  }

  // ── Seguro médico (solo patient) ──────────────────────────────────
  const [hasInsurance, setHasInsurance]   = useState(Boolean(user?.isInsured));
  const [insuranceCode, setInsuranceCode] = useState(user?.insuranceCode ?? '');
  const [savingInsurance, setSavingInsurance] = useState(false);
  const isAffiliated = /(MED|SAL)$/i.test(insuranceCode.trim());

  async function handleSaveInsurance() {
    setSavingInsurance(true);
    try {
      await patientService.update(user.id, {
        isInsured: hasInsurance,
        insuranceCode: hasInsurance ? insuranceCode : '',
      });
      updateUser({ isInsured: hasInsurance, insuranceCode });
      toast(MESSAGES.success.patientUpdated, 'success');
    } catch (err) {
      toast(err.message || MESSAGES.error.connection.server, 'error');
    } finally {
      setSavingInsurance(false);
    }
  }

  // ── Perfil profesional (solo doctor) ──────────────────────────────
  const [bio, setBio] = useState(user?.bio ?? '');
  const [savingBio, setSavingBio] = useState(false);
  const { appointments } = useAppointments(currentBranchId);
  const myAppts  = appointments.filter(a => a.professional === user?.fullName);
  const attended = myAppts.filter(a => a.status === APPOINTMENT_STATUS.ATTENDED).length;
  const uniquePatients = new Set(myAppts.map(a => a.patientId)).size;
  const attendanceRate = myAppts.length ? Math.round((attended / myAppts.length) * 100) : 0;

  async function handleSaveBio() {
    setSavingBio(true);
    try {
      await professionalService.update(user.id, { bio });
      toast(MESSAGES.success.patientUpdated, 'success');
    } catch (err) {
      toast(err.message || MESSAGES.error.connection.server, 'error');
    } finally {
      setSavingBio(false);
    }
  }

  // ── Cambiar contraseña ────────────────────────────────────────────
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const setPwdField = (k, v) => setPwd(p => ({ ...p, [k]: v }));

  const [savingPwd, setSavingPwd] = useState(false);
  async function handleChangePassword() {
    if (pwd.next.length < 6) { setPwdError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (pwd.next !== pwd.confirm) { setPwdError('Las contraseñas nuevas no coinciden'); return; }
    setPwdError('');
    setSavingPwd(true);
    try {
      await userApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current: '', next: '', confirm: '' });
      setPwdOpen(false);
      toast('Contraseña actualizada correctamente', 'success');
    } catch (err) {
      setPwdError(err.message || MESSAGES.error.connection.server);
      toast(err.message || MESSAGES.error.connection.server, 'error');
    } finally {
      setSavingPwd(false);
    }
  }

  if (!user) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#0E4A8A]">Mi perfil</h1>
        <Badge text={roleBadge.text} color={roleBadge.color} />
      </div>

      {/* SECCIÓN 1 — Foto de perfil */}
      <div className="flex justify-center">
        <PhotoUpload
          currentPhoto={user.photoUrl ?? null}
          onUpload={handlePhotoUploaded}
          entityType={photoEntity}
          entityId={user.id}
          label="Foto de perfil"
          size="lg"
        />
      </div>

      {/* SECCIÓN 2 — Datos personales */}
      <div className={cardClass}>
        <h2 className="text-base font-semibold text-[#0E4A8A]">Datos personales</h2>
        <FormField label="Nombre completo">
          <input className={inputClass} value={form.name} onChange={e => setField('name', e.target.value)} />
        </FormField>
        <FormField label="Teléfono">
          <input className={inputClass} value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+591 7XXXXXXX" />
        </FormField>
        <FormField label="Correo electrónico">
          <input className={inputClass} type="email" value={form.email} onChange={e => setField('email', e.target.value)} />
        </FormField>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Rol</p>
            <Badge text={roleBadge.text} color={roleBadge.color} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Sucursal</p>
            <p className="text-sm text-gray-700">{currentBranchId ?? '—'}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button label="Guardar cambios" onClick={handleSaveData} loading={savingData} />
        </div>
      </div>

      {/* SECCIÓN 3 — Seguro médico (solo patient) */}
      {isPatient && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-[#0E4A8A]">Seguro médico</h2>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={hasInsurance}
              onChange={e => setHasInsurance(e.target.checked)}
              className="h-4 w-4 accent-[#00B4D8]"
            />
            ¿Tenés seguro médico?
          </label>

          {hasInsurance && (
            <>
              <FormField label="Código de seguro">
                <input className={inputClass} value={insuranceCode} onChange={e => setInsuranceCode(e.target.value)} placeholder="Ej: 12345-MED" />
              </FormField>
              {isAffiliated
                ? <Badge text="Afiliado — Citas gratuitas" color="green" />
                : <Badge text="Sin cobertura — Se cobrarán las citas" color="orange" />
              }
            </>
          )}

          <div className="flex justify-end">
            <Button label="Guardar cambios" onClick={handleSaveInsurance} loading={savingInsurance} />
          </div>
        </div>
      )}

      {/* SECCIÓN 4 — Perfil profesional (solo doctor) */}
      {isDoctor && (
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-[#0E4A8A]">Perfil profesional</h2>
          <div>
            <p className="text-xs text-gray-400 mb-1">Especialidad</p>
            <p className="text-sm text-gray-700">{user.specialty ?? '—'}</p>
          </div>
          <FormField label="Bio corta">
            <textarea
              className={inputClass}
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Describí brevemente tu experiencia..."
            />
          </FormField>
          <p className="text-xs text-gray-400">Aparece en el portal público</p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-[#00B4D8]">{attended}</p>
              <p className="text-xs text-gray-500">Citas atendidas</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-[#00B4D8]">{uniquePatients}</p>
              <p className="text-xs text-gray-500">Pacientes únicos</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-[#00B4D8]">{attendanceRate}%</p>
              <p className="text-xs text-gray-500">Tasa asistencia</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button label="Guardar cambios" onClick={handleSaveBio} loading={savingBio} />
          </div>
        </div>
      )}

      {/* SECCIÓN 5 — Cambiar contraseña (accordion) */}
      <div className={cardClass}>
        <button
          type="button"
          onClick={() => setPwdOpen(o => !o)}
          className="w-full flex items-center justify-between text-base font-semibold text-[#0E4A8A]"
        >
          Cambiar contraseña
          <svg className={`h-5 w-5 transition-transform ${pwdOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {pwdOpen && (
          <div className="space-y-4 pt-2">
            <FormField label="Contraseña actual">
              <input className={inputClass} type="password" value={pwd.current} onChange={e => setPwdField('current', e.target.value)} />
            </FormField>
            <FormField label="Nueva contraseña">
              <input className={inputClass} type="password" value={pwd.next} onChange={e => setPwdField('next', e.target.value)} placeholder="Mínimo 6 caracteres" />
            </FormField>
            <FormField label="Confirmar nueva contraseña">
              <input className={inputClass} type="password" value={pwd.confirm} onChange={e => setPwdField('confirm', e.target.value)} />
            </FormField>
            {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
            <div className="flex justify-end">
              <Button label="Actualizar contraseña" onClick={handleChangePassword} loading={savingPwd} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

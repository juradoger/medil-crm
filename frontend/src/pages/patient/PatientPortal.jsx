// Portal del paciente
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { recordService } from '../../services/recordService';
import { professionalService } from '../../services/professionalService';
import { StatusBadge } from '../../molecules/StatusBadge';
import { FormField, inputClass } from '../../molecules/FormField';
import { ConfirmModal } from '../../molecules/ConfirmModal';
import { FullPageSpinner } from '../../atoms/Spinner';
import { Avatar } from '../../atoms/Avatar';
import { APPOINTMENT_STATUS } from '../../core/constants';


const TODAY = new Date().toISOString().slice(0, 10);

function BookModal({ professionals, onSave, onClose }) {
  const [form, setForm] = useState({ professionalId: '', date: TODAY, time: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.professionalId || !form.date || !form.time || !form.reason.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const doc = professionals.find(p => p.id === form.professionalId);
      await onSave({
        professionalId: form.professionalId,
        professionalName: doc?.fullName ?? doc?.name ?? '',
        scheduledAt: `${form.date}T${form.time}`,
        reason: form.reason,
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-left">
        <h2 className="text-lg font-semibold text-[#0E4A8A] mb-4">Agendar Nueva Cita</h2>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Profesional Médico" required>
            <select
              className={inputClass}
              value={form.professionalId}
              onChange={e => setForm(f => ({ ...f, professionalId: e.target.value }))}
              required
            >
              <option value="">Seleccionar profesional…</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.fullName ?? p.name} ({p.specialty})</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha" required>
              <input
                type="date"
                min={TODAY}
                className={inputClass}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Hora" required>
              <input
                type="time"
                className={inputClass}
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                required
              />
            </FormField>
          </div>
          <FormField label="Motivo de la consulta" required>
            <input
              className={inputClass}
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Ej: Control de rutina, dolor de cabeza..."
              required
            />
          </FormField>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50 font-medium">
              {saving ? 'Agendando…' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientPortal() {
  const { user, currentBranchId } = useAuth();
  const { patients, loading: loadP } = usePatients(currentBranchId);
  const { appointments, loading: loadA, create: createAppointment, cancel: cancelAppointment } = useAppointments(currentBranchId);

  const [records, setRecords]           = useState([]);
  const [loadR, setLoadR]               = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [loadProfs, setLoadProfs]       = useState(true);

  const [showBook, setShowBook]         = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Encontrar el registro del paciente vinculado al usuario
  const myPatient = useMemo(() => {
    if (!user) return null;
    return patients.find(p => p.userId === user.id || p.email === user.email);
  }, [patients, user]);

  // Citas del paciente
  const myAppointments = useMemo(() => {
    if (!myPatient) return [];
    return appointments.filter(a => a.patientId === myPatient.id);
  }, [appointments, myPatient]);

  const upcomingAppointments = useMemo(() => {
    return myAppointments
      .filter(a => a.status === APPOINTMENT_STATUS.SCHEDULED)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
      .slice(0, 3);
  }, [myAppointments]);

  // Cargar historial médico del paciente
  useEffect(() => {
    if (!myPatient) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadR(true);
    recordService.getByPatient(myPatient.id)
      .then(data => setRecords(data))
      .catch(e => console.error(e))
      .finally(() => setLoadR(false));
  }, [myPatient]);

  // Cargar lista de profesionales
  useEffect(() => {
    professionalService.getAll()
      .then(data => setProfessionals(data))
      .catch(e => console.error(e))
      .finally(() => setLoadProfs(false));
  }, []);

  const handleBook = async (formPayload) => {
    if (!myPatient) return;
    await createAppointment({
      ...formPayload,
      patientId: myPatient.id,
      patientName: myPatient.name,
    });
  };

  const handleCancelConfirmed = async () => {
    if (!cancelTarget) return;
    await cancelAppointment(cancelTarget.id);
    setCancelTarget(null);
  };

  if (loadP || loadA || loadR || loadProfs) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Portal Público
        </Link>
      </div>

      {/* Cabecera del Portal */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={user?.fullName || 'Paciente'} size="lg" />
          <div className="text-center md:text-left">
            <h1 className="text-xl font-bold text-[#0E4A8A]">¡Hola, {user?.fullName || 'Paciente'}!</h1>
            <p className="text-xs text-gray-400 mt-0.5">Bienvenido a tu portal de salud MedIL</p>
          </div>
        </div>
        <button
          onClick={() => setShowBook(true)}
          className="hidden md:inline-flex px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors font-medium"
        >
          Agendar cita
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0E4A8A] text-left">Mis próximas citas</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-gray-400">No tenés citas próximas programadas.</p>
              <button
                onClick={() => setShowBook(true)}
                className="text-xs text-[#00B4D8] border border-[#00B4D8] hover:bg-[#00B4D8]/10 px-3 py-1.5 rounded transition-colors font-medium"
              >
                Agendá tu primera cita
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-left">
              {upcomingAppointments.map(a => (
                <div key={a.id} className="p-3 border border-gray-100 rounded-lg flex items-center justify-between bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{a.date} · {a.time?.slice(0, 5)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.professional}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">"{a.reason}"</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={a.status} />
                    <button
                      onClick={() => setCancelTarget(a)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Cancelar cita"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial Clínico */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0E4A8A] text-left">Mi historial médico</h2>
          {records.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center bg-gray-50 rounded-xl border border-gray-100">
              No tenés registros de consultas médicas aún.
            </p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 text-left">
              {records.map(r => (
                <div key={r.id} className="relative pl-6 border-l border-gray-200 space-y-1">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#00B4D8]" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="font-semibold text-[#00B4D8]">Consulta médica</span>
                    <span>{r.attendanceDate || new Date(r.createdAt).toLocaleDateString('es-BO')}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">{r.diagnosis}</h4>
                  <p className="text-xs text-gray-500 whitespace-pre-wrap">{r.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante móvil */}
      <button
        onClick={() => setShowBook(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-[#00B4D8] hover:bg-[#0096B4] text-white p-4 rounded-full shadow-lg transition-transform active:scale-95"
        aria-label="Agendar cita"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {showBook && (
        <BookModal
          professionals={professionals}
          onSave={handleBook}
          onClose={() => setShowBook(false)}
        />
      )}

      <ConfirmModal
        open={!!cancelTarget}
        title="¿Cancelar esta cita?"
        description="Esta cita será cancelada permanentemente. ¿Deseas continuar?"
        onConfirm={handleCancelConfirmed}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}

// Portal del paciente
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import { usePatients } from '../../hooks/usePatients';
import { useAI } from '../../hooks/useAI';
import { recordService } from '../../services/recordService';
import { professionalService } from '../../services/professionalService';
import { StatusBadge } from '../../molecules/StatusBadge';
import { FormField, inputClass } from '../../molecules/FormField';
import { ConfirmModal } from '../../molecules/ConfirmModal';
import { PaymentGate } from '../../organisms/PaymentGate';
import { Button } from '../../atoms/Button';
import { FullPageSpinner } from '../../atoms/Spinner';
import { Avatar } from '../../atoms/Avatar';
import { Check, Zap, Sparkles, ArrowRight, ArrowLeft, Calendar, FileText, Plus, XCircle } from 'lucide-react';
import { APPOINTMENT_STATUS, DEFAULT_CONSULTATION_FEE } from '../../core/constants';
import { MESSAGES } from '../../core/messages';
import { eventBus } from '../../core/eventBus';


const TODAY = new Date().toISOString().slice(0, 10);
const MIN_SYMPTOMS = 20;

// Indicador de pasos del flujo de agendamiento
function Stepper({ step }) {
  return (
    <div data-testid="stepper" className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map(n => (
        <React.Fragment key={n}>
          <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold ${
            n < step ? 'bg-green-500 text-white'
            : n === step ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-400'
          }`}>
            {n < step ? <Check size={16} strokeWidth={3} /> : n}
          </div>
          {n < 4 && <div className={`h-0.5 w-8 ${n < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// Insignia de urgencia según la sugerencia de la IA
function UrgencyBadge({ urgency }) {
  if (urgency === 'Urgente') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white"><Zap size={12} strokeWidth={2.5} /> Consulta urgente</span>;
  }
  if (urgency === 'Consultar pronto') {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-orange-400 text-white">Consultar pronto</span>;
  }
  return null;
}

function BookModal({ professionals, isInsured, onSave, onClose }) {
  const { suggestSpecialty, loading: aiLoading } = useAI();

  const [step, setStep]         = useState(1);
  const [symptoms, setSymptoms] = useState('');
  const [suggestion, setSuggestion] = useState(null); // { specialty, reason, urgency }
  const [selectedProf, setSelectedProf] = useState(null);
  const [date, setDate]   = useState(TODAY);
  const [time, setTime]   = useState('');
  const [reason, setReason] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTiming, setReminderTiming]   = useState('24h');
  const [reminderCustomTime, setReminderCustomTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const goToStep = (n) => { setError(''); setStep(n); };

  const handleSuggestSpecialty = async () => {
    try {
      const result = await suggestSpecialty(symptoms, professionals.map(p => p.specialty));
      setSuggestion({ specialty: result.specialty, reason: result.reason, urgency: result.urgency });
      setReason(prev => prev || symptoms);
      goToStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  // Profesionales ordenados: primero los de la especialidad sugerida
  const orderedProfessionals = useMemo(() => {
    if (!suggestion?.specialty) return professionals;
    const matches = (p) => p.specialty?.toLowerCase() === suggestion.specialty.toLowerCase();
    return [...professionals].sort((a, b) => (matches(b) ? 1 : 0) - (matches(a) ? 1 : 0));
  }, [professionals, suggestion]);

  const isRecommended = (p) =>
    suggestion?.specialty && p.specialty?.toLowerCase() === suggestion.specialty.toLowerCase();

  const handleConfirm = async () => {
    if (!date || !time || !reason.trim()) {
      setError('Completá fecha, hora y motivo');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        professionalId:   selectedProf.id,
        professionalName: selectedProf.fullName ?? selectedProf.name ?? '',
        scheduledAt:      `${date}T${time}`,
        reason,
        reminderConfig: reminderEnabled
          ? { timing: reminderTiming, customTime: reminderTiming === 'custom' ? reminderCustomTime : null }
          : null,
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
      <div className="medil-modal relative bg-white rounded-xl w-full max-w-lg p-6 text-left max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-navy mb-4 text-center">Agendar nueva cita</h2>
        <Stepper step={step} />

        {/* PASO 1 — Síntomas */}
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-navy">Contanos cómo te sentís</h3>
            <textarea
              className={`${inputClass} resize-none`}
              rows={5}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder={'Describí tus síntomas, por ejemplo:\ndolor de cabeza desde hace 3 días,\nmareos al levantarme...'}
            />
            <p className="text-xs text-gray-300">Mínimo {MIN_SYMPTOMS} caracteres</p>
            <div className="flex flex-col gap-2">
              <Button
                label="Sugerir especialidad con IA"
                icon={Sparkles}
                iconRight={ArrowRight}
                loading={aiLoading}
                disabled={!symptoms.trim() || symptoms.length < MIN_SYMPTOMS}
                onClick={handleSuggestSpecialty}
              />
              <Button label="Elegir sin IA" iconRight={ArrowRight} variant="ghost" onClick={() => goToStep(2)} />
            </div>
          </div>
        )}

        {/* PASO 2 — Seleccionar médico */}
        {step === 2 && (
          <div className="space-y-3">
            {suggestion && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-2">
                <p className="text-xs text-primary font-medium uppercase inline-flex items-center gap-1.5"><Sparkles size={13} /> El asistente sugiere:</p>
                <p className="text-lg font-bold text-navy">{suggestion.specialty}</p>
                <p className="text-sm text-gray-400">{suggestion.reason}</p>
                <div className="mt-2"><UrgencyBadge urgency={suggestion.urgency} /></div>
              </div>
            )}

            {orderedProfessionals.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No hay profesionales disponibles.</p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {orderedProfessionals.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setSelectedProf(p)}
                    className={`w-full text-left bg-white rounded-xl border p-4 flex items-center gap-3 transition-colors ${
                      selectedProf?.id === p.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'
                    }`}
                  >
                    <Avatar name={p.fullName ?? p.name} photoUrl={p.photoUrl} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy truncate">{p.fullName ?? p.name}</p>
                      <p className="text-sm text-gray-400">{p.specialty}</p>
                    </div>
                    {isRecommended(p) && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap"><Check size={12} strokeWidth={2.5} /> Recomendado</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-between gap-3 pt-2">
              <Button label="Atrás" icon={ArrowLeft} variant="secondary" onClick={() => goToStep(1)} />
              <Button label="Continuar" iconRight={ArrowRight} disabled={!selectedProf} onClick={() => goToStep(3)} />
            </div>
          </div>
        )}

        {/* PASO 3 — Fecha y hora */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Fecha" required>
                <input type="date" min={TODAY} className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
              </FormField>
              <FormField label="Hora" required>
                <input type="time" className={inputClass} value={time} onChange={e => setTime(e.target.value)} />
              </FormField>
            </div>
            <FormField label="Motivo de la consulta" required>
              <input className={inputClass} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: control de rutina, dolor de cabeza..." />
            </FormField>

            {isInsured
              ? <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500 text-white">Cita gratuita — Afiliado</span>
              : <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-400 text-white">Se cobrará Bs. {DEFAULT_CONSULTATION_FEE}</span>
            }

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={reminderEnabled} onChange={e => setReminderEnabled(e.target.checked)} />
                Recordatorio por WhatsApp
              </label>
              {reminderEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <select className={inputClass} value={reminderTiming} onChange={e => setReminderTiming(e.target.value)}>
                    <option value="24h">24 horas antes</option>
                    <option value="1h">1 hora antes</option>
                    <option value="custom">Hora específica</option>
                  </select>
                  {reminderTiming === 'custom' && (
                    <input type="time" className={inputClass} value={reminderCustomTime} onChange={e => setReminderCustomTime(e.target.value)} />
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-between gap-3 pt-2">
              <Button label="Atrás" icon={ArrowLeft} variant="secondary" onClick={() => goToStep(2)} />
              <Button label="Continuar" iconRight={ArrowRight} disabled={!date || !time || !reason.trim()} onClick={() => goToStep(4)} />
            </div>
          </div>
        )}

        {/* PASO 4 — Confirmación y pago */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-navy">Confirmá tu cita</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={selectedProf?.fullName ?? selectedProf?.name} photoUrl={selectedProf?.photoUrl} size="md" />
                <div>
                  <p className="font-semibold text-navy">{selectedProf?.fullName ?? selectedProf?.name}</p>
                  <p className="text-sm text-gray-400">{selectedProf?.specialty}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 flex items-center gap-2"><Calendar size={15} className="text-primary shrink-0" /> {date} · {time}</p>
              <p className="text-sm text-gray-700 flex items-center gap-2"><FileText size={15} className="text-primary shrink-0" /> {reason}</p>
            </div>

            {isInsured
              ? <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500 text-white">Cita gratuita por seguro médico</span>
              : <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-400 text-white">Se requiere pago de Bs. {DEFAULT_CONSULTATION_FEE} para confirmar</span>
            }

            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-between gap-3 pt-2">
              <Button label="Atrás" icon={ArrowLeft} variant="secondary" onClick={() => goToStep(3)} />
              <Button
                label={isInsured ? 'Confirmar cita gratis' : 'Continuar al pago'}
                loading={saving}
                onClick={handleConfirm}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientPortal() {
  const { user, currentBranchId } = useAuth();
  const { patients, loading: loadP } = usePatients(currentBranchId);
  const { appointments, loading: loadA, cancel: cancelAppointment, createWithPaymentCheck, createAfterPayment } = useAppointments(currentBranchId);

  const [records, setRecords]           = useState([]);
  const [loadR, setLoadR]               = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [loadProfs, setLoadProfs]       = useState(true);

  const [showBook, setShowBook]         = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [pendingAppt, setPendingAppt]   = useState(null); // cita esperando pago
  const [ready, setReady]               = useState(false); // carga inicial completada

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

  // El spinner de página completa solo debe verse en la carga inicial. Las
  // mutaciones (agendar, cancelar) también activan `loading` en los hooks; si
  // volviéramos a mostrar el spinner se desmontaría el BookModal a mitad del
  // guardado y se perdería el mensaje de error. Por eso `ready` se fija una vez.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!loadP && !loadA && !loadR && !loadProfs) setReady(true);
  }, [loadP, loadA, loadR, loadProfs]);

  const handleBook = async (formPayload) => {
    if (!myPatient) return;
    const data = { ...formPayload, patientId: myPatient.id, patientName: myPatient.name };
    const result = await createWithPaymentCheck(data);
    if (result.requiresPayment) {
      setPendingAppt(data);
    } else {
      eventBus.emit('toast:show', { message: MESSAGES.success.appointmentFree, type: 'success' });
    }
  };

  // Tras aprobarse el pago, crea la cita definitivamente
  const handlePaymentSuccess = async (paymentId) => {
    try {
      await createAfterPayment(pendingAppt, paymentId);
      eventBus.emit('toast:show', { message: MESSAGES.success.appointmentCreated, type: 'success' });
      setPendingAppt(null);
    } catch (err) {
      // Si la creación falla tras el pago, avisamos en vez de dejar la pasarela
      // abierta sin explicación.
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
    }
  };

  const handleCancelConfirmed = async () => {
    if (!cancelTarget) return;
    await cancelAppointment(cancelTarget.id);
    setCancelTarget(null);
  };

  if (!ready) return <FullPageSpinner />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          <ArrowLeft size={16} strokeWidth={2.25} />
          Volver al Portal Público
        </Link>
      </div>

      {/* Cabecera del Portal */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={user?.fullName || 'Paciente'}
            photoUrl={user?.photoUrl || (user?.email ? localStorage.getItem(`medil_profile_photo_${user.email}`) : null)}
            size="lg"
          />
          <div className="text-center md:text-left">
            <h1 className="text-xl font-bold text-navy">¡Hola, {user?.fullName || 'Paciente'}!</h1>
            <p className="text-xs text-gray-400 mt-0.5">Bienvenido a tu portal de salud MedIL</p>
          </div>
        </div>
        <button
          onClick={() => setShowBook(true)}
          className="hidden md:inline-flex px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Agendar cita
        </button>
      </div>

      {/* Banner de seguro: visible si el paciente no tiene código configurado */}
      {myPatient && !myPatient.insuranceCode && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm text-navy">{MESSAGES.empty.noInsurance}</p>
          <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark whitespace-nowrap">
            Ir a mi perfil <ArrowRight size={15} strokeWidth={2.25} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-navy text-left">Mis próximas citas</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-gray-400">No tenés citas próximas programadas.</p>
              <button
                onClick={() => setShowBook(true)}
                className="text-xs text-primary border border-primary hover:bg-primary/10 px-3 py-1.5 rounded transition-colors font-medium"
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
                      <XCircle size={20} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial Clínico */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-navy text-left">Mi historial médico</h2>
          {records.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center bg-gray-50 rounded-xl border border-gray-100">
              No tenés registros de consultas médicas aún.
            </p>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 text-left">
              {records.map(r => (
                <div key={r.id} className="relative pl-6 border-l border-gray-200 space-y-1">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="font-semibold text-primary">Consulta médica</span>
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
        className="md:hidden fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg transition-transform active:scale-95"
        aria-label="Agendar cita"
      >
        <Plus size={24} strokeWidth={2.25} />
      </button>

      {showBook && (
        <BookModal
          professionals={professionals}
          isInsured={!!myPatient?.isInsured}
          onSave={handleBook}
          onClose={() => setShowBook(false)}
        />
      )}

      <PaymentGate
        isOpen={!!pendingAppt}
        appointmentData={pendingAppt}
        amount={DEFAULT_CONSULTATION_FEE}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={() => setPendingAppt(null)}
      />

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

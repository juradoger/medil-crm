// Consola médica del doctor
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { useSupplies } from '../../hooks/useSupplies';
import { useAI } from '../../hooks/useAI';
import { patientService } from '../../services/patientService';
import { SplitScreenLayout } from '../../templates/SplitScreenLayout';
import { StatusBadge } from '../../molecules/StatusBadge';
import { FormField, inputClass } from '../../molecules/FormField';
import { ConfirmModal } from '../../molecules/ConfirmModal';
import { SuppliesDeductModal } from '../../organisms/SuppliesDeductModal';
import { Button } from '../../atoms/Button';
import { Avatar } from '../../atoms/Avatar';
import { Spinner } from '../../atoms/Spinner';
import { Logo } from '../../atoms/Logo';
import { Sparkles, Check, MessageCircle, ArrowLeft, X, Send } from 'lucide-react';
import { eventBus } from '../../core/eventBus';
import { MESSAGES } from '../../core/messages';
import { APPOINTMENT_STATUS } from '../../core/constants';

const TODAY = new Date().toISOString().slice(0, 10);
const FILTERS = ['Todas', APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.ATTENDED];
const FILTER_LABELS = { Todas: 'Todas', scheduled: 'Agendadas', attended: 'Atendidas' };

// Cantidad de consultas a partir de la cual se resume el historial automáticamente
const AUTO_SUMMARY_THRESHOLD = 3;

// Notifica al usuario vía el bus de eventos (Toast global)
function notify(message, type = 'info') {
  eventBus.emit('toast:show', { message, type });
}

export default function DoctorConsole() {
  const { currentBranchId, user } = useAuth();
  const { appointments, loading: loadA, markAttended } = useAppointments(currentBranchId);
  const { supplies, adjustStock } = useSupplies(currentBranchId);
  const {
    suggestDiagnosis, summarizeHistory, chat, suggestSupplies,
    loading: aiLoading, isSimulated,
  } = useAI();

  const [selected, setSelected]       = useState(null);
  const [patient, setPatient]         = useState(null);
  const [loadP, setLoadP]             = useState(false);
  const [tab, setTab]                 = useState(2); // Default to "Nueva consulta"
  const [filterStatus, setFilter]     = useState('Todas');
  const [showConfirm, setShowConfirm] = useState(false);

  const [consultForm, setConsult]     = useState({ attendanceDate: TODAY, diagnosis: '', notes: '' });
  const [formErr, setFormErr]         = useState('');
  const [savedOk, setSavedOk]         = useState(false);

  // Estado de IA
  const [symptoms, setSymptoms]           = useState('');
  const [aiSuggestion, setAiSuggestion]   = useState(null);
  const [autoSummary, setAutoSummary]     = useState(null);
  const [manualSummary, setManualSummary] = useState(null);
  const [showChat, setShowChat]           = useState(false);
  const [chatHistory, setChatHistory]     = useState([]);
  const [chatInput, setChatInput]         = useState('');

  // Insumos sugeridos tras la consulta
  const [supplySuggestions, setSupplySuggestions] = useState([]);
  const [showSupplies, setShowSupplies]           = useState(false);

  const { records, loading: loadR, create: createRecord } =
    useMedicalRecords(selected?.patientId ?? null, currentBranchId);

  const todayAppts = useMemo(() => {
    return appointments.filter(a => a.date === TODAY);
  }, [appointments]);

  const filteredAppts = useMemo(() => {
    if (filterStatus === 'Todas') return todayAppts;
    return todayAppts.filter(a => a.status === filterStatus);
  }, [todayAppts, filterStatus]);

  useEffect(() => {
    if (!selected) {
      setPatient(null);
      return;
    }
    setLoadP(true);
    patientService.getById(selected.patientId)
      .then(p => setPatient(p))
      .catch(e => console.error(e))
      .finally(() => setLoadP(false));
  }, [selected]);

  // Resumen automático del historial cuando hay más de 3 consultas (carga en paralelo, no bloquea)
  useEffect(() => {
    if (!selected || autoSummary !== null) return;
    if (records.length > AUTO_SUMMARY_THRESHOLD) {
      summarizeHistory(selected.patientId, patient?.name)
        .then(r => setAutoSummary(r.summary))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, selected]);

  function handleSelect(appt) {
    setSelected(appt);
    setTab(2); // Reset tab to "Nueva consulta" when selecting a new patient
    setSavedOk(false);
    setFormErr('');
    setConsult({ attendanceDate: TODAY, diagnosis: '', notes: '' });
    // Reset del estado de IA al cambiar de paciente
    setSymptoms('');
    setAiSuggestion(null);
    setAutoSummary(null);
    setManualSummary(null);
    setChatHistory([]);
    setChatInput('');
    setShowChat(false);
  }

  // ─── IA: sugerir diagnóstico ───
  async function handleSuggestDiagnosis() {
    try {
      const result = await suggestDiagnosis(symptoms, selected.patientId, user?.specialty);
      setAiSuggestion(result.suggestion);
      if (result.simulated) notify(MESSAGES.error.aiSimulated, 'warning');
      else notify('Sugerencia generada', 'info');
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  function handleUseSuggestion() {
    setConsult(f => ({ ...f, diagnosis: aiSuggestion }));
    setAiSuggestion(null);
    notify(MESSAGES.success.aiSuggestionApplied, 'success');
  }

  // ─── IA: resumir historial (botón manual) ───
  async function handleSummarizeHistory() {
    try {
      const result = await summarizeHistory(selected.patientId, patient?.name);
      setManualSummary(result.summary);
      if (!result.simulated) notify(MESSAGES.success.historySummarized, 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // ─── IA: chat ───
  function buildPatientContext() {
    if (!patient) return 'Sin contexto del paciente.';
    const base = { nombre: patient.name, ci: patient.ci, telefono: patient.phone };
    const resumen = autoSummary || manualSummary || 'Sin resumen disponible.';
    return `Datos del paciente: ${JSON.stringify(base)}\nResumen del historial: ${resumen}`;
  }

  async function handleChatSend() {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { role: 'user', content: text };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    try {
      const result = await chat(text, buildPatientContext(), chatHistory);
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: err.message }]);
    }
  }

  // ─── Guardar consulta ───
  const triggerSave = (e) => {
    e.preventDefault();
    if (!consultForm.diagnosis.trim()) {
      setFormErr('El diagnóstico es obligatorio');
      return;
    }
    setFormErr('');
    setShowConfirm(true);
  };

  function finishConsultation() {
    setSelected(null);
  }

  const handleSaveConfirmed = async () => {
    setShowConfirm(false);
    try {
      await createRecord({ ...consultForm, appointmentId: selected.id });
      if (selected.status === APPOINTMENT_STATUS.SCHEDULED) {
        await markAttended(selected.id);
      }
      setSavedOk(true);
      notify(MESSAGES.success.appointmentAttended, 'success');

      // Sugerir insumos a descontar según el diagnóstico
      try {
        const result = await suggestSupplies(consultForm.diagnosis, consultForm.notes, currentBranchId);
        if (result?.suggestions?.length > 0) {
          setSupplySuggestions(result.suggestions);
          setShowSupplies(true);
          return; // Esperar a que el doctor resuelva el modal antes de cerrar
        }
      } catch {
        // Sin sugerencias de insumos: continuar normalmente
      }
      finishConsultation();
    } catch (err) {
      setFormErr(err.message);
    }
  };

  // Descuenta del inventario los insumos confirmados por el doctor
  async function handleConfirmDeduct(items) {
    for (const item of items) {
      const supply = supplies.find(s =>
        s.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(s.name.toLowerCase())
      );
      if (!supply) continue;
      const newStock = Math.max(0, Number(supply.stockCurrent) - Number(item.quantity));
      await adjustStock(supply.id, newStock, supply.stockMinimum);
    }
    notify(MESSAGES.success.suppliesDeducted, 'success');
    setShowSupplies(false);
    finishConsultation();
  }

  function handleSkipDeduct() {
    setShowSupplies(false);
    finishConsultation();
  }

  const leftPanel = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
      <div>
        <h2 className="text-base font-bold text-navy">Agenda del día</h2>
        <p className="text-xs text-gray-400 mt-0.5">{TODAY}</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              filterStatus === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loadA ? (
        <div className="py-8 flex justify-center"><Spinner /></div>
      ) : filteredAppts.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Sin citas registradas.</p>
      ) : (
        <ul className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {filteredAppts.map(a => (
            <li
              key={a.id}
              onClick={() => handleSelect(a)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selected?.id === a.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-800">
                  {a.time?.slice(0, 5) ?? '—'}
                </span>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-sm font-medium text-navy mt-1.5 truncate">{a.patientName}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{a.reason || 'Sin motivo especificado'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const rightPanel = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      {savedOk && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
          Consulta registrada exitosamente. El paciente ha sido marcado como atendido.
        </div>
      )}

      {!selected ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-base font-medium text-gray-500">Consola de Consulta Médica</p>
          <p className="text-sm text-gray-400 max-w-xs">
            Seleccioná un paciente de la agenda del día para comenzar la consulta médica.
          </p>
        </div>
      ) : loadP ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : (
        <div className="space-y-6">
          {/* Cabecera del Paciente */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <Avatar name={patient?.name || selected.patientName} size="md" />
            <div>
              <h3 className="text-base font-bold text-navy">{patient?.name || selected.patientName}</h3>
              <p className="text-xs text-gray-400">CI: {patient?.ci || '—'} · Cel: {patient?.phone || '—'}</p>
            </div>
          </div>

          {/* Resumen automático del historial */}
          {autoSummary && (
            <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg">
              <p className="text-xs text-primary font-medium inline-flex items-center gap-1.5"><Sparkles size={14} /> Resumen IA</p>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{autoSummary}</p>
            </div>
          )}

          {/* Pestañas (Tabs) */}
          <div className="flex gap-1 border-b border-gray-200 -mb-px">
            {['Datos personales', 'Historial médico', 'Nueva consulta'].map((t, idx) => (
              <button
                key={t}
                onClick={() => setTab(idx)}
                className={`px-4 py-2 text-xs font-semibold transition-colors border-b-2 ${
                  tab === idx
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Contenido Pestañas */}
          {tab === 0 && (
            <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Nombre completo</span>
                  <span className="font-medium text-gray-800">{patient?.name || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">CI</span>
                  <span className="font-medium text-gray-800">{patient?.ci || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Estado</span>
                  <span className="inline-block mt-0.5"><StatusBadge status={patient?.status || 'active'} /></span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Teléfono</span>
                  <span className="font-medium text-gray-800">{patient?.phone || '—'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Email</span>
                  <span className="font-medium text-gray-800">{patient?.email || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  label="Resumir con IA"
                  icon={Sparkles}
                  variant="ghost"
                  size="sm"
                  loading={aiLoading}
                  onClick={handleSummarizeHistory}
                />
              </div>

              {manualSummary && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs uppercase text-primary font-medium">Resumen IA</p>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{manualSummary}</p>
                  {isSimulated && <p className="text-xs text-gray-300 mt-1">(simulado)</p>}
                </div>
              )}

              {loadR ? (
                <div className="py-6 flex justify-center"><Spinner /></div>
              ) : records.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-gray-100">Sin consultas previas.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {records.map(r => (
                    <div key={r.id} className="p-3 border border-gray-100 rounded-lg space-y-1 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span className="font-semibold text-primary">Consulta</span>
                        <span>{r.attendanceDate || new Date(r.createdAt).toLocaleDateString('es-BO')}</span>
                      </div>
                      <p className="text-sm font-bold text-navy">{r.diagnosis}</p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{r.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 2 && (
            <form onSubmit={triggerSave} className="space-y-4">
              {/* Sección 1: Síntomas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Síntomas del paciente</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="Describí lo que refiere el paciente…"
                />
                <Button
                  label="Sugerir diagnóstico"
                  icon={Sparkles}
                  variant="ghost"
                  size="sm"
                  loading={aiLoading}
                  disabled={!symptoms.trim()}
                  onClick={handleSuggestDiagnosis}
                />
              </div>

              {/* Sección 2: Sugerencia IA */}
              {aiSuggestion !== null && (
                <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-navy inline-flex items-center gap-1.5"><Sparkles size={16} className="text-primary" /> Sugerencia del asistente IA</span>
                    {isSimulated && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-orange-400 text-white">Simulado</span>
                    )}
                  </div>
                  <p className="font-mono text-sm text-gray-700 whitespace-pre-wrap">{aiSuggestion}</p>
                  <div className="flex gap-2">
                    <Button label="Usar esta sugerencia" icon={Check} variant="primary" size="sm" onClick={handleUseSuggestion} />
                    <Button label="Ignorar" variant="secondary" size="sm" onClick={() => setAiSuggestion(null)} />
                  </div>
                </div>
              )}

              {/* Sección 3: Fecha + Diagnóstico final */}
              <FormField label="Fecha de atención" htmlFor="attendanceDate" required>
                <input
                  id="attendanceDate"
                  type="date"
                  className={inputClass}
                  value={consultForm.attendanceDate}
                  onChange={e => setConsult(f => ({ ...f, attendanceDate: e.target.value }))}
                />
              </FormField>

              <FormField label="Diagnóstico final" htmlFor="diagnosis" required error={formErr || undefined}>
                <textarea
                  id="diagnosis"
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={consultForm.diagnosis}
                  onChange={e => setConsult(f => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="Diagnóstico confirmado por el médico"
                  required
                />
              </FormField>

              {/* Sección 4: Notas y tratamiento */}
              <FormField label="Evolución, indicaciones y tratamiento" htmlFor="notes">
                <textarea
                  id="notes"
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={consultForm.notes}
                  onChange={e => setConsult(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Indicaciones, medicación, controles…"
                />
              </FormField>

              {/* Sección 5: Botones de acción */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  label="Chat con IA"
                  icon={MessageCircle}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(s => !s)}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    <Check size={16} strokeWidth={2.25} />
                    Guardar consulta
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        title="¿Guardar consulta médica?"
        description="Esta acción registrará el diagnóstico en el historial clínico del paciente y marcará la cita como atendida."
        onConfirm={handleSaveConfirmed}
        onCancel={() => setShowConfirm(false)}
      />

      <SuppliesDeductModal
        isOpen={showSupplies}
        suggestions={supplySuggestions}
        branchId={currentBranchId}
        onConfirm={handleConfirmDeduct}
        onCancel={handleSkipDeduct}
      />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          <ArrowLeft size={16} strokeWidth={2.25} />
          Volver al Dashboard
        </Link>
      </div>
      <SplitScreenLayout leftWidth="40" leftPanel={leftPanel} rightPanel={rightPanel} />

      {/* Drawer de chat con la IA */}
      {showChat && selected && (
        <div className="fixed right-0 top-0 h-full w-80 z-40 bg-white shadow-2xl border-l border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Logo className="text-[0.55rem]" />
              </span>
              <div>
                <p className="font-semibold text-navy leading-tight">Asistente MedIL</p>
                <p className="text-xs text-gray-400">Contexto: {patient?.name || selected.patientName}</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              aria-label="Cerrar chat"
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {chatHistory.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-4">
                Escribí una consulta para el asistente.
              </p>
            )}
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`px-3 py-2 text-sm max-w-[80%] ${
                  msg.role === 'user'
                    ? 'self-end bg-primary text-white rounded-2xl rounded-tr-sm'
                    : 'self-start bg-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {aiLoading && (
              <div className="self-start bg-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-3 py-2 text-sm animate-pulse">
                …
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-2">
            <input
              className={inputClass}
              placeholder="Escribí tu consulta..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleChatSend(); } }}
            />
            <Button label="Enviar" iconRight={Send} variant="primary" size="sm" onClick={handleChatSend} />
          </div>
        </div>
      )}
    </div>
  );
}

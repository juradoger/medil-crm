// Consola médica del doctor
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { patientService } from '../../services/patientService';
import { SplitScreenLayout } from '../../templates/SplitScreenLayout';
import { StatusBadge } from '../../molecules/StatusBadge';
import { FormField, inputClass } from '../../molecules/FormField';
import { ConfirmModal } from '../../molecules/ConfirmModal';
import { APPOINTMENT_STATUS } from '../../core/constants';
import { Avatar } from '../../atoms/Avatar';
import { Spinner } from '../../atoms/Spinner';


const TODAY = new Date().toISOString().slice(0, 10);
const FILTERS = ['Todas', APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.ATTENDED];
const FILTER_LABELS = { Todas: 'Todas', scheduled: 'Agendadas', attended: 'Atendidas' };

export default function DoctorConsole() {
  const { currentBranchId } = useAuth();
  const { appointments, loading: loadA, markAttended } = useAppointments(currentBranchId);

  const [selected, setSelected]         = useState(null);
  const [patient, setPatient]           = useState(null);
  const [loadP, setLoadP]               = useState(false);
  const [tab, setTab]                   = useState(2); // Default to "Nueva consulta"
  const [filterStatus, setFilter]       = useState('Todas');
  const [showConfirm, setShowConfirm]   = useState(false);

  const [consultForm, setConsult]       = useState({ attendanceDate: TODAY, diagnosis: '', notes: '' });
  const [formErr, setFormErr]           = useState('');
  const [savedOk, setSavedOk]           = useState(false);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPatient(null);
      return;
    }
    setLoadP(true);
    patientService.getById(selected.patientId)
      .then(p => setPatient(p))
      .catch(e => console.error(e))
      .finally(() => setLoadP(false));
  }, [selected]);

  function handleSelect(appt) {
    setSelected(appt);
    setTab(2); // Reset tab to "Nueva consulta" when selecting a new patient
    setSavedOk(false);
    setFormErr('');
    setConsult({ attendanceDate: TODAY, diagnosis: '', notes: '' });
  }

  const triggerSave = (e) => {
    e.preventDefault();
    if (!consultForm.diagnosis.trim()) {
      setFormErr('El diagnóstico es obligatorio');
      return;
    }
    setFormErr('');
    setShowConfirm(true);
  };

  const handleSaveConfirmed = async () => {
    setShowConfirm(false);
    try {
      await createRecord({ ...consultForm, appointmentId: selected.id });
      if (selected.status === APPOINTMENT_STATUS.SCHEDULED) {
        await markAttended(selected.id);
      }
      setSavedOk(true);
      setSelected(null);
    } catch (err) {
      setFormErr(err.message);
    }
  };

  const leftPanel = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#0E4A8A]">Agenda del día</h2>
        <p className="text-xs text-gray-400 mt-0.5">{TODAY}</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              filterStatus === f ? 'bg-[#00B4D8] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  ? 'border-[#00B4D8] bg-[#00B4D8]/5 shadow-sm'
                  : 'border-gray-100 hover:border-[#00B4D8]/30 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-800">
                  {a.time?.slice(0, 5) ?? '—'}
                </span>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-sm font-medium text-[#0E4A8A] mt-1.5 truncate">{a.patientName}</p>
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
              <h3 className="text-base font-bold text-[#0E4A8A]">{patient?.name || selected.patientName}</h3>
              <p className="text-xs text-gray-400">CI: {patient?.ci || '—'} · Cel: {patient?.phone || '—'}</p>
            </div>
          </div>

          {/* Pestañas (Tabs) */}
          <div className="flex gap-1 border-b border-gray-200 -mb-px">
            {['Datos personales', 'Historial médico', 'Nueva consulta'].map((t, idx) => (
              <button
                key={t}
                onClick={() => setTab(idx)}
                className={`px-4 py-2 text-xs font-semibold transition-colors border-b-2 ${
                  tab === idx
                    ? 'border-[#00B4D8] text-[#00B4D8]'
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
              {loadR ? (
                <div className="py-6 flex justify-center"><Spinner /></div>
              ) : records.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-gray-100">Sin consultas previas.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {records.map(r => (
                    <div key={r.id} className="p-3 border border-gray-100 rounded-lg space-y-1 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span className="font-semibold text-[#00B4D8]">Consulta</span>
                        <span>{r.attendanceDate || new Date(r.createdAt).toLocaleDateString('es-BO')}</span>
                      </div>
                      <p className="text-sm font-bold text-[#0E4A8A]">{r.diagnosis}</p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{r.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 2 && (
            <form onSubmit={triggerSave} className="space-y-4">
              <FormField label="Fecha de atención" htmlFor="attendanceDate" required>
                <input
                  id="attendanceDate"
                  type="date"
                  className={inputClass}
                  value={consultForm.attendanceDate}
                  onChange={e => setConsult(f => ({ ...f, attendanceDate: e.target.value }))}
                />
              </FormField>

              <FormField label="Diagnóstico" htmlFor="diagnosis" required error={formErr || undefined}>
                <textarea
                  id="diagnosis"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={consultForm.diagnosis}
                  onChange={e => setConsult(f => ({ ...f, diagnosis: e.target.value }))}
                  placeholder="Ingrese el diagnóstico principal del paciente..."
                  required
                />
              </FormField>

              <FormField label="Notas y tratamiento" htmlFor="notes">
                <textarea
                  id="notes"
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={consultForm.notes}
                  onChange={e => setConsult(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Tratamiento recetado y notas de control..."
                />
              </FormField>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] transition-colors font-medium"
                >
                  Guardar consulta
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
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
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>
      <SplitScreenLayout leftWidth="40" leftPanel={leftPanel} rightPanel={rightPanel} />
    </div>
  );
}

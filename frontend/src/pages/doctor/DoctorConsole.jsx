// Consola médica del doctor
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import { useMedicalRecords } from '../../hooks/useMedicalRecords';
import { SplitScreenLayout } from '../../templates/SplitScreenLayout';
import { StatusBadge } from '../../molecules/StatusBadge';
import { FormField, inputClass } from '../../molecules/FormField';
import { Button } from '../../atoms/Button';
import { Spinner } from '../../atoms/Spinner';
import { APPOINTMENT_STATUS } from '../../core/constants';

const TODAY = new Date().toISOString().slice(0, 10);

export default function DoctorConsole() {
  const { currentBranchId } = useAuth();
  const { appointments, loading: loadA, markAttended } = useAppointments(currentBranchId);

  const [selected,    setSelected]  = useState(null);
  const [savedOk,     setSavedOk]   = useState(false);
  const [formErr,     setFormErr]   = useState('');
  const [consultForm, setConsult]   = useState({ attendanceDate: TODAY, diagnosis: '', notes: '' });

  const { create: createRecord, loading: savingR } =
    useMedicalRecords(selected?.patientId ?? null, currentBranchId);

  const todayAppts = appointments.filter(a => a.date === TODAY);

  function handleSelect(appt) {
    setSelected(appt);
    setSavedOk(false);
    setFormErr('');
    setConsult({ attendanceDate: TODAY, diagnosis: '', notes: '' });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!consultForm.diagnosis.trim()) { setFormErr('El diagnóstico es obligatorio'); return; }
    setFormErr('');
    await createRecord({ ...consultForm, appointmentId: selected.id });
    if (selected.status === APPOINTMENT_STATUS.SCHEDULED) {
      await markAttended(selected.id);
    }
    setSavedOk(true);
    setSelected(null);
  }

  const leftPanel = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h2 className="text-base font-semibold text-gray-800">Agenda del día</h2>
      <p className="text-xs text-gray-400 mb-3">{TODAY}</p>
      {loadA
        ? <Spinner />
        : todayAppts.length === 0
          ? <p className="text-sm text-gray-400 mt-2">Sin citas para hoy.</p>
          : (
            <ul className="space-y-2 mt-2">
              {todayAppts.map(a => (
                <li
                  key={a.id}
                  onClick={() => handleSelect(a)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selected?.id === a.id
                      ? 'border-[#00B4D8] bg-[#CAF0F8]'
                      : 'border-gray-100 hover:border-[#90E0EF]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {a.time?.slice(0, 5) ?? '—'}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{a.reason || '—'}</p>
                </li>
              ))}
            </ul>
          )
      }
    </div>
  );

  const rightPanel = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h2 className="text-base font-semibold text-gray-800">Nueva consulta</h2>

      {savedOk && (
        <p className="text-sm text-green-600 mt-2 mb-4">Consulta guardada correctamente.</p>
      )}

      {!selected && !savedOk && (
        <p className="text-sm text-gray-400 mt-2">
          Seleccioná una cita de la agenda para registrar la consulta.
        </p>
      )}

      {selected && (
        <form onSubmit={handleSave} className="space-y-4 mt-4">
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
              placeholder="Ingrese el diagnóstico..."
            />
          </FormField>

          <FormField label="Notas y observaciones" htmlFor="notes">
            <textarea
              id="notes"
              className={`${inputClass} resize-none`}
              rows={4}
              value={consultForm.notes}
              onChange={e => setConsult(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notas adicionales (opcional)..."
            />
          </FormField>

          <div className="flex gap-3">
            <Button label="Guardar consulta" variant="primary" type="submit"
              loading={savingR} disabled={savingR} />
            <Button label="Cancelar" variant="secondary" type="button"
              onClick={() => setSelected(null)} />
          </div>
        </form>
      )}
    </div>
  );

  return (
    <SplitScreenLayout leftWidth="40" leftPanel={leftPanel} rightPanel={rightPanel} />
  );
}

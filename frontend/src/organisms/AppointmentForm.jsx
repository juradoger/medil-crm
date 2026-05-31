// Formulario de cita con selección de paciente, indicador de seguro y recordatorio
import React, { useState } from 'react';
import { FormField, inputClass } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { patientService } from '../services/patientService';

const EMPTY = {
  patientId: '',
  professionalId: '',
  date: '',
  time: '',
  reason: '',
};

const REMINDER_DEFAULT = { enabled: true, timing: '24h', customTime: null };

export function AppointmentForm({ patients = [], professionals = [], onSubmit, onCancel, loading = false }) {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [insurance, setInsurance] = useState(null);   // { isInsured } del paciente seleccionado
  const [reminder, setReminder]   = useState(REMINDER_DEFAULT);

  const today = new Date().toISOString().split('T')[0];

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  // Carga el estado de afiliación al seleccionar el paciente
  async function selectPatient(id) {
    set('patientId', id);
    setInsurance(null);
    if (!id) return;
    try {
      const info = await patientService.checkInsurance(id);
      setInsurance(info);
    } catch {
      setInsurance(null);
    }
  }

  function setReminderField(key, value) {
    setReminder(r => ({ ...r, [key]: value }));
  }

  function validate() {
    const e = {};
    if (!form.patientId)      e.patientId      = 'Seleccioná un paciente';
    if (!form.professionalId) e.professionalId = 'Seleccioná un profesional';
    if (!form.date)           e.date           = 'La fecha es obligatoria';
    else if (form.date < today) e.date         = 'La fecha debe ser a partir de hoy';
    if (!form.time)           e.time           = 'La hora es obligatoria';
    if (!form.reason?.trim()) e.reason         = 'El motivo es obligatorio';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await onSubmit({ ...form, reminderConfig: reminder });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Paciente" htmlFor="patientId" required error={errors.patientId}>
        <select id="patientId" className={inputClass} value={form.patientId}
          onChange={e => selectPatient(e.target.value)}>
          <option value="">Seleccioná un paciente…</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.fullName ?? p.name}</option>
          ))}
        </select>
      </FormField>

      {/* Indicador de seguro del paciente seleccionado */}
      {insurance && (
        insurance.isInsured
          ? <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <Badge text="Paciente afiliado — Cita gratuita" color="green" />
            </div>
          : <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <Badge text="Sin cobertura — Se cobrará la consulta" color="orange" />
            </div>
      )}

      <FormField label="Profesional" htmlFor="professionalId" required error={errors.professionalId}>
        <select id="professionalId" className={inputClass} value={form.professionalId}
          onChange={e => set('professionalId', e.target.value)}>
          <option value="">Seleccioná un profesional…</option>
          {professionals.map(p => (
            <option key={p.id} value={p.id}>{p.fullName ?? p.name}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Fecha" htmlFor="date" required error={errors.date}>
        <input id="date" type="date" min={today} className={inputClass} value={form.date}
          onChange={e => set('date', e.target.value)} />
      </FormField>

      <FormField label="Hora" htmlFor="time" required error={errors.time}>
        <input id="time" type="time" className={inputClass} value={form.time}
          onChange={e => set('time', e.target.value)} />
      </FormField>

      <FormField label="Motivo" htmlFor="reason" required error={errors.reason}>
        <input id="reason" className={inputClass} value={form.reason}
          onChange={e => set('reason', e.target.value)} />
      </FormField>

      {/* Configuración del recordatorio */}
      <div className="rounded-lg bg-gray-50 p-3 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={reminder.enabled}
            onChange={e => setReminderField('enabled', e.target.checked)}
            className="h-4 w-4 accent-[#00B4D8]"
          />
          ¿Querés programar un recordatorio?
        </label>

        {reminder.enabled && (
          <div className="space-y-3">
            <FormField label="¿Cuándo enviarlo?" htmlFor="reminderTiming">
              <select
                id="reminderTiming"
                className={inputClass}
                value={reminder.timing}
                onChange={e => setReminderField('timing', e.target.value)}
              >
                <option value="24h">24 horas antes</option>
                <option value="1h">1 hora antes</option>
                <option value="now">En el momento</option>
                <option value="custom">Hora específica</option>
              </select>
            </FormField>

            {reminder.timing === 'custom' && (
              <FormField label="Hora del recordatorio" htmlFor="reminderTime">
                <input
                  id="reminderTime"
                  type="time"
                  className={inputClass}
                  value={reminder.customTime ?? ''}
                  onChange={e => setReminderField('customTime', e.target.value)}
                />
              </FormField>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button label="Cancelar" variant="secondary" onClick={onCancel} type="button" />
        <Button label="Agendar" variant="primary" type="submit" loading={loading} disabled={loading} />
      </div>
    </form>
  );
}

// Formulario de cita con selección de paciente y profesional
import React, { useState } from 'react';
import { FormField, inputClass } from '../molecules/FormField';
import { Button } from '../atoms/Button';

const EMPTY = {
  patientId: '',
  professionalId: '',
  date: '',
  time: '',
  reason: '',
};

export function AppointmentForm({ patients = [], professionals = [], onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split('T')[0];

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
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
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Paciente" htmlFor="patientId" required error={errors.patientId}>
        <select id="patientId" className={inputClass} value={form.patientId}
          onChange={e => set('patientId', e.target.value)}>
          <option value="">Seleccioná un paciente…</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.fullName ?? p.name}</option>
          ))}
        </select>
      </FormField>

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

      <div className="flex justify-end gap-3 pt-2">
        <Button label="Cancelar" variant="secondary" onClick={onCancel} type="button" />
        <Button label="Agendar" variant="primary" type="submit" loading={loading} disabled={loading} />
      </div>
    </form>
  );
}

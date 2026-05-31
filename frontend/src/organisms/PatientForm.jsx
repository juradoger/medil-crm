// Formulario de paciente con validación visual
import React, { useState } from 'react';
import { FormField, inputClass } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { PATIENT_STATUS } from '../core/constants';
import { patientValidator } from '../domain/validators/patientValidator';

const EMPTY = {
  name:   '',
  phone:  '',
  email:  '',
  status: PATIENT_STATUS.ACTIVE,
};

export function PatientForm({ initialData, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(initialData ?? EMPTY);
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { isValid, errors: errs } = patientValidator.validate(form);
    if (!isValid) { setErrors(errs); return; }
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Nombre completo" htmlFor="name" required error={errors.name}>
        <input id="name" className={inputClass} value={form.name ?? ''}
          onChange={e => set('name', e.target.value)} />
      </FormField>

      <FormField label="Teléfono" htmlFor="phone" required error={errors.phone}>
        <input id="phone" type="tel" className={inputClass} value={form.phone ?? ''}
          onChange={e => set('phone', e.target.value)} />
      </FormField>

      <FormField label="Correo electrónico" htmlFor="email" required error={errors.email}>
        <input id="email" type="email" className={inputClass} value={form.email ?? ''}
          onChange={e => set('email', e.target.value)} />
      </FormField>

      <FormField label="Estado" htmlFor="status">
        <select id="status" className={inputClass} value={form.status ?? PATIENT_STATUS.ACTIVE}
          onChange={e => set('status', e.target.value)}>
          <option value={PATIENT_STATUS.ACTIVE}>Activo</option>
          <option value={PATIENT_STATUS.INACTIVE}>Inactivo</option>
        </select>
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Button label="Cancelar" variant="secondary" onClick={onCancel} type="button" />
        <Button label="Guardar" variant="primary" type="submit" loading={loading} disabled={loading} />
      </div>
    </form>
  );
}

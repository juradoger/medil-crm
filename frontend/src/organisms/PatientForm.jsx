// Formulario de paciente con validación visual
import React, { useState } from 'react';
import { FormField, inputClass } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { PATIENT_STATUS } from '../core/constants';

const EMPTY = {
  fullName: '',
  documentId: '',
  phone: '',
  email: '',
  birthDate: '',
  status: PATIENT_STATUS.ACTIVE,
};

export function PatientForm({ initialData, onSubmit, onCancel, loading = false }) {
  const [form, setForm]     = useState(initialData ?? EMPTY);
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.fullName?.trim())  e.fullName   = 'El nombre completo es obligatorio';
    if (!form.documentId?.trim()) e.documentId = 'El CI es obligatorio';
    if (!form.phone?.trim())     e.phone      = 'El teléfono es obligatorio';
    if (!form.email?.trim())     e.email      = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.birthDate)         e.birthDate  = 'La fecha de nacimiento es obligatoria';
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
      <FormField label="Nombre completo" htmlFor="fullName" required error={errors.fullName}>
        <input id="fullName" className={inputClass} value={form.fullName}
          onChange={e => set('fullName', e.target.value)} />
      </FormField>

      <FormField label="CI" htmlFor="documentId" required error={errors.documentId}>
        <input id="documentId" className={inputClass} value={form.documentId}
          onChange={e => set('documentId', e.target.value)} />
      </FormField>

      <FormField label="Teléfono" htmlFor="phone" required error={errors.phone}>
        <input id="phone" className={inputClass} value={form.phone}
          onChange={e => set('phone', e.target.value)} />
      </FormField>

      <FormField label="Correo electrónico" htmlFor="email" required error={errors.email}>
        <input id="email" type="email" className={inputClass} value={form.email}
          onChange={e => set('email', e.target.value)} />
      </FormField>

      <FormField label="Fecha de nacimiento" htmlFor="birthDate" required error={errors.birthDate}>
        <input id="birthDate" type="date" className={inputClass} value={form.birthDate}
          onChange={e => set('birthDate', e.target.value)} />
      </FormField>

      <FormField label="Estado" htmlFor="status">
        <select id="status" className={inputClass} value={form.status}
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

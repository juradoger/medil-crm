export const patientValidator = {
  validate(data) {
    const errors = {};
    if (!data.fullName?.trim())   errors.fullName   = 'El nombre completo es obligatorio';
    if (!data.documentId?.trim()) errors.documentId = 'El CI es obligatorio';
    if (!data.phone?.trim())      errors.phone      = 'El teléfono es obligatorio';
    if (!data.email?.trim())      errors.email      = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Ingresá un correo válido';
    if (!data.birthDate)          errors.birthDate  = 'La fecha de nacimiento es obligatoria';
    return { isValid: Object.keys(errors).length === 0, errors };
  },
};

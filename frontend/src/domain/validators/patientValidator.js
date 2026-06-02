export const patientValidator = {
  validate(data) {
    const errors = {};
    if (!data.name?.trim())  errors.name  = 'El nombre completo es obligatorio';
    // CI (Carnet de Identidad) obligatorio — Identity card number required
    if (!data.ci?.toString().trim()) errors.ci = 'El CI es obligatorio';
    else if (!/^\d{5,12}(-?\d{0,3}\s?[A-Za-z]{0,2})?$/.test(data.ci.toString().trim()))
      errors.ci = 'Ingresá un CI válido (5 a 12 dígitos, extensión opcional)';
    if (!data.phone?.trim()) errors.phone = 'El teléfono es obligatorio';
    if (!data.email?.trim()) errors.email = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Ingresá un correo válido';
    return { isValid: Object.keys(errors).length === 0, errors };
  },
};

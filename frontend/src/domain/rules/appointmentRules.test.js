import { appointmentRules } from './appointmentRules';

describe('appointmentRules', () => {
  it('isFutureDate retorna false para fecha pasada', () => {
    expect(appointmentRules.isFutureDate('2000-01-01', '10:00')).toBe(false);
  });

  it('isFutureDate retorna true para fecha futura', () => {
    expect(appointmentRules.isFutureDate('2099-12-31', '10:00')).toBe(true);
  });

  it('canBeAttended retorna false para cita cancelada', () => {
    expect(appointmentRules.canBeAttended({ status: 'cancelled' })).toBe(false);
  });

  it('canBeAttended retorna true para cita scheduled', () => {
    expect(appointmentRules.canBeAttended({ status: 'scheduled' })).toBe(true);
  });

  it('canBeCancelled retorna false para cita attended', () => {
    expect(appointmentRules.canBeCancelled({ status: 'attended' })).toBe(false);
  });

  it('requiresPayment retorna true para paciente sin seguro', () => {
    expect(appointmentRules.requiresPayment({ isInsured: false })).toBe(true);
  });

  it('requiresPayment retorna false para paciente asegurado', () => {
    expect(appointmentRules.requiresPayment({ isInsured: true })).toBe(false);
  });

  it('validateInsuranceCode retorna true para código que termina en MED', () => {
    expect(appointmentRules.validateInsuranceCode('CNSALUD-MED')).toBe(true);
  });

  it('validateInsuranceCode retorna true para código que termina en SAL', () => {
    expect(appointmentRules.validateInsuranceCode('caja-sal')).toBe(true);
  });

  it('validateInsuranceCode retorna false para código inválido', () => {
    expect(appointmentRules.validateInsuranceCode('PARTICULAR-001')).toBe(false);
    expect(appointmentRules.validateInsuranceCode(null)).toBe(false);
  });
});

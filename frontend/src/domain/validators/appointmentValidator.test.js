import { appointmentValidator } from './appointmentValidator';

const VALID = {
  patientId:      'p1',
  professionalId: 'pr1',
  date:           '2099-12-31',
  time:           '10:00',
  reason:         'Control rutinario',
};

describe('appointmentValidator', () => {
  it('retorna error cuando date es pasada', () => {
    const { errors } = appointmentValidator.validate({ ...VALID, date: '2000-01-01' });
    expect(errors.date).toBeTruthy();
  });

  it('retorna error cuando patientId está vacío', () => {
    const { errors } = appointmentValidator.validate({ ...VALID, patientId: '' });
    expect(errors.patientId).toBeTruthy();
  });

  it('retorna isValid=true con datos correctos', () => {
    const { isValid } = appointmentValidator.validate(VALID);
    expect(isValid).toBe(true);
  });
});

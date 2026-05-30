import { patientValidator } from './patientValidator';

const VALID = {
  fullName: 'Ana García',
  documentId: '12345678',
  phone: '591-70000000',
  email: 'ana@example.com',
  birthDate: '1990-05-15',
};

describe('patientValidator', () => {
  it('retorna error cuando fullName está vacío', () => {
    const { errors } = patientValidator.validate({ ...VALID, fullName: '' });
    expect(errors.fullName).toBeTruthy();
  });

  it('retorna error cuando email es inválido', () => {
    const { errors } = patientValidator.validate({ ...VALID, email: 'no-es-email' });
    expect(errors.email).toBeTruthy();
  });

  it('retorna isValid=true cuando todos los campos son correctos', () => {
    const { isValid } = patientValidator.validate(VALID);
    expect(isValid).toBe(true);
  });
});

import { patientValidator } from './patientValidator';

const VALID = {
  name:  'Ana García',
  phone: '591-70000000',
  email: 'ana@example.com',
};

describe('patientValidator', () => {
  it('retorna error cuando name está vacío', () => {
    const { errors } = patientValidator.validate({ ...VALID, name: '' });
    expect(errors.name).toBeTruthy();
  });

  it('retorna error cuando phone está vacío', () => {
    const { errors } = patientValidator.validate({ ...VALID, phone: '' });
    expect(errors.phone).toBeTruthy();
  });

  it('retorna error cuando email es inválido', () => {
    const { errors } = patientValidator.validate({ ...VALID, email: 'no-es-email' });
    expect(errors.email).toBeTruthy();
  });

  it('retorna isValid=true cuando todos los campos son correctos', () => {
    const { isValid } = patientValidator.validate(VALID);
    expect(isValid).toBe(true);
  });

  it('no valida documentId ni birthDate (no existen en el schema)', () => {
    const { errors } = patientValidator.validate(VALID);
    expect(errors.documentId).toBeUndefined();
    expect(errors.birthDate).toBeUndefined();
  });
});

import { PatientFactory } from './PatientFactory';
import { PATIENT_STATUS } from '../../core/constants';

describe('PatientFactory', () => {
  it('create() asigna status ACTIVE por defecto', () => {
    const p = PatientFactory.create({ fullName: 'Ana', documentId: '123' });
    expect(p.status).toBe(PATIENT_STATUS.ACTIVE);
  });

  it('create() asigna createdAt automáticamente', () => {
    const p = PatientFactory.create({ fullName: 'Ana' });
    expect(p.createdAt).toBeTruthy();
    expect(typeof p.createdAt).toBe('string');
  });

  it('create() conserva los datos del paciente', () => {
    const p = PatientFactory.create({ fullName: 'Ana', phone: '123456' });
    expect(p.fullName).toBe('Ana');
    expect(p.phone).toBe('123456');
  });

  it('update() asigna updatedAt automáticamente', () => {
    const p = PatientFactory.update({ fullName: 'Ana' });
    expect(p.updatedAt).toBeTruthy();
  });
});

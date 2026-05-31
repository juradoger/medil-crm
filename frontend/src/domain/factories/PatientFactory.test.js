import { PatientFactory } from './PatientFactory';
import { PATIENT_STATUS } from '../../core/constants';

describe('PatientFactory', () => {
  it('create() asigna status ACTIVE por defecto', () => {
    const p = PatientFactory.create({ name: 'Ana García' });
    expect(p.status).toBe(PATIENT_STATUS.ACTIVE);
  });

  it('create() asigna createdAt automáticamente', () => {
    const p = PatientFactory.create({ name: 'Ana García' });
    expect(p.createdAt).toBeTruthy();
    expect(typeof p.createdAt).toBe('string');
  });

  it('create() no incluye updatedAt (patients no tiene esa columna)', () => {
    const p = PatientFactory.create({ name: 'Ana García' });
    expect(p.updatedAt).toBeUndefined();
  });

  it('create() conserva name, phone, email, branchId, userId', () => {
    const p = PatientFactory.create({
      name: 'Ana García', phone: '591-70001234',
      email: 'ana@example.com', branchId: 'b1', userId: 'u1',
    });
    expect(p.name).toBe('Ana García');
    expect(p.phone).toBe('591-70001234');
    expect(p.branchId).toBe('b1');
    expect(p.userId).toBe('u1');
  });

  it('create() no incluye documentId ni birthDate', () => {
    const p = PatientFactory.create({ name: 'Ana', documentId: '123', birthDate: '1990-01-01' });
    expect(p.documentId).toBeUndefined();
    expect(p.birthDate).toBeUndefined();
  });

  it('update() devuelve los campos del schema sin timestamps adicionales', () => {
    const p = PatientFactory.update({ name: 'Ana García', phone: '591-70001234' });
    expect(p.name).toBe('Ana García');
    expect(p.phone).toBe('591-70001234');
  });
});

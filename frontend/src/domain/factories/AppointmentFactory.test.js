import { AppointmentFactory } from './AppointmentFactory';
import { APPOINTMENT_STATUS } from '../../core/constants';

describe('AppointmentFactory', () => {
  it('create() asigna status SCHEDULED por defecto', () => {
    const a = AppointmentFactory.create({ patientId: '1', date: '2026-06-01', time: '10:00' });
    expect(a.status).toBe(APPOINTMENT_STATUS.SCHEDULED);
  });

  it('create() asigna createdAt automáticamente', () => {
    const a = AppointmentFactory.create({ patientId: '1' });
    expect(a.createdAt).toBeTruthy();
  });
});

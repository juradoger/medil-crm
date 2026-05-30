import { ReminderFactory } from './ReminderFactory';
import { REMINDER_STATUS, HOURS_BEFORE_REMINDER } from '../../core/constants';

const APPOINTMENT = {
  id: 'a1',
  patientId: 'p1',
  branchId: 'b1',
  date: '2026-07-01',
  time: '10:00',
};

describe('ReminderFactory', () => {
  it('createFromAppointment() calcula scheduledDate 24hs antes', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    const expected = new Date('2026-07-01T10:00').getTime() - HOURS_BEFORE_REMINDER * 3600000;
    expect(new Date(r.scheduledDate).getTime()).toBe(expected);
  });

  it('createFromAppointment() asigna status PENDING', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    expect(r.status).toBe(REMINDER_STATUS.PENDING);
  });

  it('createFromAppointment() genera mensaje correcto', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    expect(r.message).toContain('2026-07-01');
    expect(r.message).toContain('10:00');
  });
});

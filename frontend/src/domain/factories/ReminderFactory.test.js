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
  it('createFromAppointment() calcula sendAt 24hs antes de la cita', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    const expected = new Date('2026-07-01T10:00').getTime() - HOURS_BEFORE_REMINDER * 3600000;
    expect(new Date(r.sendAt).getTime()).toBe(expected);
  });

  it('createFromAppointment() no incluye scheduledDate (campo renombrado a sendAt)', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    expect(r.scheduledDate).toBeUndefined();
  });

  it('createFromAppointment() asigna status PENDING', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    expect(r.status).toBe(REMINDER_STATUS.PENDING);
  });

  it('createFromAppointment() inicializa sentBy y sentAt en null', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    expect(r.sentBy).toBeNull();
    expect(r.sentAt).toBeNull();
  });

  it('createFromAppointment() genera mensaje correcto', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT);
    expect(r.message).toContain('2026-07-01');
    expect(r.message).toContain('10:00');
  });

  it('createFromAppointment() sin config → sendAt 24hs antes', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT, null);
    const expected = new Date('2026-07-01T10:00').getTime() - HOURS_BEFORE_REMINDER * 3600000;
    expect(new Date(r.sendAt).getTime()).toBe(expected);
  });

  it('createFromAppointment() con timing=1h → sendAt 1hs antes', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT, { timing: '1h', customTime: null });
    const expected = new Date('2026-07-01T10:00').getTime() - 3600000;
    expect(new Date(r.sendAt).getTime()).toBe(expected);
  });

  it('createFromAppointment() con timing=now → sendAt ahora', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT, { timing: 'now', customTime: null });
    expect(Math.abs(new Date(r.sendAt).getTime() - Date.now())).toBeLessThan(5000);
  });

  it('createFromAppointment() con timing=custom + customTime=09:00 → sendAt a las 09:00 del día de la cita', () => {
    const r = ReminderFactory.createFromAppointment(APPOINTMENT, { timing: 'custom', customTime: '09:00' });
    const expected = new Date('2026-07-01T10:00');
    expected.setHours(9, 0, 0, 0);
    expect(new Date(r.sendAt).getTime()).toBe(expected.getTime());
  });
});

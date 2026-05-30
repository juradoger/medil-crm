import { CancelAppointment } from './CancelAppointment.js';
import { Appointment }        from '../domain/entities/Appointment.js';

function makeRepos(status = 'scheduled') {
  const appointment = new Appointment({ id: 'a1', status });
  const appointmentRepo = {
    findById: vi.fn().mockResolvedValue(appointment),
    updateStatus: vi.fn().mockResolvedValue({ id: 'a1', status: 'cancelled' }),
  };
  const reminderRepo = {
    cancelByAppointment: vi.fn().mockResolvedValue({}),
  };
  return { appointmentRepo, reminderRepo };
}

describe('CancelAppointment', () => {
  it('lanza error cuando la cita no puede cancelarse (attended)', async () => {
    const { appointmentRepo, reminderRepo } = makeRepos('attended');
    const uc = new CancelAppointment(appointmentRepo, reminderRepo);
    await expect(uc.execute('a1')).rejects.toThrow('no puede cancelarse');
  });

  it('cancela la cita y su recordatorio cuando es válido', async () => {
    const { appointmentRepo, reminderRepo } = makeRepos('scheduled');
    const uc = new CancelAppointment(appointmentRepo, reminderRepo);
    const result = await uc.execute('a1');
    expect(appointmentRepo.updateStatus).toHaveBeenCalledWith('a1', 'cancelled');
    expect(reminderRepo.cancelByAppointment).toHaveBeenCalledWith('a1');
    expect(result.success).toBe(true);
  });
});

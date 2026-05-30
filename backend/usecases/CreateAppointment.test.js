import { CreateAppointment } from './CreateAppointment.js';

// Mocks de repositorios para pruebas
function makeRepos({ patientActive = true, hasConflict = false } = {}) {
  const appointment = { id: 'a1', patientId: 'p1', professionalId: 'pr1', date: '2099-12-31', time: '10:00', status: 'scheduled' };

  const patientRepo = {
    findById: vi.fn().mockResolvedValue({ isActive: () => patientActive }),
  };
  const appointmentRepo = {
    findConflict: vi.fn().mockResolvedValue(hasConflict ? { id: 'conflict' } : null),
    save: vi.fn().mockResolvedValue(appointment),
    findById: vi.fn().mockResolvedValue(appointment),
  };
  const reminderRepo = {
    save: vi.fn().mockResolvedValue({}),
    cancelByAppointment: vi.fn().mockResolvedValue({}),
  };

  return { patientRepo, appointmentRepo, reminderRepo, appointment };
}

describe('CreateAppointment', () => {
  it('lanza error cuando la fecha es pasada', async () => {
    const { patientRepo, appointmentRepo, reminderRepo } = makeRepos();
    const uc = new CreateAppointment(appointmentRepo, patientRepo, reminderRepo);
    await expect(
      uc.execute({ date: '2000-01-01', time: '10:00', patientId: 'p1', professionalId: 'pr1' })
    ).rejects.toThrow('a partir de hoy');
  });

  it('lanza error cuando el paciente está inactivo', async () => {
    const { patientRepo, appointmentRepo, reminderRepo } = makeRepos({ patientActive: false });
    const uc = new CreateAppointment(appointmentRepo, patientRepo, reminderRepo);
    await expect(
      uc.execute({ date: '2099-12-31', time: '10:00', patientId: 'p1', professionalId: 'pr1' })
    ).rejects.toThrow('inactivo');
  });

  it('lanza error cuando hay conflicto de horario', async () => {
    const { patientRepo, appointmentRepo, reminderRepo } = makeRepos({ hasConflict: true });
    const uc = new CreateAppointment(appointmentRepo, patientRepo, reminderRepo);
    await expect(
      uc.execute({ date: '2099-12-31', time: '10:00', patientId: 'p1', professionalId: 'pr1' })
    ).rejects.toThrow('conflicto');
  });

  it('crea la cita y genera recordatorio cuando todo es válido', async () => {
    const { patientRepo, appointmentRepo, reminderRepo } = makeRepos();
    const uc = new CreateAppointment(appointmentRepo, patientRepo, reminderRepo);
    const result = await uc.execute({
      date: '2099-12-31', time: '10:00', patientId: 'p1', professionalId: 'pr1',
    });
    expect(appointmentRepo.save).toHaveBeenCalled();
    expect(reminderRepo.save).toHaveBeenCalled();
    expect(result.id).toBe('a1');
  });
});

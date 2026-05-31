import { describe, it, expect, beforeEach, vi } from 'vitest';

// Holder mutable para controlar la fila devuelta por el mock de InsForge
const state = vi.hoisted(() => ({ row: null }));

vi.mock('../lib/insforge', () => {
  const builder = {
    select: () => builder,
    update: () => builder,
    insert: () => builder,
    eq: () => Promise.resolve({ data: state.row ? [state.row] : [], error: null }),
  };
  return { db: { from: () => builder } };
});

vi.mock('./reminderService', () => ({
  reminderService: {
    create: vi.fn().mockResolvedValue({}),
    cancelByAppointment: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('./patientService', () => ({
  patientService: { getById: vi.fn().mockResolvedValue({ id: 'p1', status: 'active' }) },
}));

import { appointmentService } from './appointmentService';
import { reminderService } from './reminderService';

describe('appointmentService — transiciones de estado y recordatorios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.row = null;
  });

  it('cancel() cancela el recordatorio asociado cuando la cita está agendada', async () => {
    state.row = { id: 'a1', status: 'scheduled' };
    await appointmentService.cancel('a1');
    expect(reminderService.cancelByAppointment).toHaveBeenCalledWith('a1');
  });

  it('cancel() rechaza cancelar una cita ya atendida', async () => {
    state.row = { id: 'a1', status: 'attended' };
    await expect(appointmentService.cancel('a1')).rejects.toThrow();
    expect(reminderService.cancelByAppointment).not.toHaveBeenCalled();
  });

  it('markAttended() rechaza atender una cita cancelada', async () => {
    state.row = { id: 'a1', status: 'cancelled' };
    await expect(appointmentService.markAttended('a1')).rejects.toThrow();
  });

  it('markAttended() permite atender una cita agendada', async () => {
    state.row = { id: 'a1', status: 'scheduled' };
    await expect(appointmentService.markAttended('a1')).resolves.toBeUndefined();
  });
});

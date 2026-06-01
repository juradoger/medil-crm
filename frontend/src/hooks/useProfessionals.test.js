// Tests del hook useProfessionals — useProfessionals hook tests
import { renderHook, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useProfessionals } from './useProfessionals';
import { professionalService } from '../services/professionalService';

vi.mock('../services/professionalService');

const MOCK = [
  { id: 'p1', fullName: 'Dr. A', branchId: 'b1', isActive: true },
  { id: 'p2', fullName: 'Dra. B', branchId: 'b2', isActive: true },
];

describe('useProfessionals — hook', () => {
  afterEach(() => vi.clearAllMocks());

  it('carga todos los profesionales al montar sin branchId', async () => {
    professionalService.getAll.mockResolvedValue(MOCK);
    const { result } = renderHook(() => useProfessionals());
    await waitFor(() => expect(result.current.professionals).toHaveLength(2));
  });

  it('filtra por branchId cuando se especifica', async () => {
    professionalService.getAll.mockResolvedValue(MOCK);
    const { result } = renderHook(() => useProfessionals('b1'));
    await waitFor(() => expect(result.current.professionals).toHaveLength(1));
    expect(result.current.professionals[0].id).toBe('p1');
  });

  it('createProfessional agrega el profesional creado', async () => {
    professionalService.getAll.mockResolvedValue([]);
    professionalService.create.mockResolvedValue({ id: 'p9', fullName: 'Dr. Nuevo' });
    const { result } = renderHook(() => useProfessionals());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createProfessional({ fullName: 'Dr. Nuevo' });
    });

    expect(result.current.professionals.some(p => p.id === 'p9')).toBe(true);
  });
});

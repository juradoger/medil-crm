// Tests de usePatients — usePatients hook tests
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePatients } from './usePatients';
import { patientService } from '../services/patientService';

vi.mock('../services/patientService');

const MOCK_PATIENTS = [
  { id: '1', fullName: 'Ana García', ci: '1234567', status: 'active', branchId: 'b1' },
  { id: '2', fullName: 'Luis Pérez', ci: '7654321', status: 'active', branchId: 'b1' },
];

beforeEach(() => {
  vi.clearAllMocks();
  patientService.getAll.mockResolvedValue(MOCK_PATIENTS);
  patientService.create.mockResolvedValue({ id: '3', ...MOCK_PATIENTS[0] });
  patientService.update.mockResolvedValue({});
  patientService.remove.mockResolvedValue({});
});

describe('usePatients', () => {
  it('carga pacientes al montar — loads patients on mount', async () => {
    const { result } = renderHook(() => usePatients('b1'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.patients).toEqual(MOCK_PATIENTS);
    expect(patientService.getAll).toHaveBeenCalledWith('b1');
  });

  it('no carga si no hay branchId — does not load without branchId', async () => {
    const { result } = renderHook(() => usePatients(null));
    await waitFor(() => expect(result.current.loading).toBe(true));
    expect(patientService.getAll).not.toHaveBeenCalled();
  });

  it('crea un paciente y recarga — creates a patient and reloads', async () => {
    const { result } = renderHook(() => usePatients('b1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.create({ fullName: 'Carlos Ruiz', ci: '9999999' });
    });

    expect(patientService.create).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Carlos Ruiz', branchId: 'b1' })
    );
    expect(patientService.getAll).toHaveBeenCalledTimes(2);
  });

  it('expone error cuando falla la carga — exposes error on load failure', async () => {
    patientService.getAll.mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => usePatients('b1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('DB error');
    expect(result.current.patients).toEqual([]);
  });
});

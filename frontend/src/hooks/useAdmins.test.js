// Tests del hook useAdmins — useAdmins hook tests
import { renderHook, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAdmins } from './useAdmins';
import { adminService } from '../services/adminService';

vi.mock('../services/adminService');

const MOCK = [
  { id: 'u1', email: 'admin.lapaz@medil.com', fullName: 'Admin LP', role: 'admin', branchId: 'b1' },
  { id: 'u2', email: 'admin.cbba@medil.com', fullName: 'Admin CBBA', role: 'admin', branchId: 'b2' },
];

describe('useAdmins — hook', () => {
  afterEach(() => vi.clearAllMocks());

  it('carga los administradores al montar', async () => {
    adminService.getAll.mockResolvedValue(MOCK);
    const { result } = renderHook(() => useAdmins());
    await waitFor(() => expect(result.current.admins).toHaveLength(2));
    expect(result.current.loading).toBe(false);
  });

  it('addAdmin crea/eleva y refresca la lista', async () => {
    adminService.getAll.mockResolvedValue(MOCK);
    adminService.createOrElevate.mockResolvedValue({ admin: { id: 'u3', fullName: 'Nuevo' }, elevated: false });
    const { result } = renderHook(() => useAdmins());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returned;
    await act(async () => {
      returned = await result.current.addAdmin({ email: 'nuevo@medil.com', fullName: 'Nuevo', password: 'secret1', branchId: 'b1' });
    });

    expect(adminService.createOrElevate).toHaveBeenCalled();
    expect(returned.elevated).toBe(false);
    expect(adminService.getAll).toHaveBeenCalledTimes(2); // montaje + refresco
  });
});

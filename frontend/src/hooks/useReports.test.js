// Tests del hook useReports — useReports hook tests
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useReports } from './useReports';
import { reportService } from '../services/reportService';

vi.mock('../services/reportService');

describe('useReports — hook', () => {
  afterEach(() => vi.clearAllMocks());

  it('inicia con report=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useReports());
    expect(result.current.report).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('generate guarda el reporte devuelto por el servicio', async () => {
    const fake = { rows: [], metrics: { attended: 0 } };
    reportService.getReport.mockResolvedValue(fake);
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.generate('', '2026-01-01', '2026-01-31');
    });

    expect(result.current.report).toEqual(fake);
  });

  it('error se actualiza cuando el servicio falla', async () => {
    reportService.getReport.mockRejectedValue(new Error('falló'));
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.generate('', 'a', 'b').catch(() => {});
    });

    await waitFor(() => expect(result.current.error).toBe('falló'));
  });
});

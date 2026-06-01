// Tests del hook useAI — useAI hook tests
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAI } from './useAI';
import { aiService } from '../services/aiService';

vi.mock('../services/aiService');

describe('useAI — hook', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('inicia con loading=false, error=null, isSimulated=false', () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isSimulated).toBe(false);
  });

  it('isSimulated=true cuando la respuesta tiene simulated=true', async () => {
    aiService.suggestDiagnosis.mockResolvedValue({
      suggestion: 'Resumen simulado',
      simulated: true,
    });
    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.suggestDiagnosis('fiebre', 'p1', 'general');
    });

    expect(result.current.isSimulated).toBe(true);
  });

  it('no marca isSimulated cuando la respuesta es real', async () => {
    aiService.suggestDiagnosis.mockResolvedValue({ suggestion: 'Gripe común' });
    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.suggestDiagnosis('fiebre', 'p1', 'general');
    });

    expect(result.current.isSimulated).toBe(false);
  });

  it('error se actualiza cuando el servicio falla', async () => {
    aiService.chat.mockRejectedValue(new Error('Error del asistente IA'));
    const { result } = renderHook(() => useAI());

    await act(async () => {
      await result.current.chat('hola', null, []).catch(() => {});
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Error del asistente IA');
    });
  });
});

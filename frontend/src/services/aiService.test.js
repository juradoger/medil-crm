// Tests del servicio de IA — aiService tests
import { vi } from 'vitest';
import { aiService } from './aiService';

describe('aiService — servicio', () => {
  beforeEach(() => {
    localStorage.setItem('medil_token', 'token-test');
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('suggestDiagnosis devuelve la respuesta del servidor', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ suggestion: 'Gripe común' }),
    });

    const result = await aiService.suggestDiagnosis('fiebre', 'p1', 'general');
    expect(result.suggestion).toBe('Gripe común');
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it('no lanza error cuando la respuesta es simulada (simulated=true)', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ simulated: true, suggestion: 'Simulado' }),
    });

    const result = await aiService.summarizeHistory('p1', 'Juan');
    expect(result.simulated).toBe(true);
  });

  it('lanza error cuando la respuesta falla y no es simulada', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Error del asistente IA' }),
    });

    await expect(aiService.chat('hola', null, [])).rejects.toThrow('Error del asistente IA');
  });
});

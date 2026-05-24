// Tests del hook useBilling — useBilling hook tests
import { renderHook } from '@testing-library/react';
import { useBilling } from './useBilling';

describe('useBilling', () => {
  it('inicia con estado idle — starts with idle state', () => {
    const { result } = renderHook(() => useBilling());
    expect(result.current.paymentState).toBe('idle');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

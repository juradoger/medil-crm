import { billingRules } from './billingRules';

describe('billingRules', () => {
  it('calculateTotal(100) retorna {subtotal:100, commission:2, total:102}', () => {
    const result = billingRules.calculateTotal(100);
    expect(result.subtotal).toBe(100);
    expect(result.commission).toBe(2);
    expect(result.total).toBe(102);
  });

  it('lanza error cuando amount <= 0', () => {
    expect(() => billingRules.calculateTotal(0)).toThrow();
    expect(() => billingRules.calculateTotal(-5)).toThrow();
  });
});

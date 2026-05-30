import { PaymentFactory } from './PaymentFactory';
import { PAYMENT_STATUS, QR_COMMISSION_PERCENTAGE } from '../../core/constants';

describe('PaymentFactory', () => {
  it('create() calcula commission correctamente (2%)', () => {
    const p = PaymentFactory.create({ amount: 100 });
    expect(p.commission).toBe(100 * QR_COMMISSION_PERCENTAGE);
  });

  it('create() calcula totalAmount correctamente', () => {
    const p = PaymentFactory.create({ amount: 100 });
    expect(p.totalAmount).toBe(102);
  });

  it('create() asigna status PENDING', () => {
    const p = PaymentFactory.create({ amount: 50 });
    expect(p.status).toBe(PAYMENT_STATUS.PENDING);
  });
});

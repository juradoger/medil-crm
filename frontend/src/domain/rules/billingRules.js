import { QR_COMMISSION_PERCENTAGE } from '../../core/constants';

export const billingRules = {
  calculateCommission(amount) {
    if (amount <= 0) throw new Error('El monto debe ser mayor a cero');
    return amount * QR_COMMISSION_PERCENTAGE;
  },
  calculateTotal(amount) {
    const commission = billingRules.calculateCommission(amount);
    return { subtotal: amount, commission, total: amount + commission };
  },
};

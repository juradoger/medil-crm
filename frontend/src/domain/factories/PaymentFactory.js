import { PAYMENT_STATUS, QR_COMMISSION_PERCENTAGE } from '../../core/constants';

export const PaymentFactory = {
  create(data) {
    const commission  = data.amount * QR_COMMISSION_PERCENTAGE;
    const totalAmount = data.amount + commission;
    return {
      ...data,
      commission,
      totalAmount,
      status:    PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };
  },
};

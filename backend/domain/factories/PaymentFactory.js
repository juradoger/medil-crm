const QR_COMMISSION_PERCENTAGE = 0.02;

export const PaymentFactory = {
  create(data) {
    const commission  = data.amount * QR_COMMISSION_PERCENTAGE;
    const totalAmount = data.amount + commission;
    return {
      ...data,
      commission,
      totalAmount,
      status:    'pending',
      createdAt: new Date().toISOString(),
    };
  },
};

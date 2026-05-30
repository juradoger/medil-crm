// TDD — Fase RED: pruebas del servicio de facturación — RED Phase: billing service tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from './billingService.js';

describe('BillingService', () => {
  let service;
  let mockAdapter;

  beforeEach(() => {
    mockAdapter = {
      generateQR: vi.fn(),
      checkPaymentStatus: vi.fn(),
    };
    service = new BillingService(mockAdapter);
  });

  it('calcula total con 2% comisión — calculates total with 2% commission', () => {
    expect(service.calculateTotal(100)).toEqual({
      subtotal:   100,
      commission: 2,
      total:      102,
    });
  });

  it('lanza error con monto negativo — throws error for negative amount', () => {
    expect(() => service.calculateTotal(-50)).toThrow(
      'El monto debe ser mayor a cero'
    );
  });

  it('lanza error con monto cero — throws error for zero amount', () => {
    expect(() => service.calculateTotal(0)).toThrow();
  });

  it('genera QR delegando al adaptador — generates QR delegating to adapter', async () => {
    mockAdapter.generateQR.mockResolvedValue({
      qrCode: 'QR_123', transactionId: 'TXN_ABC',
    });
    const result = await service.generatePaymentQR({
      appointmentId: '1', amount: 100, branchId: 'b1',
    });
    expect(mockAdapter.generateQR).toHaveBeenCalledOnce();
    expect(result.qrCode).toBe('QR_123');
  });

  it('verifica estado de pago — checks payment status', async () => {
    mockAdapter.checkPaymentStatus.mockResolvedValue({ status: 'approved' });
    const result = await service.checkPaymentStatus('TXN_ABC');
    expect(result.status).toBe('approved');
  });
});

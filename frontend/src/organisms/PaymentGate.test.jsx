import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentGate } from './PaymentGate';

const APPT = {
  patientName: 'Ana García',
  professional: 'Dra. Solís',
  date: '2099-12-31',
  time: '10:00',
  branchId: 'b1',
};

describe('PaymentGate', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<PaymentGate isOpen appointmentData={APPT} amount={100} onPaymentSuccess={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Pago requerido para confirmar la cita')).toBeTruthy();
  });

  it('no renderiza nada cuando isOpen=false', () => {
    const { container } = render(
      <PaymentGate isOpen={false} appointmentData={APPT} amount={100} onPaymentSuccess={() => {}} onCancel={() => {}} />
    );
    expect(container.textContent).toBe('');
  });

  it('muestra el monto correctamente', () => {
    render(<PaymentGate isOpen appointmentData={APPT} amount={100} onPaymentSuccess={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Bs. 100.00')).toBeTruthy();
    expect(screen.getByText('Total: Bs. 102.00')).toBeTruthy();
  });

  it('muestra los botones de pago QR y efectivo', () => {
    render(<PaymentGate isOpen appointmentData={APPT} amount={100} onPaymentSuccess={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Pagar con QR')).toBeTruthy();
    expect(screen.getByText('Registrar pago en efectivo')).toBeTruthy();
  });

  it('llama onCancel al cancelar', () => {
    const onCancel = vi.fn();
    render(<PaymentGate isOpen appointmentData={APPT} amount={100} onPaymentSuccess={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });
});

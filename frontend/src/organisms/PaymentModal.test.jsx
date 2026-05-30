// Tests de PaymentModal — PaymentModal tests
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PaymentModal } from './PaymentModal';

// Mock del hook useBilling — useBilling hook mock
vi.mock('../hooks/useBilling', () => ({
  useBilling: () => ({
    generateQR:    vi.fn(),
    paymentState:  'idle',
    qrData:        null,
    error:         null,
    loading:       false,
    resetPayment:  vi.fn(),
  }),
}));

describe('PaymentModal', () => {
  const baseProps = {
    isOpen:           false,
    onClose:          vi.fn(),
    appointmentId:    '1',
    amount:           100,
    branchId:         'b1',
    onPaymentSuccess: vi.fn(),
  };

  it('no renderiza cuando isOpen=false — does not render when isOpen=false', () => {
    const { container } = render(<PaymentModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra el monto cuando isOpen=true — shows amount when isOpen=true', () => {
    render(<PaymentModal {...baseProps} isOpen={true} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('llama onClose al presionar cancelar — calls onClose when cancel pressed', () => {
    const onClose = vi.fn();
    render(<PaymentModal {...baseProps} isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

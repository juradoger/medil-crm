// Tests de SuppliesDeductModal — SuppliesDeductModal tests
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SuppliesDeductModal } from './SuppliesDeductModal';

describe('SuppliesDeductModal — organismo', () => {
  const baseProps = {
    isOpen: true,
    suggestions: [
      { name: 'Gasas estériles', quantity: 2 },
      { name: 'Alcohol en gel', quantity: 1 },
    ],
    branchId: 'b1',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  afterEach(() => vi.clearAllMocks());

  it('smoke — renderiza sin errores', () => {
    render(<SuppliesDeductModal {...baseProps} />);
    expect(document.body).toBeTruthy();
  });

  it('no renderiza cuando isOpen=false', () => {
    const { container } = render(<SuppliesDeductModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra la lista de insumos sugeridos', () => {
    render(<SuppliesDeductModal {...baseProps} />);
    expect(screen.getByText('Gasas estériles')).toBeInTheDocument();
    expect(screen.getByText('Alcohol en gel')).toBeInTheDocument();
  });

  it('llama onCancel al omitir', () => {
    const onCancel = vi.fn();
    render(<SuppliesDeductModal {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /omitir/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('llama onConfirm con los insumos al confirmar', () => {
    const onConfirm = vi.fn();
    render(<SuppliesDeductModal {...baseProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /confirmar descuento/i }));
    expect(onConfirm).toHaveBeenCalledWith([
      { name: 'Gasas estériles', quantity: 2 },
      { name: 'Alcohol en gel', quantity: 1 },
    ]);
  });

  it('quita un insumo de la lista al presionar su botón quitar', () => {
    render(<SuppliesDeductModal {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /quitar gasas estériles/i }));
    expect(screen.queryByText('Gasas estériles')).not.toBeInTheDocument();
  });
});

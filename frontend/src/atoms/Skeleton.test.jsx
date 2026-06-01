import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton — átomo', () => {
  it('renderiza con la clase animate-pulse', () => {
    render(<Skeleton />);
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
  });

  it('acepta className adicional', () => {
    render(<Skeleton className="h-9 w-16" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('h-9');
    expect(el).toHaveClass('w-16');
  });

  it('aguanta className vacío sin explotar', () => {
    render(<Skeleton className="" />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});

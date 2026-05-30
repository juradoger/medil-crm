import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
  it('renderiza con texto correcto', () => {
    render(<Label text="Nombre completo" />);
    expect(screen.getByText('Nombre completo')).toBeTruthy();
  });

  it('muestra asterisco cuando required=true', () => {
    render(<Label text="Email" required={true} />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('no muestra asterisco cuando required=false', () => {
    render(<Label text="Email" required={false} />);
    expect(screen.queryByText('*')).toBeNull();
  });

  it('prueba de estrés: text null no explota', () => {
    const { container } = render(<Label text={null} />);
    expect(container.firstChild).toBeTruthy();
  });
});

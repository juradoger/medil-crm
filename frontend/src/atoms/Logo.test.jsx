import React from 'react';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo Component', () => {
  it('smoke test: renders without error', () => {
    render(<Logo />);
    const img = screen.getByAltText('MedIL Logo');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/logo-png.png');
  });
});


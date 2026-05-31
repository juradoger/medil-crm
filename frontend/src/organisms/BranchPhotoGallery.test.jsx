import React from 'react';
import { render, screen } from '@testing-library/react';
import { BranchPhotoGallery } from './BranchPhotoGallery';

vi.mock('../services/backendService', () => ({
  BACKEND_URL: 'http://localhost:3001',
}));

describe('BranchPhotoGallery', () => {
  it('smoke test: renderiza sin errores', () => {
    const { container } = render(<BranchPhotoGallery branchId="b1" editable />);
    expect(container).toBeTruthy();
  });

  it('no muestra galería cuando no hay fotos y editable=false', () => {
    const { container } = render(<BranchPhotoGallery branchId="b1" editable={false} />);
    expect(container.querySelector('img')).toBeFalsy();
    expect(container.textContent).toBe('');
  });

  it('muestra las fotos existentes en modo público', () => {
    const { container } = render(
      <BranchPhotoGallery
        branchId="b1"
        coverPhoto="https://example.com/cover.jpg"
        photo1="https://example.com/1.jpg"
      />
    );
    expect(container.querySelectorAll('img').length).toBe(2);
  });

  it('muestra botones de upload cuando editable=true', () => {
    render(<BranchPhotoGallery branchId="b1" editable />);
    // 1 portada + 3 fotos = 4 botones "Cambiar"
    expect(screen.getAllByText('Cambiar').length).toBeGreaterThanOrEqual(4);
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoUpload } from './PhotoUpload';

vi.mock('../services/backendService', () => ({
  BACKEND_URL: 'http://localhost:3001',
}));

describe('PhotoUpload', () => {
  it('smoke test: renderiza sin errores', () => {
    render(<PhotoUpload label="Foto" onUpload={() => {}} entityType="patient" entityId="p1" />);
    expect(screen.getByText('Foto')).toBeTruthy();
  });

  it('muestra Avatar (iniciales) cuando no hay foto', () => {
    const { container } = render(
      <PhotoUpload label="María" onUpload={() => {}} entityType="patient" entityId="p1" />
    );
    // Sin foto: no hay <img>, se muestra la inicial del label
    expect(container.querySelector('img')).toBeFalsy();
    expect(screen.getByText('M')).toBeTruthy();
  });

  it('muestra imagen cuando hay currentPhoto', () => {
    const { container } = render(
      <PhotoUpload
        currentPhoto="https://example.com/photo.jpg"
        label="Foto"
        onUpload={() => {}}
        entityType="patient"
        entityId="p1"
      />
    );
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toBe('https://example.com/photo.jpg');
  });

  it('muestra error cuando el archivo supera 5MB', () => {
    render(<PhotoUpload label="Foto" onUpload={() => {}} entityType="patient" entityId="p1" />);
    const input = document.querySelector('input[type="file"]');

    const bigFile = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(screen.getByText('La foto no puede superar los 5MB')).toBeTruthy();
  });
});

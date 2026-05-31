// Organismo de subida de foto con preview, validación y subida inmediata
import React, { useState, useRef } from 'react';
import { Avatar } from '../atoms/Avatar';
import { Spinner } from '../atoms/Spinner';
import { BACKEND_URL } from '../services/backendService';
import { eventBus } from '../core/eventBus';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Tamaños del contenedor de la foto
const SIZE_MAP = {
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
  lg: 'h-32 w-32',
};

export function PhotoUpload({
  currentPhoto,
  onUpload,
  entityType,
  entityId,
  label = 'Foto',
  size = 'md',
}) {
  const inputRef = useRef(null);
  const [preview,   setPreview]   = useState(currentPhoto ?? null);
  const [error,     setError]     = useState('');
  const [uploading, setUploading] = useState(false);

  const sizeCls = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Valida y dispara la subida inmediata al seleccionar un archivo
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato no permitido. Usá JPG, PNG o WEBP');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('La foto no puede superar los 5MB');
      return;
    }

    setError('');
    setPreview(URL.createObjectURL(file)); // preview inmediato
    await uploadFile(file);
  }

  // Sube el archivo al backend Express (Cloudinary) y notifica al padre
  async function uploadFile(file) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('medil_token');
      const res = await fetch(`${BACKEND_URL}/api/uploads/${entityType}/${entityId}`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al subir la foto');

      onUpload?.(data.url);
      eventBus.emit('toast:show', { message: 'Foto actualizada correctamente', type: 'success' });
    } catch (err) {
      setError(err.message);
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title={`Cambiar ${label.toLowerCase()}`}
        className={`relative ${sizeCls} rounded-full group focus:outline-none`}
      >
        {preview
          ? <img
              src={preview}
              alt={label}
              className={`${sizeCls} rounded-full object-cover border-2 border-[#90E0EF]`}
            />
          : <div className={sizeCls}>
              <Avatar name={label} size="fill" className="h-full w-full text-2xl" />
            </div>
        }

        {/* Overlay de carga */}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Spinner size="sm" />
          </span>
        )}

        {/* Hint al pasar el mouse */}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white text-xs opacity-0 group-hover:bg-black/30 group-hover:opacity-100 transition">
          Cambiar
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <span className="text-xs text-gray-500">{label}</span>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

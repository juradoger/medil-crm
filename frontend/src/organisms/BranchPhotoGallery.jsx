// Galería de fotos de sucursal: portada + 3 fotos adicionales
// editable=true (admin): permite cambiar cada foto
// editable=false (público): solo muestra las fotos existentes
import React, { useState, useRef } from 'react';
import { Spinner } from '../atoms/Spinner';
import { BACKEND_URL } from '../services/backendService';
import { eventBus } from '../core/eventBus';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Slot individual editable con subida inmediata al backend
function SlotUploader({ branchId, slotKey, label, currentUrl, cover, onChange }) {
  const inputRef = useRef(null);
  const [preview,   setPreview]   = useState(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  const imgCls = cover
    ? 'h-64 w-full object-cover rounded-xl'
    : 'h-32 w-full object-cover rounded-lg';

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('La foto no puede superar los 5MB');
      return;
    }
    setError('');
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photos', file);
      formData.append('slot', slotKey);

      const token = localStorage.getItem('medil_token');
      const res = await fetch(`${BACKEND_URL}/api/uploads/branch/${branchId}`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al subir la foto');

      onChange?.(slotKey, data.url);
      eventBus.emit('toast:show', { message: 'Foto de sucursal actualizada', type: 'success' });
    } catch (err) {
      setError(err.message);
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative">
      {preview
        ? <img src={preview} alt={label} className={imgCls} />
        : <div className={`${imgCls} bg-[#CAF0F8] flex items-center justify-center text-[#0096B4] text-xs font-medium`}>
            {label}
          </div>
      }
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-black/50 rounded-lg hover:bg-black/70 disabled:opacity-60 transition-colors"
      >
        {uploading ? <Spinner size="sm" /> : 'Cambiar'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleChange}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function BranchPhotoGallery({
  branchId,
  coverPhoto,
  photo1,
  photo2,
  photo3,
  editable = false,
  onChange,
}) {
  const extras = [
    { key: 'photo1', url: photo1 },
    { key: 'photo2', url: photo2 },
    { key: 'photo3', url: photo3 },
  ];

  // Modo edición (admin): portada + 3 slots editables
  if (editable) {
    return (
      <div className="space-y-3">
        <SlotUploader
          branchId={branchId} slotKey="coverPhoto" label="Foto de portada"
          currentUrl={coverPhoto} cover onChange={onChange}
        />
        <div className="grid grid-cols-3 gap-3">
          {extras.map(s => (
            <SlotUploader
              key={s.key} branchId={branchId} slotKey={s.key} label={s.key}
              currentUrl={s.url} onChange={onChange}
            />
          ))}
        </div>
      </div>
    );
  }

  // Modo público: si no hay fotos, no se muestra nada
  const hasAny = coverPhoto || photo1 || photo2 || photo3;
  if (!hasAny) return null;

  const existingExtras = extras.filter(s => s.url);
  return (
    <div className="space-y-3">
      {coverPhoto && (
        <img src={coverPhoto} alt="Portada de la sucursal" className="h-64 w-full object-cover rounded-xl" />
      )}
      {existingExtras.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {existingExtras.map(s => (
            <img key={s.key} src={s.url} alt="Foto de la sucursal" className="h-32 w-full object-cover rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}

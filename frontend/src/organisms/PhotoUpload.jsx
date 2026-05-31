// Organismo de subida de foto con preview y validación
import React, { useState, useRef } from 'react';
import { BACKEND_URL } from '../services/backendService';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function PhotoUpload({
  currentPhoto,
  onUpload,
  endpoint,
  entityId,
  label      = 'Foto',
  loading    = false,
}) {
  const inputRef = useRef(null);
  const [preview,   setPreview]   = useState(currentPhoto ?? null);
  const [file,      setFile]      = useState(null);
  const [sizeErr,   setSizeErr]   = useState('');
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setSizeErr('La foto no puede superar los 5MB');
      return;
    }
    setSizeErr('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!file) return;
    setUploading(true);
    setSizeErr('');
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const path  = entityId
        ? `/api/uploads/${endpoint}/${entityId}`
        : `/api/uploads/${endpoint}`;
      const token = localStorage.getItem('medil_token');

      const res  = await fetch(`${BACKEND_URL}${path}`, {
        method:  'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al subir la foto');

      setFile(null);
      onUpload?.(data.url);
    } catch (e) {
      setSizeErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  const initials = label.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {preview
          ? <img src={preview} alt={label}
              className="h-24 w-24 rounded-full object-cover border-2 border-[#90E0EF]" />
          : <div className="h-24 w-24 rounded-full bg-[#CAF0F8] flex items-center justify-center">
              <span className="text-[#0096B4] font-bold text-2xl">{initials}</span>
            </div>
        }
      </div>

      {sizeErr && <p className="text-xs text-red-500">{sizeErr}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-[#00B4D8] hover:underline"
        disabled={loading || uploading}
      >
        Cambiar foto
      </button>

      {file && (
        <button
          type="button"
          onClick={handleSave}
          disabled={uploading || loading}
          className="px-3 py-1 text-xs font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Subiendo…' : 'Guardar foto'}
        </button>
      )}
    </div>
  );
}

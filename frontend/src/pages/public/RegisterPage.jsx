// Registro de nuevo paciente desde el portal público
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from './PublicLayout';
import { publicApi, uploadApi } from '../../services/backendService';
import { Logo } from '../../atoms/Logo';


const EMPTY = { name: '', phone: '', email: '', password: '', confirmPassword: '', branchId: '' };

export default function RegisterPage() {
  const navigate  = useNavigate();
  const inputRef  = useRef(null);

  const [form,       setForm]      = useState(EMPTY);
  const [errors,     setErrors]    = useState({});
  const [branches,   setBranches]  = useState([]);
  const [preview,    setPreview]   = useState(null);
  const [photoFile,  setPhotoFile] = useState(null);
  const [saving,     setSaving]    = useState(false);
  const [success,    setSuccess]   = useState(false);
  const [serverErr,  setServerErr] = useState('');

  useEffect(() => {
    publicApi.getBranches()
      .then(res => setBranches(res.branches ?? []))
      .catch(() => {});
  }, []);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, photo: 'La foto no puede superar los 5MB' }));
      return;
    }
    setErrors(e => ({ ...e, photo: undefined }));
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())            e.name            = 'El nombre es obligatorio';
    if (!form.phone.trim())           e.phone           = 'El teléfono es obligatorio';
    if (!form.email.trim())           e.email           = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.password)               e.password        = 'La contraseña es obligatoria';
    else if (form.password.length < 6) e.password       = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
    if (!form.branchId)               e.branchId        = 'Seleccioná una clínica';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setServerErr('');
    try {
      let photoUrl = null;

      if (photoFile) {
        const fd = new FormData();
        fd.append('photo', photoFile);
        const uploaded = await uploadApi.publicRegisterPhoto(fd);
        photoUrl = uploaded.url ?? null;
      }

      await publicApi.register({ ...form, photoUrl });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B4D8]';

  if (success) return (
    <PublicLayout>
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="text-5xl">✓</div>
        <h2 className="text-xl font-bold text-[#00B4D8]">¡Cuenta creada!</h2>
        <p className="text-gray-500">Redirigiendo al inicio de sesión…</p>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto">
        {/* Logo centrado */}
        <div className="flex justify-center mb-6">
          <Logo className="text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-center text-[#0E4A8A] mb-6">Crear cuenta de paciente</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">


          {/* Foto de perfil opcional */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div
              onClick={() => inputRef.current?.click()}
              className="h-20 w-20 rounded-full overflow-hidden cursor-pointer border-2 border-[#90E0EF] bg-[#CAF0F8] flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              {preview
                ? <img src={preview} alt="Foto" className="w-full h-full object-cover" />
                : <span className="text-[#0096B4] text-sm font-medium">Foto</span>
              }
            </div>
            <button type="button" onClick={() => inputRef.current?.click()}
              className="text-xs text-[#00B4D8] hover:underline">
              {preview ? 'Cambiar foto' : 'Agregar foto (opcional)'}
            </button>
            <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp"
              className="hidden" onChange={handlePhotoChange} />
            {errors.photo && <p className="text-xs text-red-500">{errors.photo}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input className={inputClass} value={form.name}
              onChange={e => set('name', e.target.value)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input type="tel" className={inputClass} value={form.phone}
              placeholder="+591 7xxxxxxx"
              onChange={e => set('phone', e.target.value)} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input type="email" className={inputClass} value={form.email}
              onChange={e => set('email', e.target.value)} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input type="password" className={inputClass} value={form.password}
              onChange={e => set('password', e.target.value)} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <input type="password" className={inputClass} value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)} />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Clínica */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Clínica <span className="text-red-500">*</span>
            </label>
            <select className={inputClass} value={form.branchId}
              onChange={e => set('branchId', e.target.value)}>
              <option value="">Seleccioná una clínica</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
              ))}
            </select>
            {errors.branchId && <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>}
          </div>

          {serverErr && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{serverErr}</p>
          )}

          <button type="submit" disabled={saving}
            className="w-full py-2.5 text-sm font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0096B4] disabled:opacity-50 transition-colors">
            {saving ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-[#00B4D8] hover:underline">Iniciá sesión</Link>
          </p>
        </form>
      </div>
    </PublicLayout>
  );
}

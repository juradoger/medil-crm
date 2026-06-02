// Servicio para llamar al servidor Express propio (no InsForge)
// Usar solo para: uploads Cloudinary, IA (Etapa 8), Twilio (Etapa 8), PagoFácil (Etapa 7)

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Reintenta una vez ante fallos de red (el backend gratuito puede estar "dormido"
// y el primer fetch falla por arranque en frío — el segundo ya responde).
async function fetchWithRetry(url, options, retries = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1200));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

async function callBackend(endpoint, options = {}) {
  const token = localStorage.getItem('medil_token');
  const response = await fetchWithRetry(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error del servidor');
  }
  return response.json();
}

// Rutas públicas del portal (sin auth)
export const publicApi = {
  getBranches:   ()   => callBackend('/api/public/branches'),
  getBranchById: (id) => callBackend(`/api/public/branches/${id}`),
  register:      (data) => callBackend('/api/public/register', {
    method: 'POST',
    body:   JSON.stringify(data),
  }),
};

// Operaciones de usuario autenticadas vía Express
export const userApi = {
  changePassword: (data) => callBackend('/api/users/change-password', {
    method: 'POST',
    body:   JSON.stringify(data),
  }),
};

// Uploads de fotos a Cloudinary vía Express
export const uploadApi = {
  branchPhoto: (id, formData) =>
    fetch(`${BACKEND_URL}/api/uploads/branch/${id}`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('medil_token')}` },
      body:    formData,
    }).then(r => r.json()),

  professionalPhoto: (id, formData) =>
    fetch(`${BACKEND_URL}/api/uploads/professional/${id}`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('medil_token')}` },
      body:    formData,
    }).then(r => r.json()),

  patientPhoto: (id, formData) =>
    fetch(`${BACKEND_URL}/api/uploads/patient/${id}`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('medil_token')}` },
      body:    formData,
    }).then(r => r.json()),

  publicRegisterPhoto: (formData) =>
    fetchWithRetry(`${BACKEND_URL}/api/uploads/public/register-photo`, {
      method: 'POST',
      body:   formData,
    }).then(r => r.json()),
};

import { Router } from 'express';
import { db } from '../infrastructure/insforge.js';
import { USER_ROLES, PATIENT_STATUS, BRANCH_STATUS } from '../core/constants.js';

const router = Router();

// GET /api/public/branches — lista de clínicas activas para el portal
router.get('/branches', async (req, res, next) => {
  try {
    const { data: branches, error } = await db.from('branches')
      .select('*')
      .eq('status', BRANCH_STATUS.ACTIVE);
    if (error) throw new Error(error.message);
    res.json({ branches: branches ?? [] });
  } catch (error) { next(error); }
});

// GET /api/public/branches/:id — detalle de una clínica con sus profesionales
router.get('/branches/:id', async (req, res, next) => {
  try {
    const { data: rows, error } = await db.from('branches')
      .select('*')
      .eq('id', req.params.id);
    if (error) throw new Error(error.message);

    if (!rows?.[0])
      return res.status(404).json({ error: 'Clínica no encontrada' });

    const branch = rows[0];

    // Solo los profesionales de ESTA sucursal (antes devolvía todos los del sistema)
    const { data: professionals, error: profErr } = await db.from('professionals')
      .select('*')
      .eq('isActive', true)
      .eq('branchId', req.params.id);
    if (profErr) throw new Error(profErr.message);

    res.json({ branch, professionals: professionals ?? [] });
  } catch (error) { next(error); }
});

// POST /api/public/register — registro de nuevo paciente desde el portal
router.post('/register', async (req, res, next) => {
  try {
    const { name, ci, phone, email, password, branchId, photoUrl } = req.body;

    if (!name || !ci || !phone || !email || !password || !branchId) {
      return res.status(400).json({
        error:   'Datos incompletos',
        message: 'Nombre, CI, teléfono, correo, contraseña y sucursal son obligatorios',
      });
    }

    // Verificar que el email no existe
    const { data: existing, error: checkErr } = await db.from('users')
      .select('*')
      .eq('email', email);
    if (checkErr) throw new Error(checkErr.message);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        error:   'Email ya registrado',
        message: 'Ya existe una cuenta con ese correo electrónico',
      });
    }

    const now = new Date().toISOString();

    // Crear user con rol patient (incluye la foto para que el avatar persista)
    const { data: userRows, error: userErr } = await db.from('users').insert({
      email,
      passwordHash: password,
      role:         USER_ROLES.PATIENT,
      branchId,
      isActive:     true,
      fullName:     name,
      photoUrl:     photoUrl ?? null,
      created_at:   now,
      updated_at:   now,
    }).select();
    if (userErr) throw new Error(userErr.message);

    const userId = userRows?.[0]?.id;

    // Crear patient vinculado al user (por email). Se guardan teléfono y foto
    // para que se muestren luego en el perfil y el portal del paciente.
    const { data: patientRows, error: patientErr } = await db.from('patients').insert({
      name,
      ci,
      phone,
      email,
      status:        PATIENT_STATUS.ACTIVE,
      photoUrl:      photoUrl ?? null,
      whatsappPhone: phone,
      createdAt:     now,
    }).select();
    if (patientErr) throw new Error(patientErr.message);

    const patientId = patientRows?.[0]?.id;

    res.status(201).json({
      message:   'Cuenta creada correctamente. Ya podés iniciar sesión.',
      userId,
      patientId,
    });
  } catch (error) { next(error); }
});

export default router;

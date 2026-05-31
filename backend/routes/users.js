import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/users/change-password
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error:   'Datos incompletos',
        message: 'Contraseña actual y nueva son requeridas',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error:   'Contraseña inválida',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const { db } = await import('../infrastructure/insforge.js');

    // Verificar contraseña actual
    const { data: user } = await db.from('users')
      .select('id, passwordHash')
      .eq('id', req.userId)
      .single();

    if (!user || user.passwordHash !== currentPassword) {
      return res.status(401).json({
        error:   'Contraseña incorrecta',
        message: 'La contraseña actual no es correcta',
      });
    }

    // Actualizar contraseña
    await db.from('users')
      .update({ passwordHash: newPassword, updatedAt: new Date().toISOString() })
      .eq('id', req.userId);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;

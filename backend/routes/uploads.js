import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  uploadBranchPhoto,
  uploadProfessionalPhoto,
  uploadPatientPhoto,
} from '../middleware/upload.js';

const router = Router();

// POST /api/uploads/branch/:id — hasta 3 fotos de una sucursal
router.post('/branch/:id',
  requireAuth,
  uploadBranchPhoto.array('photos', 3),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0)
        return res.status(400).json({ error: 'No se recibieron fotos' });
      const urls = req.files.map(f => f.path);
      res.json({ urls, message: 'Fotos subidas correctamente' });
    } catch (error) { next(error); }
  }
);

// POST /api/uploads/professional/:id — foto de perfil del profesional
router.post('/professional/:id',
  requireAuth,
  uploadProfessionalPhoto.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: 'No se recibió la foto' });
      res.json({ url: req.file.path, message: 'Foto subida correctamente' });
    } catch (error) { next(error); }
  }
);

// POST /api/uploads/patient/:id — foto de perfil del paciente
router.post('/patient/:id',
  requireAuth,
  uploadPatientPhoto.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: 'No se recibió la foto' });
      res.json({ url: req.file.path, message: 'Foto subida correctamente' });
    } catch (error) { next(error); }
  }
);

// POST /api/uploads/public/register-photo — sin auth, durante registro
router.post('/public/register-photo',
  uploadPatientPhoto.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: 'No se recibió la foto' });
      res.json({ url: req.file.path, message: 'Foto subida correctamente' });
    } catch (error) { next(error); }
  }
);

export default router;

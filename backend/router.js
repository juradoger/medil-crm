import { Router } from 'express';
import aiRoutes           from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes      from './routes/payments.js';
import uploadRoutes       from './routes/uploads.js';
import publicRoutes       from './routes/public.js';

const router = Router();

router.use('/ai',       aiRoutes);
router.use('/notify',   notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/uploads',  uploadRoutes);
router.use('/public',   publicRoutes);

router.get('/', (req, res) => {
  res.json({
    message:   'MedIL API v1.0',
    endpoints: {
      ai:            '/api/ai/*',
      notifications: '/api/notify/*',
      payments:      '/api/payments/*',
      uploads:       '/api/uploads/*',
      public:        '/api/public/*',
    },
  });
});

export default router;

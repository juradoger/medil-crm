// Middleware de autenticación
// Verifica que el request viene del frontend de MedIL
// En Etapa 8 se conectará con los tokens de InsForge

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error:   'No autorizado',
      message: 'Token de autenticación requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  // TODO Etapa 8: verificar el token con InsForge
  if (!token) {
    return res.status(401).json({
      error:   'No autorizado',
      message: 'Token inválido',
    });
  }

  // Por ahora el token es el userId directamente (hasta JWT en Etapa 8)
  req.userId = token;
  req.token  = token;
  next();
}

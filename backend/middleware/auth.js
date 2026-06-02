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

  // El token que envía el frontend es el payload en base64: { id, email, role, branchId }.
  // Hay que decodificarlo para obtener el id real del usuario (no el blob base64),
  // de lo contrario las consultas .eq('id', req.userId) nunca encuentran al usuario.
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    req.userId = payload.id ?? token;
    req.user   = payload;
  } catch {
    // Compatibilidad: si el token no es un base64 válido, usarlo tal cual
    req.userId = token;
  }
  req.token = token;
  next();
}

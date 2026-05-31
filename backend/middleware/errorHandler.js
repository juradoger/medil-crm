// Manejo global de errores
// Nunca exponer stack traces en producción

export function errorHandler(err, req, res, next) {
  console.error('Error en servidor:', err.message);

  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      error:   'Acceso denegado',
      message: 'Origen no permitido',
    });
  }

  const statusCode = err.statusCode || 500;
  const message    = process.env.NODE_ENV === 'production'
    ? 'Algo salió mal. Intentá de nuevo en unos segundos.'
    : err.message;

  res.status(statusCode).json({
    error: 'Error del servidor',
    message,
  });
}

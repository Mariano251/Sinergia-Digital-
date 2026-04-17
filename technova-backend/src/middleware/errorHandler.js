// Middleware centralizado de manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // Errores de validación de PostgreSQL (ej: unicidad de email)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }

  // Errores de clave foránea
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia inválida' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;

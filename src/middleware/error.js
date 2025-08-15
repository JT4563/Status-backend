function notFound(req, res, next) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Something went wrong';
  const details = err.details || undefined;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: { code, message, details } });
}

module.exports = { notFound, errorHandler };

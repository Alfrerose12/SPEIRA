const verificarRol = require('./rolValidator');

const swaggerAuth = (rolPermitido = 'admin') => {
  return (req, res, next) => {
    const publicRoutePrefixes = [
      '/api-docs',
      '/api-docs-json',
      '/favicon.ico'
    ];

    if (publicRoutePrefixes.some(prefix => req.path.startsWith(prefix))) {
      return next();
    }

    const isFromSwagger = req.headers.referer?.includes('/api-docs');

    if (isFromSwagger) {
      if (req.method !== 'GET') {
        return res.status(403).json({
          error: 'Acciones modificativas deshabilitadas desde Swagger UI',
          solution: 'Use herramientas como Postman para pruebas'
        });
      }
      return next();
    }

    return verificarRol(rolPermitido)(req, res, next);
  };
};

module.exports = swaggerAuth;

const jwt = require('jsonwebtoken');

const extractToken = (req) => {
  return req.cookies?.token || 
         req.headers?.authorization?.replace('Bearer ', '') || 
         req.query?.token;
};

const handleAuthError = (req, res, message, status = 401) => {
  if (req.accepts('html')) {
    return res.status(status).redirect('/login.html');
  }
  return res.status(status).json({ error: message });
};

const verificarRol = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      const token = extractToken(req);

      if (!token) {
        return handleAuthError(req, res, 'No autorizado - token requerido');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');

      if (!rolesPermitidos.includes(decoded.rol)) {
        return handleAuthError(req, res, 'Acceso denegado - rol insuficiente', 403);
      }

      req.usuario = decoded;
      next();
    } catch (error) {
      res.clearCookie('token');
      return handleAuthError(req, res, 'Token inválido o expirado');
    }
  };
};

module.exports = verificarRol;

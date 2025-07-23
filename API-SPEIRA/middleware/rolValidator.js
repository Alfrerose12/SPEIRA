const jwt = require('jsonwebtoken');

const verificarRol = (rolPermitido) => {
  return (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
      if (req.accepts('html')) {
        return res.redirect('/login.html');
      } else {
        return res.status(401).json({ error: 'No autorizado - token requerido' });
      }
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
      console.log(decoded);

      if (decoded.rol !== rolPermitido) {
        if (req.accepts('html')) {
          return res.status(403).redirect('/login.html');
        } else {
          return res.status(403).json({ error: 'Acceso denegado - rol insuficiente' });
        }
      }

      req.usuario = decoded;
      next();
    } catch {
      res.clearCookie('token');
      if (req.accepts('html')) {
        return res.redirect('/login.html');
      } else {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }
    }
  };
};

module.exports = verificarRol;

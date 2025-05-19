const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login.html');
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    next();
  } catch {
    res.clearCookie('token');
    res.redirect('/login.html');
  }
};
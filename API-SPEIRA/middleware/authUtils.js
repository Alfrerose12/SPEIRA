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

module.exports = {
  extractToken,
  handleAuthError
};
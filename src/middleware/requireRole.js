// middleware/requireRole.js
function requireRole(role) {
  return (req, res, next) => {
    const userRole = req.user?.app_metadata?.role;
    if (userRole !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireRole };
const { supabaseAdmin } = require('../config/supabaseClient');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization; // "Bearer <token>"
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed token' });
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user; // attach user to request
    next();
  } catch (err) {
    next(err); // Express 4 doesn't catch async errors by itself
  }
}

module.exports = { requireAuth };
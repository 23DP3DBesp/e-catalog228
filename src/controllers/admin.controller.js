const { matchedData } = require('express-validator');
const { supabaseAdmin } = require('../config/supabaseClient');

function formatAdminUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name ?? null,
    role: user.app_metadata?.role === 'admin' ? 'admin' : 'user',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

// GET /api/admin/users?page=&limit=  ->  { items, total, page, limit, totalPages }
async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20 } = matchedData(req, { locations: ['query'] });
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: limit });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const total = Number(data.total) || data.users.length;
    res.json({
      items: data.users.map(formatAdminUser),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err); // passes to errorHandler middleware
  }
}

module.exports = { listUsers };

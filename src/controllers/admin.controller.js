const { supabaseAdmin } = require('../config/supabaseClient');

async function listUsers(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ users: data.users });
  } catch (err) {
    next(err); // passes to errorHandler middleware
  }
}

module.exports = { listUsers };

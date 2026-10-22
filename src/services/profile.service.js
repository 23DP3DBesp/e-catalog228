const { supabaseAdmin } = require('../config/supabaseClient');

async function getProfileById(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { getProfileById };

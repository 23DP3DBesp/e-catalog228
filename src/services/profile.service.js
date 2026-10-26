const { supabaseAdmin } = require('../config/supabaseClient');

function dbError(error) {
  console.error('Database error:', error);
  const err = new Error('Database error');
  err.status = 500;
  return err;
}

// `user` is the logged-in auth user (set by requireAuth); `row` is the profiles table row, if any
function formatProfile(user, row) {
  return {
    id: user.id,
    email: user.email,
    displayName: row?.display_name ?? user.user_metadata?.display_name ?? null,
    role: user.app_metadata?.role === 'admin' ? 'admin' : 'user',
    createdAt: row?.created_at ?? user.created_at,
  };
}

async function getProfile(user) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('display_name, created_at')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw dbError(error);
  return formatProfile(user, data);
}

async function updateProfile(user, { displayName }) {
  // upsert: also creates the row if it is missing for some reason
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      { id: user.id, email: user.email, display_name: displayName, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
    .select('display_name, created_at')
    .single();
  if (error) throw dbError(error);

  // Keep the name stored with the login account in sync (login/register responses read it from there).
  // The profiles table is the source of truth, so a failure here is logged but doesn't fail the request.
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, display_name: displayName },
  });
  if (authError) console.error('Could not sync display name to auth user:', authError);

  return formatProfile(user, data);
}

module.exports = { getProfile, updateProfile };
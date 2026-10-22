const { createAnonClient, supabaseAdmin } = require('../config/supabaseClient');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name ?? null,
    createdAt: user.created_at,
  };
}

function formatSession(session) {
  if (!session) return null;
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    tokenType: session.token_type,
    expiresIn: session.expires_in,
    expiresAt: session.expires_at,
  };
}

async function register({ email, password, displayName }) {
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // marks the email as confirmed, so Supabase sends nothing
    user_metadata: { display_name: displayName },
  });

  if (error) {
    if (error.code === 'email_exists') throw httpError(409, 'Email is already registered');
    if (error.code === 'weak_password') throw httpError(422, error.message);
    throw httpError(error.status || 400, error.message);
  }

  // log the new user in so the response includes a session
  return login({ email, password });
}

async function login({ email, password }) {
  const { data, error } = await createAnonClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.code === 'email_not_confirmed') {
      throw httpError(403, 'Please confirm your email before logging in');
    }
    if (!error.status || error.status >= 500) throw httpError(502, 'Auth provider unavailable');
    // Same message for wrong email and wrong password, so accounts can't be probed
    throw httpError(401, 'Invalid email or password');
  }

  return {
    user: formatUser(data.user),
    session: formatSession(data.session),
  };
}

module.exports = { register, login };
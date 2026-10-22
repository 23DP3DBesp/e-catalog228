const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;

for (const [name, value] of Object.entries({
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
})) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
}

// Server-side: don't store sessions or refresh tokens in memory
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

// Admin client (service role, bypasses RLS).
// Use for admin tasks and token verification only. NEVER sign users in with it.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options);

// Signing in attaches the session to the client instance, so every
// register/login call gets its own throwaway client to avoid sessions leaking
// between requests.
function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
}

module.exports = { supabaseAdmin, createAnonClient };
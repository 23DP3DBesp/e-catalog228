import { computed, ref } from 'vue'

const STORAGE_KEY = 'e-catalog-auth-session'

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { user: null, session: null }

    const parsed = JSON.parse(stored)
    const expiresAt = Number(parsed.session?.expiresAt || 0)
    if (!parsed.user || !parsed.session?.accessToken || (expiresAt && expiresAt * 1000 <= Date.now())) {
      localStorage.removeItem(STORAGE_KEY)
      return { user: null, session: null }
    }

    return parsed
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { user: null, session: null }
  }
}

const initialAuth = typeof window !== 'undefined'
  ? readStoredAuth()
  : { user: null, session: null }

export const user = ref(initialAuth.user)
const session = ref(initialAuth.session)
const isAuthenticated = computed(() => Boolean(user.value && session.value?.accessToken))
export { isAuthenticated }

export function getAccessToken() {
  if (!session.value?.accessToken) return null

  const expiresAt = Number(session.value.expiresAt || 0)
  if (expiresAt && expiresAt * 1000 <= Date.now()) {
    clearAuth()
    return null
  }

  return session.value.accessToken
}

export function setAuth(authResult) {
  if (!authResult?.user || !authResult?.session?.accessToken) {
    throw new Error('Serveris neatgrieza derīgu lietotāja sesiju.')
  }

  const safeSession = {
    accessToken: authResult.session.accessToken,
    tokenType: authResult.session.tokenType,
    expiresIn: authResult.session.expiresIn,
    expiresAt: authResult.session.expiresAt,
  }

  user.value = authResult.user
  session.value = safeSession

  // Do not persist the Supabase refresh token in browser storage.
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    user: authResult.user,
    session: safeSession,
  }))
  window.dispatchEvent(new CustomEvent('ecatalog:auth-updated'))
}

export function clearAuth() {
  user.value = null
  session.value = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('ecatalog:auth-updated'))
  }
}

export function updateAuthUser(patch) {
  user.value = { ...user.value, ...patch }
  if (typeof window !== 'undefined' && session.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: user.value, session: session.value }))
    window.dispatchEvent(new CustomEvent('ecatalog:auth-updated'))
  }
}

export function useAuth() {
  return { user: computed(() => user.value), isAuthenticated }
}

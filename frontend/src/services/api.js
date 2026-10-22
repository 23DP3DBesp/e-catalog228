const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const isDemoMode = import.meta.env.VITE_API_MODE !== 'api'

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Neizdevās sasniegt serveri. Pārbaudi savienojumu un mēģini vēlreiz.')
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || 'Pieprasījumu neizdevās izpildīt. Mēģini vēlreiz.')
  }
  return payload
}

export function sendChatMessage(question) {
  return apiRequest('/api/chat', { method: 'POST', body: { question } })
}

export function signIn(credentials) {
  return apiRequest('/api/auth/login', { method: 'POST', body: credentials })
}

export function registerAccount(details) {
  return apiRequest('/api/auth/register', { method: 'POST', body: details })
}

export function signOut() {
  return apiRequest('/api/auth/logout', { method: 'POST' })
}

export function createOrder(order) {
  return apiRequest('/api/orders', { method: 'POST', body: order })
}

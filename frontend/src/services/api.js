import { getAccessToken, clearAuth } from './auth.js'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const isDemoMode = import.meta.env.VITE_API_MODE !== 'api'

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    const headers = {}
    if (body) headers['Content-Type'] = 'application/json'
    const accessToken = getAccessToken()
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`

    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: Object.keys(headers).length ? headers : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Neizdevās sasniegt serveri. Pārbaudi savienojumu un mēģini vēlreiz.')
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/register') {
      clearAuth()
    }
    // Validation errors list what is wrong in `details`; show those instead of just "Validation failed"
    const details = Array.isArray(payload.details) ? payload.details.map(item => item.message).filter(Boolean) : []
    throw new Error(details.length ? details.join('\n') : payload.error || 'Pieprasījumu neizdevās izpildīt. Mēģini vēlreiz.')
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
  // The current backend has no logout endpoint; clear the client-side bearer session.
  clearAuth()
  return Promise.resolve({ message: 'Pierakstīšanās pārtraukta.' })
}

export function createOrder(order) {
  return apiRequest('/api/orders', { method: 'POST', body: order })
}

export function getProfile() { return apiRequest('/api/profile') }
export function updateProfile(profile) { return apiRequest('/api/profile', { method: 'PATCH', body: profile }) }
export function getOrders() { return apiRequest('/api/orders') }
export function getOrder(id) { return apiRequest(`/api/orders/${encodeURIComponent(id)}`) }
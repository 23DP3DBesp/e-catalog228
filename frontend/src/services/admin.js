import { apiRequest } from './api.js'

// All of these need an admin account; the backend answers 403 for everyone else.

export function getAdminOrders({ status, page = 1, limit = 15 } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  return apiRequest(`/api/admin/orders?${params}`)
}

// The normal order endpoint lets admins read any order
export function getAdminOrder(id) {
  return apiRequest(`/api/orders/${encodeURIComponent(id)}`)
}

export function updateOrderStatus(id, status) {
  return apiRequest(`/api/admin/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } })
}

export function getAdminUsers({ page = 1, limit = 20 } = {}) {
  return apiRequest(`/api/admin/users?${new URLSearchParams({ page, limit })}`)
}

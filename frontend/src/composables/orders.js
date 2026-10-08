import { orders as seed } from '../data/orders'

const KEY = 'e-catalog-admin-orders'

export function loadOrders() {
	try {
		const stored = JSON.parse(localStorage.getItem(KEY) || 'null')
		if (Array.isArray(stored)) return stored
	} catch {
		/* ignore */
	}
	return seed.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) }))
}

export const itemsTotal = (o) => o.items.reduce((sum, i) => sum + i.qty * i.price, 0)
export const orderTotal = (o) => o.total ?? itemsTotal(o)
export const orderTitle = (o) => o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')
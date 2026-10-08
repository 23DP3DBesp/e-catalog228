import { computed, ref } from 'vue'
import { users as seed } from '../data/users'

const USERS_KEY = 'e-catalog-admin-users' 
const SESSION_KEY = 'e-catalog-session'
const RESET_KEY = 'e-catalog-reset'
const PROFILE_KEY = 'e-catalog-profile'
const DEMO_PASSWORD = 'Password123' 
const RESET_MINUTES = 30

function read(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
	} catch {
		return fallback
	}
}
function write(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch {
		/* ignore */
	}
}

async function hash(email, password) {
	const data = new TextEncoder().encode(`${email.toLowerCase()}:${password}`)
	const buffer = await crypto.subtle.digest('SHA-256', data)
	return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}


async function loadUsers() {
	const stored = read(USERS_KEY, null)
	const list = Array.isArray(stored) ? stored : seed.map((u) => ({ ...u }))
	let changed = !Array.isArray(stored)
	for (const u of list) {
		if (!u.passwordHash) {
			u.passwordHash = await hash(u.email, DEMO_PASSWORD)
			changed = true
		}
	}
	if (changed) write(USERS_KEY, list)
	return list
}


const sessionUser = ref(read(SESSION_KEY, null))
export const currentUser = computed(() => sessionUser.value)
export const isLoggedIn = computed(() => !!sessionUser.value)
export const isAdmin = computed(() => sessionUser.value?.role === 'admin')

function startSession(user) {
	const session = { id: user.id, name: user.name, email: user.email, role: user.role }
	sessionUser.value = session
	write(SESSION_KEY, session)


	const profile = read(PROFILE_KEY, null)
	if (!profile || profile.email?.toLowerCase() !== user.email.toLowerCase()) {
		write(PROFILE_KEY, { name: user.name, email: user.email, phone: '', tireSize: '' })
	}
}

export function logout() {
	sessionUser.value = null
	try {
		localStorage.removeItem(SESSION_KEY)
	} catch {
		/* ignore */
	}
}


export async function register({ name, email, password }) {
	email = email.trim().toLowerCase()
	if (password.length < 8) throw new Error('Password must be at least 8 characters.')

	const list = await loadUsers()
	if (list.some((u) => u.email.toLowerCase() === email)) {
		throw new Error('An account with this email already exists.')
	}

	const user = {
		id: list.reduce((max, u) => Math.max(max, u.id), 0) + 1,
		name: name.trim(),
		email,
		role: 'customer',
		status: 'active',
		joined: new Date().toISOString().slice(0, 10),
		passwordHash: await hash(email, password),
	}
	list.push(user)
	write(USERS_KEY, list)
	startSession(user)
	return user
}

export async function login(email, password) {
	email = email.trim().toLowerCase()
	const list = await loadUsers()
	const user = list.find((u) => u.email.toLowerCase() === email)

	
	if (!user || user.passwordHash !== (await hash(email, password))) {
		throw new Error('Incorrect email or password.')
	}
	if (user.status === 'blocked') throw new Error('This account has been blocked.')

	startSession(user)
	return user
}


export async function requestPasswordReset(email) {
	email = email.trim().toLowerCase()
	const list = await loadUsers()
	if (!list.some((u) => u.email.toLowerCase() === email)) return null

	const token = crypto.randomUUID()
	write(RESET_KEY, { token, email, expires: Date.now() + RESET_MINUTES * 60 * 1000 })
	return token
}

export async function resetPassword(token, newPassword) {
	if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.')

	const request = read(RESET_KEY, null)
	if (!request || request.token !== token || request.expires < Date.now()) {
		throw new Error('This reset link is invalid or has expired.')
	}

	const list = await loadUsers()
	const user = list.find((u) => u.email.toLowerCase() === request.email)
	if (!user) throw new Error('This reset link is invalid or has expired.')

	user.passwordHash = await hash(user.email, newPassword)
	write(USERS_KEY, list)
	try {
		localStorage.removeItem(RESET_KEY)
	} catch {
		/* ignore */
	}
}
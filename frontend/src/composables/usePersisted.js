import { ref, watch } from 'vue'

export function usePersisted(key, getFallback) {
	let initial
	try {
		const stored = JSON.parse(localStorage.getItem(key) || 'null')
		if (Array.isArray(stored)) initial = stored
	} catch {
		/* ignore */
	}
	const data = ref(initial ?? getFallback())

	watch(data, (value) => {
		try {
			localStorage.setItem(key, JSON.stringify(value))
		} catch {
			/* ignore */
		}
	}, { deep: true })

	return data
}
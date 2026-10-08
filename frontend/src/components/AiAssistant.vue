<template>
	<div class="ai-widget">
		<Transition name="pop">
			<section v-if="open" class="ai-panel" aria-label="AI assistant">
				<header class="ai-header">
					<div class="ai-title">
						<span class="ai-avatar" aria-hidden="true"></span>
						<div>
							<strong>Tire assistant</strong>
							<small>Online</small>
						</div>
					</div>
					<button type="button" aria-label="Close chat" @click="open = false">×</button>
				</header>

				<div ref="listEl" class="ai-messages">
					<p class="ai-msg bot">Hi! Tell me your tire size, season and budget, and I'll suggest a fit.</p>

					<div v-if="!messages.length" class="ai-chips">
						<button v-for="chip in chips" :key="chip" type="button" @click="send(chip)">{{ chip }}</button>
					</div>

					<p v-for="(m, i) in messages" :key="i" class="ai-msg" :class="m.role">{{ m.text }}</p>

					<p v-if="typing" class="ai-msg bot typing" aria-label="Assistant is typing">
						<span></span><span></span><span></span>
					</p>
				</div>

				<form class="ai-input" @submit.prevent="send(draft)">
					<input v-model="draft" type="text" placeholder="Ask about tires…" aria-label="Message" />
					<button type="submit" :disabled="!draft.trim() || typing" aria-label="Send">➤</button>
				</form>
			</section>
		</Transition>

		<button class="ai-bubble" type="button" :aria-label="open ? 'Close chat' : 'Open chat'" @click="open = !open">
			<svg v-if="!open" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
			</svg>
			<svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
				<path d="M6 9l6 6 6-6" />
			</svg>
		</button>
	</div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const open = ref(false)
const draft = ref('')
const typing = ref(false)
const messages = ref([])
const listEl = ref(null)

const chips = ['Best winter tire?', 'Under €110', 'All-season options']

function scrollDown() {
	nextTick(() => {
		if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
	})
}

function send(text) {
	text = text.trim()
	if (!text || typing.value) return

	messages.value.push({ role: 'user', text })
	draft.value = ''
	typing.value = true
	scrollDown()

	
	window.setTimeout(() => {
		messages.value.push({ role: 'bot', text: 'This is a demo reply. Once connected, I will recommend real products here.' })
		typing.value = false
		scrollDown()
	}, 1200)
}
</script>

<style scoped>
.ai-widget { position: fixed; right: 24px; bottom: 24px; z-index: 50; display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }

/* Bubble */
.ai-bubble { display: grid; width: 60px; height: 60px; place-items: center; border: 0; border-radius: 50%; background: #ef552c; color: #fff; cursor: pointer; box-shadow: 0 10px 30px rgb(239 85 44 / 40%); transition: transform .2s ease, background .2s ease; }
.ai-bubble:hover { transform: scale(1.08); background: #d94820; }

/* Panel */
.ai-panel { display: flex; flex-direction: column; width: 370px; max-width: calc(100vw - 48px); height: 520px; max-height: calc(100vh - 120px); border-radius: 28px; background: #fff; box-shadow: 0 18px 55px rgb(0 0 0 / 28%); overflow: hidden; transform-origin: bottom right; }

/* Expand / collapse animation */
.pop-enter-active, .pop-leave-active { transition: transform .28s cubic-bezier(.2, .9, .3, 1.2), opacity .2s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(.4) translateY(30px); }

.ai-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #161b20; color: #fff; }
.ai-title { display: flex; align-items: center; gap: 12px; }
.ai-title strong { display: block; font-size: 15px; }
.ai-title small { color: #7ddc9a; font-size: 12px; }
.ai-avatar { width: 34px; height: 34px; border: 3px solid transparent; border-radius: 50%; background: linear-gradient(#161b20, #161b20) padding-box, conic-gradient(#ff4b13, #ffd400, #00a9e8, #a13bdb, #ff4b13) border-box; }
.ai-header > button { border: 0; background: transparent; color: #fff; font-size: 26px; line-height: 1; cursor: pointer; }

.ai-messages { flex: 1; display: flex; flex-direction: column; gap: 10px; padding: 18px 16px; overflow-y: auto; }
.ai-msg { max-width: 85%; margin: 0; padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.45; }
.ai-msg.bot { align-self: flex-start; border-bottom-left-radius: 6px; background: #f2f1ef; color: #19232b; }
.ai-msg.user { align-self: flex-end; border-bottom-right-radius: 6px; background: #161b20; color: #fff; }

.ai-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.ai-chips button { padding: 8px 14px; border: 1px solid #dedede; border-radius: 18px; background: #fff; color: #19232b; font-size: 13px; cursor: pointer; transition: border-color .2s ease, color .2s ease; }
.ai-chips button:hover { border-color: #ef552c; color: #ef552c; }

/* Typing dots */
.typing { display: flex; gap: 5px; padding: 14px 16px; }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: #9aa0a4; animation: bounce 1.2s infinite ease-in-out; }
.typing span:nth-child(2) { animation-delay: .15s; }
.typing span:nth-child(3) { animation-delay: .3s; }
@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-5px); opacity: 1; } }

.ai-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #ededed; }
.ai-input input { flex: 1; padding: 11px 16px; border: 1px solid #dedede; border-radius: 22px; outline: 0; font-size: 14px; }
.ai-input input:focus { border-color: #19232b; }
.ai-input button { width: 42px; border: 0; border-radius: 50%; background: #ef552c; color: #fff; cursor: pointer; }
.ai-input button:disabled { opacity: .4; cursor: not-allowed; }

@media (max-width: 520px) {
	.ai-widget { right: 16px; bottom: 16px; }
	.ai-panel { width: calc(100vw - 32px); }
}
</style>
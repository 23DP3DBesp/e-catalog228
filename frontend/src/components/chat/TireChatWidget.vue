<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { MessageCircle, Send, X } from '@lucide/vue'
import { isDemoMode, sendChatMessage } from '../../services/api.js'

const isOpen = ref(false)
const question = ref('')
const sending = ref(false)
const error = ref('')
const messages = ref([])
const launcher = ref(null)
const input = ref(null)
const messageList = ref(null)

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) nextTick(() => input.value?.focus())
  else nextTick(() => launcher.value?.focus())
}

function closeOnEscape(event) {
  if (event.key === 'Escape' && isOpen.value) toggleChat()
}

async function sendQuestion() {
  const text = question.value.trim()
  if (!text || sending.value) return

  messages.value.push({ id: Date.now(), from: 'user', text })
  question.value = ''
  error.value = ''
  sending.value = true
  nextTick(() => {
    if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
  })

  try {
    if (isDemoMode) {
      messages.value.push({ id: Date.now() + 1, from: 'assistant', text: 'Čats darbojas demonstrācijas režīmā. Atbildes būs pieejamas pēc API pieslēgšanas.' })
      return
    }
    const result = await sendChatMessage(text)
    if (typeof result.answer !== 'string' || !result.answer.trim()) throw new Error('Serveris neatgrieza atbildi.')
    messages.value.push({ id: Date.now() + 1, from: 'assistant', text: result.answer })
  } catch (cause) {
    error.value = cause.message || 'Neizdevās nosūtīt jautājumu.'
    question.value = text
  } finally {
    sending.value = false
    await nextTick()
    if (messageList.value) messageList.value.scrollTop = messageList.value.scrollHeight
    input.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <section v-if="isOpen" class="tire-chat" role="dialog" aria-modal="false" aria-labelledby="tire-chat-title">
    <header class="tire-chat__header">
      <div>
        <h2 id="tire-chat-title">Jautājumi par riepām</h2>
        <p>Uzdod savu jautājumu</p>
      </div>
      <button class="tire-chat__close" type="button" aria-label="Aizvērt čatu" @click="toggleChat">
        <X :size="20" />
      </button>
    </header>

    <div ref="messageList" class="tire-chat__messages" aria-live="polite">
      <p v-if="messages.length === 0" class="tire-chat__note">
        Šeit vari jautāt par riepu izmēriem un izvēli. Atbildes būs pieejamas pēc API pieslēgšanas.
      </p>
      <div v-for="message in messages" :key="message.id" class="tire-chat__message" :class="`tire-chat__message--${message.from}`">
        {{ message.text }}
      </div>
      <p v-if="sending" class="tire-chat__note" role="status">Meklēju atbildi…</p>
      <p v-if="error" class="tire-chat__error" role="alert">{{ error }}</p>
    </div>

    <form class="tire-chat__form" @submit.prevent="sendQuestion">
      <label class="visually-hidden" for="tire-chat-input">Tavs jautājums</label>
      <input
        id="tire-chat-input"
        ref="input"
        v-model="question"
        type="text"
        maxlength="500"
        placeholder="Raksti jautājumu..."
        autocomplete="off"
      />
      <button type="submit" aria-label="Nosūtīt jautājumu" :disabled="!question.trim() || sending">
        <Send v-if="!sending" :size="18" />
        <span v-else aria-hidden="true">…</span>
      </button>
    </form>
  </section>

  <button
    ref="launcher"
    class="tire-chat__launcher"
    type="button"
    :aria-expanded="isOpen"
    aria-controls="tire-chat-title"
    :aria-label="isOpen ? 'Aizvērt čatu' : 'Atvērt čatu par riepām'"
    @click="toggleChat"
  >
    <X v-if="isOpen" :size="22" />
    <MessageCircle v-else :size="24" />
  </button>
</template>

<style scoped>
.tire-chat__launcher {
  position: fixed;
  z-index: 40;
  right: 24px;
  bottom: 24px;
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  padding: 0;
  color: #fff;
  background: var(--color-accent-hover);
  border: 0;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgb(0 0 0 / 18%);
}
.tire-chat__launcher:hover { background: #a92121; }
.tire-chat {
  position: fixed;
  z-index: 40;
  right: 24px;
  bottom: 92px;
  display: flex;
  width: min(360px, calc(100vw - 32px));
  height: min(460px, calc(100dvh - 120px));
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgb(0 0 0 / 16%);
}
.tire-chat__header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px; border-bottom: 1px solid var(--color-border); }
.tire-chat__header h2 { margin: 0; font-size: 16px; font-weight: 600; }
.tire-chat__header p { margin: 4px 0 0; color: var(--color-secondary); font-size: 13px; }
.tire-chat__close { display: grid; width: 36px; height: 36px; place-items: center; padding: 0; color: var(--color-text); background: transparent; border: 0; border-radius: 8px; }
.tire-chat__close:hover { background: var(--color-surface); }
.tire-chat__messages { display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 10px; overflow-y: auto; padding: 16px; }
.tire-chat__note { max-width: 280px; margin: 0; padding: 12px; color: #52525b; background: var(--color-surface); border-radius: 10px; font-size: 14px; }
.tire-chat__message { max-width: 85%; padding: 10px 12px; border-radius: 12px; font-size: 14px; line-height: 1.45; }
.tire-chat__message--user { align-self: flex-end; color: #fff; background: var(--color-accent-hover); border-bottom-right-radius: 4px; }
.tire-chat__message--assistant { background: var(--color-surface); border-bottom-left-radius: 4px; }
.tire-chat__error { margin: 0; color: #b42318; font-size: 13px; }
.tire-chat__form { display: flex; align-items: center; gap: 8px; padding: 12px; border-top: 1px solid var(--color-border); }
.tire-chat__form input { width: 0; min-width: 0; min-height: 44px; flex: 1; padding: 10px 12px; font-size: 14px; }
.tire-chat__form button { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; padding: 0; color: #fff; background: var(--color-accent-hover); border: 0; border-radius: 10px; }
.tire-chat__form button:disabled { opacity: .45; }
@media (max-width: 600px) {
  .tire-chat__launcher { right: 16px; bottom: 16px; width: 52px; height: 52px; }
  .tire-chat { right: 16px; bottom: 80px; width: calc(100vw - 32px); height: min(460px, calc(100dvh - 100px)); }
}
</style>

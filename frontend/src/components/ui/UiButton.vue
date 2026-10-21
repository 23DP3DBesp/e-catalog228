<script setup>
import { LoaderCircle } from '@lucide/vue'
defineProps({ variant: { type: String, default: 'primary' }, loading: Boolean, disabled: Boolean, type: { type: String, default: 'button' } })
</script>
<template>
  <button :type="type" class="ui-button" :class="`ui-button--${variant}`" :disabled="disabled || loading" :aria-busy="loading || undefined"><LoaderCircle v-if="loading" class="spinner" :size="18" aria-hidden="true" /><slot /></button>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { AlertTriangle, RotateCcw } from 'lucide-vue-next'

const errorMessage = ref<string | null>(null)

onErrorCaptured((error) => {
  errorMessage.value = error instanceof Error ? error.message : 'Unexpected application error'
  return false
})

const retry = () => {
  window.location.reload()
}
</script>

<template>
  <slot v-if="!errorMessage" />
  <main v-else class="error-boundary" role="alert">
    <div class="error-boundary__icon"><AlertTriangle :size="28" /></div>
    <h1>Something went wrong</h1>
    <p>The page could not be displayed. Reload the page to try again.</p>
    <button type="button" @click="retry">
      <RotateCcw :size="15" />
      Reload page
    </button>
  </main>
</template>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--text-primary);
  text-align: center;
}
.error-boundary__icon { color: #ef4444; }
.error-boundary h1 { margin: 0; font-size: 1.5rem; }
.error-boundary p { max-width: 360px; margin: 0; color: var(--text-muted); font-size: 0.85rem; }
.error-boundary button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.55rem 0.8rem;
  background: var(--secondary-color);
  color: var(--text-secondary);
  cursor: pointer;
}
.error-boundary button:hover { color: var(--text-primary); border-color: var(--border-light); }
</style>

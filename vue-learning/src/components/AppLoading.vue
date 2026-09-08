<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
</script>

<template>
  <main class="app-loading" role="status" aria-live="polite">
    <Loader2 :size="32" class="app-loading__icon" />
    <p>Loading page...</p>
  </main>
</template>

<style scoped>
.app-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-muted);
}
.app-loading__icon { color: var(--primary-color); animation: spin 1s linear infinite; }
.app-loading p { margin: 0; font-size: 0.85rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

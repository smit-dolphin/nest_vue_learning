<script setup lang="ts">
import { FileQuestion, ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="not-found" role="main">
    <FileQuestion :size="48" class="not-found__icon" />
    <p class="not-found__code">404</p>
    <h1>Page not found</h1>
    <p class="not-found__message">The page you requested does not exist or has moved.</p>
    <button type="button" @click="router.push('/')">
      <ArrowLeft :size="15" />
      Back to home
    </button>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  padding: 2rem;
  color: var(--text-primary);
  text-align: center;
}
.not-found__icon { color: var(--primary-color); }
.not-found__code { margin: 0; color: var(--primary-color); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.15em; }
.not-found h1 { margin: 0; font-size: 1.6rem; }
.not-found__message { margin: 0 0 0.75rem; color: var(--text-muted); font-size: 0.85rem; }
.not-found button {
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
.not-found button:hover { color: var(--text-primary); border-color: var(--border-light); }
</style>

<script setup lang="ts">
import { FileVideo, Upload } from 'lucide-vue-next'

defineProps<{
  total: number
  subtitled: number
}>()

const emit = defineEmits<{
  (e: 'upload'): void
}>()
</script>

<template>
  <div class="page-header">
    <div class="page-header__left">
      <div class="page-header__icon"><FileVideo :size="22" /></div>
      <div>
        <h2 class="page-header__title">Video Library</h2>
        <p class="page-header__sub">{{ total }} videos · {{ subtitled }} subtitled</p>
      </div>
    </div>
    <button class="btn btn--primary" @click="emit('upload')">
      <Upload :size="15" /> Upload Video
    </button>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-header__left { display: flex; align-items: center; gap: 1rem; }
.page-header__icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 20px rgba(6,182,212,0.3); flex-shrink: 0;
}
.page-header__title { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin: 0 0 2px; }
.page-header__sub { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }

.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 0.55rem 1.1rem; border: none; text-decoration: none; }
.btn--primary { background: var(--team-gradient); color: #fff; box-shadow: 0 4px 12px rgba(139,92,246,0.4); }
.btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(139,92,246,0.5); }
</style>

<script setup lang="ts">
import { Languages, Check } from 'lucide-vue-next'

const features = ['98% accuracy', '50+ languages', 'Word-level timing', 'Instant export']
</script>

<template>
  <div class="empty-panel">
    <div class="empty-panel__icon">
      <Languages :size="32" />
    </div>
    <p class="empty-panel__title">Your subtitles will appear here</p>
    <p class="empty-panel__hint">Upload a file and click Generate to start</p>
    <div class="empty-panel__features">
      <div v-for="feat in features" :key="feat" class="empty-panel__feat">
        <Check :size="12" />
        <span>{{ feat }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-panel {
  background: var(--secondary-color);
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  min-height: 400px;
  justify-content: center;
}

.empty-panel__icon {
  width: 72px;
  height: 72px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.empty-panel__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.empty-panel__hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.empty-panel__features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.empty-panel__feat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
}

.empty-panel__feat svg {
  color: var(--success-color);
}
</style>

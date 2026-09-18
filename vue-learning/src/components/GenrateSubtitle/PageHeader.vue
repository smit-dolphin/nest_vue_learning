<script setup lang="ts">
import { Captions, Sparkles } from 'lucide-vue-next'
</script>

<template>
  <div class="gen-page__header">
    <div class="gen-page__header-left">
      <div class="gen-page__icon-wrap">
        <Captions :size="22" />
      </div>
      <div>
        <h2 class="gen-page__title">Generate Subtitles</h2>
        <p class="gen-page__sub">
          Upload your video and let AI transcribe and generate subtitles automatically
        </p>
      </div>
    </div>
    <div class="gen-page__header-right">
      <div class="gen-page__model-badge">
        <Sparkles :size="13" />
        <span>Whisper v3 Turbo</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gen-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.gen-page__header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.gen-page__icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--team-gradient);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-glow);
  flex-shrink: 0;
}

.gen-page__title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.gen-page__sub {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
}

.gen-page__model-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--card-color);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a78bfa;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .gen-page__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
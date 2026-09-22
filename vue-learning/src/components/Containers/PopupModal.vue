<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    closeOnBackdrop?: boolean
  }>(),
  {
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const close = () => emit('update:modelValue', false)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="modelValue"
        class="popup-modal"
        role="presentation"
        @click.self="closeOnBackdrop && close()"
      >
        <section
          class="popup-modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header class="popup-modal__header">
            <h2 class="popup-modal__title">{{ title }}</h2>
            <button class="popup-modal__close" type="button" aria-label="Close" @click="close">
              <X :size="18" />
            </button>
          </header>

          <div class="popup-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="popup-modal__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(8, 10, 20, 0.64);
  backdrop-filter: blur(3px);
}

.popup-modal__panel {
  width: min(100%, 420px);
  overflow: hidden;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.popup-modal__header,
.popup-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.15rem;
}

.popup-modal__header { border-bottom: 1px solid var(--border-color); }
.popup-modal__title { margin: 0; color: var(--text-primary); font-size: 1rem; font-weight: 700; }
.popup-modal__close { display: grid; place-items: center; padding: 0.25rem; color: var(--text-muted); background: none; border: 0; cursor: pointer; }
.popup-modal__close:hover { color: var(--text-primary); }
.popup-modal__body { padding: 1.15rem; color: var(--text-secondary); }
.popup-modal__footer { justify-content: flex-end; gap: 0.65rem; border-top: 1px solid var(--border-color); }

.popup-enter-active,
.popup-leave-active { transition: opacity 0.18s ease; }
.popup-enter-active .popup-modal__panel,
.popup-leave-active .popup-modal__panel { transition: transform 0.18s ease; }
.popup-enter-from,
.popup-leave-to { opacity: 0; }
.popup-enter-from .popup-modal__panel,
.popup-leave-to .popup-modal__panel { transform: translateY(10px) scale(0.98); }

@media (max-width: 520px) {
  .popup-modal {
    padding: 0;
    align-items: flex-end;
  }

  .popup-modal__panel {
    width: 100%;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    border-radius: 16px 16px 0 0;
  }

  .popup-modal__body {
    overflow-y: auto;
    min-height: 0;
  }

  .popup-modal__footer {
    flex-wrap: wrap;
  }
}
</style>
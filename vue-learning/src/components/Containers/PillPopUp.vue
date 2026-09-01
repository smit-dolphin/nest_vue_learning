<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)
const popup = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleOutsideClick(event: MouseEvent) {
  if (
    popup.value &&
    !popup.value.contains(event.target as Node)
  ) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div
    ref="popup"
    class="pill-popup"
  >

    <!-- Button / Trigger -->
    <div
      class="pill-popup__trigger"
      @click.stop="toggle"
    >
      <slot name="trigger" />
    </div>

    <!-- Collapsible Popup -->
    <Transition name="popup">

      <div
        v-if="isOpen"
        class="pill-popup__content"
      >
        <slot name="popup" />
      </div>

    </Transition>

  </div>
</template>

<style scoped>

.pill-popup {
  position: relative;
  display: inline-block;
}

.pill-popup__trigger {
  cursor: pointer;
}

.pill-popup__content {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;

  min-width: 180px;

  background: var(--card-color);
  border: 1px solid var(--border-light);
  border-radius: 10px;

  box-shadow: var(--shadow-md);

  z-index: 100;
  overflow: hidden;
}

/* Animation */

.popup-enter-active,
.popup-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

</style>
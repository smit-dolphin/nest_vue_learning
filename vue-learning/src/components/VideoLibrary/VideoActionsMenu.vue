<script setup lang="ts">
import { MoreHorizontal, Eye, Files } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  videoId: string
}>()

const isOpen = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

const menuPosition = computed(() => menuStyle.value)

const updateMenuPosition = () => {
  const element = trigger.value
  if (!element) return

  const rect = element.getBoundingClientRect()
  const menuWidth = 160
  const menuHeight = 82
  const edgePadding = 8
  const horizontalOffset = 150
  const opensUp = rect.bottom + menuHeight > window.innerHeight - edgePadding
  const left = Math.min(
    Math.max(rect.right - menuWidth + horizontalOffset, edgePadding),
    window.innerWidth - menuWidth - edgePadding,
  )

  menuStyle.value = opensUp
    ? {
        left: `${left}px`,
        bottom: `${window.innerHeight - rect.top + 6}px`,
      }
    : {
        left: `${left}px`,
        top: `${rect.bottom + 6}px`,
      }
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) updateMenuPosition()
}

const closeMenu = () => {
  isOpen.value = false
}

const onDocumentClick = () => closeMenu()
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

window.addEventListener('resize', updateMenuPosition)
window.addEventListener('scroll', updateMenuPosition, true)
window.addEventListener('click', onDocumentClick)
window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
  window.removeEventListener('click', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="actions-menu">
    <button
      ref="trigger"
      class="action-btn"
      type="button"
      title="More actions"
      aria-label="More actions"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click.stop="toggleMenu"
    >
      <MoreHorizontal :size="14" />
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="actions-menu__popover" :style="menuPosition" role="menu" @click.stop>
      <RouterLink
        class="actions-menu__item"
        :to="`/library/subtitles/${props.videoId}`"
        role="menuitem"
        @click="closeMenu"
      >
        <Eye :size="14" />
        See details
      </RouterLink>
      <RouterLink
        class="actions-menu__item"
        :to="`/library/subtitles/${props.videoId}`"
        role="menuitem"
        @click="closeMenu"
      >
        <Files :size="14" />
        View files
      </RouterLink>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.actions-menu__popover {
  position: fixed;
  z-index: 2000;
  min-width: 150px;
  padding: 4px;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
.actions-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  color: var(--text-secondary);
  border-radius: 5px;
  font-size: 0.78rem;
  text-decoration: none;
  white-space: nowrap;
}
.actions-menu__item:hover { color: var(--text-primary); background: var(--hover-color); }
</style>

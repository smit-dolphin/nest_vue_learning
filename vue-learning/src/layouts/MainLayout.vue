<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/mainLayout/AppSidebar.vue'
import AppNavbar from '@/components/mainLayout/AppNavbar.vue'
import ProtectedLayer from './ProtectedLayer.vue'
import { RouterView } from 'vue-router'

const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(false)

const route = useRoute()

let mediaQuery: MediaQueryList | null = null

function handleMediaChange(event: MediaQueryListEvent) {
  isMobile.value = event.matches
  if (!event.matches) mobileOpen.value = false
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 900px)')
  isMobile.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleMediaChange)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleMediaChange)
  window.removeEventListener('keydown', handleKeydown)
  unlockScroll()
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') mobileOpen.value = false
}

watch(mobileOpen, (open) => {
  if (open) lockScroll()
  else unlockScroll()
})

watch(
  () => route.path,
  () => {
    mobileOpen.value = false
  },
)

function lockScroll() {
  document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  document.body.style.overflow = ''
}
</script>

<template>
  <ProtectedLayer>
    <div
      class="layout"
      :class="{
        'layout--collapsed': sidebarCollapsed,
      }"
    >
      <AppSidebar
        v-model:collapsed="sidebarCollapsed"
        :mobile-open="mobileOpen"
        @close-mobile="mobileOpen = false"
      />
      <AppNavbar
        :collapsed="sidebarCollapsed"
        @toggle-mobile="mobileOpen = !mobileOpen"
      />

      <Teleport to="body">
        <Transition name="overlay">
          <div
            v-if="mobileOpen"
            class="layout__overlay"
            @click="mobileOpen = false"
          ></div>
        </Transition>
      </Teleport>

      <main class="layout__main" :class="{ 'layout__main--mobile-open': mobileOpen }">
        <RouterView
          v-slot="{ Component }"
        >
          <Transition
            name="page"
            mode="out-in"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </ProtectedLayer>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--tertiary-color);
}
.layout__main {
  min-height: 100vh;
  padding-top: 64px;
  margin-left: 240px;
  transition:
    margin-left 0.3s
    cubic-bezier(0.4, 0, 0.2, 1);
}
.layout--collapsed .layout__main {
  margin-left: 68px;
}
.layout__overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(8, 10, 18, 0.6);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .layout__main,
  .layout--collapsed .layout__main {
    margin-left: 0;
  }
  .layout__main {
    padding-top: 60px;
  }
}
</style>
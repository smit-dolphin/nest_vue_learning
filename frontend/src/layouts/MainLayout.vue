<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ProtectedRoutes from '@/components/ProtectedRoutes.vue'

const collapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(false)
const route = useRoute()

let mediaQuery: MediaQueryList | null = null

const handleMediaChange = (event: MediaQueryListEvent) => {
  isMobile.value = event.matches
  if (!event.matches) mobileOpen.value = false
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') mobileOpen.value = false
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 1023px)')
  isMobile.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleMediaChange)
  window.addEventListener('keydown', onKeydown)
  document.body.style.overflow = mobileOpen.value ? 'hidden' : ''
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleMediaChange)
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

watch(mobileOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(
  () => route.path,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <ProtectedRoutes>
    <div class="min-h-screen bg-background">
      <AppSidebar
        v-model:collapsed="collapsed"
        :mobile-open="mobileOpen"
        @close-mobile="mobileOpen = false"
      />

      <Teleport to="body">
        <Transition name="overlay">
          <div
            v-if="mobileOpen"
            class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            @click="mobileOpen = false"
          />
        </Transition>
      </Teleport>

      <div
        class="flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out max-lg:pl-0"
        :class="collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'"
      >
        <AppNavbar @toggle-mobile="mobileOpen = !mobileOpen" />

        <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in" appear>
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
      </div>
    </div>
  </ProtectedRoutes>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
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
</style>
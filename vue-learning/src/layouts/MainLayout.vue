<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/mainLayout/AppSidebar.vue'
import AppNavbar from '@/components/mainLayout/AppNavbar.vue'
import ProtectedLayer from './ProtectedLayer.vue'
import { RouterView } from 'vue-router'

const sidebarCollapsed = ref(false)
</script>

<template>
  <ProtectedLayer>
    <div
      class="layout"
      :class="{
        'layout--collapsed': sidebarCollapsed
      }"
    >
      <AppSidebar
        v-model:collapsed="sidebarCollapsed"
      />
      <AppNavbar :collapsed="sidebarCollapsed" />
      <main class="layout__main">
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
</style>
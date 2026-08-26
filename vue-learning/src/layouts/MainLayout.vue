<script setup lang="ts">
import AppSidebar from '@/components/mainLayout/AppSidebar.vue'
import AppNavbar from '@/components/mainLayout/AppNavbar.vue'
import { RouterView } from 'vue-router'
import ProtectedLayer from "./ProtectedLayer.vue"

</script>

<template>
  <div class="layout">
   <ProtectedLayer>
    <AppSidebar />
    <AppNavbar />
    <main class="layout__main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    </ProtectedLayer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--tertiary-color);
}

.layout__main {
  padding-top: 64px;
  padding-left: 240px;
  min-height: 100vh;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
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

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import AppErrorBoundary from './components/AppErrorBoundary.vue'
import AppLoading from './components/AppLoading.vue'
</script>

<template>
  <AppErrorBoundary>
    <Suspense timeout="0">
      <template #default>
        <RouterView />
      </template>
      <template #fallback>
        <AppLoading />
      </template>
    </Suspense>
  </AppErrorBoundary>
  <Toaster position="top-right" rich-colors />
</template>

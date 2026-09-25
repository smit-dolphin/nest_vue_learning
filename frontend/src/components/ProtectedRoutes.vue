<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const checking = ref(true)

onMounted(() => {
  if (!authStore.accessToken) {
    authStore.clearAuth()
    router.replace('/login')
    return
  }
  checking.value = false
})
</script>

<template>
  <div v-if="checking" class="grid min-h-screen place-items-center bg-background">
    <div class="flex flex-col items-center gap-3">
      <span class="brand-gradient size-10 animate-pulse rounded-xl" />
      <p class="text-sm text-muted-foreground">Loading…</p>
    </div>
  </div>
  <slot v-else />
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { RouterView } from 'vue-router'

import { getMyProfile } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.applyTheme()

  if (!authStore.accessToken) return

  Promise.all([getMyProfile(), settingsStore.fetchSettings()])
    .then(([profile]) => {
      if (authStore.isAuthenticated) {
        authStore.setUser(profile)
      }
    })
    .catch(() => {
      // 401 / refresh failures are handled by the Axios interceptor.
    })
})
</script>

<template>
  <Toaster position="top-right" rich-colors />
  <RouterView />
</template>
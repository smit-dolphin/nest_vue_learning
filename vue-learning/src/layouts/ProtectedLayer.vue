<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => { 
  const userisAuthenticated = authStore.isAuthenticated 
  const token = authStore.accessToken

  if (!userisAuthenticated || !token){
    authStore.clearAuth()
    router.push('/login')
  }
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  const accessToken = authStore.accessToken

  if (!accessToken) {
    router.push('/login')
  }
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
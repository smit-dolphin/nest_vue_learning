<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exchangeGoogleCode, getMyProfile } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code

  if (typeof code !== 'string' || !code) {
    errorMessage.value = 'Google sign-in did not return a valid code.'
    return
  }

  try {
    const result = await exchangeGoogleCode(code)
    authStore.setAccessToken(result.accessToken)
    const profile = await getMyProfile()
    authStore.setUser(profile)
    await router.replace('/')
  } catch {
    authStore.clearAuth()
    errorMessage.value = 'Google sign-in could not be completed.'
  }
})
</script>

<template>
  <main class="google-callback">
    <div v-if="!errorMessage" class="google-callback__status">
      Completing Google sign-in...
    </div>
    <div v-else class="google-callback__error">
      <p>{{ errorMessage }}</p>
      <button type="button" @click="router.replace('/login')">Back to login</button>
    </div>
  </main>
</template>

<style scoped>
.google-callback {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  color: var(--text-primary);
  background: var(--tertiary-color);
}

.google-callback__status,
.google-callback__error {
  text-align: center;
}

.google-callback__error p {
  margin: 0 0 1rem;
}

.google-callback__error button {
  padding: 0.65rem 1rem;
  color: white;
  background: var(--team-gradient);
  border: 0;
  border-radius: 10px;
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { CheckCircle2, Loader2, Sparkles, XCircle } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { exchangeGoogleCode, getMyProfile } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useSettingsStore } from '@/stores/settingsStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const notificationStore = useNotificationStore()

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

    const [profile] = await Promise.all([
      getMyProfile(),
      settingsStore.fetchSettings(),
      notificationStore.refreshUnread(),
    ])

    authStore.setUser(profile)
    settingsStore.applyTheme()
    router.replace('/')
  } catch {
    authStore.clearAuth()
    errorMessage.value = 'Google sign-in could not be completed.'
  }
})
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <!-- Form panel -->
    <div class="flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md text-center">
        <div class="mb-8 flex items-center justify-center gap-3">
          <span class="brand-gradient grid size-10 place-items-center rounded-xl text-white">
            <Sparkles class="size-5" />
          </span>
          <span class="text-lg font-bold">Vue<span class="text-primary">Subs</span></span>
        </div>

        <div v-if="!errorMessage" class="flex flex-col items-center gap-4">
          <span class="grid size-14 place-items-center rounded-2xl bg-muted text-primary">
            <Loader2 class="size-7 animate-spin" />
          </span>
          <h1 class="text-xl font-bold tracking-tight">Completing Google sign-in...</h1>
          <p class="text-sm text-muted-foreground">We're exchanging your credentials and setting things up.</p>
        </div>

        <div v-else class="flex flex-col items-center gap-4">
          <span class="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <XCircle class="size-7" />
          </span>
          <h1 class="text-xl font-bold tracking-tight">Sign-in failed</h1>
          <p class="text-sm text-muted-foreground">{{ errorMessage }}</p>
          <Button class="mt-2 gap-2" @click="router.replace('/login')">
            <CheckCircle2 class="size-4" />
            Back to login
          </Button>
        </div>
      </div>
    </div>

    <!-- Brand panel -->
    <div class="relative hidden overflow-hidden bg-[oklch(0.16_0.04_278)] text-white lg:block">
      <div class="absolute -left-24 -top-24 size-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div class="absolute -bottom-32 -right-16 size-96 rounded-full bg-sky-500/25 blur-3xl" />
      <div class="relative flex h-full flex-col justify-center p-12">
        <span class="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
          ✨ Secure sign-in
        </span>
        <h2 class="mt-5 max-w-lg text-4xl font-bold leading-tight tracking-tight">
          One click and you're
          <span class="bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">subtitle-ready</span>
        </h2>
        <p class="mt-4 max-w-md text-sm text-white/70">
          Sign in with your Google account to generate captions, download SRT or VTT files, and manage your library.
        </p>
      </div>
    </div>
  </div>
</template>
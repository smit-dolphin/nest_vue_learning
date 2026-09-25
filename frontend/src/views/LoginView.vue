<script setup lang="ts">
import { Captions, Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from '@/composables/useForm'
import { getMyProfile, loginUser, startGoogleAuth } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { loginSchema } from '@/validation/schemas'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { errors, validate, touchField, clearField } = useForm(loginSchema)

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (loading.value) return
  if (!validate({ email: email.value, password: password.value })) return

  loading.value = true
  try {
    const result = await loginUser(email.value.trim(), password.value)
    authStore.setAccessToken(result.accessToken)
    const [profile, _settings] = await Promise.all([
      getMyProfile(),
      settingsStore.fetchSettings(),
    ])
    authStore.setUser(profile)
    router.replace('/')
  } catch {
    // Error is toasted by the Axios interceptor.
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <!-- Brand panel -->
    <div class="relative hidden overflow-hidden bg-[oklch(0.16_0.04_278)] text-white lg:block">
      <div class="absolute -left-24 -top-24 size-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div class="absolute -bottom-32 -right-16 size-96 rounded-full bg-sky-500/25 blur-3xl" />
      <div class="relative flex h-full flex-col justify-between p-12">
        <div class="flex items-center gap-3">
          <span class="brand-gradient grid size-11 place-items-center rounded-2xl shadow-lg shadow-indigo-500/40">
            <Sparkles class="size-6" />
          </span>
          <span class="text-xl font-bold tracking-tight">Vue<span class="text-indigo-300">Subs</span></span>
        </div>

        <div>
          <h2 class="max-w-md text-4xl font-bold leading-tight tracking-tight">
            Subtitles that
            <span class="bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">write themselves</span>
          </h2>
          <p class="mt-4 max-w-md text-sm leading-relaxed text-white/60">
            Upload a video, get perfectly synced subtitles in seconds. Powered by modern AI.
          </p>

          <div class="mt-8 space-y-3">
            <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-500/30 text-indigo-200">
                <Captions class="size-5" />
              </span>
              <div>
                <p class="text-sm font-semibold">50+ languages</p>
                <p class="text-xs text-white/50">Transcribe and translate any video</p>
              </div>
            </div>
            <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-500/30 text-sky-200">
                <Sparkles class="size-5" />
              </span>
              <div>
                <p class="text-sm font-semibold">97% accuracy</p>
                <p class="text-xs text-white/50">Industry-leading speech recognition</p>
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-white/40">© 2026 VueSubs · AI subtitle generator</p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="brand-gradient grid size-10 place-items-center rounded-xl text-white">
            <Sparkles class="size-5" />
          </span>
          <span class="text-lg font-bold">Vue<span class="text-primary">Subs</span></span>
        </div>

        <h1 class="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p class="mt-1 text-sm text-muted-foreground">Sign in to continue to your workspace</p>

        <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="email">Email address</Label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" v-model="email" type="email" placeholder="you@example.com" class="h-11 pl-10" :class="errors.email ? 'border-destructive' : ''" :aria-invalid="errors.email ? 'true' : 'false'" @input="clearField('email')" @blur="touchField({ email, password }, 'email')" autocomplete="email" />
            </div>
            <p v-if="errors.email" class="text-xs font-medium text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password">Password</Label>
              <button type="button" class="text-xs font-medium text-primary hover:underline">Forgot?</button>
            </div>
            <div class="relative">
              <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="h-11 pl-10 pr-10" :class="errors.password ? 'border-destructive' : ''" :aria-invalid="errors.password ? 'true' : 'false'" @input="clearField('password')" @blur="touchField({ email, password }, 'password')" autocomplete="current-password" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
            <p v-if="errors.password" class="text-xs font-medium text-destructive">{{ errors.password }}</p>
          </div>

          <Button type="submit" size="lg" class="w-full" :disabled="loading">
            <Loader2 v-if="loading" class="size-4 animate-spin" />
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>

        <div class="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span class="h-px flex-1 bg-border" />
          or continue with
          <span class="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" size="lg" class="w-full gap-2" @click="startGoogleAuth">
          <svg class="size-4" viewBox="0 0 24 24" fill="none">
            <path d="M21.36 10.23h-9.54v4h5.62c-.53 2.52-2.65 4-5.62 4a6.4 6.4 0 1 1 0-12.79c1.77 0 3.02.75 3.71 1.37l2.71-2.66C16.88 2.9 14.8 2 11.82 2 6.4 2 2 6.4 2 11.8S6.4 21.6 11.82 21.6c5.66 0 9.41-3.97 9.41-9.57 0-.63-.06-1.12-.17-1.6Z" fill="currentColor" />
          </svg>
          Continue with Google
        </Button>

        <p class="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?
          <router-link to="/register" class="font-semibold text-primary hover:underline">Create one</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
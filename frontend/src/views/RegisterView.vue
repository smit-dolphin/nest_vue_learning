<script setup lang="ts">
import { Eye, EyeOff, Lock, Mail, Sparkles, UserRound } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const showPassword = ref(false)
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <!-- Form panel -->
    <div class="flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3">
          <span class="brand-gradient grid size-10 place-items-center rounded-xl text-white">
            <Sparkles class="size-5" />
          </span>
          <span class="text-lg font-bold">Vue<span class="text-primary">Subs</span></span>
        </div>

        <h1 class="text-2xl font-bold tracking-tight">Create your account</h1>
        <p class="mt-1 text-sm text-muted-foreground">Start generating subtitles in minutes</p>

        <form class="mt-8 space-y-5" @submit.prevent="router.push('/')">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="first">First name</Label>
              <Input id="first" type="text" placeholder="Smit" class="h-11" />
            </div>
            <div class="space-y-2">
              <Label for="last">Last name</Label>
              <Input id="last" type="text" placeholder="Gajjar" class="h-11" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="username">Username</Label>
            <div class="relative">
              <UserRound class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="username" type="text" placeholder="smitgajjar" class="h-11 pl-10" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="email">Email address</Label>
            <div class="relative">
              <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" class="h-11 pl-10" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <div class="relative">
              <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="h-11 pl-10 pr-10" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" class="w-full">Create account</Button>
        </form>

        <div class="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span class="h-px flex-1 bg-border" />
          or continue with
          <span class="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" size="lg" class="w-full gap-2">
          <svg class="size-4" viewBox="0 0 24 24" fill="none">
            <path d="M21.36 10.23h-9.54v4h5.62c-.53 2.52-2.65 4-5.62 4a6.4 6.4 0 1 1 0-12.79c1.77 0 3.02.75 3.71 1.37l2.71-2.66C16.88 2.9 14.8 2 11.82 2 6.4 2 2 6.4 2 11.8S6.4 21.6 11.82 21.6c5.66 0 9.41-3.97 9.41-9.57 0-.63-.06-1.12-.17-1.6Z" fill="currentColor" />
          </svg>
          Continue with Google
        </Button>

        <p class="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="font-semibold text-primary hover:underline">Sign in</router-link>
        </p>
      </div>
    </div>

    <!-- Brand panel -->
    <div class="relative hidden overflow-hidden bg-[oklch(0.16_0.04_278)] text-white lg:block">
      <div class="absolute -right-24 -top-24 size-96 rounded-full bg-sky-500/25 blur-3xl" />
      <div class="absolute -bottom-32 -left-16 size-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div class="relative flex h-full flex-col justify-center p-12">
        <span class="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
          ✨ New in v2
        </span>
        <h2 class="mt-5 max-w-lg text-4xl font-bold leading-tight tracking-tight">
          Join thousands making videos
          <span class="bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">watchable everywhere</span>
        </h2>
        <ul class="mt-8 space-y-3 text-sm text-white/70">
          <li class="flex items-center gap-2.5">
            <span class="grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">✓</span>
            Free plan — 3 videos every month
          </li>
          <li class="flex items-center gap-2.5">
            <span class="grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">✓</span>
            Export to SRT, VTT, ASS & more
          </li>
          <li class="flex items-center gap-2.5">
            <span class="grid size-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">✓</span>
            No credit card required
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
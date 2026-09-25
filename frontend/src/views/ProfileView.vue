<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Mail,
  ShieldCheck,
  UserRound,
} from '@lucide/vue'
import { computed } from 'vue'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LANGUAGES } from '@/constants/settings'
import { getProfileImageUrl } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const userName = computed(() => authStore.user?.username || 'User')
const userEmail = computed(() => authStore.user?.email || '')
const roleLabel = computed(() => (authStore.user?.role === 'ADMIN' ? 'Admin' : 'Member'))
const memberSince = computed(() => {
  const raw = authStore.user?.createdAt
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
const avatarSrc = computed(() => getProfileImageUrl())
const userInitials = computed(() => {
  const source = (authStore.user?.username || authStore.user?.email || 'U').trim()
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  return (initials || 'U').toUpperCase()
})
const languageLabel = computed(() => {
  const code = settingsStore.effectiveSettings.defaultLanguage
  return LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase()
})

const details = computed(() => [
  { label: 'Username', value: userName.value, icon: UserRound },
  { label: 'Email address', value: userEmail.value, icon: Mail },
  { label: 'Role', value: roleLabel.value, icon: ShieldCheck },
  { label: 'Member since', value: memberSince.value, icon: CalendarDays },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">Account</p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight">Your profile</h2>
        <p class="mt-1 text-sm text-muted-foreground">Manage your account details and workspace identity.</p>
      </div>
      <Badge variant="outline" class="gap-1.5 px-3 py-1.5 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 class="size-3.5" />
        Active account
      </Badge>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <!-- Identity -->
      <Card>
        <CardContent class="flex flex-col items-center p-8 text-center">
          <Avatar class="size-24 rounded-3xl">
            <AvatarImage v-if="avatarSrc" :src="avatarSrc" alt="Profile" class="rounded-3xl" />
            <AvatarFallback class="brand-gradient rounded-3xl text-3xl font-bold text-white shadow-lg shadow-indigo-500/30">{{ userInitials }}</AvatarFallback>
          </Avatar>
          <h3 class="mt-4 text-lg font-bold">{{ userName }}</h3>
          <p class="mt-1 text-sm text-muted-foreground">{{ userEmail }}</p>
          <Badge class="mt-4 capitalize">{{ roleLabel }}</Badge>

          <div class="mt-8 w-full rounded-2xl bg-accent/50 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-1.5 text-muted-foreground">
                <Globe2 class="size-3.5" /> Language
              </span>
              <span class="font-medium">{{ languageLabel }}</span>
            </div>
            <div class="mt-3 flex items-center justify-between text-sm">
              <span class="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 class="size-3.5" /> Status
              </span>
              <span class="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span class="size-2 rounded-full bg-emerald-500" /> Online
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Details -->
      <div class="space-y-6">
        <Card>
          <CardContent class="p-6">
            <div class="mb-5 flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400">Personal information</p>
                <h3 class="mt-1 font-semibold">Account details</h3>
              </div>
              <UserRound class="size-5 text-sky-600 dark:text-sky-400" />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div v-for="detail in details" :key="detail.label" class="rounded-2xl border bg-muted/30 p-4">
                <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <component :is="detail.icon" class="size-3.5" />
                  {{ detail.label }}
                </span>
                <p class="mt-2 truncate text-sm font-semibold">{{ detail.value }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex flex-wrap items-center gap-4 p-5">
            <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <ShieldCheck class="size-5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold">Your account is protected</p>
              <p class="text-sm text-muted-foreground">Your session is secured with authenticated access.</p>
            </div>
            <Button as-child variant="outline" class="gap-2">
              <router-link to="/settings" class="gap-2">
                Open settings
                <ArrowRight class="size-3.5" />
              </router-link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
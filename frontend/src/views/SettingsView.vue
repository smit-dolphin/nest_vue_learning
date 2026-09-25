<script setup lang="ts">
import {
  Bell,
  Captions,
  ChevronRight,
  CreditCard,
  Key,
  Moon,
  Palette,
  Settings,
  Shield,
  User,
} from '@lucide/vue'
import { ref } from 'vue'

import PageHeader from '@/components/layout/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
]

const activeSection = ref('profile')

const prefToggles = [
  { label: 'Auto Download', desc: 'Automatically download SRT after generation', icon: Captions },
  { label: 'Dark Mode', desc: 'Use dark theme across the app', icon: Moon },
  { label: 'Compact View', desc: 'Show a more condensed interface', icon: Palette },
]

const notifToggles = [
  { label: 'Job Completed', desc: 'Notify when a subtitle job finishes successfully' },
  { label: 'Job Failed', desc: 'Notify when a subtitle job encounters an error' },
  { label: 'Weekly Report', desc: 'Receive a weekly summary of your usage' },
  { label: 'Product Updates', desc: 'Learn about new features and improvements' },
]
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="Settings"
      title="Settings"
      subtitle="Manage your account, preferences, and API configuration"
      gradient="bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-emerald-500/30"
    />

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_1fr]">
      <!-- Nav -->
      <Card class="p-2 lg:sticky lg:top-24">
        <div class="flex gap-1 overflow-x-auto lg:flex-col">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            :class="activeSection === s.id ? 'bg-accent font-semibold text-foreground' : ''"
            @click="activeSection = s.id"
          >
            <component :is="s.icon" class="size-4" />
            {{ s.label }}
            <ChevronRight class="ml-auto hidden size-3.5 opacity-40 lg:block" />
          </button>
        </div>
      </Card>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Profile -->
        <Card v-if="activeSection === 'profile'">
          <CardContent class="space-y-6 p-6">
            <div>
              <h3 class="font-semibold">Profile Information</h3>
              <p class="text-sm text-muted-foreground">Update your personal details and account info</p>
            </div>

            <div class="flex flex-wrap items-center gap-5">
              <span class="brand-gradient grid size-20 place-items-center rounded-3xl text-3xl font-bold text-white shadow-lg shadow-indigo-500/30">
                SG
              </span>
              <div class="flex flex-col gap-2">
                <div class="flex gap-2">
                  <Button variant="outline" size="sm">Change photo</Button>
                  <Button size="sm">Upload</Button>
                </div>
                <p class="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="username">Username</Label>
                <Input id="username" type="text" value="Smit Gajjar" />
              </div>
              <div class="space-y-2">
                <Label for="email">Email address</Label>
                <Input id="email" type="email" value="smit@example.com" disabled />
              </div>
            </div>

            <div class="flex border-t pt-5">
              <Button class="gap-2">
                Save changes
              </Button>
            </div>

            <!-- Danger zone -->
            <div class="overflow-hidden rounded-2xl border border-red-200 dark:border-red-500/30">
              <div class="border-b border-red-200 bg-red-50 px-5 py-3 dark:border-red-500/30 dark:bg-red-500/10">
                <h4 class="text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h4>
                <p class="text-xs text-muted-foreground">These actions are irreversible. Please proceed with caution.</p>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p class="text-sm font-semibold">Delete all history</p>
                  <p class="text-xs text-muted-foreground">Permanently remove all job history and subtitle files</p>
                </div>
                <Button variant="outline" size="sm" class="text-destructive">Delete history</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Preferences -->
        <Card v-if="activeSection === 'preferences'">
          <CardContent class="space-y-6 p-6">
            <div>
              <h3 class="font-semibold">Preferences</h3>
              <p class="text-sm text-muted-foreground">Customize your default subtitle settings and app appearance</p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="lang">Default language</Label>
                <Input id="lang" type="text" value="English (en)" />
              </div>
              <div class="space-y-2">
                <Label for="fmt">Default format</Label>
                <Input id="fmt" type="text" value="SRT" />
              </div>
            </div>

            <div class="divide-y">
              <div v-for="pref in prefToggles" :key="pref.label" class="flex items-center justify-between gap-4 py-3.5">
                <div class="flex items-start gap-3">
                  <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <component :is="pref.icon" class="size-4" />
                  </span>
                  <div>
                    <p class="text-sm font-medium">{{ pref.label }}</p>
                    <p class="text-xs text-muted-foreground">{{ pref.desc }}</p>
                  </div>
                </div>
                <Switch :default-checked="pref.label === 'Dark Mode' || pref.label === 'Auto Download'" />
              </div>
            </div>

            <div class="flex border-t pt-5">
              <Button class="gap-2">Save preferences</Button>
            </div>
          </CardContent>
        </Card>

        <!-- API Keys -->
        <Card v-if="activeSection === 'api'">
          <CardContent class="flex flex-col items-center gap-3 p-12 text-center">
            <span class="grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Key class="size-6" />
            </span>
            <p class="font-semibold">Coming soon</p>
            <p class="max-w-sm text-sm text-muted-foreground">
              API access is currently in private beta. Programmatic subtitle generation will be available here shortly.
            </p>
          </CardContent>
        </Card>

        <!-- Notifications -->
        <Card v-if="activeSection === 'notifications'">
          <CardContent class="space-y-6 p-6">
            <div>
              <h3 class="font-semibold">Notifications</h3>
              <p class="text-sm text-muted-foreground">Choose what updates you want to receive</p>
            </div>

            <div class="divide-y">
              <div v-for="notif in notifToggles" :key="notif.label" class="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p class="text-sm font-medium">{{ notif.label }}</p>
                  <p class="text-xs text-muted-foreground">{{ notif.desc }}</p>
                </div>
                <Switch :default-checked="!['Weekly Report'].includes(notif.label)" />
              </div>
            </div>

            <div class="flex border-t pt-5">
              <Button class="gap-2">Save preferences</Button>
            </div>
          </CardContent>
        </Card>

        <!-- Billing -->
        <Card v-if="activeSection === 'billing'">
          <CardContent class="flex flex-col items-center gap-3 p-12 text-center">
            <span class="grid size-14 place-items-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
              <CreditCard class="size-6" />
            </span>
            <p class="font-semibold">Free plan</p>
            <p class="max-w-sm text-sm text-muted-foreground">
              Payments and plan management are not available yet. You can continue using the app for free.
            </p>
            <Button class="mt-2 gap-2">Upgrade to Pro</Button>
          </CardContent>
        </Card>

        <!-- Security -->
        <Card v-if="activeSection === 'security'">
          <CardContent class="space-y-6 p-6">
            <div>
              <h3 class="font-semibold">Security</h3>
              <p class="text-sm text-muted-foreground">Protect your account with a strong password and two-factor authentication</p>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="current">Current password</Label>
                <Input id="current" type="password" placeholder="••••••••" />
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="new">New password</Label>
                  <Input id="new" type="password" placeholder="••••••••" />
                </div>
                <div class="space-y-2">
                  <Label for="confirm">Confirm new password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4 rounded-2xl border bg-muted/40 p-4">
              <div class="flex items-start gap-3">
                <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Shield class="size-5" />
                </span>
                <div>
                  <p class="text-sm font-medium">Two-factor authentication</p>
                  <p class="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>Coming soon</Button>
            </div>

            <div class="flex border-t pt-5">
              <Button class="gap-2">Update password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
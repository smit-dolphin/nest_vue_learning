<script setup lang="ts">
import {
  Bell,
  Captions,
  ChevronRight,
  CreditCard,
  Key,
  Loader2,
  Moon,
  Palette,
  Save,
  Settings,
  Shield,
  User,
} from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

import PageHeader from '@/components/layout/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useForm } from '@/composables/useForm'
import { LANGUAGES, SUBTITLE_FORMATS } from '@/constants/settings'
import {
  changePassword,
  getMyProfile,
  getProfileImageUrl,
  updateProfile,
  uploadProfileImage,
} from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  passwordChangeSchema,
  preferencesSchema,
  profileSchema,
} from '@/validation/schemas'

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
]

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const activeSection = ref('profile')
const saving = ref<'profile' | 'preferences' | 'notifications' | 'security' | null>(null)

const profileForm = ref({
  username: authStore.user?.username ?? '',
})

const prefForm = ref({
  defaultLanguage: settingsStore.effectiveSettings.defaultLanguage,
  defaultFormat: settingsStore.effectiveSettings.defaultFormat,
  autoDownload: settingsStore.effectiveSettings.autoDownload,
  theme: settingsStore.effectiveSettings.theme,
  compactView: settingsStore.effectiveSettings.compactView,
})

const notifForm = ref({
  jobComplete: settingsStore.effectiveSettings.jobComplete,
  jobFailed: settingsStore.effectiveSettings.jobFailed,
  weeklyReport: settingsStore.effectiveSettings.weeklyReport,
  productUpdates: settingsStore.effectiveSettings.productUpdates,
  marketing: settingsStore.effectiveSettings.marketing,
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const syncForms = () => {
  const settings = settingsStore.effectiveSettings
  prefForm.value = {
    defaultLanguage: settings.defaultLanguage,
    defaultFormat: settings.defaultFormat,
    autoDownload: settings.autoDownload,
    theme: settings.theme,
    compactView: settings.compactView,
  }
  notifForm.value = {
    jobComplete: settings.jobComplete,
    jobFailed: settings.jobFailed,
    weeklyReport: settings.weeklyReport,
    productUpdates: settings.productUpdates,
    marketing: settings.marketing,
  }
  if (authStore.user?.username) {
    profileForm.value.username = authStore.user.username
  }
}

onMounted(async () => {
  if (!authStore.user) {
    try {
      authStore.setUser(await getMyProfile())
    } catch {
      // 401 / refresh failures are handled by the interceptor.
    }
  }
  if (!settingsStore.isLoaded) {
    try {
      await settingsStore.fetchSettings()
    } catch {
      // 401 / refresh failures are handled by the interceptor.
    }
  }
  syncForms()
})

const prefToggles = [
  { label: 'Auto Download', desc: 'Automatically download SRT after generation', icon: Captions, key: 'autoDownload' as const },
  { label: 'Dark Mode', desc: 'Use dark theme across the app', icon: Moon, key: 'theme' as const },
  { label: 'Compact View', desc: 'Show a more condensed interface', icon: Palette, key: 'compactView' as const },
]

const notifToggles = [
  { label: 'Job Completed', desc: 'Notify when a subtitle job finishes successfully', key: 'jobComplete' as const },
  { label: 'Job Failed', desc: 'Notify when a subtitle job encounters an error', key: 'jobFailed' as const },
  { label: 'Weekly Report', desc: 'Receive a weekly summary of your usage', key: 'weeklyReport' as const },
  { label: 'Product Updates', desc: 'Learn about new features and improvements', key: 'productUpdates' as const },
  { label: 'Marketing Emails', desc: 'Occasional promotional emails about offers and tips', key: 'marketing' as const },
]

const emailDisplay = computed(() => authStore.user?.email ?? '')
const avatarInitials = computed(() => {
  const name = profileForm.value.username.trim()
  return name ? name.slice(0, 2).toUpperCase() : 'U'
})

const prefValue = (key: 'autoDownload' | 'theme' | 'compactView') => {
  if (key === 'theme') return prefForm.value.theme === 'dark'
  return prefForm.value[key]
}

const setPref = (key: 'autoDownload' | 'theme' | 'compactView', value: boolean) => {
  if (key === 'theme') prefForm.value.theme = value ? 'dark' : 'light'
  else prefForm.value[key] = value
}

const saveProfile = async () => {
  if (!validateProfile(profileForm.value)) return
  saving.value = 'profile'
  try {
    const user = await updateProfile({ username: profileForm.value.username })
    authStore.setUser(user)
    toast.success('Profile updated')
  } catch {
    // Error is toasted by the interceptor.
  } finally {
    saving.value = null
  }
}

const savePreferences = async () => {
  if (!validatePrefs(prefForm.value)) return
  saving.value = 'preferences'
  try {
    await settingsStore.updateSettings({
      defaultLanguage: prefForm.value.defaultLanguage,
      defaultFormat: prefForm.value.defaultFormat as 'SRT' | 'VTT',
      autoDownload: prefForm.value.autoDownload,
      theme: prefForm.value.theme,
      compactView: prefForm.value.compactView,
    })
    toast.success('Preferences saved')
  } catch {
    // Error is toasted by the interceptor.
  } finally {
    saving.value = null
  }
}

const saveNotifications = async () => {
  saving.value = 'notifications'
  try {
    await settingsStore.updateSettings(notifForm.value)
    toast.success('Notification preferences saved')
  } catch {
    // Error is toasted by the interceptor.
  } finally {
    saving.value = null
  }
}

const updatePassword = async () => {
  const { currentPassword, newPassword } = passwordForm.value
  if (!validatePassword(passwordForm.value)) return

  saving.value = 'security'
  try {
    await changePassword(currentPassword, newPassword)
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    toast.success('Password updated successfully')
  } catch {
    // Error is toasted by the interceptor.
  } finally {
    saving.value = null
  }
}

const photoInput = ref<HTMLInputElement | null>(null)
const selectedPhoto = ref<File | null>(null)
const photoPreviewUrl = ref('')
const uploadingPhoto = ref(false)

const onPhotoSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  selectedPhoto.value = file
  photoPreviewUrl.value = URL.createObjectURL(file)
}

const cancelPhotoSelection = () => {
  selectedPhoto.value = null
  photoPreviewUrl.value = ''
  if (photoInput.value) photoInput.value.value = ''
}

const uploadPhoto = async () => {
  if (!selectedPhoto.value) {
    toast.error('Select a photo first.')
    return
  }

  uploadingPhoto.value = true
  try {
    const user = await uploadProfileImage(selectedPhoto.value)
    authStore.setUser(user)
    cancelPhotoSelection()
    toast.success('Profile photo updated')
  } catch {
    // Error is toasted by the interceptor.
  } finally {
    uploadingPhoto.value = false
  }
}

const photoUrl = computed(() => getProfileImageUrl())

const { errors: profileErrors, validate: validateProfile, clearField: clearProfileField } = useForm(profileSchema)
const { errors: prefErrors, validate: validatePrefs, clearField: clearPrefField } = useForm(preferencesSchema)
const { errors: passwordErrors, validate: validatePassword, clearField: clearPasswordField } = useForm(passwordChangeSchema)
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
              <img
                v-if="photoPreviewUrl"
                :src="photoPreviewUrl"
                alt="Profile preview"
                class="size-20 rounded-3xl object-cover shadow-lg shadow-indigo-500/30"
              />
              <img
                v-else-if="photoUrl"
                :src="photoUrl"
                alt="Profile"
                class="size-20 rounded-3xl object-cover shadow-lg shadow-indigo-500/30"
              />
              <span v-else class="brand-gradient grid size-20 place-items-center rounded-3xl text-3xl font-bold text-white shadow-lg shadow-indigo-500/30">
                {{ avatarInitials }}
              </span>
              <div class="flex flex-col gap-2">
                <div class="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" @click="photoInput?.click()">Change photo</Button>
                  <Button size="sm" :disabled="!selectedPhoto || uploadingPhoto" @click="uploadPhoto">
                    <Loader2 v-if="uploadingPhoto" class="size-4 animate-spin" />
                    <Save v-else class="size-4" />
                    Upload
                  </Button>
                  <Button v-if="selectedPhoto" variant="ghost" size="sm" @click="cancelPhotoSelection">Cancel</Button>
                  <input ref="photoInput" type="file" accept="image/jpeg,image/png" class="hidden" @change="onPhotoSelected" />
                </div>
                <p class="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="username">Username</Label>
                <Input id="username" v-model="profileForm.username" type="text" :class="profileErrors.username ? 'border-destructive' : ''" :aria-invalid="profileErrors.username ? 'true' : 'false'" @input="clearProfileField('username')" />
                <p v-if="profileErrors.username" class="text-xs font-medium text-destructive">{{ profileErrors.username }}</p>
              </div>
              <div class="space-y-2">
                <Label for="email">Email address</Label>
                <Input id="email" :model-value="emailDisplay" type="email" disabled />
              </div>
            </div>

            <div class="flex border-t pt-5">
              <Button class="gap-2" :disabled="saving === 'profile'" @click="saveProfile">
                <Loader2 v-if="saving === 'profile'" class="size-4 animate-spin" />
                <Save v-else class="size-4" />
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
                <Select v-model="prefForm.defaultLanguage" @update:model-value="clearPrefField('defaultLanguage')">
                  <SelectTrigger id="lang" class="h-9 w-full" :class="prefErrors.defaultLanguage ? 'border-destructive' : ''">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">
                      {{ lang.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="prefErrors.defaultLanguage" class="text-xs font-medium text-destructive">{{ prefErrors.defaultLanguage }}</p>
              </div>
              <div class="space-y-2">
                <Label for="fmt">Default format</Label>
                <Select v-model="prefForm.defaultFormat" @update:model-value="clearPrefField('defaultFormat')">
                  <SelectTrigger id="fmt" class="h-9 w-full" :class="prefErrors.defaultFormat ? 'border-destructive' : ''">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="fmt in SUBTITLE_FORMATS" :key="fmt" :value="fmt">
                      {{ fmt }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="prefErrors.defaultFormat" class="text-xs font-medium text-destructive">{{ prefErrors.defaultFormat }}</p>
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
                <Switch :model-value="prefValue(pref.key)" @update:model-value="setPref(pref.key, $event)" />
              </div>
            </div>

            <div class="flex border-t pt-5">
              <Button class="gap-2" :disabled="saving === 'preferences'" @click="savePreferences">
                <Loader2 v-if="saving === 'preferences'" class="size-4 animate-spin" />
                <Save v-else class="size-4" />
                Save preferences
              </Button>
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
              <div v-for="notif in notifToggles" :key="notif.key" class="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p class="text-sm font-medium">{{ notif.label }}</p>
                  <p class="text-xs text-muted-foreground">{{ notif.desc }}</p>
                </div>
                <Switch :model-value="notifForm[notif.key]" @update:model-value="notifForm[notif.key] = $event" />
              </div>
            </div>

            <div class="flex border-t pt-5">
              <Button class="gap-2" :disabled="saving === 'notifications'" @click="saveNotifications">
                <Loader2 v-if="saving === 'notifications'" class="size-4 animate-spin" />
                <Save v-else class="size-4" />
                Save preferences
              </Button>
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
                <Input id="current" v-model="passwordForm.currentPassword" type="password" placeholder="••••••••" autocomplete="current-password" :class="passwordErrors.currentPassword ? 'border-destructive' : ''" :aria-invalid="passwordErrors.currentPassword ? 'true' : 'false'" @input="clearPasswordField('currentPassword')" />
                <p v-if="passwordErrors.currentPassword" class="text-xs font-medium text-destructive">{{ passwordErrors.currentPassword }}</p>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="new">New password</Label>
                  <Input id="new" v-model="passwordForm.newPassword" type="password" placeholder="••••••••" autocomplete="new-password" :class="passwordErrors.newPassword ? 'border-destructive' : ''" :aria-invalid="passwordErrors.newPassword ? 'true' : 'false'" @input="clearPasswordField('newPassword')" />
                  <p v-if="passwordErrors.newPassword" class="text-xs font-medium text-destructive">{{ passwordErrors.newPassword }}</p>
                </div>
                <div class="space-y-2">
                  <Label for="confirm">Confirm new password</Label>
                  <Input id="confirm" v-model="passwordForm.confirmPassword" type="password" placeholder="••••••••" autocomplete="new-password" :class="passwordErrors.confirmPassword ? 'border-destructive' : ''" :aria-invalid="passwordErrors.confirmPassword ? 'true' : 'false'" @input="clearPasswordField('confirmPassword')" />
                  <p v-if="passwordErrors.confirmPassword" class="text-xs font-medium text-destructive">{{ passwordErrors.confirmPassword }}</p>
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
              <Button class="gap-2" :disabled="saving === 'security'" @click="updatePassword">
                <Loader2 v-if="saving === 'security'" class="size-4 animate-spin" />
                <Save v-else class="size-4" />
                Update password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
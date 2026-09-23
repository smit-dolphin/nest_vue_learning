<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Settings, User, Globe2, Bell, Shield, Palette, Key,
  CreditCard, Trash2, Check, ChevronRight, Moon, AlignLeft, Captions, Loader2
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/authStore'
import {
  changePassword,
  getUserSettings,
  getProfileImageUrl,
  updateProfile,
  updateUserSettings,
  uploadProfileImage,
} from '@/services/authService'
import type { UserSettings } from '@/services/authService'
import { deleteVideo, getUserVideos } from '@/services/videoService'
import { FORMATS, LANGUAGES } from '@/components/GenrateSubtitle/languages'

const authStore = useAuthStore()
const isOAuth = computed(() => authStore.isOAuth)

const activeSection = ref('profile')

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
]

/* Profile */
const username = ref('')
const email = ref('')
const avatarUrl = ref('')

/* Preferences */
const prefs = ref({ defaultLang: 'en', defaultFormat: 'SRT' })
const settingToggles = ref({
  autoDownload: false,
  darkMode: true,
  compactView: false,
})

/* Notifications */
const notifs = ref({
  jobComplete: true,
  jobFailed: true,
  weeklyReport: false,
  productUpdates: true,
  marketing: false,
})

/* Password */
const passwordForm = ref({ current: '', next: '', confirm: '' })
const changingPassword = ref(false)

/* Shared save state */
const saved = ref('')
const saving = ref(false)
const settingsLoading = ref(true)
const deletingHistory = ref(false)

const savedFlash = (which: string) => {
  saved.value = which
  setTimeout(() => (saved.value = ''), 2000)
}

const loadSettings = async () => {
  settingsLoading.value = true
  try {
    const settings: UserSettings = await getUserSettings()
    prefs.value.defaultLang = settings.defaultLang
    prefs.value.defaultFormat = settings.defaultFormat
    settingToggles.value.autoDownload = settings.autoDownload
    settingToggles.value.darkMode = settings.darkMode
    settingToggles.value.compactView = settings.compactView
    notifs.value = { ...notifs.value, ...settings.notifications }
  } catch {
    toast.error('Could not load your settings')
  } finally {
    settingsLoading.value = false
  }
}

const syncFromUser = () => {
  username.value = authStore.user?.username ?? ''
  email.value = authStore.user?.email ?? ''
  avatarUrl.value = authStore.user?.profileImage ? getProfileImageUrl() : ''
}

const saveProfile = async () => {
  if (!username.value.trim()) {
    toast.error('Username cannot be empty')
    return
  }
  if (username.value === authStore.user?.username) {
    savedFlash('profile')
    return
  }
  saving.value = true
  try {
    const updated = await updateProfile({ username: username.value.trim() })
    authStore.setUser(updated)
    savedFlash('profile')
  } catch {
    /* error toast handled by interceptor */
  } finally {
    saving.value = false
  }
}

const savePrefs = async () => {
  saving.value = true
  try {
    await updateUserSettings({
      defaultLang: prefs.value.defaultLang,
      defaultFormat: prefs.value.defaultFormat,
      autoDownload: settingToggles.value.autoDownload,
      darkMode: settingToggles.value.darkMode,
      compactView: settingToggles.value.compactView,
    })
    savedFlash('prefs')
  } catch {
    /* handled */
  } finally {
    saving.value = false
  }
}

const saveNotifs = async () => {
  saving.value = true
  try {
    await updateUserSettings({ notifications: { ...notifs.value } })
    savedFlash('notifs')
  } catch {
    /* handled */
  } finally {
    saving.value = false
  }
}

const pickedAvatar = ref<File | null>(null)

const pickAvatar = () => {
  document.getElementById('avatar-file-input')?.click()
}

const onPickAvatar = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  pickedAvatar.value = file

  const reader = new FileReader()
  reader.onload = () => { avatarUrl.value = String(reader.result) }
  reader.readAsDataURL(file)
}

const uploadAvatar = async () => {
  const file = pickedAvatar.value
  if (!file) {
    toast.error('Choose an image first')
    return
  }

  saving.value = true
  try {
    const updated = await uploadProfileImage(file)
    authStore.setUser(updated)
    avatarUrl.value = updated.profileImage ? getProfileImageUrl() : ''
    pickedAvatar.value = null
    savedFlash('profile')
  } catch {
    /* handled */
  } finally {
    saving.value = false
  }
}

const submitPassword = async () => {
  const { current, next, confirm } = passwordForm.value
  if (!current || !next || !confirm) {
    toast.error('Fill in all password fields')
    return
  }
  if (next !== confirm) {
    toast.error('New passwords do not match')
    return
  }
  changingPassword.value = true
  try {
    await changePassword(current, next)
    passwordForm.value = { current: '', next: '', confirm: '' }
    toast.success('Password updated successfully')
  } catch {
    /* handled */
  } finally {
    changingPassword.value = false
  }
}

const deleteHistory = async () => {
  if (!window.confirm('Delete ALL videos, subtitle files, and job history? This cannot be undone.')) return
  deletingHistory.value = true
  try {
    const videos = (await getUserVideos()).data
    for (const video of videos) {
      await deleteVideo(video.id)
    }
    toast.success(`Deleted ${videos.length} item${videos.length === 1 ? '' : 's'}`)
  } catch {
    /* handled */
  } finally {
    deletingHistory.value = false
  }
}

const initials = computed(() => {
  const name = authStore.user?.username || authStore.user?.email || 'User'
  return name.slice(0, 1).toUpperCase()
})

onMounted(() => {
  syncFromUser()
  void loadSettings()
})

const preferenceIcons = { autoDownload: Captions, darkMode: Moon, compactView: Palette }
const preferenceLabels = { autoDownload: 'Auto Download', darkMode: 'Dark Mode', compactView: 'Compact View' }
const preferenceDescriptions = {
  autoDownload: 'Automatically download SRT after generation',
  darkMode: 'Use dark theme across the app',
  compactView: 'Show a more condensed interface',
}
</script>

<template>
  <div class="settings-page">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header__icon"><Settings :size="22" /></div>
      <div>
        <h2 class="page-header__title">Settings</h2>
        <p class="page-header__sub">Manage your account, preferences, and API configuration</p>
      </div>
    </div>

    <div class="settings-layout">
      <!-- Sidebar Nav -->
      <aside class="settings-nav">
        <button
          v-for="s in sections"
          :key="s.id"
          class="settings-nav__item"
          :class="{ 'settings-nav__item--active': activeSection === s.id }"
          @click="activeSection = s.id"
        >
          <component :is="s.icon" :size="16" />
          <span>{{ s.label }}</span>
          <ChevronRight :size="14" class="settings-nav__arrow" />
        </button>
      </aside>

      <!-- Content Panel -->
      <main class="settings-content">

        <!-- Profile -->
        <div v-if="activeSection === 'profile'" class="settings-section">
          <div class="settings-section__header">
            <h3>Profile Information</h3>
            <p>Update your personal details and account info</p>
          </div>

          <!-- Avatar -->
          <div class="avatar-upload">
            <div class="avatar-upload__preview">
              <img v-if="avatarUrl" :src="avatarUrl" alt="Profile photo" />
              <span v-else>{{ initials }}</span>
            </div>
            <div>
              <input id="avatar-file-input" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onPickAvatar" />
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn--ghost btn--sm" @click="pickAvatar">Change Photo</button>
                <button class="btn btn--primary btn--sm" @click="uploadAvatar">
                  <Loader2 v-if="saving" :size="14" class="spin" />
                  <Check v-else-if="saved === 'profile'" :size="14" />
                  Upload
                </button>
              </div>
              <p class="avatar-upload__hint">JPG, PNG up to 2MB</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">Username</label>
              <input v-model="username" type="text" class="form-input" />
            </div>
            <div class="form-field">
              <label class="form-label">Email Address</label>
              <input :value="email" type="email" class="form-input" disabled />
            </div>
          </div>

          <div class="settings-section__footer">
            <button class="btn btn--primary" @click="saveProfile">
              <Loader2 v-if="saving" :size="15" class="spin" />
              <Check v-else-if="saved === 'profile'" :size="15" />
              {{ saved === 'profile' ? 'Saved!' : 'Save Changes' }}
            </button>
          </div>

          <!-- Danger Zone -->
          <div class="danger-zone">
            <div class="danger-zone__header">
              <h4>Danger Zone</h4>
              <p>These actions are irreversible. Please proceed with caution.</p>
            </div>
            <div class="danger-zone__actions">
              <div class="danger-row">
                <div>
                  <p class="danger-row__title">Delete All History</p>
                  <p class="danger-row__desc">Permanently remove all job history and subtitle files</p>
                </div>
                <button class="btn btn--danger btn--sm" :disabled="deletingHistory" @click="deleteHistory">
                  <Loader2 v-if="deletingHistory" :size="14" class="spin" />
                  <Trash2 v-else :size="14" />
                  {{ deletingHistory ? 'Deleting…' : 'Delete History' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div v-if="activeSection === 'preferences'" class="settings-section">
          <div class="settings-section__header">
            <h3>Preferences</h3>
            <p>Customize your default subtitle settings and app appearance</p>
          </div>
          <div v-if="settingsLoading" class="settings-loading"><Loader2 :size="18" class="spin" /> Loading preferences…</div>
          <template v-else>
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label"><Globe2 :size="13" /> Default Language</label>
              <select v-model="prefs.defaultLang" class="form-select">
                <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">{{ l.name }}</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label"><AlignLeft :size="13" /> Default Format</label>
              <select v-model="prefs.defaultFormat" class="form-select">
                <option v-for="f in FORMATS" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
          </div>
          <div class="pref-toggles">
            <div v-for="(val, key) in settingToggles" :key="key" class="pref-toggle-row">
              <div class="pref-toggle-row__inner">
                <div class="pref-toggle-row__info">
                  <component :is="preferenceIcons[key as keyof typeof preferenceIcons] ?? Captions" :size="15" />
                  <div>
                    <p class="pref-toggle-row__label">{{ preferenceLabels[key as keyof typeof preferenceLabels] }}</p>
                    <p class="pref-toggle-row__desc">{{ preferenceDescriptions[key as keyof typeof preferenceDescriptions] }}</p>
                  </div>
                </div>
                <button class="toggle-btn" :class="{ 'toggle-btn--on': settingToggles[key as keyof typeof settingToggles] }"
                  @click="(settingToggles[key as keyof typeof settingToggles] as boolean) = !(settingToggles[key as keyof typeof settingToggles] as boolean)">
                  <span class="toggle-btn__thumb"></span>
                </button>
              </div>
            </div>
          </div>
          <div class="settings-section__footer">
            <button class="btn btn--primary" @click="savePrefs">
              <Loader2 v-if="saving" :size="15" class="spin" />
              <Check v-else-if="saved === 'prefs'" :size="15" />
              {{ saved === 'prefs' ? 'Saved!' : 'Save Preferences' }}
            </button>
          </div>
          </template>
        </div>

        <!-- API Keys -->
        <div v-if="activeSection === 'api'" class="settings-section">
          <div class="settings-section__header">
            <h3>API Keys</h3>
            <p>Manage your API keys for programmatic access</p>
          </div>
          <div class="coming-soon">
            <Key :size="22" />
            <p class="coming-soon__title">Coming soon</p>
            <p class="coming-soon__desc">API access is currently in private beta. Programmatic subtitle generation will be available here shortly.</p>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="activeSection === 'notifications'" class="settings-section">
          <div class="settings-section__header">
            <h3>Notifications</h3>
            <p>Choose what updates you want to receive</p>
          </div>
          <div v-if="settingsLoading" class="settings-loading"><Loader2 :size="18" class="spin" /> Loading notifications…</div>
          <template v-else>
          <div class="notif-list">
            <div v-for="(val, key) in notifs" :key="key" class="notif-row">
              <div class="notif-row__info">
                <p class="notif-row__label">{{ {
                  jobComplete: 'Job Completed',
                  jobFailed: 'Job Failed',
                  weeklyReport: 'Weekly Report',
                  productUpdates: 'Product Updates',
                  marketing: 'Marketing Emails',
                }[key] }}</p>
                <p class="notif-row__desc">{{ {
                  jobComplete: 'Notify when a subtitle job finishes successfully',
                  jobFailed: 'Notify when a subtitle job encounters an error',
                  weeklyReport: 'Receive a weekly summary of your usage',
                  productUpdates: 'Learn about new features and improvements',
                  marketing: 'Receive promotional offers and newsletters',
                }[key] }}</p>
              </div>
              <button class="toggle-btn" :class="{ 'toggle-btn--on': notifs[key as keyof typeof notifs] }"
                @click="notifs[key as keyof typeof notifs] = !notifs[key as keyof typeof notifs]">
                <span class="toggle-btn__thumb"></span>
              </button>
            </div>
          </div>
          <div class="settings-section__footer">
            <button class="btn btn--primary" @click="saveNotifs">
              <Loader2 v-if="saving" :size="15" class="spin" />
              <Check v-else-if="saved === 'notifs'" :size="15" />
              {{ saved === 'notifs' ? 'Saved!' : 'Save Preferences' }}
            </button>
          </div>
          </template>
        </div>

        <!-- Billing -->
        <div v-if="activeSection === 'billing'" class="settings-section">
          <div class="settings-section__header">
            <h3>Billing & Plan</h3>
            <p>Manage your subscription and payment methods</p>
          </div>
          <div class="coming-soon">
            <CreditCard :size="22" />
            <p class="coming-soon__title">Coming soon</p>
            <p class="coming-soon__desc">Payments and plan management are not available yet. You can continue using the app for free.</p>
          </div>
        </div>

        <!-- Security -->
        <div v-if="activeSection === 'security'" class="settings-section">
          <div class="settings-section__header">
            <h3>Security</h3>
            <p>Protect your account with a strong password and two-factor authentication</p>
          </div>

          <div v-if="isOAuth" class="oauth-note">
            <Shield :size="18" />
            <div>
              <p class="oauth-note__title">Signed in with Google</p>
              <p class="oauth-note__desc">You signed in using your Google account, so a password is not used. Password changes are only available for accounts created with email.</p>
            </div>
          </div>

          <template v-else>
          <div class="form-grid">
            <div class="form-field" style="grid-column: 1/-1">
              <label class="form-label">Current Password</label>
              <input v-model="passwordForm.current" type="password" class="form-input" placeholder="••••••••" />
            </div>
            <div class="form-field">
              <label class="form-label">New Password</label>
              <input v-model="passwordForm.next" type="password" class="form-input" placeholder="••••••••" />
            </div>
            <div class="form-field">
              <label class="form-label">Confirm New Password</label>
              <input v-model="passwordForm.confirm" type="password" class="form-input" placeholder="••••••••" />
            </div>
          </div>
          <div class="security-2fa">
            <div class="security-2fa__info">
              <Shield :size="20" />
              <div>
                <p class="security-2fa__title">Two-Factor Authentication</p>
                <p class="security-2fa__desc">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button class="btn btn--primary btn--sm" disabled>Coming soon</button>
          </div>
          <div class="settings-section__footer">
            <button class="btn btn--primary" :disabled="changingPassword" @click="submitPassword">
              <Loader2 v-if="changingPassword" :size="15" class="spin" />
              {{ changingPassword ? 'Updating…' : 'Update Password' }}
            </button>
          </div>
          </template>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
.settings-page { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

/* Header */
.page-header { display: flex; align-items: center; gap: 1rem; }
.page-header__icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; box-shadow: 0 4px 20px rgba(16,185,129,0.3); flex-shrink: 0;
}
.page-header__title { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin: 0 0 2px; }
.page-header__sub { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }

/* Layout */
.settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 1.25rem; align-items: start; }

/* Settings Nav */
.settings-nav {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 0.5rem; display: flex; flex-direction: column; gap: 2px;
  position: sticky; top: 80px;
}
.settings-nav__item {
  display: flex; align-items: center; gap: 10px; padding: 0.65rem 0.75rem;
  border-radius: 8px; cursor: pointer; color: var(--text-secondary);
  font-size: 0.85rem; font-weight: 500; background: transparent; border: none;
  width: 100%; text-align: left; transition: all 0.2s;
}
.settings-nav__item:hover { background: var(--hover-color); color: var(--text-primary); }
.settings-nav__item--active { background: var(--active-color); color: var(--primary-color); }
.settings-nav__arrow { margin-left: auto; opacity: 0.4; }

/* Content */
.settings-content { display: flex; flex-direction: column; gap: 1.25rem; }
.settings-section {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;
}
.settings-section__header h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
.settings-section__header p { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
.settings-section__footer { display: flex; padding-top: 0.5rem; border-top: 1px solid var(--border-color); margin-top: 0.25rem; }

/* Avatar */
.avatar-upload { display: flex; align-items: center; gap: 1rem; }
.avatar-upload__preview {
  width: 68px; height: 68px; border-radius: 18px;
  background: var(--team-gradient); display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; font-weight: 800; color: #fff; flex-shrink: 0;
  overflow: hidden;
}
.avatar-upload__preview img { width: 100%; height: 100%; object-fit: cover; }
.avatar-upload__hint { font-size: 0.72rem; color: var(--text-muted); margin: 4px 0 0; }

/* Loading + states */
.settings-loading { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0; }
.coming-soon {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 2.5rem 1.5rem; text-align: center; color: var(--text-muted);
  background: var(--card-color); border: 1px dashed var(--border-light); border-radius: 12px;
}
.coming-soon__title { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0; }
.coming-soon__desc { font-size: 0.78rem; color: var(--text-secondary); margin: 0; max-width: 420px; line-height: 1.5; }

/* OAuth note */
.oauth-note { display: flex; align-items: flex-start; gap: 10px; color: #a78bfa; background: var(--card-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem 1.25rem; }
.oauth-note__title { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin: 0 0 3px; }
.oauth-note__desc { font-size: 0.75rem; color: var(--text-muted); margin: 0; line-height: 1.45; }

.spin { animation: settings-spin 0.9s linear infinite; }
@keyframes settings-spin { to { transform: rotate(360deg); } }

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted);
}
.form-input, .form-select {
  background: var(--card-color); border: 1px solid var(--border-color);
  border-radius: 9px; padding: 0.6rem 0.85rem;
  font-size: 0.875rem; color: var(--text-primary); outline: none;
  transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
}
.form-input:focus, .form-select:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
.form-input::placeholder { color: var(--text-muted); }

/* Pref Toggles */
.pref-toggles { display: flex; flex-direction: column; gap: 0; }
.pref-toggle-row__inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.85rem 0; border-bottom: 1px solid var(--border-color);
}
.pref-toggle-row:last-child .pref-toggle-row__inner { border-bottom: none; }
.pref-toggle-row__info { display: flex; align-items: flex-start; gap: 10px; color: var(--text-muted); }
.pref-toggle-row__label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.pref-toggle-row__desc { font-size: 0.72rem; color: var(--text-muted); margin: 0; }

/* API Keys */
.api-keys { display: flex; flex-direction: column; gap: 0.75rem; }
.api-key-card { background: var(--card-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; }
.api-key-card__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem; }
.api-key-card__name { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin: 0 0 3px; }
.api-key-card__created { font-size: 0.72rem; color: var(--text-muted); margin: 0; }
.api-key-card__badge { background: rgba(16,185,129,0.12); color: #10b981; border-radius: 20px; padding: 2px 10px; font-size: 0.68rem; font-weight: 700; }
.api-key-card__key { display: flex; align-items: center; gap: 10px; background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem 0.75rem; margin-bottom: 0.75rem; }
.api-key-card__key code { flex: 1; font-size: 0.82rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
.api-key-card__footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); }

/* Notif List */
.notif-list { display: flex; flex-direction: column; }
.notif-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.9rem 0; border-bottom: 1px solid var(--border-color); }
.notif-row:last-child { border-bottom: none; }
.notif-row__label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.notif-row__desc { font-size: 0.72rem; color: var(--text-muted); margin: 0; }

/* Plan Card */
.plan-card { background: var(--card-color); border: 1px solid rgba(139,92,246,0.3); border-radius: 14px; padding: 1.5rem; }
.plan-card__badge { display: inline-flex; align-items: center; gap: 5px; background: var(--team-color-light); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.3); border-radius: 20px; padding: 3px 12px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem; }
.plan-card__price { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0 0 6px; }
.plan-card__price span { font-size: 1rem; color: var(--text-muted); font-weight: 400; }
.plan-card__desc { font-size: 0.82rem; color: var(--text-secondary); margin: 0 0 1.25rem; }
.plan-card__usage { display: flex; flex-direction: column; gap: 6px; margin-bottom: 0.85rem; }
.plan-card__usage-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); }
.plan-card__usage-bar-track { height: 4px; background: var(--secondary-color); border-radius: 4px; margin-bottom: 1rem; overflow: hidden; }
.plan-card__usage-bar { height: 100%; background: var(--team-gradient); border-radius: 4px; }
.plan-card__footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 1rem; }

/* Security */
.security-2fa {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  background: var(--card-color); border: 1px solid var(--border-color);
  border-radius: 12px; padding: 1rem 1.25rem;
}
.security-2fa__info { display: flex; align-items: flex-start; gap: 12px; color: var(--primary-color); }
.security-2fa__title { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin: 0 0 3px; }
.security-2fa__desc { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

/* Danger Zone */
.danger-zone { border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; overflow: hidden; }
.danger-zone__header { padding: 1rem 1.25rem; background: rgba(239,68,68,0.05); border-bottom: 1px solid rgba(239,68,68,0.15); }
.danger-zone__header h4 { font-size: 0.9rem; font-weight: 700; color: #ef4444; margin: 0 0 3px; }
.danger-zone__header p { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
.danger-zone__actions { padding: 0.5rem 0; }
.danger-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(239,68,68,0.1); }
.danger-row:last-child { border-bottom: none; }
.danger-row__title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.danger-row__desc { font-size: 0.72rem; color: var(--text-muted); margin: 0; }

/* Toggle */
.toggle-btn { width: 42px; height: 23px; background: var(--card-color); border: 1px solid var(--border-color); border-radius: 20px; cursor: pointer; padding: 2px; transition: background 0.25s, border-color 0.25s; flex-shrink: 0; }
.toggle-btn--on { background: var(--primary-color); border-color: var(--primary-color); }
.toggle-btn__thumb { display: block; width: 17px; height: 17px; background: #fff; border-radius: 50%; transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.4); }
.toggle-btn--on .toggle-btn__thumb { transform: translateX(19px); }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 0.55rem 1.1rem; border: none; font-family: inherit; }
.btn--primary { background: var(--team-gradient); color: #fff; box-shadow: 0 4px 12px rgba(139,92,246,0.35); }
.btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(139,92,246,0.5); }
.btn--ghost { background: var(--card-color); color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn--ghost:hover { background: var(--hover-color); color: var(--text-primary); border-color: var(--border-light); }
.btn--danger { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
.btn--danger:hover { background: rgba(239,68,68,0.2); }
.btn--sm { font-size: 0.78rem; padding: 0.35rem 0.85rem; }
.btn--xs { font-size: 0.72rem; padding: 0.25rem 0.65rem; }

@media (max-width: 900px) {
  .settings-layout { grid-template-columns: 1fr; }
  .settings-nav { position: static; flex-direction: row; flex-wrap: wrap; }
}

@media (max-width: 760px) {
  .settings-page {
    padding: 1rem;
    gap: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .settings-section {
    padding: 1.1rem;
  }

  .settings-section__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-section__footer .btn {
    justify-content: center;
    width: 100%;
  }

  .danger-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .danger-row .btn {
    width: 100%;
    justify-content: center;
  }

  .security-2fa {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-upload {
    align-items: flex-start;
    flex-direction: column;
  }

  .plan-card__footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .plan-card__footer .btn {
    width: 100%;
    justify-content: center;
  }

  .api-key-card__key {
    flex-wrap: wrap;
  }

  .api-key-card__key code {
    flex: 1 1 100%;
    overflow-wrap: break-word;
  }

  .api-key-card__footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 520px) {
  .settings-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .settings-nav__item {
    white-space: nowrap;
    flex-shrink: 0;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, CheckCircle2, Mail, ShieldCheck, UserRound } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const user = computed(() => authStore.user)
const initials = computed(() => {
  const name = user.value?.username || user.value?.email || 'User'
  return name.slice(0, 1).toUpperCase()
})

const joinedDate = computed(() => {
  if (!user.value?.createdAt) return 'Account date unavailable'

  const date = new Date(user.value.createdAt)
  if (Number.isNaN(date.getTime())) return 'Account date unavailable'

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})
</script>

<template>
  <div class="profile-page">
    <header class="profile-page__header">
      <div>
        <p class="profile-page__eyebrow">Account</p>
        <h2 class="profile-page__title">Your profile</h2>
        <p class="profile-page__subtitle">Manage your account details and workspace identity.</p>
      </div>
      <div class="profile-page__status"><CheckCircle2 :size="15" /> Active account</div>
    </header>

    <div class="profile-layout">
      <section class="profile-card profile-card--identity">
        <div class="profile-avatar">{{ initials }}</div>
        <h3>{{ user?.username || 'Unnamed user' }}</h3>
        <p>{{ user?.email || 'No email address' }}</p>
        <span class="profile-role">{{ user?.role || 'Member' }}</span>
      </section>

      <section class="profile-card profile-card--details">
        <div class="profile-card__heading">
          <div>
            <p class="profile-card__eyebrow">Personal information</p>
            <h3>Account details</h3>
          </div>
          <UserRound :size="20" />
        </div>

        <div class="profile-details">
          <div class="profile-detail">
            <span class="profile-detail__label"><UserRound :size="15" /> Username</span>
            <strong>{{ user?.username || 'Not set' }}</strong>
          </div>
          <div class="profile-detail">
            <span class="profile-detail__label"><Mail :size="15" /> Email address</span>
            <strong>{{ user?.email || 'Not available' }}</strong>
          </div>
          <div class="profile-detail">
            <span class="profile-detail__label"><ShieldCheck :size="15" /> Role</span>
            <strong>{{ user?.role || 'Member' }}</strong>
          </div>
          <div class="profile-detail">
            <span class="profile-detail__label"><CalendarDays :size="15" /> Member since</span>
            <strong>{{ joinedDate }}</strong>
          </div>
        </div>
      </section>
    </div>

    <section class="profile-card profile-card--notice">
      <div class="profile-notice__icon"><ShieldCheck :size="20" /></div>
      <div>
        <h3>Your account is protected</h3>
        <p>Your session is secured with authenticated access. Account and security settings are available from the Settings page.</p>
      </div>
      <router-link class="profile-notice__link" to="/settings">Open settings</router-link>
    </section>
  </div>
</template>

<style scoped>
.profile-page { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.5rem; }
.profile-page__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.profile-page__eyebrow, .profile-card__eyebrow { margin: 0 0 0.35rem; color: #06b6d4; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.profile-page__title { margin: 0; color: var(--text-primary); font-size: 1.6rem; font-weight: 800; }
.profile-page__subtitle { margin: 0.35rem 0 0; color: var(--text-secondary); font-size: 0.85rem; }
.profile-page__status { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.7rem; color: #10b981; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.22); border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.profile-layout { display: grid; grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.7fr); gap: 1.25rem; }
.profile-card { background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 14px; }
.profile-card--identity { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 285px; padding: 1.5rem; text-align: center; }
.profile-avatar { display: grid; place-items: center; width: 82px; height: 82px; margin-bottom: 1rem; color: #fff; background: var(--team-gradient); border-radius: 24px; box-shadow: 0 12px 28px rgba(139, 92, 246, 0.25); font-size: 2rem; font-weight: 800; }
.profile-card--identity h3 { margin: 0; color: var(--text-primary); font-size: 1.15rem; }
.profile-card--identity p { margin: 0.4rem 0 0.85rem; color: var(--text-secondary); font-size: 0.8rem; word-break: break-word; }
.profile-role { padding: 0.35rem 0.7rem; color: #a78bfa; background: rgba(139, 92, 246, 0.12); border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: capitalize; }
.profile-card--details { padding: 1.4rem; }
.profile-card__heading { display: flex; align-items: flex-start; justify-content: space-between; color: #06b6d4; }
.profile-card__heading h3 { margin: 0; color: var(--text-primary); font-size: 1.05rem; }
.profile-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin-top: 1.25rem; }
.profile-detail { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; background: var(--card-color); border: 1px solid var(--border-color); border-radius: 10px; }
.profile-detail__label { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--text-muted); font-size: 0.72rem; }
.profile-detail strong { overflow: hidden; color: var(--text-primary); font-size: 0.85rem; text-overflow: ellipsis; white-space: nowrap; }
.profile-card--notice { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.profile-notice__icon { display: grid; place-items: center; width: 38px; height: 38px; color: #10b981; background: rgba(16, 185, 129, 0.12); border-radius: 10px; flex-shrink: 0; }
.profile-card--notice h3 { margin: 0; color: var(--text-primary); font-size: 0.85rem; }
.profile-card--notice p { margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.75rem; line-height: 1.45; }
.profile-notice__link { margin-left: auto; color: #06b6d4; font-size: 0.75rem; font-weight: 700; text-decoration: none; white-space: nowrap; }
.profile-notice__link:hover { color: #67e8f9; }
@media (max-width: 700px) {
  .profile-page { padding: 1rem; }
  .profile-page__header { flex-direction: column; }
  .profile-layout { grid-template-columns: 1fr; }
  .profile-details { grid-template-columns: 1fr; }
  .profile-card--notice { align-items: flex-start; flex-wrap: wrap; }
  .profile-notice__link { margin-left: 3rem; }
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Bell, ChevronDown, Sun, Moon, Sparkles } from 'lucide-vue-next'
import {useAuthStore} from "../../stores/authStore.ts"


const route = useRoute()
const searchQuery = ref('')
const notifCount = ref(3)
const authstore=useAuthStore()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/': 'Dashboard',
    '/generate-subtitle': 'Generate Subtitle',
    '/library': 'Video Library',
    '/history': 'History',
    '/settings': 'Settings',
    '/help': 'Help & Support',
  }
  return map[route.path] ?? 'Dashboard'
})

const breadcrumbs = computed(() => {
  if (route.path === '/') return ['Home']
  return ['Home', pageTitle.value]
})
</script>

<template>
  <header class="navbar">
    <!-- Left: Page Title -->
    <div class="navbar__left">
      <div class="navbar__title-wrap">
        <nav class="navbar__breadcrumb">
          <span
            v-for="(crumb, i) in breadcrumbs"
            :key="crumb"
            class="navbar__breadcrumb-item"
            :class="{ 'navbar__breadcrumb-item--active': i === breadcrumbs.length - 1 }"
          >
            {{ crumb }}
            <span v-if="i < breadcrumbs.length - 1" class="navbar__breadcrumb-sep">/</span>
          </span>
        </nav>
        <h1 class="navbar__title">{{ pageTitle }}</h1>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="navbar__right">
      <!-- Search -->
      <div class="navbar__search">
        <Search :size="15" class="navbar__search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search anything..."
          class="navbar__search-input"
        />
        <kbd class="navbar__search-kbd">⌘K</kbd>
      </div>

      <!-- AI Badge -->
      <div class="navbar__ai-badge">
        <Sparkles :size="13" />
        <span>AI Active</span>
      </div>

      <!-- Notifications -->
      <button class="navbar__icon-btn" title="Notifications">
        <Bell :size="18" />
        <span v-if="notifCount" class="navbar__notif-badge">{{ notifCount }}</span>
      </button>

      <!-- Avatar -->
      <button class="navbar__avatar-btn">
        <div class="navbar__avatar">
          <span>{{authstore.username.slice(0,1)}}</span>
        </div>
        <div class="navbar__avatar-info">
          <span class="navbar__avatar-name">{{authstore.username}}</span>
          <span class="navbar__avatar-role">Pro Plan</span>
        </div>
        <ChevronDown :size="14" class="navbar__avatar-chevron" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(24, 25, 36, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem 0 calc(240px + 1.5rem);
  z-index: 99;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.navbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar__breadcrumb-item {
  font-size: 0.7rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar__breadcrumb-item--active {
  color: var(--primary-color);
}

.navbar__breadcrumb-sep {
  color: var(--text-muted);
}

.navbar__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

/* Right */
.navbar__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Search */
.navbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 200px;
}

.navbar__search:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.navbar__search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.navbar__search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 0.82rem;
  width: 100%;
}

.navbar__search-input::placeholder {
  color: var(--text-muted);
}

.navbar__search-kbd {
  font-size: 0.62rem;
  color: var(--text-muted);
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 1px 5px;
  font-family: inherit;
  white-space: nowrap;
}

/* AI Badge */
.navbar__ai-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--team-color-light);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 0.3rem 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #c4b5fd;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
  50% { box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15); }
}

/* Icon button */
.navbar__icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.navbar__icon-btn:hover {
  background: var(--hover-color);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.navbar__notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: var(--danger-color);
  border-radius: 50%;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--secondary-color);
}

/* Avatar */
.navbar__avatar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.35rem 0.65rem 0.35rem 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
}

.navbar__avatar-btn:hover {
  background: var(--hover-color);
  border-color: var(--border-light);
}

.navbar__avatar {
  width: 28px;
  height: 28px;
  background: var(--team-gradient);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
}

.navbar__avatar-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.navbar__avatar-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.navbar__avatar-role {
  font-size: 0.62rem;
  color: #a78bfa;
  line-height: 1;
  margin-top: 2px;
}

.navbar__avatar-chevron {
  color: var(--text-muted);
}
</style>

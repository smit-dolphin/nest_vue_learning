<script setup lang="ts">
import {
  LayoutDashboard,
  Captions,
  FileVideo,
  History,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  LogOut,
} from 'lucide-vue-next'

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logoutMe } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Parent controls the collapsed state
const props = defineProps<{
  collapsed: boolean
  mobileOpen?: boolean
}>()

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'close-mobile': []
}>()

const isMobile = ref(false)
let mediaQuery: MediaQueryList | null = null

function handleMediaChange(event: MediaQueryListEvent) {
  isMobile.value = event.matches
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 900px)')
  isMobile.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleMediaChange)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleMediaChange)
})

const effectiveCollapsed = computed(() => props.collapsed && !isMobile.value)

const navItems = [
  {
    group: 'Main',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        to: '/',
      },
      {
        label: 'Generate Subtitle',
        icon: Captions,
        to: '/generate-subtitle',
      },
      {
        label: 'Video Library',
        icon: FileVideo,
        to: '/library',
      },
      {
        label: 'History',
        icon: History,
        to: '/history',
      },
    ],
  },

  {
    group: 'Account',
    items: [
      {
        label: 'Settings',
        icon: Settings,
        to: '/settings',
      },
      {
        label: 'Help',
        icon: HelpCircle,
        to: '/help',
      },
    ],
  },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path.startsWith(path)
}

const toggleCollapsed = () => {
  emit('update:collapsed', !props.collapsed)
}

const logout = async () => {
  try {
    await logoutMe()
  } finally {
    authStore.clearAuth()
    router.replace('/login')
  }
}
</script>

<template>
  <aside
    class="sidebar"
    :class="{
      'sidebar--collapsed': effectiveCollapsed,
      'sidebar--mobile-open': props.mobileOpen,
    }"
  >
    <!-- Logo -->
    <div class="sidebar__logo" :class="{ 'sidebar__logo--collapsed': effectiveCollapsed }">
      <div class="sidebar__logo-icon">
        <Sparkles :size="20" />
      </div>

      <Transition name="fade">
        <span
          v-if="!effectiveCollapsed"
          class="sidebar__logo-text"
        >
          Sub<span class="sidebar__logo-accent">AI</span>
        </span>
      </Transition>

      <button
        class="sidebar__toggle"
        :title="effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-label="effectiveCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        type="button"
        @click="toggleCollapsed"
      >
        <ChevronLeft v-if="!effectiveCollapsed" :size="16" />
        <ChevronRight v-else :size="16" />
      </button>
    </div>

    <!-- Upgrade Banner -->
    <Transition name="fade">
      <div
        v-if="!effectiveCollapsed"
        class="sidebar__upgrade"
      >
        <div class="sidebar__upgrade-icon">
          <Zap :size="14" />
        </div>

        <div class="sidebar__upgrade-content">
          <p class="sidebar__upgrade-title">
            Upgrade to Pro
          </p>

          <p class="sidebar__upgrade-desc">
            Unlimited subtitles
          </p>
        </div>
      </div>
    </Transition>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <div
        v-for="group in navItems"
        :key="group.group"
        class="sidebar__nav-group"
      >
        <!-- Group title -->
        <Transition name="fade">
          <p
            v-if="!effectiveCollapsed"
            class="sidebar__group-label"
          >
            {{ group.group }}
          </p>
        </Transition>

        <!-- Navigation items -->
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="sidebar__nav-item"
          :class="{
            'sidebar__nav-item--active': isActive(item.to),
          }"
          :title="effectiveCollapsed ? item.label : ''"
          @click="emit('close-mobile')"
        >
          <!-- Icon -->
          <span class="sidebar__nav-icon">
            <component
              :is="item.icon"
              :size="18"
            />
          </span>

          <!-- Label -->
          <Transition name="fade">
            <span
              v-if="!effectiveCollapsed"
              class="sidebar__nav-label"
            >
              {{ item.label }}
            </span>
          </Transition>

          <!-- Active dot -->
          <span
            v-if="
              !effectiveCollapsed &&
              isActive(item.to)
            "
            class="sidebar__nav-dot"
          />
        </router-link>
      </div>
    </nav>

    <!-- Logout -->
    <button
      class="sidebar__logout"
      :title="effectiveCollapsed ? 'Log out' : ''"
      type="button"
      @click="logout"
    >
      <LogOut :size="17" />
      <Transition name="fade">
        <span v-if="!effectiveCollapsed">Log out</span>
      </Transition>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;

  width: 240px;
  height: 100vh;

  background: var(--secondary-color);
  border-right: 1px solid var(--border-color);

  display: flex;
  flex-direction: column;

  padding: 0 0 1rem;

  transition:
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  z-index: 100;

  overflow: hidden;
}

.sidebar--collapsed {
  width: 68px;
}

/* =========================
   Logo
========================= */

.sidebar__logo {
  position: relative;
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 1.25rem 1rem;

  border-bottom: 1px solid var(--border-color);

  min-height: 64px;

  flex-shrink: 0;
}

.sidebar__logo--collapsed {
  justify-content: center;
  padding-inline: 0;
}

.sidebar__logo-icon {
  width: 36px;
  height: 36px;

  background: var(--team-gradient);

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff;

  flex-shrink: 0;

  box-shadow: var(--shadow-glow);
}

.sidebar__logo-text {
  font-size: 1.25rem;
  font-weight: 800;

  color: var(--text-primary);

  letter-spacing: -0.5px;

  white-space: nowrap;
}

.sidebar__logo-accent {
  background: var(--team-gradient);

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  background-clip: text;
}

/* =========================
   Upgrade
========================= */

.sidebar__upgrade {
  margin: 0.75rem 0.75rem 0;

  background: var(--team-color-light);

  border: 1px solid rgba(139, 92, 246, 0.25);

  border-radius: 10px;

  padding: 0.65rem 0.75rem;

  display: flex;
  align-items: center;

  gap: 8px;

  cursor: pointer;

  transition: background 0.2s;
}

.sidebar__upgrade:hover {
  background: rgba(139, 92, 246, 0.22);
}

.sidebar__upgrade-icon {
  color: #a78bfa;

  flex-shrink: 0;
}

.sidebar__upgrade-title {
  font-size: 0.75rem;
  font-weight: 600;

  color: #c4b5fd;

  margin: 0;
}

.sidebar__upgrade-desc {
  font-size: 0.65rem;

  color: var(--text-muted);

  margin: 0;
}

/* =========================
   Navigation
========================= */

.sidebar__nav {
  flex: 1;

  padding: 0.75rem 0.5rem;

  display: flex;
  flex-direction: column;

  gap: 1rem;

  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar__nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar__nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar__nav::-webkit-scrollbar-thumb {
  background: var(--border-color);

  border-radius: 4px;
}

.sidebar__nav-group {
  display: flex;
  flex-direction: column;

  gap: 2px;
}

.sidebar__group-label {
  font-size: 0.6rem;
  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 1px;

  color: var(--text-muted);

  padding: 0 0.5rem 0.35rem;

  margin: 0;

  white-space: nowrap;
}

/* =========================
   Nav Item
========================= */

.sidebar__nav-item {
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 0.6rem 0.65rem;

  border-radius: 8px;

  cursor: pointer;

  transition: all 0.2s ease;

  text-decoration: none;

  color: var(--text-secondary);

  position: relative;

  white-space: nowrap;
}

.sidebar__nav-item:hover {
  background: var(--hover-color);

  color: var(--text-primary);
}

.sidebar__nav-item--active {
  background: var(--active-color);

  color: var(--primary-color);
}

.sidebar__nav-item--active
.sidebar__nav-icon {
  color: var(--primary-color);
}

.sidebar__nav-icon {
  display: flex;
  align-items: center;

  justify-content: center;

  flex-shrink: 0;
}

.sidebar__nav-label {
  font-size: 0.85rem;

  font-weight: 500;
}

.sidebar__nav-dot {
  width: 6px;
  height: 6px;

  background: var(--primary-color);

  border-radius: 50%;

  margin-left: auto;

  box-shadow:
    0 0 6px var(--primary-color);
}

/* =========================
   Toggle
========================= */

.sidebar__toggle {
  margin-left: auto;
  width: 30px;
  height: 30px;
  padding: 0;

  background: var(--card-color);

  border: 1px solid var(--border-color);

  border-radius: 8px;

  color: var(--text-secondary);

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.2s;

  flex-shrink: 0;
}

.sidebar__logo--collapsed .sidebar__toggle {
  position: absolute;
  inset: 50% auto auto 50%;
  margin: 0;
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity 0.2s, background 0.2s, color 0.2s;
}

.sidebar__logo--collapsed:hover .sidebar__logo-icon {
  opacity: 0.28;
}

.sidebar__logo--collapsed:hover .sidebar__toggle,
.sidebar__logo--collapsed .sidebar__toggle:focus-visible {
  opacity: 1;
}

.sidebar__toggle:hover {
  background: var(--hover-color);

  color: var(--text-primary);

  border-color: var(--border-light);
}

.sidebar__logout {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  margin: 0.75rem 0.5rem 0;
  padding: 0.6rem 0.65rem;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  text-align: left;
  white-space: nowrap;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.sidebar__logout:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.sidebar--collapsed .sidebar__logout {
  justify-content: center;
  margin-inline: 0.75rem;
  padding-inline: 0;
}

/* =========================
   Transitions
========================= */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =========================
   Mobile drawer
========================= */

@media (max-width: 900px) {
  .sidebar {
    z-index: 130;
    width: min(300px, 86vw);
    transform: translateX(-100%);
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s ease;
    box-shadow: none;
  }

  .sidebar--mobile-open {
    transform: translateX(0);
    box-shadow: var(--shadow-md);
  }

  .sidebar--collapsed {
    width: min(300px, 86vw);
  }

  .sidebar__toggle {
    display: none;
  }

  .sidebar__logo--collapsed {
    justify-content: flex-start;
    padding-inline: 1rem;
  }

  .sidebar--collapsed .sidebar__logout {
    justify-content: flex-start;
    margin-inline: 0.5rem;
    padding-inline: 0.65rem;
  }
}
</style>
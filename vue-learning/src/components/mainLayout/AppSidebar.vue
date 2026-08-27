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
} from 'lucide-vue-next'

import { useRoute } from 'vue-router'

const route = useRoute()

// Parent controls the collapsed state
const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

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
</script>

<template>
  <aside
    class="sidebar"
    :class="{ 'sidebar--collapsed': props.collapsed }"
  >
    <!-- Logo -->
    <div class="sidebar__logo">
      <div class="sidebar__logo-icon">
        <Sparkles :size="20" />
      </div>

      <Transition name="fade">
        <span
          v-if="!props.collapsed"
          class="sidebar__logo-text"
        >
          Sub<span class="sidebar__logo-accent">AI</span>
        </span>
      </Transition>
    </div>

    <!-- Upgrade Banner -->
    <Transition name="fade">
      <div
        v-if="!props.collapsed"
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
            v-if="!props.collapsed"
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
          :title="props.collapsed ? item.label : ''"
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
              v-if="!props.collapsed"
              class="sidebar__nav-label"
            >
              {{ item.label }}
            </span>
          </Transition>

          <!-- Active dot -->
          <span
            v-if="
              !props.collapsed &&
              isActive(item.to)
            "
            class="sidebar__nav-dot"
          />
        </router-link>
      </div>
    </nav>

    <!-- Collapse Toggle -->
    <button
      class="sidebar__toggle"
      :title="
        props.collapsed
          ? 'Expand'
          : 'Collapse'
      "
      @click="toggleCollapsed"
    >
      <ChevronLeft
        v-if="!props.collapsed"
        :size="16"
      />

      <ChevronRight
        v-else
        :size="16"
      />
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
  display: flex;
  align-items: center;

  gap: 10px;

  padding: 1.25rem 1rem;

  border-bottom: 1px solid var(--border-color);

  min-height: 64px;

  flex-shrink: 0;
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
  margin: 0 0.75rem;

  padding: 0.5rem;

  background: var(--card-color);

  border: 1px solid var(--border-color);

  border-radius: 8px;

  color: var(--text-secondary);

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.2s;

  align-self: flex-start;

  flex-shrink: 0;
}

.sidebar--collapsed
.sidebar__toggle {
  align-self: center;

  margin: 0;
}

.sidebar__toggle:hover {
  background: var(--hover-color);

  color: var(--text-primary);

  border-color: var(--border-light);
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
</style>
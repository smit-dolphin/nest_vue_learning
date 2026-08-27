<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import {
  Search,
  Bell,
  Sparkles,
} from 'lucide-vue-next'

import ProfileTab from '../mainLayout/navbar/ProfileTab.vue'

const props = defineProps<{
  collapsed?: boolean
}>()

const route = useRoute()

const searchQuery = ref('')
const notifCount = ref(3)

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
  if (route.path === '/') {
    return ['Home']
  }

  return [
    'Home',
    pageTitle.value,
  ]
})
</script>

<template>
  <header
    class="navbar"
    :style="{ left: props.collapsed ? '68px' : '240px' }"
  >

    <!-- LEFT -->
    <div class="navbar__left">

      <div class="navbar__title-wrap">

        <nav class="navbar__breadcrumb">

          <span
            v-for="(crumb, i) in breadcrumbs"
            :key="`${crumb}-${i}`"
            class="navbar__breadcrumb-item"
            :class="{
              'navbar__breadcrumb-item--active':
                i === breadcrumbs.length - 1,
            }"
          >
            {{ crumb }}

            <span
              v-if="i < breadcrumbs.length - 1"
              class="navbar__breadcrumb-sep"
            >
              /
            </span>
          </span>

        </nav>

        <h1 class="navbar__title">
          {{ pageTitle }}
        </h1>

      </div>

    </div>


    <!-- RIGHT -->
    <div class="navbar__right">

      <!-- Search -->
      <div class="navbar__search">

        <Search
          :size="15"
          class="navbar__search-icon"
        />

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search anything..."
          class="navbar__search-input"
        />

        <kbd class="navbar__search-kbd">
          ⌘K
        </kbd>

      </div>


      <!-- AI -->
      <div class="navbar__ai-badge">

        <Sparkles :size="13" />

        <span>
          AI Active
        </span>

      </div>


      <!-- Notifications -->
      <button
        class="navbar__icon-btn"
        title="Notifications"
      >

        <Bell :size="18" />

        <span
          v-if="notifCount"
          class="navbar__notif-badge"
        >
          {{ notifCount }}
        </span>

      </button>


      <!-- Profile -->
      <ProfileTab />

    </div>

  </header>
</template>


<style scoped>

/* =========================================
   NAVBAR
========================================= */

.navbar {
  position: fixed;

  top: 0;

  /*
   * Take all remaining horizontal space
   */
  right: 0;

  height: 64px;

  background: rgba(24, 25, 36, 0.85);

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  border-bottom: 1px solid var(--border-color);

  display: flex;

  align-items: center;

  /*
   * Left section on left
   * Right section on right
   */
  justify-content: space-between;

  padding: 0 1.5rem;

  box-sizing: border-box;

  z-index: 99;

  transition:
    left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}


/* =========================================
   LEFT
========================================= */

.navbar__left {
  display: flex;

  align-items: center;

  gap: 1rem;

  /*
   * Prevent left side from pushing
   * everything outside the navbar.
   */
  min-width: 0;

  flex-shrink: 0;
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


/* =========================================
   RIGHT
========================================= */

.navbar__right {
  display: flex;

  align-items: center;

  gap: 0.75rem;

  /*
   * IMPORTANT:
   * Don't use width: 100%.
   */
  flex: 1;

  min-width: 0;

  /*
   * Keep everything pushed toward
   * the right side.
   */
  justify-content: flex-end;
}


/* =========================================
   SEARCH
========================================= */

.navbar__search {
  display: flex;

  align-items: center;

  gap: 8px;

  background: var(--card-color);

  border: 1px solid var(--border-color);

  border-radius: 10px;

  padding: 0.45rem 0.75rem;

  /*
   * Search can grow.
   */
  flex: 1;

  /*
   * But don't become ridiculously large.
   */
  max-width: 500px;

  min-width: 200px;

  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  box-sizing: border-box;
}


.navbar__search:focus-within {
  border-color: var(--border-focus);

  box-shadow:
    0 0 0 3px
    rgba(139, 92, 246, 0.15);
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

  min-width: 0;
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

  flex-shrink: 0;
}


/* =========================================
   AI BADGE
========================================= */

.navbar__ai-badge {
  display: flex;

  align-items: center;

  gap: 5px;

  background: var(--team-color-light);

  border: 1px solid
    rgba(139, 92, 246, 0.3);

  border-radius: 20px;

  padding: 0.3rem 0.75rem;

  font-size: 0.72rem;

  font-weight: 600;

  color: #c4b5fd;

  animation: pulse-glow 2s infinite;

  white-space: nowrap;

  flex-shrink: 0;
}


@keyframes pulse-glow {

  0%,
  100% {
    box-shadow:
      0 0 0 0
      rgba(139, 92, 246, 0);
  }

  50% {
    box-shadow:
      0 0 0 4px
      rgba(139, 92, 246, 0.15);
  }

}


/* =========================================
   NOTIFICATION
========================================= */

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

  flex-shrink: 0;
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


/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 900px) {

  .navbar__ai-badge {
    display: none;
  }

  .navbar__search {
    max-width: 350px;
  }

}


@media (max-width: 650px) {

  .navbar__search {
    display: none;
  }

}

</style>
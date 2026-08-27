<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { ChevronDown, ChevronUp, User, LogOut } from 'lucide-vue-next'
import { ref } from 'vue'
// import { useRoute } from 'vue-router'
import router from '@/router'
const authstore = useAuthStore()
import {logoutMe} from '@/services/authService.ts'

const isOpen = ref(false) 
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const logout = async  () => {
  // authstore.logout()
  await logoutMe()
  authstore.clearAuth()
  router.replace('/login')
}
</script>

<template>
  <div class="navbar__profile">
    <!-- Avatar Button -->
    <button
      class="navbar__avatar-btn"
      @click="toggleMenu"
    >
      <div class="navbar__avatar">
        <span>
          {{ authstore?.user?.username?.slice(0, 1) || '' }}
        </span>
      </div>

      <div class="navbar__avatar-info">
        <span class="navbar__avatar-name">
          {{ authstore?.user?.username }}
        </span>

        <span class="navbar__avatar-role">
          Pro Plan
        </span>
      </div>

      <ChevronDown
        v-if="!isOpen"
        :size="14"
        class="navbar__avatar-chevron"
      />

      <ChevronUp
        v-else
        :size="14"
        class="navbar__avatar-chevron"
      />
    </button>

    <!-- Dropdown -->
    <Transition name="profile-menu">
      <div
        v-if="isOpen"
        class="navbar__profile-menu"
      >
        <!-- User Info -->
        <div class="navbar__menu-user">
          <div class="navbar__menu-avatar">
            {{ authstore?.user?.username?.slice(0, 1) || '' }}
          </div>

          <div class="navbar__menu-user-info">
            <span class="navbar__menu-name">
              {{ authstore?.user?.username || '' }}
            </span>

            <span class="navbar__menu-email">
              {{ authstore?.user?.email || '' }}
            </span>
          </div>
        </div>

        <div class="navbar__menu-divider"></div>

        <!-- Profile -->
        <button class="navbar__menu-item">
          <User :size="16" />
          <span>Profile</span>
        </button>

        <!-- Logout -->
        <button
          class="navbar__menu-item navbar__menu-logout"
          @click="logout"
        >
          <LogOut :size="16" />
          <span>Logout</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.navbar__profile {
  position: relative;
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

/* Dropdown */
.navbar__profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 250px;
  padding: 8px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  z-index: 100;
}

/* User information */
.navbar__menu-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

.navbar__menu-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--team-gradient);
  border-radius: 9px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
}

.navbar__menu-user-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.navbar__menu-name {
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

.navbar__menu-email {
  color: var(--text-muted);
  font-size: 0.68rem;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Divider */
.navbar__menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 6px 4px;
}

/* Menu items */
.navbar__menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.navbar__menu-item:hover {
  background: var(--hover-color);
  color: var(--text-primary);
}

.navbar__menu-logout:hover {
  color: var(--danger-color);
}

/* Animation */
.profile-menu-enter-active,
.profile-menu-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.profile-menu-enter-from,
.profile-menu-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

import DashboardView from '@/views/DashboardView.vue'
import GenerateView from '@/views/GenerateView.vue'
import LibraryView from '@/views/LibraryView.vue'
import SubtitleFilesView from '@/views/SubtitleFilesView.vue'
import SubtitleEditorView from '@/views/SubtitleEditorView.vue'
import HistoryView from '@/views/HistoryView.vue'
import SettingsView from '@/views/SettingsView.vue'
import HelpView from '@/views/HelpView.vue'
import ProfileView from '@/views/ProfileView.vue'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import GoogleCallbackView from '@/views/GoogleCallbackView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import AdminLoginView from '@/views/AdminLoginView.vue'

import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'
import AdminVideosView from '@/views/admin/AdminVideosView.vue'
import AdminJobsView from '@/views/admin/AdminJobsView.vue'
import AdminSettingsView from '@/views/admin/AdminSettingsView.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLoginView,
      meta: { adminGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true },
    },
    {
      path: '/auth/google/callback',
      name: 'google-callback',
      component: GoogleCallbackView,
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: AdminDashboardView,
          meta: { title: 'Admin Dashboard', requiresAdmin: true },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: AdminUsersView,
          meta: { title: 'Users', requiresAdmin: true },
        },
        {
          path: 'videos',
          name: 'admin-videos',
          component: AdminVideosView,
          meta: { title: 'Videos', requiresAdmin: true },
        },
        {
          path: 'jobs',
          name: 'admin-jobs',
          component: AdminJobsView,
          meta: { title: 'Subtitle Jobs', requiresAdmin: true },
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: AdminSettingsView,
          meta: { title: 'System Settings', requiresAdmin: true },
        },
      ],
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
          meta: { title: 'Dashboard' },
        },
        {
          path: 'generate-subtitle',
          name: 'generate-subtitle',
          component: GenerateView,
          meta: { title: 'Generate Subtitle' },
        },
        {
          path: 'generate-subtitle/:videoId',
          name: 'generate-subtitle-video',
          component: GenerateView,
          meta: { title: 'Generate Subtitle' },
        },
        {
          path: 'library',
          name: 'library',
          component: LibraryView,
          meta: { title: 'Video Library' },
        },
        {
          path: 'library/subtitles/:videoId',
          name: 'subtitle-files',
          component: SubtitleFilesView,
          meta: { title: 'Subtitle Files' },
        },
        {
          path: 'library/subtitles/:videoId/edit/:subtitleId',
          name: 'subtitle-editor',
          component: SubtitleEditorView,
          meta: { title: 'Subtitle Editor' },
        },
        {
          path: 'history',
          name: 'history',
          component: HistoryView,
          meta: { title: 'History' },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
          meta: { title: 'Settings' },
        },
        {
          path: 'help',
          name: 'help',
          component: HelpView,
          meta: { title: 'Help & Support' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
          meta: { title: 'Profile' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated || authStore.user?.role !== 'ADMIN') {
      next({ name: 'admin-login' })
      return
    }
  }

  if (to.meta.adminGuest && authStore.isAuthenticated && authStore.user?.role === 'ADMIN') {
    next({ name: 'admin-dashboard' })
    return
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    if (authStore.user?.role === 'ADMIN') {
      next({ name: 'admin-dashboard' })
    } else {
      next({ name: 'dashboard' })
    }
    return
  }

  next()
})

export default router
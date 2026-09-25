import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'

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
import NotFoundView from '@/views/NotFoundView.vue'

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
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true },
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

export default router
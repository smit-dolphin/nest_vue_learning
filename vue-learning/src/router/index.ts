import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// Views
import HomeView from '../views/HomeView.vue'
import GenrateSubtitleView from '../views/GenrateSubtitleView.vue'
import VideoLibraryView from '../views/VideoLibraryView.vue'
import HistoryView from '../views/HistoryView.vue'
import SettingsView from '../views/SettingsView.vue'
import HelpView from '../views/HelpView.vue'

import LoginView from '../views/LoginView.vue'
import RegisterUser from '../views/RegisterUser.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/admin/register',
      name: 'register',
      component: RegisterUser,
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '/',
          name: 'home',
          component: HomeView,
        },
        {
          path: '/generate-subtitle',
          name: 'generate-subtitle',
          component: GenrateSubtitleView,
        },
        {
          path: '/library',
          name: 'library',
          component: VideoLibraryView,
        },
        {
          path: '/history',
          name: 'history',
          component: HistoryView,
        },
        {
          path: '/settings',
          name: 'settings',
          component: SettingsView,
        },
        {
          path: '/help',
          name: 'help',
          component: HelpView,
        },
      ],
    },
  ],
})

export default router

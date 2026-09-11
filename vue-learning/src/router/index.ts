import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// Views
import HomeView from '../views/HomeView.vue'
import GenrateSubtitleView from '../views/GenrateSubtitleView.vue'
import VideoLibraryView from '../views/VideoLibraryView.vue'
import SubtitleFilesView from '../views/SubtitleFilesView.vue'
import HistoryView from '../views/HistoryView.vue'
import SettingsView from '../views/SettingsView.vue'
import HelpView from '../views/HelpView.vue'
import ProfileView from '../views/ProfileView.vue'

import LoginView from '../views/LoginView.vue'
import RegisterUser from '../views/RegisterUser.vue'
import GoogleCallbackView from '../views/GoogleCallbackView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import JobProgressTest from '../views/JobProgressTest.vue'


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
      path: '/auth/google/callback',
      name: 'google-callback',
      component: GoogleCallbackView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
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
          path: '/generate-subtitle/:videoId',
          name: 'generate-subtitle-video',
          component: GenrateSubtitleView,
        },
        {
          path: '/library',
          name: 'library',
          component: VideoLibraryView,
        },
        {
          path: '/library/subtitles/:videoId',
          name: 'subtitle-files',
          component: SubtitleFilesView,
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
          path: '/profile',
          name: 'profile',
          component: ProfileView,
        },
        {
          path: '/help',
          name: 'help',
          component: HelpView,
        },
        {
          path: '/socket-test',
          name: 'socket-test',
          component: JobProgressTest,
        },
      ],
    },
  ],
})

export default router

import { defineStore } from 'pinia'

export interface User {
  id: string
  username: string | null
  email: string
  role: 'USER' | 'ADMIN' | null
  profileImage: string | null
  googleId: string | null
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  }),

  getters: {
    isOAuth: (state): boolean => Boolean(state.user?.googleId),
  },

  actions: {
    setAuth(user: User, accessToken: string) {
      this.user = user
      this.accessToken = accessToken
      this.isAuthenticated = true
    },

    setAccessToken(accessToken: string) {
      this.accessToken = accessToken
      this.isAuthenticated = true
    },

    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
    },

    setLoading(value: boolean) {
      this.isLoading = value
    },

    clearAuth() {
      this.user = null
      this.accessToken = null
      this.isAuthenticated = false
    },
  },

  persist: {
    key: 'vue-subs-auth',
    storage: localStorage,
    pick: ['user', 'isAuthenticated', 'accessToken'],
  },
})
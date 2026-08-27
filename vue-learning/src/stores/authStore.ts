import { defineStore } from 'pinia'

interface User {
  id: string
  username: string | null
  email: string
  role: string |null
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

  actions: {
    // Called after successful login/register
    setAuth(user: User, accessToken: string) {
      this.user = user
      this.accessToken = accessToken
      this.isAuthenticated = true
    },

    // Used when access token is refreshed
    setAccessToken(accessToken: string) {
      this.accessToken = accessToken
      this.isAuthenticated = true
    },

    // Used when /auth/me successfully returns the user
    setUser(user: User) {
      this.user = user
      this.isAuthenticated = true
    },

    // Used when authentication initialization is complete
    setLoading(value: boolean) {
      this.isLoading = value
    },

    // Used during logout / authentication failure
    clearAuth() {
      this.user = null
      this.accessToken = null
      this.isAuthenticated = false
    },
  },

  persist: {
    storage: localStorage,

    pick: ['user', 'isAuthenticated', 'accessToken'],
  },
})
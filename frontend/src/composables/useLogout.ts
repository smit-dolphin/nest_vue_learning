import { useRouter } from 'vue-router'

import { logoutMe } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function useLogout() {
  const router = useRouter()

  const logout = async () => {
    // 1. Ask the server to revoke the refresh token and clear the httpOnly cookie.
    try {
      await logoutMe()
    } catch {
      // Ignore network failures — local session must still be cleared.
    }

    // 2. Reset all persisted session stores.
    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()
    const notificationStore = useNotificationStore()

    authStore.$reset()
    settingsStore.$reset()
    notificationStore.$reset()

    // 3. Nuke the persisted local snapshots so nothing survives a reload.
    localStorage.removeItem('vue-subs-auth')
    localStorage.removeItem('vue-subs-settings')

    // 4. Drop the applied theme class.
    document.documentElement.classList.remove('dark')

    // 5. Send the user back to the login screen.
    router.replace('/login')
  }

  return { logout }
}
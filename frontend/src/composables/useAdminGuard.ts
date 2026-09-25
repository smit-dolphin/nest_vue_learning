import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function useAdminGuard() {
  const router = useRouter()
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.user?.role === 'ADMIN')

  function checkAdmin(): boolean {
    if (!isAuthenticated.value) {
      router.replace('/admin/login')
      return false
    }
    if (!isAdmin.value) {
      router.replace('/')
      return false
    }
    return true
  }

  return { isAuthenticated, isAdmin, checkAdmin }
}

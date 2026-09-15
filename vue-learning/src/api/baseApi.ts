import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import router from '@/router'
import { toast } from 'vue-sonner'


const baseurl='/api'
// http://localhost:3000
export const baseApi = axios.create({
  baseURL: baseurl,
  withCredentials: true,
})



baseApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url ?? ''
    const isAuthRequest = requestUrl === '/auth/me' || requestUrl === '/auth/refresh'

    // If it's a 401, not already retried, AND the url is NOT /auth/refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      requestUrl !== '/auth/refresh'
    ) {
      originalRequest._retry = true

      try {
        const authStore = useAuthStore()
        const response = await axios.post(
          `${baseurl}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        )
        const newAccessToken = response.data?.accessToken

        authStore.setAccessToken(newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return baseApi(originalRequest)
      } catch (refreshError) {
        const authStore = useAuthStore()
        authStore.clearAuth()
        toast.error('Your session has expired. Please sign in again.')
        router.replace('/login')
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status !== 401 && !isAuthRequest) {
      const message = error.response?.data?.message
      toast.error(typeof message === 'string' ? message : 'Something went wrong. Please try again.')
    }

    return Promise.reject(error);
  }
)

baseApi.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const accessToken = authStore.accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default baseApi
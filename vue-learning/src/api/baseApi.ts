import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import router from '@/router'

export const baseApi = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})



baseApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config

    // If it's a 401, not already retried, AND the url is NOT /auth/refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true

      try {
        const authStore = useAuthStore()
        const response = await axios.get('http://localhost:3000/auth/refresh')
        const newAccessToken = response.data?.accessToken

        authStore.setAccessToken(newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return baseApi(originalRequest)
      } catch (refreshError) {
        const authStore = useAuthStore()
        authStore.clearAuth()
        router.replace('/login')
        return Promise.reject(refreshError)
      }
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
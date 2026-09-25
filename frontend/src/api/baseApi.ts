import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import router from '@/router'
import { toast } from 'vue-sonner'

const baseurl = '/api'

export const baseApi = axios.create({
  baseURL: baseurl,
  withCredentials: true,
})

baseApi.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url ?? ''
    const isAuthEndpoint = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/me',
      '/auth/google/exchange',
    ].includes(requestUrl)
    const isCredentialEndpoint =
      requestUrl === '/auth/login' ||
      requestUrl === '/auth/register' ||
      requestUrl === '/auth/google/exchange'

    const showMessage = () => {
      const message = error.response?.data?.message
      if (typeof message === 'string') {
        toast.error(message)
      } else if (Array.isArray(message)) {
        toast.error(message.join(', '))
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    }

    if (error.response?.status === 401 && isCredentialEndpoint) {
      showMessage()
      return Promise.reject(error)
    }

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
          },
        )
        const newAccessToken = response.data?.data?.accessToken

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

    if (error.response?.status !== 401 && !isAuthEndpoint) {
      showMessage()
    }

    return Promise.reject(error)
  },
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
  },
)

export default baseApi
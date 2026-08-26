import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

export const baseApi = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})



baseApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {

    const originalRequest = error.config

    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true


      try {
        const authstore = useAuthStore()

        const response = await baseApi.post('/auth/refresh')

        const newAccessToken =
          response.data.accessToken

        authstore.setAccessToken(
          newAccessToken,
        )

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return baseApi(originalRequest)

      } catch (refreshError) {
        const authstore = useAuthStore()
        authstore.clearAuth()

        return Promise.reject(refreshError)
      }


    }
    return Promise.reject(error);



  }
)

baseApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken")
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
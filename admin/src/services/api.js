// services/api.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Create the Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  // baseURL: 'http://localhost:8000',
  withCredentials: false, // no cookies used
})

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('access')
    if (access) {
      config.headers.Authorization = `Bearer ${access}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 error AND not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh')
    ) {
      originalRequest._retry = true
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refresh')
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh/`, {
          refresh: refreshToken,
        })

        const newAccess = res.data.access

        // Save new access token
        localStorage.setItem('access', newAccess)

        // Update original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`

        return api(originalRequest)
      } catch (refreshErr) {
        // Refresh failed â log out
        const authStore = useAuthStore()
        authStore.logout()
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export default api;
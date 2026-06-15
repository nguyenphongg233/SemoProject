import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

import { APP_ENV } from './env'
import { getAuthToken, removeAuthToken } from '@/utils'

function getToken() {
  return getAuthToken()
}

function clearToken() {
  removeAuthToken()
}

export const axiosClient = axios.create({
  baseURL: APP_ENV.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Thêm kiểu InternalAxiosRequestConfig cho config
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()

    if (token) {
      // Axios v1.x sử dụng config.headers làm AxiosHeaders object sạch
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Thêm kiểu AxiosResponse và AxiosError cho response / error
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      clearToken()
    }

    return Promise.reject(error)
  },
)

export { clearToken, getToken }

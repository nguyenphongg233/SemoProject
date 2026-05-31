// Shared Axios instance with JWT injection and auth error handling.
import axios from 'axios'

import { APP_ENV } from './env'
import { getAuthToken, removeAuthToken } from '../utils/authSession'

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

axiosClient.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken()
    }

    return Promise.reject(error)
  },
)

export { clearToken, getToken }

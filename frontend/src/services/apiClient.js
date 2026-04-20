import axios from 'axios'
import { STORAGE_KEYS, safeJsonParse } from '../utils/auth'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 7000,
})

apiClient.interceptors.request.use((config) => {
    const rawSession = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION)
    const session = rawSession ? safeJsonParse(rawSession, null) : null

    if (session?.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${session.token}`
    }

    return config
})

export default apiClient

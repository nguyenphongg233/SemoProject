import apiClient from './apiClient'
import { defaultMockUsers } from '../mock/mockData'
import { STORAGE_KEYS, normalizeRole, safeJsonParse } from '../utils/auth'

const MOCK_LOGIN_ENDPOINT = '/api/auth/login'
const MOCK_REGISTER_ENDPOINT = '/api/auth/register'

function wait(ms = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function seedUsers() {
    const existing = window.localStorage.getItem(STORAGE_KEYS.MOCK_USERS)

    if (!existing) {
        window.localStorage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(defaultMockUsers))
    }
}

function getUsers() {
    seedUsers()
    return safeJsonParse(window.localStorage.getItem(STORAGE_KEYS.MOCK_USERS), defaultMockUsers)
}

function saveUsers(users) {
    window.localStorage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(users))
}

function createSessionPayload(user) {
    const normalizedRole = normalizeRole(user.role)

    return {
        token: `mock-token-${btoa(`${user.email}:${normalizedRole}`)}`,
        role: normalizedRole,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: normalizedRole,
        },
    }
}

function persistSession(session) {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session))
}

function shouldFallback(error) {
    return !error?.response || [404, 405, 501].includes(error.response.status)
}

function parseAuthResponse(payload) {
    const role = normalizeRole(payload?.role || payload?.user?.role)

    return {
        token: payload?.token,
        role,
        user: {
            id: payload?.user?.id ?? payload?.id,
            name: payload?.user?.name ?? payload?.name,
            email: payload?.user?.email ?? payload?.email,
            role,
        },
    }
}

export async function login(credentials) {
    try {
        const response = await apiClient.post(MOCK_LOGIN_ENDPOINT, credentials)
        const session = parseAuthResponse(response.data)
        persistSession(session)
        return session
    } catch (error) {
        if (!shouldFallback(error)) {
            throw new Error(error.response?.data?.message || 'Đăng nhập thất bại.')
        }
    }

    await wait()

    const users = getUsers()
    const matchedUser = users.find(
        (user) =>
            user.email.toLowerCase() === credentials.email.trim().toLowerCase() &&
            user.password === credentials.password,
    )

    if (!matchedUser) {
        throw new Error('Email hoặc mật khẩu không đúng.')
    }

    const session = createSessionPayload(matchedUser)
    persistSession(session)
    return session
}

export async function register(payload) {
    try {
        const response = await apiClient.post(MOCK_REGISTER_ENDPOINT, payload)
        return parseAuthResponse(response.data)
    } catch (error) {
        if (!shouldFallback(error)) {
            throw new Error(error.response?.data?.message || 'Đăng ký thất bại.')
        }
    }

    await wait()

    const users = getUsers()
    const existingUser = users.find(
        (user) => user.email.toLowerCase() === payload.email.trim().toLowerCase(),
    )

    if (existingUser) {
        throw new Error('Email này đã được sử dụng.')
    }

    const newUser = {
        id: `usr-${Date.now()}`,
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role: 'user',
    }

    saveUsers([...users, newUser])
    return createSessionPayload(newUser)
}

export function logout() {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION)
}

export function getStoredSession() {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION)
    return raw ? safeJsonParse(raw, null) : null
}

export function saveSession(session) {
    persistSession(session)
}

export const authService = {
    login,
    register,
    logout,
    getStoredSession,
    saveSession,
}

// TODO: Khi backend auth hoàn thiện, đổi MOCK_*_ENDPOINT sang endpoint thật và bỏ fallback localStorage.

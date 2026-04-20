export const STORAGE_KEYS = {
    AUTH_SESSION: 'semo_auth_session',
    MOCK_USERS: 'semo_mock_users',
}

export function normalizeRole(role) {
    const value = String(role || '').trim().toLowerCase()

    if (value === 'customer') {
        return 'user'
    }

    return value
}

export function isUserRole(role) {
    return ['user', 'customer'].includes(String(role || '').trim().toLowerCase())
}

export function getDefaultRouteByRole(role) {
    return normalizeRole(role) === 'admin' ? '/admin/dashboard' : '/user/booking'
}

export function getUserInitials(name = '') {
    const parts = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)

    if (!parts.length) {
        return 'SE'
    }

    return parts.map((part) => part[0]?.toUpperCase()).join('')
}

export function safeJsonParse(value, fallback) {
    try {
        return JSON.parse(value)
    } catch {
        return fallback
    }
}

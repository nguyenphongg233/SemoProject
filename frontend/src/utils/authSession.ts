// Session-scoped auth storage helpers with localStorage migration support.
import { STORAGE_KEYS } from '@/constants'
import type { User } from '@/types/models'

function hasWindowStorage(): boolean {
  return typeof window !== 'undefined'
}

function readRawValue(key: string): string | null {
  if (!hasWindowStorage()) {
    return null
  }

  const sessionValue = window.sessionStorage.getItem(key)
  if (sessionValue !== null) {
    return sessionValue
  }

  const legacyValue = window.localStorage.getItem(key)
  if (legacyValue !== null) {
    window.sessionStorage.setItem(key, legacyValue)
    window.localStorage.removeItem(key)
    return legacyValue
  }

  return null
}

function writeRawValue(key: string, value: string): void {
  if (!hasWindowStorage()) {
    return
  }

  window.sessionStorage.setItem(key, value)
  window.localStorage.removeItem(key)
}

function removeRawValue(key: string): void {
  if (!hasWindowStorage()) {
    return
  }

  window.sessionStorage.removeItem(key)
  window.localStorage.removeItem(key)
}

function parseStoredValue(rawValue: string | null): any {
  if (rawValue === null) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return rawValue
  }
}

export function getAuthToken(): string | null {
  const storedToken = parseStoredValue(readRawValue(STORAGE_KEYS.AUTH_TOKEN))
  return typeof storedToken === 'string' && storedToken.trim() ? storedToken : null
}

export function setAuthToken(token: string): void {
  if (typeof token !== 'string' || !token.trim()) {
    removeAuthToken()
    return
  }

  writeRawValue(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token))
}

export function removeAuthToken(): void {
  removeRawValue(STORAGE_KEYS.AUTH_TOKEN)
}

export function getAuthUser(): User | null {
  const storedUser = parseStoredValue(readRawValue(STORAGE_KEYS.AUTH_USER))
  return storedUser && typeof storedUser === 'object' ? (storedUser as User) : null
}

export function setAuthUser(user: User | null): void {
  if (!user || typeof user !== 'object') {
    removeAuthUser()
    return
  }

  writeRawValue(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
}

export function removeAuthUser(): void {
  removeRawValue(STORAGE_KEYS.AUTH_USER)
}

export function clearAuthSession(): void {
  removeAuthToken()
  removeAuthUser()
}
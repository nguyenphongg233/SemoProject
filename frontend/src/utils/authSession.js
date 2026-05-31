// Session-scoped auth storage helpers with localStorage migration support.
import { STORAGE_KEYS } from '../constants/storageKeys'

function hasWindowStorage() {
  return typeof window !== 'undefined'
}

function readRawValue(key) {
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

function writeRawValue(key, value) {
  if (!hasWindowStorage()) {
    return
  }

  window.sessionStorage.setItem(key, value)
  window.localStorage.removeItem(key)
}

function removeRawValue(key) {
  if (!hasWindowStorage()) {
    return
  }

  window.sessionStorage.removeItem(key)
  window.localStorage.removeItem(key)
}

function parseStoredValue(rawValue) {
  if (rawValue === null) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return rawValue
  }
}

export function getAuthToken() {
  const storedToken = parseStoredValue(readRawValue(STORAGE_KEYS.AUTH_TOKEN))
  return typeof storedToken === 'string' && storedToken.trim() ? storedToken : null
}

export function setAuthToken(token) {
  if (typeof token !== 'string' || !token.trim()) {
    removeAuthToken()
    return
  }

  writeRawValue(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(token))
}

export function removeAuthToken() {
  removeRawValue(STORAGE_KEYS.AUTH_TOKEN)
}

export function getAuthUser() {
  const storedUser = parseStoredValue(readRawValue(STORAGE_KEYS.AUTH_USER))
  return storedUser && typeof storedUser === 'object' ? storedUser : null
}

export function setAuthUser(user) {
  if (!user || typeof user !== 'object') {
    removeAuthUser()
    return
  }

  writeRawValue(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
}

export function removeAuthUser() {
  removeRawValue(STORAGE_KEYS.AUTH_USER)
}

export function clearAuthSession() {
  removeAuthToken()
  removeAuthUser()
}
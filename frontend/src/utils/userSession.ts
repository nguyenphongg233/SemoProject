// Lightweight client-side persistence for user-only data that backend
// does not currently expose via GET endpoints (wallet balance snapshot,
// active rental, recent rentals history, uploaded avatar URL).
//
// Backend GET /api/users/{id} không trả balance, và không có endpoint
// GET /api/rentals/active. Trong khi chờ backend bổ sung, ta cache
// dữ liệu user-side để UI không bị "câm" sau khi reload.


import type { Rental } from '@/types/models'

interface LocalRentalData extends Rental {
  scooterName?: string
}

const KEYS = {
  BALANCE: 'semo_user_balance',
  ACTIVE_RENTAL: 'semo_active_rental',
  RENTAL_HISTORY: 'semo_rental_history',
  AVATAR: 'semo_user_avatar',
}

function safeRead(key: string): any {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function safeWrite(key: string, value: any): void {
  if (typeof window === 'undefined') return
  if (value === null || value === undefined) {
    window.localStorage.removeItem(key)
    return
  }
  window.localStorage.setItem(key, JSON.stringify(value))
}

/* -------- Wallet balance snapshot -------- */

export function getBalanceSnapshot(): number | null {
  const value = safeRead(KEYS.BALANCE)
  return typeof value === 'number' ? value : null
}

// FIX 4: Định nghĩa kiểu number cho tham số value mức ví
export function setBalanceSnapshot(value: number): void {
  if (typeof value !== 'number' || Number.isNaN(value)) return
  safeWrite(KEYS.BALANCE, value)
}

export function clearBalanceSnapshot(): void {
  safeWrite(KEYS.BALANCE, null)
}

/* -------- Active rental -------- */
// Shape: { id, scooterId, scooterName, startTime, status }

export function getActiveRental(): LocalRentalData | null {
  const value = safeRead(KEYS.ACTIVE_RENTAL)
  if (!value || typeof value !== 'object') return null
  return value as LocalRentalData
}

// FIX 5: Định nghĩa kiểu dữ liệu LocalRentalData cho tham số rental
export function setActiveRental(rental: LocalRentalData): void {
  safeWrite(KEYS.ACTIVE_RENTAL, rental)
}

export function clearActiveRental(): void {
  safeWrite(KEYS.ACTIVE_RENTAL, null)
}

/* -------- Rental history (last 20) -------- */

export function getRentalHistory(): LocalRentalData[] {
  const value = safeRead(KEYS.RENTAL_HISTORY)
  return Array.isArray(value) ? value : []
}

// FIX 6: Định nghĩa kiểu dữ liệu LocalRentalData cho bản ghi mới append vào mảng
export function appendRentalHistory(entry: LocalRentalData): void {
  if (!entry) return
  const next = [entry, ...getRentalHistory()].slice(0, 20)
  safeWrite(KEYS.RENTAL_HISTORY, next)
}

export function clearRentalHistory(): void {
  safeWrite(KEYS.RENTAL_HISTORY, null)
}

/* -------- Avatar URL -------- */

export function getAvatarUrl(): string | null {
  const value = safeRead(KEYS.AVATAR)
  return typeof value === 'string' ? value : null
}

// FIX 7: Định nghĩa kiểu string cho tham số url hình ảnh đại diện
export function setAvatarUrl(url: string): void {
  if (typeof url !== 'string' || !url.trim()) return
  safeWrite(KEYS.AVATAR, url.trim())
}

export function clearAvatarUrl(): void {
  safeWrite(KEYS.AVATAR, null)
}


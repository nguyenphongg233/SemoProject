// Shared formatting helpers for money, dates, and display values.
const DEFAULT_LOCALE = 'vi-VN'
const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export function formatCurrency(value, currency = 'VND', locale = DEFAULT_LOCALE) {
  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return ''
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(value, locale = DEFAULT_LOCALE) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value, locale = DEFAULT_LOCALE, timeZone = DEFAULT_TIME_ZONE) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date)
}

export function formatBatteryLevel(value) {
  const level = Number(value)

  if (Number.isNaN(level)) {
    return ''
  }

  return `${level}%`
}

export function formatCoordinates(lat, lng) {
  const latitude = Number(lat)
  const longitude = Number(lng)

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return ''
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

// Pure validation helpers shared across forms and feature logic.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+()\-\s]{8,20}$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim())
}

export function isValidPhoneNumber(value: unknown): boolean {
  return typeof value === 'string' && PHONE_PATTERN.test(value.trim())
}

export function isStrongPassword(value: unknown): boolean {
  return typeof value === 'string' && PASSWORD_PATTERN.test(value)
}

export function isRequired(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim().length > 0
}
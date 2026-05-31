// Centralized runtime environment values for the frontend app.
const DEFAULT_API_URL = "http://localhost:8888"

function getEnvValue(key, fallback = '') {
  const value = import.meta.env[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export const APP_ENV = {
  apiUrl: getEnvValue('VITE_API_URL', DEFAULT_API_URL),
  appName: getEnvValue('VITE_APP_NAME', 'SemoProject'),
  tokenKey: getEnvValue('VITE_AUTH_TOKEN_KEY', 'semo_auth_token'),
}

const DEFAULT_API_URL = "http://localhost:8888"

function getEnvValue(key: string, fallback: string = ''): string {
  const value = (import.meta.env as Record<string, any>)[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export const APP_ENV = {
  apiUrl: getEnvValue('VITE_API_URL', DEFAULT_API_URL),
  appName: getEnvValue('VITE_APP_NAME', 'SemoProject'),
  tokenKey: getEnvValue('VITE_AUTH_TOKEN_KEY', 'semo_auth_token'),
}
// Convenience hook for reading the auth context from React components.
import { useContext } from 'react'

import { AuthContext } from '../contexts/authContext'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

// Provider that owns auth state, persistence, and session actions.
import { useCallback, useMemo, useState } from 'react'

import { ROLES } from '../constants/roles'
import { decodeJwtPayload } from '../utils/jwt'
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
} from '../utils/authSession'
import { login as loginRequest, register as registerRequest } from '../features/auth/api'
import { AuthContext } from './authContext'

function readStoredUser() {
  const storedUser = getAuthUser()

  if (storedUser) {
    return storedUser
  }

  const token = getAuthToken()
  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.userId ?? null,
    email: payload.sub ?? '',
    fullName: '',
    role: payload.role ?? ROLES.CUSTOMER,
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAuthToken())
  const [user, setUserState] = useState(() => readStoredUser())

  const isAuthenticated = Boolean(token)
  const isAdmin = user?.role === ROLES.ADMIN

  const login = useCallback(async (request) => {
    const response = await loginRequest(request)
    const nextUser = {
      id: response.userId,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    }

    setTokenState(response.token)
    setUserState(nextUser)
    setAuthToken(response.token)
    setAuthUser(nextUser)

    return response
  }, [])

  const register = useCallback(async (request) => {
    const response = await registerRequest(request)
    return response
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    setUserState(null)
    clearAuthSession()
  }, [])

  const updateUser = useCallback(
    (nextUser) => {
      setUserState(nextUser)
      setAuthUser(nextUser)
    },
    [],
  )

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
    }),
    [isAdmin, isAuthenticated, login, logout, register, token, updateUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Provider giữ trạng thái xác thực, lưu trữ session và các action liên quan.
// Đã giữ nguyên cấu trúc cũ; bổ sung tiện ích `setBalance(newBalance)` cho ví người dùng.
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react' 

// 1. Import kiểu dữ liệu User chính thống của dự án
import type { User } from '@/types/models'

import { ROLES } from '@/constants'
import {
  decodeJwtPayload, clearAuthSession, getAuthToken,
  getAuthUser, setAuthToken, setAuthUser
} from '@/utils'

import { login as loginRequest, register as registerRequest } from '@/features/auth/api'
import { AuthContext } from './authContext'

interface AuthProviderProps {
  children: ReactNode
}

function readStoredUser(): User | null {
  const storedUser = getAuthUser()
  if (storedUser) return storedUser as User

  const token = getAuthToken()
  if (!token) return null

  const payload = decodeJwtPayload(token)
  if (!payload) return null

  return {
    // Ép kiểu về dạng Number để khớp với model hệ thống
    id: payload.userId ? Number(payload.userId) : null,
    email: payload.sub ?? '',
    fullName: '',
    role: payload.role ?? ROLES.CUSTOMER,
    balance: null,
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(() => getAuthToken())
  const [user, setUserState] = useState<User | null>(() => readStoredUser())

  const isAuthenticated = Boolean(token)
  const isAdmin = user?.role === ROLES.ADMIN

  const login = useCallback(async (request: any) => {
    const response = await loginRequest(request)
    const nextUser: User = {
      // Đảm bảo id trả về từ API được convert sang number nếu nó đang là string
      id: response.userId ? Number(response.userId) : null,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
      balance: response.balance ?? null,
    }

    setTokenState(response.token)
    setUserState(nextUser)
    setAuthToken(response.token)
    setAuthUser(nextUser)

    return response
  }, [])

  const register = useCallback(async (request: any) => registerRequest(request), [])

  const logout = useCallback(() => {
    setTokenState(null)
    setUserState(null)
    clearAuthSession()
  }, [])

  const updateUser = useCallback((nextUser: User | null) => {
    setUserState(nextUser)
    setAuthUser(nextUser)
  }, [])

  const setBalance = useCallback((newBalance: number | string) => {
    setUserState((current: User | null) => {
      const next = { ...(current || {}), balance: Number(newBalance) } as User
      setAuthUser(next)
      return next
    })
  }, [])

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
      setBalance,
    }),
    [isAdmin, isAuthenticated, login, logout, register, setBalance, token, updateUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
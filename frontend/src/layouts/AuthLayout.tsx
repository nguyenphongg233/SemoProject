// Layout wrapper for login and register routes.
import { Navigate, Outlet } from 'react-router-dom'

import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'

export default function AuthLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}

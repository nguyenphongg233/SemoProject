// Route guard that blocks unauthenticated users and role mismatches.
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  requiredRoles?: string[]
}

export default function ProtectedRoute({ requiredRoles = [] }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  if (requiredRoles.length > 0 && user?.role && !requiredRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
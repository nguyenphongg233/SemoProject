// Route guard that blocks unauthenticated users and role mismatches.
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { ROUTES } from '../constants/routes'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ requiredRoles = [] }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}

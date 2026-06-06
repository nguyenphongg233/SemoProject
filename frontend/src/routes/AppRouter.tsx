import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout, AppLayout, AuthLayout } from '@/layouts'
import ProtectedRoute from './ProtectedRoute'
import { ROUTES, ROLES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { 
  Login, Register, DashboardPage, ProfilePage, BookingPage, 
  AnalyticsPage, MaintenancePage, RentalsPage, ScootersPage, UsersPage, SettingsPage 
} from '@/pages'

function RoleHomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === ROLES.ADMIN ? ROUTES.USERS : ROUTES.DASHBOARD} replace />
}

function RoleDashboardRoute() {
  const { user } = useAuth()
  if (user?.role === ROLES.ADMIN) return <Navigate to={ROUTES.USERS} replace />
  return <DashboardPage />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.HOME} element={<RoleHomeRedirect />} />
            <Route path={ROUTES.DASHBOARD} element={<RoleDashboardRoute />} />
            <Route path={ROUTES.BOOKING} element={<BookingPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requiredRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.USERS} element={<UsersPage />} />
            <Route path={ROUTES.SCOOTERS} element={<ScootersPage />} />
            <Route path={ROUTES.RENTALS} element={<RentalsPage />} />
            <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

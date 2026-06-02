// Layout wrapper for authenticated user pages.
import { Outlet } from 'react-router-dom'

import { AppShell } from '../components/layout'
import { ROLES } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'

export default function AppLayout() {
  const { user } = useAuth()
  const mode = user?.role === ROLES.ADMIN ? 'admin' : 'user'

  return (
    <AppShell mode={mode}>
      <Outlet />
    </AppShell>
  )
}

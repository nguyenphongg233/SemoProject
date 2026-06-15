// Layout wrapper for authenticated user pages.
import { Outlet } from 'react-router-dom'

import { AppShell } from '@/components'
import { ROLES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'

export default function AppLayout() {
  const { user } = useAuth()
  const mode = user?.role === ROLES.ADMIN ? 'admin' : 'user'

  return (
    <AppShell mode={mode}>
      <Outlet />
    </AppShell>
  )
}

// Layout wrapper reserved for admin-only pages.
import { Outlet } from 'react-router-dom'

import { AppShell } from '../components/layout'

export default function AdminLayout() {
  return (
    <AppShell mode="admin">
      <Outlet />
    </AppShell>
  )
}

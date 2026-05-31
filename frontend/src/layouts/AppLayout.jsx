// Layout wrapper for authenticated user pages.
import { Outlet } from 'react-router-dom'

import { AppShell } from '../components/layout'

export default function AppLayout() {
  return (
    <AppShell mode="user">
      <Outlet />
    </AppShell>
  )
}

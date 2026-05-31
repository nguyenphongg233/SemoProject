// Responsive application shell with sidebar and topbar navigation.
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { ROUTES } from '../../constants/routes'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui'

const userNavItems = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD },
  { label: 'Profile', to: ROUTES.PROFILE },
]

const adminNavItems = [
  { label: 'Users', to: ROUTES.USERS },
  { label: 'Scooters', to: ROUTES.SCOOTERS },
  { label: 'Rentals', to: ROUTES.RENTALS },
  { label: 'Maintenance', to: ROUTES.MAINTENANCE },
  { label: 'Analytics', to: ROUTES.ANALYTICS },
]

function NavList({ items, onNavigate }) {
  return (
    <nav className="app-shell__nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `app-shell__nav-link ${isActive ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AppShell({ mode = 'user', children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isAdminMode = mode === 'admin'
  const navItems = isAdminMode ? adminNavItems : userNavItems

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const roleLabel = user?.role === ROLES.ADMIN ? 'Administrator' : 'Customer'

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand-row">
          <Link to={ROUTES.DASHBOARD} className="app-shell__brand">
            <span className="app-shell__brand-mark">S</span>
            <span>SemoProject</span>
          </Link>
          <span className="app-shell__role-pill">{roleLabel}</span>
        </div>

        <NavList items={navItems} />

        <div className="app-shell__sidebar-footer">
          <p className="app-shell__sidebar-meta">{user?.fullName || user?.email || 'Signed in user'}</p>
          <Button variant="secondary" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-shell__topbar">
          <div>
            <p className="app-shell__eyebrow">Fleet operations</p>
            <h1 className="app-shell__title">{isAdminMode ? 'Admin console' : 'User workspace'}</h1>
          </div>

          <div className="app-shell__topbar-actions">
            <span className="app-shell__user-chip">{user?.email || 'guest@example.com'}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </header>

        <main className="app-shell__main">{children}</main>
      </div>
    </div>
  )
}
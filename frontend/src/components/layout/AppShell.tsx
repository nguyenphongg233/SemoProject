import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Bike,
  Receipt,
  Wrench,
  BarChart3,
  LogOut,
  MapPinned,
} from 'lucide-react'
import SemoIcon from '../../assets/semo-icon.svg?react';

import { ROUTES } from '../../constants/routes'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui'

// 1. Định nghĩa kiểu cho một phần tử menu
interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

const ICON_PROPS = { size: 18, strokeWidth: 1.7 }

const userNavItems: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: <LayoutDashboard {...ICON_PROPS} /> },
  { label: 'Ride booking',          to: ROUTES.BOOKING,   icon: <MapPinned      {...ICON_PROPS} /> },
  { label: 'Account & Wallet',  to: ROUTES.PROFILE,   icon: <UserCircle     {...ICON_PROPS} /> },
]

const adminNavItems: NavItem[] = [
  { label: 'Users',       to: ROUTES.USERS,       icon: <Users    {...ICON_PROPS} /> },
  { label: 'Scooters',    to: ROUTES.SCOOTERS,    icon: <Bike     {...ICON_PROPS} /> },
  { label: 'Rentals',     to: ROUTES.RENTALS,     icon: <Receipt  {...ICON_PROPS} /> },
  { label: 'Maintenance', to: ROUTES.MAINTENANCE, icon: <Wrench   {...ICON_PROPS} /> },
  { label: 'Analytics',   to: ROUTES.ANALYTICS,   icon: <BarChart3 {...ICON_PROPS} /> },
]

// 2. Định nghĩa Props cho component NavList
interface NavListProps {
  items: NavItem[];
  sectionLabel?: string;
  onNavigate?: () => void; // Cho phép onNavigate không bắt buộc (khắc phục Error 2741)
}

function NavList({ items, sectionLabel, onNavigate }: NavListProps) {
  return (
    <nav className="app-shell__nav">
      {sectionLabel && <p className="app-shell__nav-label">{sectionLabel}</p>}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `app-shell__nav-link ${isActive ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function getInitials(name = '', email = '') {
  const source = (name || email || '?').trim()
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// 3. Định nghĩa Props cho component AppShell
interface AppShellProps {
  mode?: 'user' | 'admin';
  children: ReactNode;
}

export default function AppShell({ mode = 'user', children }: AppShellProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth() // Sẽ tự động nhận diện type từ AuthContextType

  const isAdminMode = mode === 'admin'
  const navItems = isAdminMode ? adminNavItems : userNavItems
  const sectionLabel = isAdminMode ? 'Admin' : 'Explore'

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const roleLabel = user?.role === ROLES.ADMIN ? 'Administrator' : 'User Platform'
  const topbarEyebrow = isAdminMode ? 'Fleet operations' : 'E-mobility experience'
  const topbarTitle = isAdminMode ? 'Admin console' : 'Personal Console'

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand-row">
          <Link to={ROUTES.DASHBOARD} className="app-shell__brand">
            <span className="inline-flex items-center gap-2">
              <SemoIcon className="w-10 h-10" />
              SEMO
            </span>
          </Link>
          <span className="app-shell__role-pill">{roleLabel}</span>
        </div>

        <NavList items={navItems} sectionLabel={sectionLabel} />

        <div className="app-shell__sidebar-footer">
          <div className="app-shell__user-card">
            <div className="app-shell__user-avatar">
              {getInitials(user?.fullName, user?.email)}
            </div>
            <div className="app-shell__user-info">
              <span className="app-shell__user-name">
                {user?.fullName || (isAdminMode ? 'Administrator' : 'User')}
              </span>
              <span className="app-shell__user-email">{user?.email || ''}</span>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            leadingIcon={<LogOut size={16} strokeWidth={1.8} />}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-shell__topbar">
          <div>
            <p className="app-shell__eyebrow">{topbarEyebrow}</p>
            <h1 className="app-shell__title">{topbarTitle}</h1>
          </div>

          <div className="app-shell__topbar-actions">
            <span className="app-shell__user-chip">{user?.email || 'guest@example.com'}</span>
          </div>
        </header>

        <main className="app-shell__main">{children}</main>
      </div>
    </div>
  )
}
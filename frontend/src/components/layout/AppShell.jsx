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

import { ROUTES } from '../../constants/routes'
import { ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui'

const ICON_PROPS = { size: 18, strokeWidth: 1.7 }

const userNavItems = [
  { label: 'Bảng điều khiển', to: ROUTES.DASHBOARD, icon: <LayoutDashboard {...ICON_PROPS} /> },
  { label: 'Đặt xe',          to: ROUTES.BOOKING,   icon: <MapPinned     {...ICON_PROPS} /> },
  { label: 'Tài khoản & Ví',  to: ROUTES.PROFILE,   icon: <UserCircle    {...ICON_PROPS} /> },
]

const adminNavItems = [
  { label: 'Người dùng',   to: ROUTES.USERS,       icon: <Users    {...ICON_PROPS} /> },
  { label: 'Xe điện',      to: ROUTES.SCOOTERS,    icon: <Bike     {...ICON_PROPS} /> },
  { label: 'Chuyến đi',    to: ROUTES.RENTALS,     icon: <Receipt  {...ICON_PROPS} /> },
  { label: 'Bảo trì',      to: ROUTES.MAINTENANCE, icon: <Wrench   {...ICON_PROPS} /> },
  { label: 'Phân tích',    to: ROUTES.ANALYTICS,   icon: <BarChart3 {...ICON_PROPS} /> },
]

function NavList({ items, sectionLabel, onNavigate }) {
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

export default function AppShell({ mode = 'user', children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isAdminMode = mode === 'admin'
  const navItems = isAdminMode ? adminNavItems : userNavItems
  const sectionLabel = isAdminMode ? 'Quản trị viên' : 'Khám phá'

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const roleLabel = user?.role === ROLES.ADMIN ? 'Admin' : 'Khách hàng'
  const topbarEyebrow = isAdminMode ? 'Vận hành hệ thống' : 'Trải nghiệm xe điện'
  const topbarTitle = isAdminMode ? 'TRANG QUẢN TRỊ' : 'Không gian của bạn'

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand-row">
          <Link to={ROUTES.DASHBOARD} className="app-shell__brand">
            <span className="app-shell__brand-mark">S</span>
            <span>Semo</span>
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
                {user?.fullName || (isAdminMode ? 'Người quản trị' : 'Người dùng')}
              </span>
              <span className="app-shell__user-email">{user?.email || ''}</span>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            leadingIcon={<LogOut size={16} strokeWidth={1.8} />}
          >
            Đăng xuất
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
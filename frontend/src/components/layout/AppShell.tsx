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
import SemoIcon from '@/assets/semo-icon.svg?react';

import { ROUTES, ROLES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '../ui'
import { cn } from '@/utils';

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

interface NavListProps {
  items: NavItem[];
  sectionLabel?: string;
  onNavigate?: () => void;
}

function NavList({ items, sectionLabel, onNavigate }: NavListProps) {
  return (
    <nav className="grid gap-2">
      {sectionLabel && (
        <p className="m-2 text-sm font-bold tracking-[0.15em] uppercase text-text-faded">
          {sectionLabel}
        </p>
      )}

      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => 
            cn(
              "flex items-center gap-3 min-h-11 px-4 py-[0.7rem] rounded-sm font-medium border border-transparent",
              "transition-[background,color,transform,border-color,box-shadow] duration-180 ease-out",
              "hover:text-text-strong hover:bg-electric/8 hover:translate-x-0.5",
              
              "[&_svg]:shrink-0 [&_svg]:opacity-80 hover:[&_svg]:opacity-100",
              
              isActive ? [
                "text-brand bg-brand-soft border-border-strong shadow-soft",
                "[&_svg]:opacity-100 [&_svg]:text-brand",
                // Chuyển cấu trúc rực rỡ sang dark mode modifier
                "dark:text-white dark:bg-linear-to-br dark:from-brand/25 dark:to-accent/10 dark:border-border-glow",
                "dark:shadow-[inset_0_0_0_1px_rgba(0,209,255,0.1),0_8px_24px_rgba(0,82,255,0.15)]",
                "dark:[&_svg]:text-accent"
              ] : [
                "text-text-muted bg-transparent"
              ]
            )
          }
          onClick={onNavigate}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function getInitials(name = '', email = '') {
  const source = (name || email || '?').trim()
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface AppShellProps {
  mode?: 'user' | 'admin';
  children: ReactNode;
}

export default function AppShell({ mode = 'user', children }: AppShellProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isAdminMode = mode === 'admin'
  const navItems = isAdminMode ? adminNavItems : userNavItems
  const sectionLabel = isAdminMode ? 'Admin Operations' : 'Explore'

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const roleLabel = user?.role === ROLES.ADMIN ? 'Administrator' : 'User Platform'
  const topbarEyebrow = isAdminMode ? 'Fleet operations' : 'E-mobility experience'
  const topbarTitle = isAdminMode ? 'Admin console' : 'Personal Console'

  return (
    <div className="grid min-h-screen grid-cols-[280px_minmax(0,1fr)] max-sm:grid-cols-1 bg-bg-accent theme-transition">
      
      {/* Sidebar (Thanh điều hướng bên trái) */}
      <aside className="flex flex-col gap-6 p-[1.5rem_1.2rem] bg-surface border-r border-border backdrop-blur-xl relative theme-transition
        dark:bg-[linear-gradient(180deg,rgba(6,10,22,0.92),rgba(11,17,32,0.92))]
        after:content-[''] after:absolute after:inset-[0_0_0_auto] after:w-px
        after:bg-[linear-gradient(180deg,transparent,var(--border-glow),transparent)]
        after:opacity-0 dark:after:opacity-35 after:pointer-events-none"
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-flex items-center font-extrabold text-base text-text-strong"
          >
            <span className="inline-flex items-center gap-2">
              <SemoIcon className="w-9 h-9 text-brand" />
              <span className="tracking-wider">SEMO</span>
            </span>
          </Link>

          <span className="inline-flex items-center justify-center text-center min-h-7 px-2.5 rounded-full text-xs font-bold
            tracking-wider bg-brand-soft border border-border-strong text-brand"
          >
            {roleLabel}
          </span>
        </div>

        <NavList items={navItems} sectionLabel={sectionLabel} />

        {/* User Profile Card cuối Sidebar */}
        <div className="grid gap-3 mt-auto">
          <div className="flex items-center gap-[0.7rem] p-[0.7rem_0.85rem] rounded-[14px] bg-surface-elevated border border-border-strong">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-gradient-brand text-white font-bold text-[0.85rem] shadow-soft">
              {getInitials(user?.fullName, user?.email)}
            </div>
            
            <div className="grid gap-[0.05rem] min-w-0">
              <span className="text-[0.88rem] font-bold text-text-strong whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.fullName || (isAdminMode ? 'Administrator' : 'User')}
              </span>
              <span className="text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.email || ''}
              </span>
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

      <div className="grid grid-rows-[auto_1fr] min-w-0">
        <header className="flex items-center justify-between gap-4 px-8 py-6
          border-b border-border bg-surface/80 backdrop-blur-xl theme-transition
          max-sm:flex-col max-sm:items-start"
        >
          <div>
            <p className="mb-1 text-brand text-xs uppercase tracking-[0.18em] font-bold">
              {topbarEyebrow}
            </p>
            <h1 className="text-3xl font-extrabold text-text-strong">
              {topbarTitle}
            </h1>
          </div>

          <div className="flex items-center flex-wrap">
            <span className="inline-flex items-center justify-center min-h-8 px-4
              rounded-full text-xs font-bold tracking-wider bg-brand-soft 
              border border-border-strong text-brand"
            >
              {user?.email || 'guest@example.com'}
            </span>
          </div>
        </header>

        {/* Khối chứa nội dung động */}
        <main className="p-8 max-sm:p-5 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  )
}
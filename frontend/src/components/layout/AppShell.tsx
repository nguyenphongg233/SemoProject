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
  Settings,
  Bell,
  Sun,
  Moon,
  Palette,
} from 'lucide-react'
import SemoIcon from '@/assets/semo-icon.svg?react';

import { ROUTES, ROLES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '../ui'
import { cn } from '@/utils'; // Đường dẫn tới hàm cn của bạn
import { useTheme } from '@/contexts/ThemeContext';


// 1. Định nghĩa kiểu cho một phần tử menu
interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

const ICON_PROPS = { size: 18, strokeWidth: 1.7 }

const userNavItems: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: <LayoutDashboard {...ICON_PROPS} /> },
  { label: 'Ride booking', to: ROUTES.BOOKING, icon: <MapPinned      {...ICON_PROPS} /> },
  { label: 'Account & Wallet', to: ROUTES.PROFILE, icon: <UserCircle     {...ICON_PROPS} /> },
]

const adminNavItems: NavItem[] = [
  { label: 'Users', to: ROUTES.USERS, icon: <Users    {...ICON_PROPS} /> },
  { label: 'Scooters', to: ROUTES.SCOOTERS, icon: <Bike     {...ICON_PROPS} /> },
  { label: 'Rentals', to: ROUTES.RENTALS, icon: <Receipt  {...ICON_PROPS} /> },
  { label: 'Maintenance', to: ROUTES.MAINTENANCE, icon: <Wrench   {...ICON_PROPS} /> },
  { label: 'Analytics', to: ROUTES.ANALYTICS, icon: <BarChart3 {...ICON_PROPS} /> },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: <Settings {...ICON_PROPS} /> },
]

// 2. Định nghĩa Props cho component NavList
interface NavListProps {
  items: NavItem[];
  sectionLabel?: string;
  onNavigate?: () => void; // Cho phép onNavigate không bắt buộc (khắc phục Error 2741)
}

function NavList({ items, sectionLabel, onNavigate }: NavListProps) {
  return (
    <nav className="grid gap-2">
      {/* Nhãn phân khu menu (Ví dụ: MANAGEMENT, SETTINGS) */}
      {sectionLabel && (
        <p className="m-2 text-lg font-bold tracking-[0.2em] uppercase text-text-faded">
          {sectionLabel}
        </p>
      )}

      {/* Danh sách các đường link điều hướng */}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              // Base classes: Bố cục hàng, hiệu ứng transition dịch chuyển nhẹ sang phải khi hover
              "flex items-center gap-3 min-h-11 px-4 py-[0.7rem] rounded-sm font-medium border border-transparent",
              "transition-[background,color,transform,border-color,box-shadow] duration-180 ease-out",
              "hover:text-text-strong hover:bg-electric/8 hover:translate-x-0.5",

              // Quản lý Icon SVG nằm bên trong Link mặc định
              "[&_svg]:shrink-0 [&_svg]:opacity-80 hover:[&_svg]:opacity-100",

              // Cấu hình trạng thái khi Menu ĐANG ACTIVE
              isActive ? [
                "text-white bg-linear-to-br from-electric/22 to-cyan/10 border-border-glow",
                "shadow-[inset_0_0_0_1px_rgba(0,209,255,0.1),0_8px_24px_rgba(0,82,255,0.18)]",
                "[&_svg]:opacity-100 [&_svg]:text-cyan-soft"
              ] : [
                // Cấu hình trạng thái khi Menu KHÔNG ACTIVE
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

// 3. Định nghĩa Props cho component AppShell
interface AppShellProps {
  mode?: 'user' | 'admin';
  children: ReactNode;
}

export default function AppShell({ mode = 'user', children }: AppShellProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth() // Sẽ tự động nhận diện type từ AuthContextType
  const { theme, toggleTheme } = useTheme()

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
    <div className="grid min-h-screen grid-cols-[280px_minmax(0,1fr)] max-sm:grid-cols-1">
      <aside className="flex flex-col gap-[1.6rem] p-[1.5rem_1.2rem] text-white
        bg-[linear-gradient(180deg,rgba(6,10,22,0.92),rgba(11,17,32,0.92)),var(--color-midnight)]
        border-r border-(--border) backdrop-blur-[18px] relative after:content-['']
        after:absolute after:inset-[0_0_0_auto] after:w-px
        after:bg-[linear-gradient(180deg,transparent,var(--color-cyan),transparent)]
        after:opacity-35 after:pointer-events-none sm:border-r max-sm:border-r-0
        max-sm:border-b max-sm:border-(--border)"
      >
        <div className="flex items-center justify-between">
          <Link
            to={ROUTES.DASHBOARD}
            className="inline-flex items-center
              font-extrabold text-base text-(--text-strong)"
          >
            <span className="inline-flex items-center gap-2">
              <SemoIcon className="w-10 h-10" />
              SEMO
            </span>
          </Link>

          <span className="inline-flex items-center justify-center gap-1.5
            min-h-8 px-3 rounded-full text-sm font-semibold
            tracking-[0.04em] bg-[rgba(0,209,255,0.12)] border
            border-[rgba(0,209,255,0.3)] text-cyan-soft"
          >{roleLabel}</span>
        </div>

        <NavList items={navItems} sectionLabel={sectionLabel} />

        <div className="grid gap-3 mt-auto">
          <div className="flex items-center gap-[0.7rem] p-[0.7rem_0.85rem] rounded-[14px] bg-surface-elevated border border-border">
            <div className="w-9 h-9 rounded-full grid place-items-center bg-gradient-brand text-white font-bold text-[0.85rem] [box-shadow:0_0_12px_rgba(0,82,255,0.4)]">
              {getInitials(user?.fullName, user?.email)}
            </div>

            <div className="grid gap-[0.05rem] min-w-0">
              <span className="text-[0.88rem] font-semibold text-text-strong whitespace-nowrap overflow-hidden text-ellipsis">
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
          border-b border-border bg-[#0b1120]/55 backdrop-blur-[18px]
          max-sm:flex-col max-sm:items-start"
        >
          <div>
            <p className="mb-2 text-cyan-soft text-xs uppercase tracking-[0.18em] font-bold">
              {topbarEyebrow}
            </p>
            <h1 className="text-3xl text-text-strong">
              {topbarTitle}
            </h1>
          </div>

          <div className="flex items-center flex-wrap">
            {isAdminMode && (
              <button className="relative p-2 mr-3 text-text-muted hover:text-cyan-soft transition-colors" title="Notifications (Pending API)">
                <Bell size={20} strokeWidth={2} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse"></span>
              </button>
            )}
            <button 
              onClick={toggleTheme}
              className="relative p-2 mr-4 text-text-muted hover:text-cyan-soft transition-colors rounded-full hover:bg-[rgba(255,255,255,0.05)]" 
              title={`Current Theme: ${theme}`}
            >
              {theme === 'light' ? <Sun size={20} strokeWidth={2} /> : theme === 'dark' ? <Moon size={20} strokeWidth={2} /> : <Palette size={20} strokeWidth={2} />}
            </button>
            <span className="inline-flex items-center justify-center min-h-8 px-4
              rounded-full text-sm font-semibold tracking-wider
              bg-[rgba(0,209,255,0.12)] border border-[rgba(0,209,255,0.3)]
              text-cyan-soft"
            >
              {user?.email || 'guest@example.com'}
            </span>
          </div>
        </header>

        <main className="p-8 max-sm:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
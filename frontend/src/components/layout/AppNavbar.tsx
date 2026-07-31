import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, LogOut, User as UserIcon, Moon, GraduationCap, Zap, Bike, Users, Receipt, MessageSquare, Map, Settings, BarChart3, Wrench } from 'lucide-react'
import { Button } from '@/components/ui'
import { ROUTES, ROLES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import SemoIcon from '@/assets/semo-icon.svg?react'

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const isAdmin = user?.role === ROLES.ADMIN

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
      isActive
        ? 'text-brand bg-brand/10'
        : 'text-text-muted hover:text-text-strong hover:bg-surface-muted'
    }`

  const dropdownItemClass = "flex items-center gap-3 px-4 py-2 text-sm font-medium text-text-muted hover:text-text-strong hover:bg-white/5 transition-colors"

  return (
    <header className="fixed inset-x-0 top-0 z-[99999] h-16 w-full select-none border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto h-full w-full max-w-[1400px] px-4 md:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-text-strong flex items-center gap-2">
              <SemoIcon className="w-8 h-8" />
              Semo<span className="text-brand">AI</span>
            </span>
          </Link>
          
          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>Overview</NavLink>
                  
                  {/* Fleet Dropdown */}
                  <div className="group relative">
                    <button className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
                      Fleet <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                      <div className="flex flex-col bg-midnight/90 backdrop-blur-xl border border-border rounded-xl shadow-glow-blue py-2 min-w-[200px]">
                        <Link to={ROUTES.SCOOTERS} className={dropdownItemClass}><Bike size={16}/> Scooters</Link>
                        <Link to={ROUTES.MAINTENANCE} className={dropdownItemClass}><Wrench size={16}/> Maintenance</Link>
                        <Link to={ROUTES.CHARGING} className={dropdownItemClass}><Zap size={16}/> Charging Stations</Link>
                        <Link to={ROUTES.GEOFENCE} className={dropdownItemClass}><Map size={16}/> Geofence</Link>
                      </div>
                    </div>
                  </div>

                  <NavLink to={ROUTES.USERS} className={navLinkClass}>Users</NavLink>

                  {/* Business Dropdown */}
                  <div className="group relative">
                    <button className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
                      Business <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                      <div className="flex flex-col bg-midnight/90 backdrop-blur-xl border border-border rounded-xl shadow-glow-blue py-2 min-w-[200px]">
                        <Link to={ROUTES.RENTALS} className={dropdownItemClass}><Receipt size={16}/> Rentals</Link>
                        <Link to={ROUTES.TRANSACTIONS} className={dropdownItemClass}><Receipt size={16}/> Transactions</Link>
                        <Link to={ROUTES.FEEDBACKS} className={dropdownItemClass}><MessageSquare size={16}/> Feedbacks</Link>
                        <Link to={ROUTES.ANALYTICS} className={dropdownItemClass}><BarChart3 size={16}/> Analytics</Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>Dashboard</NavLink>
                  <NavLink to={ROUTES.BOOKING} className={navLinkClass}>Ride Booking</NavLink>
                  <NavLink to={ROUTES.MY_RIDES} className={navLinkClass}>My Rides</NavLink>
                  <NavLink to={ROUTES.WALLET} className={navLinkClass}>Wallet</NavLink>
                </>
              )
            ) : (
              // Public Navigation
              <>
                <div className="group relative">
                  <button className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
                    Platform <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                    <div className="flex flex-col bg-midnight/90 backdrop-blur-xl border border-border rounded-xl shadow-glow-blue py-2 min-w-[200px]">
                      <Link to={ROUTES.LOGIN} className={dropdownItemClass}><Zap size={16}/> Smart Booking</Link>
                      <Link to={ROUTES.LOGIN} className={dropdownItemClass}><Map size={16}/> Interactive Map</Link>
                      <Link to={ROUTES.LOGIN} className={dropdownItemClass}><Receipt size={16}/> Digital Wallet</Link>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <button className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors text-text-muted hover:text-text-strong hover:bg-surface-muted focus:outline-none">
                    Fleet Ops <ChevronDown className="ml-1 h-3 w-3 transition duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-50">
                    <div className="flex flex-col bg-midnight/90 backdrop-blur-xl border border-border rounded-xl shadow-glow-blue py-2 min-w-[220px]">
                      <Link to={ROUTES.LOGIN} className={dropdownItemClass}><Bike size={16}/> Scooter Network</Link>
                      <Link to={ROUTES.LOGIN} className={dropdownItemClass}><Wrench size={16}/> Maintenance Hub</Link>
                      <Link to={ROUTES.LOGIN} className={dropdownItemClass}><BarChart3 size={16}/> Analytics</Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="hidden items-center lg:flex space-x-2">

          {isAuthenticated ? (
            <div className="group relative">
              <button className="flex items-center gap-2 h-9 px-3 rounded-full bg-brand/10 border border-brand/20 text-sm font-medium text-text-strong hover:bg-brand/20 transition-colors focus:outline-none">
                <div className="w-5 h-5 rounded-full bg-gradient-brand text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <span>{user?.fullName?.split(' ')[0] || 'User'}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              
              <div className="absolute top-full right-0 hidden group-hover:block pt-2 z-50">
                <div className="flex flex-col bg-midnight/90 backdrop-blur-xl border border-border rounded-xl shadow-glow-blue py-2 min-w-[180px]">
                  <div className="px-4 py-2 border-b border-border/50 mb-1">
                    <p className="text-sm font-semibold text-text-strong">{user?.fullName}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <Link to={ROUTES.ACCOUNT} className={dropdownItemClass}><UserIcon size={16}/> Profile</Link>
                  {isAdmin && <Link to={ROUTES.SETTINGS} className={dropdownItemClass}><Settings size={16}/> Settings</Link>}
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors text-left w-full cursor-pointer">
                    <LogOut size={16}/> Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 ml-2">
              <Link to={ROUTES.LOGIN} className="text-sm font-medium text-text-muted hover:text-text-strong transition-colors px-2">
                Log in
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" className="h-9 px-4 py-2 min-h-0 rounded-lg shadow-none text-sm">
                  Start for free
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle (Placeholder) */}
        <div className="flex items-center justify-end lg:hidden">
          <button className="inline-flex items-center justify-center rounded-md text-text-muted hover:text-text-strong hover:bg-surface-muted h-9 w-9">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

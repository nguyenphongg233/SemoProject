import { Bike, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getUserInitials } from '../utils/auth'
import Button from './Button'

export default function AppHeader() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <header className="app-header">
            <div className="app-header__inner">
                <div className="brand">
          <span className="brand__mark">
            <Bike size={20} />
          </span>
                    <span className="brand__meta">
            <span className="brand__title">SEMO</span>
            <span className="brand__subtitle">Customer mobility portal</span>
          </span>
                </div>

                <div className="header-user">
                    <div className="header-user__chip">
                        <div className="header-user__avatar">{getUserInitials(user?.name)}</div>
                        <div className="header-user__meta">
                            <span className="header-user__name">{user?.name}</span>
                            <span className="header-user__role">{user?.role}</span>
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" icon={LogOut} onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    )
}

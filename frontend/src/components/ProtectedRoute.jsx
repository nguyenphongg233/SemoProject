import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { normalizeRole } from '../utils/auth'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, bootstrapping } = useAuth()
    const location = useLocation()

    if (bootstrapping) {
        return <div className="page-loader">Đang xác thực truy cập...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (allowedRoles?.length) {
        const normalizedRole = normalizeRole(user.role)
        const accepted = allowedRoles.map(normalizeRole)

        if (!accepted.includes(normalizedRole)) {
            return <Navigate to="/unauthorized" replace />
        }
    }

    return children
}

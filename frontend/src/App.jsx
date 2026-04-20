import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import BookingPage from './pages/BookingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import { getDefaultRouteByRole, isUserRole } from './utils/auth'

function RootRedirect() {
    const { user, bootstrapping } = useAuth()

    if (bootstrapping) {
        return <div className="page-loader">Đang khởi tạo phiên làm việc...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Navigate to={getDefaultRouteByRole(user.role)} replace />
}

function UserRoleRoute({ children }) {
    const { user } = useAuth()

    if (!user || !isUserRole(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route
                path="/user/booking"
                element={
                    <ProtectedRoute>
                        <UserRoleRoute>
                            <BookingPage />
                        </UserRoleRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

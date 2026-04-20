import { Eye, EyeOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { useAuth } from '../contexts/AuthContext'
import { getDefaultRouteByRole } from '../utils/auth'

function validate(values) {
    const errors = {}

    if (!values.email.trim()) {
        errors.email = 'Vui lòng nhập email.'
    }

    if (!values.password) {
        errors.password = 'Vui lòng nhập mật khẩu.'
    }

    return errors
}

export default function LoginPage() {
    const { user, login, bootstrapping } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [values, setValues] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formError, setFormError] = useState('')

    const from = useMemo(() => location.state?.from?.pathname, [location.state])

    if (!bootstrapping && user) {
        return <Navigate to={getDefaultRouteByRole(user.role)} replace />
    }

    function handleChange(event) {
        const { name, value } = event.target
        setValues((current) => ({ ...current, [name]: value }))
        setErrors((current) => ({ ...current, [name]: '' }))
        setFormError('')
    }

    async function handleSubmit(event) {
        event.preventDefault()
        const nextErrors = validate(values)

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors)
            return
        }

        setLoading(true)
        setFormError('')

        try {
            const session = await login(values)
            toast.success(`Xin chào ${session.user.name}`)
            navigate(from || getDefaultRouteByRole(session.role), { replace: true })
        } catch (error) {
            setFormError(error.message)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Đăng nhập vào SEMO"
            description="Quản lý luồng đặt xe, mở khóa và các cảnh báo an toàn từ một giao diện duy nhất."
            asideTitle="Đi xe điện thông minh, an toàn và rõ ràng từng bước."
            asideText="SEMO customer portal tập trung vào trải nghiệm thực tế: tìm xe nhanh, đặt xe rõ ràng, theo dõi geofence và phản ứng ngay khi pin có vấn đề."
            footer={
                <>
                    Chưa có tài khoản? <Link className="auth-link" to="/register">Đăng ký ngay</Link>
                </>
            }
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <TextInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <TextInput
                    label="Mật khẩu"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={values.password}
                    onChange={handleChange}
                    error={errors.password}
                    rightSlot={
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm btn--icon"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    }
                />

                {formError ? <div className="form-message form-message--error">{formError}</div> : null}

                <Button type="submit" block loading={loading}>
                    Đăng nhập
                </Button>
            </form>
        </AuthLayout>
    )
}

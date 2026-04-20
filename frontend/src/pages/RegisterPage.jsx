import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import { useAuth } from '../contexts/AuthContext'
import { getDefaultRouteByRole } from '../utils/auth'

function validate(values) {
    const errors = {}

    if (!values.name.trim()) {
        errors.name = 'Vui lòng nhập họ tên.'
    }

    if (!values.email.trim()) {
        errors.email = 'Vui lòng nhập email.'
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
        errors.email = 'Email không hợp lệ.'
    }

    if (!values.password) {
        errors.password = 'Vui lòng nhập mật khẩu.'
    } else if (values.password.length < 8) {
        errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.'
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
    } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    }

    return errors
}

export default function RegisterPage() {
    const { user, register, hydrate, bootstrapping } = useAuth()
    const navigate = useNavigate()

    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
            const session = await register(values)
            hydrate(session)
            toast.success('Tạo tài khoản thành công.')
            navigate(getDefaultRouteByRole(session.role), { replace: true })
        } catch (error) {
            setFormError(error.message)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Tạo tài khoản khách hàng"
            description="Thiết lập tài khoản để truy cập trang đặt xe, cảnh báo geofence và trạng thái chuyến đi."
            asideTitle="Sẵn sàng cho luồng đặt xe mượt và an toàn hơn."
            asideText="Đăng ký một lần để dùng được toàn bộ customer portal: tìm xe gần nhất, đặt xe, mở khóa, theo dõi trạng thái và nhận cảnh báo vận hành theo thời gian thực."
            footer={
                <>
                    Đã có tài khoản? <Link className="auth-link" to="/login">Đăng nhập</Link>
                </>
            }
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <TextInput
                    label="Họ tên"
                    name="name"
                    placeholder="Ví dụ: Linh Nguyen"
                    value={values.name}
                    onChange={handleChange}
                    error={errors.name}
                />

                <TextInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <div className="form-row">
                    <TextInput
                        label="Mật khẩu"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ít nhất 8 ký tự"
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

                    <TextInput
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        rightSlot={
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm btn--icon"
                                onClick={() => setShowConfirmPassword((current) => !current)}
                                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />
                </div>

                {formError ? <div className="form-message form-message--error">{formError}</div> : null}

                <Button type="submit" block loading={loading}>
                    Tạo tài khoản
                </Button>
            </form>
        </AuthLayout>
    )
}

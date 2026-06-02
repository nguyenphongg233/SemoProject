// Trang Hồ sơ & Ví — Tech Blue Luxury (tiếng Việt).
// Liên kết với API:
//   - depositToWallet → POST /api/users/wallet/deposit (qua features/users)
//   - changePassword  → PUT  /api/users/{id}/change-password
// Số dư hiển thị bằng định dạng VNĐ (vi-VN) qua utils/formatters.formatCurrency.
import { useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { FormEvent, ChangeEvent } from 'react'
import {
  Wallet, ShieldCheck, User, Mail, BadgeCheck, Sparkles, Plus, KeyRound, Lock, Eye, EyeOff,
} from 'lucide-react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { changePassword, depositToWallet } from '../../features/users'
import { formatCurrency } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'
import { ROLES } from '../../constants/roles'

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000]

export default function ProfilePage() {
  const { user, setBalance } = useAuth()

  const [depositAmount, setDepositAmount] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [loadingDeposit, setLoadingDeposit] = useState(false)
  const [loadingPwd, setLoadingPwd] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const balance = typeof user?.balance === 'number' ? user.balance : null
  const balanceDisplay = balance === null ? 'Chưa có dữ liệu' : formatCurrency(balance)

  // FIX 2: Khai báo FormEvent cho tham số event
  async function handleDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoadingDeposit(true)
    setError('')
    setSuccess('')

    try {
      const amount = Number(depositAmount)
      if (!Number.isFinite(amount) || amount < 10000) {
        setError('Số tiền nạp tối thiểu là 10.000 VNĐ.')
        return
      }

      const response = await depositToWallet({ amount })
      const newBalance = response?.newBalance

      if (typeof newBalance === 'number') {
        setBalance(newBalance)
      }

      const niceAmount = formatCurrency(amount)
      setSuccess(
        response?.message
          ? `${response.message} (+${niceAmount})`
          : `Nạp ${niceAmount} thành công.`,
      )
      setDepositAmount('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể nạp tiền vào ví.'))
    } finally {
      setLoadingDeposit(false)
    }
  }

  // FIX 2: Khai báo FormEvent cho tham số event
  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoadingPwd(true)
    setError('')
    setSuccess('')

    try {
      if (!user?.id) {
        setError('Không xác định được tài khoản hiện tại.')
        return
      }
      if (newPassword.length < 8) {
        setError('Mật khẩu mới phải có ít nhất 8 ký tự.')
        return
      }
      await changePassword(user.id, { currentPassword, newPassword })
      setSuccess('Đổi mật khẩu thành công.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể đổi mật khẩu.'))
    } finally {
      setLoadingPwd(false)
    }
  }

  // FIX 3: Khai báo kiểu number cho tham số value
  function pickQuickAmount(value: number) {
    setDepositAmount(String(value))
  }

  // FIX 4: Định nghĩa cấu trúc kiểu dữ liệu cụ thể cho hàm render nút eyeBtn
  const eyeBtn = (
    visible: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    label: string
  ) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => setter((v) => !v)}
      style={{
        background: 'transparent', border: 0, color: 'var(--text-muted)',
        cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0,
      }}
    >
      {visible ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
    </button>
  )

  const roleLabel = user?.role === ROLES.ADMIN ? 'Quản trị viên' : 'Khách hàng'

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Tài khoản"
        title="Hồ sơ & Ví của bạn"
        description="Quản lý số dư, lịch sử và bảo mật tài khoản tại một nơi duy nhất."
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {/* Wallet hero */}
      <section className="wallet-card">
        <p className="wallet-card__label">Số dư ví Semo</p>
        <p className="wallet-card__balance">{balanceDisplay}</p>
        <p className="wallet-card__meta">
          Đơn vị tiền tệ: <strong style={{ color: '#fff' }}>VNĐ</strong> &nbsp;•&nbsp;
          Chủ tài khoản:{' '}
          <strong style={{ color: '#fff' }}>{user?.fullName || user?.email || '—'}</strong>
        </p>
        <span className="wallet-card__chip">
          <Sparkles size={14} strokeWidth={1.9} /> SEMO • {roleLabel.toUpperCase()}
        </span>
      </section>

      <div className="two-column-grid">
        {/* Deposit card */}
        <Card>
          <SectionHeader
            eyebrow="Ví"
            title="Nạp tiền vào ví"
            description="Nạp tối thiểu 10.000 VNĐ. Số dư cập nhật tức thì sau khi giao dịch thành công."
            actions={<Wallet size={20} strokeWidth={1.7} style={{ color: 'var(--color-cyan-soft)' }} />}
          />

          <form className="form-grid" onSubmit={handleDeposit}>
            <div className="quick-amounts">
              {QUICK_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className="quick-amount"
                  onClick={() => pickQuickAmount(v)}
                >
                  + {formatCurrency(v)}
                </button>
              ))}
            </div>

            <TextField
              label="Số tiền nạp (VNĐ)"
              type="number"
              min="10000"
              step="1000"
              name="depositAmount"
              value={depositAmount}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setDepositAmount(event.target.value)}
              placeholder="Ví dụ: 100000"
              required
              leadingIcon={<Wallet size={18} strokeWidth={1.7} />}
              helpText={
                depositAmount && Number(depositAmount) >= 10000
                  ? `Sẽ nạp ${formatCurrency(Number(depositAmount))} vào ví.`
                  : 'Tối thiểu 10.000 VNĐ.'
              }
            />

            <Button
              type="submit"
              disabled={loadingDeposit}
              leadingIcon={<Plus size={18} strokeWidth={1.8} />}
            >
              {loadingDeposit ? 'Đang nạp…' : 'Nạp ngay'}
            </Button>
          </form>
        </Card>

        {/* Password card */}
        <Card>
          <SectionHeader
            eyebrow="Bảo mật"
            title="Đổi mật khẩu"
            description="Đổi mật khẩu thường xuyên để bảo vệ tài khoản của bạn."
            actions={<ShieldCheck size={20} strokeWidth={1.7} style={{ color: 'var(--color-cyan-soft)' }} />}
          />

          <form className="form-grid" onSubmit={handlePasswordChange}>
            <TextField
              label="Mật khẩu hiện tại"
              type={showCurrent ? 'text' : 'password'}
              name="currentPassword"
              value={currentPassword}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setCurrentPassword(event.target.value)}
              required
              leadingIcon={<Lock size={18} strokeWidth={1.7} />}
              trailingAction={eyeBtn(showCurrent, setShowCurrent, 'Hiện/ẩn mật khẩu hiện tại')}
            />
            <TextField
              label="Mật khẩu mới"
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={newPassword}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
              required
              leadingIcon={<KeyRound size={18} strokeWidth={1.7} />}
              trailingAction={eyeBtn(showNew, setShowNew, 'Hiện/ẩn mật khẩu mới')}
              helpText="Tối thiểu 8 ký tự, nên dùng chữ hoa, chữ thường và số."
            />
            <Button
              type="submit"
              disabled={loadingPwd}
              variant="secondary"
              leadingIcon={<ShieldCheck size={18} strokeWidth={1.8} />}
            >
              {loadingPwd ? 'Đang lưu…' : 'Cập nhật mật khẩu'}
            </Button>
          </form>
        </Card>
      </div>

      {/* Account details */}
      <Card>
        <SectionHeader eyebrow="Thông tin" title="Tài khoản đã đăng nhập" />
        <div className="profile-details" style={{ marginTop: '0.6rem' }}>
          <div style={detailsRow}>
            <User size={18} strokeWidth={1.7} style={iconStyle} />
            <span><strong>Họ tên:</strong> {user?.fullName || '—'}</span>
          </div>
          <div style={detailsRow}>
            <Mail size={18} strokeWidth={1.7} style={iconStyle} />
            <span><strong>Email:</strong> {user?.email || '—'}</span>
          </div>
          <div style={detailsRow}>
            <BadgeCheck size={18} strokeWidth={1.7} style={iconStyle} />
            <span><strong>Vai trò:</strong> {roleLabel}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

const iconStyle = { color: 'var(--color-cyan-soft)', flexShrink: 0 }
const detailsRow = { display: 'flex', alignItems: 'center', gap: '0.6rem' }
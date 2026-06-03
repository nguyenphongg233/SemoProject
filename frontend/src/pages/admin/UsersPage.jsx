import { useEffect, useMemo, useState } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Modal, Table, TextField } from '../../components/ui'
import { ROLES } from '../../constants/roles'
import {
  adminResetPassword,
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from '../../features/users'
import { formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

const initialForm = {
  id: null,
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadUsers() {
      try {
        setLoading(true)
        setError('')
        const data = await getAllUsers()
        if (mounted) {
          setUsers(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err, 'Lỗi: Không thể tải dữ liệu người dùng.'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadUsers()
    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    const admins = users.filter((user) => user.role === ROLES.ADMIN).length
    const customers = users.filter((user) => user.role === ROLES.CUSTOMER).length
    return [
      { label: 'Tổng số tài khoản', value: users.length },
      { label: 'Admin', value: admins },
      { label: 'Khách hàng', value: customers },
    ]
  }, [users])

  const columns = [
    { key: 'fullName', label: 'Họ và tên' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Số điện thoại' },
    { key: 'role', label: 'Vai trò', render: (row) => row.role === ROLES.ADMIN ? 'Admin' : 'Khách hàng' },
    { key: 'updatedAt', label: 'Cập nhật', render: (row) => formatDateTime(row.updatedAt || row.createdAt) || '-' },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="table-actions table-actions--wrap">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Sửa
          </Button>
          <Button variant="secondary" onClick={() => openReset(row)}>
            Cấp lại Mật khẩu
          </Button>
          <Button variant="destructive" onClick={() => openDelete(row)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ]

  function openCreate() {
    setForm(initialForm)
    setIsFormOpen(true)
  }

  function openEdit(row) {
    setForm({
      id: row.id,
      fullName: row.fullName || '',
      email: row.email || '',
      phoneNumber: row.phoneNumber || '',
      password: '',
    })
    setIsFormOpen(true)
  }

  function openDelete(row) {
    setSelectedUser(row)
    setIsDeleteOpen(true)
  }

  function openReset(row) {
    setSelectedUser(row)
    setNewPassword('')
    setIsResetOpen(true)
  }

  async function reloadUsers() {
    const data = await getAllUsers()
    setUsers(Array.isArray(data) ? data : [])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
    }

    try {
      if (form.id) {
        await updateUser(form.id, payload)
      } else {
        await createUser(payload)
      }

      await reloadUsers()
      setIsFormOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không thể lưu thông tin.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedUser) return
    setSaving(true)
    setError('')

    try {
      await deleteUser(selectedUser.id)
      await reloadUsers()
      setIsDeleteOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không thể xóa người dùng này.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault()
    if (!selectedUser) return

    setSaving(true)
    setError('')

    try {
      await adminResetPassword(selectedUser.id, { newPassword })
      setIsResetOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không thể cấp lại mật khẩu.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Admin"
        title="Quản lý Người dùng"
        description="Thêm mới tài khoản, cập nhật thông tin liên hệ, xóa người dùng hoặc cấp lại mật khẩu khi cần."
        actions={<Button onClick={openCreate}>+ Thêm người dùng</Button>}
      />

      <div className="stats-grid stats-grid--compact">
        {summary.map((item) => (
          <Card key={item.label}>
            <p className="stat-card__label">{item.label}</p>
            <div className="stat-card__value">{loading ? '—' : item.value}</div>
          </Card>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      <Card>
        <Table
          columns={columns}
          rows={users}
          rowKey={(row) => row.id}
          emptyMessage={loading ? 'Đang tải danh sách...' : 'Chưa có người dùng nào.'}
        />
      </Card>

      <Modal
        open={isFormOpen}
        title={form.id ? 'Cập nhật thông tin' : 'Thêm người dùng mới'}
        onClose={() => setIsFormOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" form="user-form" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu lại'}
            </Button>
          </div>
        }
      >
        <form id="user-form" className="form-grid" onSubmit={handleSubmit}>
          <TextField
            label="Họ và tên"
            name="fullName"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
          <TextField
            label="Địa chỉ Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <TextField
            label="Số điện thoại"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
            required
          />
          <TextField
            label={form.id ? 'Mật khẩu mới (Tùy chọn)' : 'Mật khẩu đăng nhập'}
            type="password"
            name="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required={!form.id}
          />
        </form>
      </Modal>

      <Modal
        open={isDeleteOpen}
        title="Xóa người dùng"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        }
      >
        <p className="modal-copy">
          Bạn có chắc chắn muốn xóa tài khoản của <strong>{selectedUser?.fullName || 'người dùng này'}</strong> không? Hành động này không thể hoàn tác.
        </p>
      </Modal>

      <Modal
        open={isResetOpen}
        title="Cấp lại Mật khẩu"
        onClose={() => setIsResetOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsResetOpen(false)}>
              Hủy bỏ
            </Button>
            <Button type="submit" form="reset-password-form" disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Xác nhận đổi'}
            </Button>
          </div>
        }
      >
        <form id="reset-password-form" className="form-grid" onSubmit={handleResetPassword}>
          <p className="modal-copy" style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
            Đặt một mật khẩu tạm thời cho <strong>{selectedUser?.fullName}</strong>. Yêu cầu khách hàng đổi lại mật khẩu sau khi đăng nhập thành công.
          </p>
          <TextField
            label="Mật khẩu tạm thời"
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  )
}
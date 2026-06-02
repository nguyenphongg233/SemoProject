// Admin users management page with create, update, delete, and reset-password actions.
import { useEffect, useMemo, useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { FormEvent, ChangeEvent } from 'react'

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

// FIX 2: Định nghĩa cấu trúc chuẩn của đối tượng User trong hệ thống
interface User {
  id: number | string | null
  fullName: string
  email: string
  phoneNumber: string
  role: string
  createdAt?: string
  updatedAt?: string
}

interface UserFormState {
  id: number | string | null
  fullName: string
  email: string
  phoneNumber: string
  password: string
}

const initialForm: UserFormState = {
  id: null,
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
}

export default function UsersPage() {
  // FIX 3: Ép kiểu state users thành User[] để hết lỗi 'never[]'
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false)
  const [form, setForm] = useState<UserFormState>(initialForm)
  // FIX 4: Định nghĩa state user đang chọn rõ ràng
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState<string>('')

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
          setError(getApiErrorMessage(err, 'Unable to load users'))
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
      { label: 'Total', value: users.length },
      { label: 'Admins', value: admins },
      { label: 'Customers', value: customers },
    ]
  }, [users])

  // FIX 5: Định nghĩa kiểu dữ liệu row: User cho các cột hiển thị dữ liệu
  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { key: 'updatedAt', label: 'Updated', render: (row: User) => formatDateTime(row.updatedAt || row.createdAt) || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: User) => (
        <div className="table-actions table-actions--wrap">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => openReset(row)}>
            Reset password
          </Button>
          <Button variant="destructive" onClick={() => openDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  function openCreate() {
    setForm(initialForm)
    setIsFormOpen(true)
  }

  function openEdit(row: User) {
    setForm({
      id: row.id,
      fullName: row.fullName || '',
      email: row.email || '',
      phoneNumber: row.phoneNumber || '',
      password: '',
    })
    setIsFormOpen(true)
  }

  function openDelete(row: User) {
    setSelectedUser(row)
    setIsDeleteOpen(true)
  }

  function openReset(row: User) {
    setSelectedUser(row)
    setNewPassword('')
    setIsResetOpen(true)
  }

  async function reloadUsers() {
    const data = await getAllUsers()
    setUsers(Array.isArray(data) ? data : [])
  }

  // FIX 6: Thêm FormEvent cho các hàm xử lý submit form
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      setError(getApiErrorMessage(err, 'Unable to save user'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedUser || selectedUser.id === null) return
    setSaving(true)
    setError('')

    try {
      await deleteUser(selectedUser.id)
      await reloadUsers()
      setIsDeleteOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete user'))
    } finally {
      setSaving(false)
    }
  }

  // FIX 6: Thêm FormEvent cho các hàm xử lý submit form
  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser || selectedUser.id === null) return

    setSaving(true)
    setError('')

    try {
      await adminResetPassword(selectedUser.id, { newPassword })
      setIsResetOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reset password'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Admin"
        title="Users"
        description="Create users, edit contact details, delete accounts, and reset passwords."
        actions={<Button onClick={openCreate}>New user</Button>}
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
          // FIX 7: Tránh lỗi check strictNull bằng optional chaining kết hợp fallback index phòng hờ
          rowKey={(row: User, index: number) => row.id?.toString() ?? `user-idx-${index}`}
          emptyMessage={loading ? 'Loading users…' : 'No users found.'}
        />
      </Card>

      <Modal
        open={isFormOpen}
        title={form.id ? 'Edit user' : 'New user'}
        onClose={() => setIsFormOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="user-form" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="user-form" className="form-grid" onSubmit={handleSubmit}>
          <TextField
            label="Full name"
            name="fullName"
            value={form.fullName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <TextField
            label="Phone number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
            required
          />
          <TextField
            label={form.id ? 'New password' : 'Password'}
            type="password"
            name="password"
            value={form.password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </form>
      </Modal>

      <Modal
        open={isDeleteOpen}
        title="Delete user"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="modal-copy">
          Are you sure you want to delete {selectedUser?.fullName || 'this user'}?
        </p>
      </Modal>

      <Modal
        open={isResetOpen}
        title="Reset password"
        onClose={() => setIsResetOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="reset-password-form" disabled={saving}>
              {saving ? 'Resetting…' : 'Reset password'}
            </Button>
          </div>
        }
      >
        <form id="reset-password-form" className="form-grid" onSubmit={handleResetPassword}>
          <TextField
            label="Temporary password"
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  )
}
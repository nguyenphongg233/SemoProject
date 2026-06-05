// Admin users management page with create, update, delete, and reset-password actions.
import { useEffect, useMemo, useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { SyntheticEvent, ChangeEvent } from 'react'

import { SectionHeader,
  Alert, Button, Card, Modal, Table, TextField
} from '@/components'
import { ROLES } from '@/constants'
import {
  adminResetPassword,
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
  toggleUserStatus,
  depositToWallet,
} from '@/features/users'
import { formatDateTime, getApiErrorMessage } from '@/utils'

// FIX 2: Định nghĩa cấu trúc chuẩn của đối tượng User trong hệ thống
interface User {
  id: number | string | null
  fullName: string
  email: string
  phoneNumber: string
  role: string
  status?: string
  balance?: number
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
  
  // Deposit state
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState<string>('')

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
    { key: 'id', label: 'ID' },
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'balance', label: 'Balance', render: (row: User) => (row.balance == null ? '-' : `VND ${row.balance.toFixed(0)}`) },
    { key: 'role', label: 'Role' },
    {
      key: 'status',
      label: 'Status',
      render: (row: User) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wider ${
          row.status === 'BANNED' 
            ? 'bg-[rgba(218,12,12,0.1)] text-[var(--warning)] border border-[rgba(218,12,12,0.3)]'
            : 'bg-[rgba(0,224,164,0.1)] text-success border border-[rgba(0,224,164,0.3)]'
        }`}>
          {row.status === 'BANNED' ? 'BANNED' : 'ACTIVE'}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (row: User) => formatDateTime(row.createdAt) || '-' },
    { key: 'updatedAt', label: 'Updated', render: (row: User) => formatDateTime(row.updatedAt || row.createdAt) || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: User) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => openDeposit(row)}>
            Top Up
          </Button>
          {row.role !== ROLES.ADMIN && (
            <Button 
              variant={row.status === 'BANNED' ? 'primary' : 'secondary'} 
              onClick={() => handleToggleStatus(row)}
              disabled={saving}
            >
              {row.status === 'BANNED' ? 'Unban' : 'Ban'}
            </Button>
          )}
          <Button variant="ghost" onClick={() => openReset(row)}>
            Reset PW
          </Button>
          {row.role !== ROLES.ADMIN && (
            <Button variant="destructive" onClick={() => openDelete(row)}>
              Delete
            </Button>
          )}
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

  function openDeposit(row: User) {
    setSelectedUser(row)
    setDepositAmount('')
    setIsDepositOpen(true)
  }

  async function reloadUsers() {
    const data = await getAllUsers()
    setUsers(Array.isArray(data) ? data : [])
  }

  // FIX 6: Thêm SyntheticEvent cho các hàm xử lý submit form
  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
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

  // FIX 6: Thêm SyntheticEvent cho các hàm xử lý submit form
  async function handleResetPassword(event: SyntheticEvent<HTMLFormElement>) {
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

  async function handleToggleStatus(row: User) {
    if (!row.id) return
    setSaving(true)
    setError('')
    try {
      await toggleUserStatus(row.id)
      await reloadUsers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to toggle user status'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeposit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser || !selectedUser.id) return
    setSaving(true)
    setError('')
    try {
      await depositToWallet({
        userId: Number(selectedUser.id),
        amount: Number(depositAmount)
      })
      await reloadUsers()
      setIsDepositOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to process deposit'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Users"
        description="Create users, edit contact details, delete accounts, and reset passwords."
        actions={<Button onClick={openCreate}>New user</Button>}
      />

      <div className="grid gap-[1.1rem] grid-cols-4 max-[980px]:grid-cols-2 max-sm:grid-cols-1">
        {summary.map((item) => (
          <Card key={item.label}>
            <p className="text-text-faded font-semibold text-sm uppercase tracking-[0.12em]">
              {item.label}
            </p>
            <div className="mt-[0.6rem] mr-0 mb-[0.4rem] ml-0 text-[2.2rem] font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--color-cyan-soft)_120%)] bg-clip-text text-transparent leading-[1.1]">
              {loading ? '—' : item.value}
            </div>
          </Card>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <Table
          columns={columns}
          rows={users}
          rowKey={(row: User, index: number) => row.id?.toString() ?? `user-idx-${index}`}
          emptyMessage={loading ? 'Loading users...' : 'No users found.'}
        />
      </Card>

      <Modal
        open={isFormOpen}
        title={form.id ? 'Edit user' : 'New user'}
        onClose={() => setIsFormOpen(false)}
        footer={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="user-form" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="user-form" className="grid gap-5" onSubmit={handleSubmit}>
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
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-text-muted">
          Are you sure you want to delete {selectedUser?.fullName || 'this user'}?
        </p>
      </Modal>

      <Modal
        open={isResetOpen}
        title="Reset password"
        onClose={() => setIsResetOpen(false)}
        footer={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="reset-password-form" disabled={saving}>
              {saving ? 'Resetting...' : 'Reset password'}
            </Button>
          </div>
        }
      >
        <form id="reset-password-form" className="grid gap-5" onSubmit={handleResetPassword}>
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

      <Modal
        open={isDepositOpen}
        title="Top Up Wallet"
        onClose={() => setIsDepositOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDepositOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="deposit-form" disabled={saving}>
              {saving ? 'Processing...' : 'Deposit'}
            </Button>
          </div>
        }
      >
        <form id="deposit-form" className="grid gap-5" onSubmit={handleDeposit}>
          <p className="text-text-muted text-sm m-0">
            Add funds to <strong>{selectedUser?.fullName}</strong>'s wallet. Current balance: VND {selectedUser?.balance?.toFixed(0) || 0}
          </p>
          <TextField
            label="Amount to Deposit (VND)"
            type="number"
            min="1000"
            step="1000"
            name="depositAmount"
            value={depositAmount}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDepositAmount(event.target.value)}
            required
            autoFocus
          />
        </form>
      </Modal>
    </div>
  )
}
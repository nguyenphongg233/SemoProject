// Admin users management page with create, update, delete, and reset-password actions.
import { useEffect, useMemo, useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { SyntheticEvent, ChangeEvent } from 'react'

import { Download, Pencil, Coins, History, Ban, Unlock, KeyRound, Trash2 } from 'lucide-react'

import { SectionHeader,
  Alert, Button, Card, Modal, Table,  TextField,
  DropdownMenu
} from '@/components'
import type { DropdownMenuItem } from '@/components/ui/DropdownMenu'
import type { TableColumn } from '@/components/ui/Table'
import { ROLES } from '@/constants'
import {
  adminResetPassword,
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
  toggleUserStatus,
  depositToWallet,
  getUserTransactions,
} from '@/features/users'
import { formatCurrency, formatDateTime, getApiErrorMessage } from '@/utils'

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

  // Search, Filter, Sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [sortByBalance, setSortByBalance] = useState<'none' | 'desc' | 'asc'>('none')

  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

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
  const columns: TableColumn<User>[] = [
    { key: 'id', label: 'ID', align: 'right' as const, isNumeric: true },
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'balance', label: 'Balance', align: 'right' as const, isNumeric: true, render: (row: User) => (row.balance == null ? '-' : formatCurrency(row.balance)) },
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
      align: 'center' as const,
      render: (row: User) => {
        const items: DropdownMenuItem[] = [
          { label: 'Edit', icon: <Pencil size={14} />, onClick: () => openEdit(row) },
          { label: 'Top Up', icon: <Coins size={14} />, onClick: () => openDeposit(row) },
          { label: 'History', icon: <History size={14} />, onClick: () => openHistory(row) },
        ];
        
        if (row.role !== ROLES.ADMIN) {
          items.push({
            label: row.status === 'BANNED' ? 'Unban' : 'Ban',
            icon: row.status === 'BANNED' ? <Unlock size={14} /> : <Ban size={14} />,
            onClick: () => handleToggleStatus(row)
          });
        }
        
        items.push({ label: 'Reset PW', icon: <KeyRound size={14} />, onClick: () => openReset(row) });
        
        if (row.role !== ROLES.ADMIN) {
          items.push({ label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: () => openDelete(row) });
        }

        return <DropdownMenu items={items} />;
      },
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

  async function openHistory(row: User) {
    setSelectedUser(row)
    setIsHistoryOpen(true)
    setHistoryLoading(true)
    setTransactions([])
    try {
      if (row.id) {
        const data = await getUserTransactions(row.id).catch(() => []) // Fallback in case API is not implemented yet
        setTransactions(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setHistoryLoading(false)
    }
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

  const filteredUsers = useMemo(() => {
    let result = users
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term) ||
          u.phoneNumber?.toLowerCase().includes(term)
      )
    }
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter)
    }
    if (sortByBalance !== 'none') {
      result = [...result].sort((a, b) => {
        const balA = a.balance || 0
        const balB = b.balance || 0
        return sortByBalance === 'asc' ? balA - balB : balB - balA
      })
    }
    return result
  }, [users, searchTerm, roleFilter, sortByBalance])

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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <TextField
              name="search"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="h-10 px-3 border border-border rounded-md bg-surface text-text-strong text-sm focus:outline-none focus:border-brand"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value={ROLES.ADMIN}>Admin</option>
            <option value={ROLES.CUSTOMER}>Customer</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary"
            title="Pending backend implementation"
            onClick={() => alert("Chức năng Export CSV hiện đang chờ Backend API.")}
            leadingIcon={<Download size={16} />}
          >
            Export CSV
          </Button>
          <Button 
            variant={sortByBalance === 'none' ? 'secondary' : 'primary'}
            onClick={() => {
              if (sortByBalance === 'none') setSortByBalance('desc')
              else if (sortByBalance === 'desc') setSortByBalance('asc')
              else setSortByBalance('none')
            }}
          >
            Sort by Balance {sortByBalance !== 'none' && (sortByBalance === 'desc' ? '↓' : '↑')}
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          rows={filteredUsers}
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

      <Modal
        open={isHistoryOpen}
        title="Wallet History"
        onClose={() => setIsHistoryOpen(false)}
        footer={
          <Button variant="secondary" onClick={() => setIsHistoryOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {historyLoading ? (
            <p className="text-center text-text-muted">Loading history...</p>
          ) : transactions.length > 0 ? (
            <Table
              columns={[
                { key: 'type', label: 'Type' },
                { key: 'amount', label: 'Amount', render: (row: any) => formatCurrency(row.amount) },
                { key: 'createdAt', label: 'Date', render: (row: any) => formatDateTime(row.createdAt) }
              ]}
              rows={transactions}
              rowKey={(row: any, i: number) => row.id || i}
            />
          ) : (
            <div className="text-center py-6 text-text-muted">
              <p>No transaction history found.</p>
              <p className="text-sm">(If this is a demo, the API might not be implemented yet)</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
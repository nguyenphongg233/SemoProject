// Admin users management page with create, update, delete, and reset-password actions.
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

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'role', label: 'Role' },
    { key: 'updatedAt', label: 'Updated', render: (row) => formatDateTime(row.updatedAt || row.createdAt) || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
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
      setError(getApiErrorMessage(err, 'Unable to save user'))
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
      setError(getApiErrorMessage(err, 'Unable to delete user'))
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
          rowKey={(row) => row.id}
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
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <TextField
            label="Phone number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
            required
          />
          <TextField
            label={form.id ? 'New password' : 'Password'}
            type="password"
            name="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
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
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  )
}
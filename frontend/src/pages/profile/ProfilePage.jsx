// User profile page with wallet deposit and password change actions.
import { useState } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { changePassword, depositToWallet } from '../../features/users'
import { formatCurrency } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

export default function ProfilePage() {
  const { user } = useAuth()
  const [depositAmount, setDepositAmount] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [balanceMessage, setBalanceMessage] = useState('')

  async function handleDeposit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await depositToWallet({ amount: Number(depositAmount) })
      setSuccess(response?.message || 'Deposit completed.')
      if (typeof response?.newBalance === 'number') {
        setBalanceMessage(`New balance: ${formatCurrency(response.newBalance)}`)
      }
      setDepositAmount('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to deposit to wallet'))
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await changePassword(user?.id, {
        currentPassword,
        newPassword,
      })
      setSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to change password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your wallet balance and password from here."
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="two-column-grid">
        <Card>
          <SectionHeader
            eyebrow="Wallet"
            title="Deposit funds"
            description="Add funds to the wallet with the minimum allowed deposit amount."
          />
          {balanceMessage && <p className="profile-note">{balanceMessage}</p>}
          <form className="form-grid" onSubmit={handleDeposit}>
            <TextField
              label="Amount"
              type="number"
              min="10000"
              step="1000"
              name="depositAmount"
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Depositing…' : 'Deposit'}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Security"
            title="Change password"
            description="Update your account password using the current password."
          />
          <form className="form-grid" onSubmit={handlePasswordChange}>
            <TextField
              label="Current password"
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
            <TextField
              label="New password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Change password'}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <SectionHeader eyebrow="Account details" title="Signed-in user" />
        <div className="profile-details">
          <div>
            <strong>Name:</strong> {user?.fullName || '-'}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || '-'}
          </div>
          <div>
            <strong>Role:</strong> {user?.role || '-'}
          </div>
        </div>
      </Card>
    </div>
  )
}
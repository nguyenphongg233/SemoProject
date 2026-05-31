// Admin rentals page for starting and ending rental sessions.
import { useState } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Modal, TextField } from '../../components/ui'
import { endRental, startRental } from '../../features/rentals'
import { formatDateTime, formatCurrency } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

const startInitial = { userId: '', scooterId: '' }

export default function RentalsPage() {
  const [startForm, setStartForm] = useState(startInitial)
  const [endRentalId, setEndRentalId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [result, setResult] = useState(null)
  const [isResultOpen, setIsResultOpen] = useState(false)

  async function handleStart(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await startRental({
        userId: Number(startForm.userId),
        scooterId: Number(startForm.scooterId),
      })

      setResult(response)
      setSuccess('Rental started successfully.')
      setIsResultOpen(true)
      setStartForm(startInitial)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to start rental'))
    } finally {
      setLoading(false)
    }
  }

  async function handleEnd(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await endRental(Number(endRentalId))
      setResult(response)
      setSuccess('Rental ended successfully.')
      setIsResultOpen(true)
      setEndRentalId('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to end rental'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Admin"
        title="Rentals"
        description="Start a rental or end it by rental ID using the backend rental endpoints."
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="two-column-grid">
        <Card>
          <SectionHeader
            eyebrow="Start"
            title="New rental"
            description="Select the user and scooter that should be connected for a new rental session."
          />
          <form className="form-grid" onSubmit={handleStart}>
            <TextField
              label="User ID"
              type="number"
              name="userId"
              value={startForm.userId}
              onChange={(event) => setStartForm((current) => ({ ...current, userId: event.target.value }))}
              required
            />
            <TextField
              label="Scooter ID"
              type="number"
              name="scooterId"
              value={startForm.scooterId}
              onChange={(event) => setStartForm((current) => ({ ...current, scooterId: event.target.value }))}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Starting…' : 'Start rental'}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="End"
            title="Close rental"
            description="Enter the rental ID to complete the trip and receive the final total price."
          />
          <form className="form-grid" onSubmit={handleEnd}>
            <TextField
              label="Rental ID"
              type="number"
              name="rentalId"
              value={endRentalId}
              onChange={(event) => setEndRentalId(event.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Ending…' : 'End rental'}
            </Button>
          </form>
        </Card>
      </div>

      <Modal
        open={isResultOpen}
        title="Rental result"
        onClose={() => setIsResultOpen(false)}
        footer={
          <div className="modal-actions">
            <Button onClick={() => setIsResultOpen(false)}>Close</Button>
          </div>
        }
      >
        {result && (
          <div className="result-list">
            <div>
              <strong>Rental ID:</strong> {result.id}
            </div>
            <div>
              <strong>Status:</strong> {result.status}
            </div>
            <div>
              <strong>Start:</strong> {formatDateTime(result.startTime) || '-'}
            </div>
            <div>
              <strong>End:</strong> {formatDateTime(result.endTime) || '-'}
            </div>
            <div>
              <strong>Total price:</strong> {formatCurrency(result.totalPrice)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
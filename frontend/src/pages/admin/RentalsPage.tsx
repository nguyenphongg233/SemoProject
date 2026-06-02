// Admin rentals page for starting and ending rental sessions.
import { useState } from 'react'
// FIX 1: Import type-only chống lỗi verbatimModuleSyntax
import type { FormEvent, ChangeEvent } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Modal, TextField } from '../../components/ui'
import { endRental, startRental } from '../../features/rentals'
import { formatDateTime, formatCurrency } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

// FIX 2: Định nghĩa cấu trúc dữ liệu trả về của một Rental Session
interface RentalResult {
  id: number | string
  status: string
  startTime: string
  endTime: string | null
  totalPrice: number
}

interface StartFormState {
  userId: string
  scooterId: string
}

const startInitial: StartFormState = { userId: '', scooterId: '' }

export default function RentalsPage() {
  const [startForm, setStartForm] = useState<StartFormState>(startInitial)
  const [endRentalId, setEndRentalId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  // FIX 3: Định nghĩa rõ state có thể là RentalResult hoặc null thay vì tự suy luận thành never
  const [result, setResult] = useState<RentalResult | null>(null)
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false)

  // FIX 4: Khai báo kiểu dữ liệu FormEvent cho tham số event
  async function handleStart(event: FormEvent<HTMLFormElement>) {
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

  // FIX 4: Khai báo kiểu dữ liệu FormEvent cho tham số event
  async function handleEnd(event: FormEvent<HTMLFormElement>) {
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
              onChange={(event: ChangeEvent<HTMLInputElement>) => setStartForm((current) => ({ ...current, userId: event.target.value }))}
              required
            />
            <TextField
              label="Scooter ID"
              type="number"
              name="scooterId"
              value={startForm.scooterId}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setStartForm((current) => ({ ...current, scooterId: event.target.value }))}
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
              onChange={(event: ChangeEvent<HTMLInputElement>) => setEndRentalId(event.target.value)}
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
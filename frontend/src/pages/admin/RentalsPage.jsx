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
      setSuccess('Đã khởi tạo chuyến đi thành công.')
      setIsResultOpen(true)
      setStartForm(startInitial)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không thể khởi tạo chuyến đi.'))
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
      setSuccess('Đã kết thúc chuyến đi và tính phí thành công.')
      setIsResultOpen(true)
      setEndRentalId('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không thể kết thúc chuyến đi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Quản trị"
        title="Quản lý Chuyến đi"
        description="Khởi tạo chuyến đi mới hoặc kết thúc phiên thuê để thanh toán."
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="two-column-grid">
        <Card>
          <SectionHeader
            eyebrow="Thao tác"
            title="Tạo chuyến đi mới"
            description="Nhập User ID và Scooter ID để bắt đầu tính giờ thuê."
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
              {loading ? 'Đang xử lý...' : 'Bắt đầu thuê'}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Thao tác"
            title="Kết thúc chuyến đi"
            description="Nhập Rental ID để dừng tính giờ và chốt tổng tiền."
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
              {loading ? 'Đang xử lý...' : 'Kết thúc thuê'}
            </Button>
          </form>
        </Card>
      </div>

      <Modal
        open={isResultOpen}
        title="Thông tin Chuyến đi"
        onClose={() => setIsResultOpen(false)}
        footer={
          <div className="modal-actions">
            <Button onClick={() => setIsResultOpen(false)}>Đóng</Button>
          </div>
        }
      >
        {result && (
          <div className="result-list">
            <div>
              <strong>Rental ID:</strong> {result.id}
            </div>
            <div>
              <strong>Trạng thái:</strong> {result.status === 'COMPLETED' ? 'Đã hoàn thành' : result.status}
            </div>
            <div>
              <strong>Giờ bắt đầu:</strong> {formatDateTime(result.startTime) || '-'}
            </div>
            <div>
              <strong>Giờ kết thúc:</strong> {formatDateTime(result.endTime) || '-'}
            </div>
            <div>
              <strong>Tổng thanh toán:</strong> {formatCurrency(result.totalPrice)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
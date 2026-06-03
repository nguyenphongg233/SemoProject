import { useState } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Modal, Table, TextField } from '../../components/ui'
import { createMaintenanceLog, getMaintenanceLogsByScooterId, resolveMaintenance } from '../../features/maintenance'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

const initialCreate = { scooterId: '', description: '', cost: '' }

export default function MaintenancePage() {
  const [createForm, setCreateForm] = useState(initialCreate)
  const [searchScooterId, setSearchScooterId] = useState('')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isResolveOpen, setIsResolveOpen] = useState(false)
  const [resolveScooterId, setResolveScooterId] = useState('')

  async function handleCreate(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await createMaintenanceLog({
        scooterId: Number(createForm.scooterId),
        description: createForm.description,
        cost: Number(createForm.cost),
      })
      setCreateForm(initialCreate)
      setSuccess('Đã tạo phiếu bảo trì thành công.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không thể tạo phiếu.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await getMaintenanceLogsByScooterId(Number(searchScooterId))
      setLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không tải được lịch sử.'))
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const message = await resolveMaintenance(Number(resolveScooterId))
      setSuccess(typeof message === 'string' ? message : 'Đã cập nhật trạng thái xe thành công.')
      setIsResolveOpen(false)
      setResolveScooterId('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi: Không thể hoàn tất sửa xe.'))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID Phiếu' },
    { key: 'description', label: 'Mô tả' },
    { key: 'cost', label: 'Chi phí', render: (row) => formatCurrency(row.cost) },
    { key: 'createdAt', label: 'Ngày tạo', render: (row) => formatDateTime(row.createdAt) || '-' },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Quản trị"
        title="Bảo trì"
        description="Quản lý phiếu sửa chữa, tra cứu lịch sử và xác nhận tình trạng xe."
        actions={<Button onClick={() => setIsResolveOpen(true)}>Hoàn tất sửa xe</Button>}
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="two-column-grid">
        <Card>
          <SectionHeader
            eyebrow="Thao tác"
            title="Lập phiếu bảo trì"
            description="Ghi nhận lỗi, chi phí và ID xe cần thực hiện bảo dưỡng."
          />
          <form className="form-grid" onSubmit={handleCreate}>
            <TextField
              label="Scooter ID"
              type="number"
              name="scooterId"
              value={createForm.scooterId}
              onChange={(event) => setCreateForm((current) => ({ ...current, scooterId: event.target.value }))}
              required
            />
            <TextField
              label="Mô tả"
              name="description"
              value={createForm.description}
              onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
            <TextField
              label="Chi phí"
              type="number"
              name="cost"
              min="0"
              step="0.01"
              value={createForm.cost}
              onChange={(event) => setCreateForm((current) => ({ ...current, cost: event.target.value }))}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Tạo phiếu'}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Tra cứu"
            title="Lịch sử xe"
            description="Nhập Scooter ID để xem toàn bộ nhật ký sửa chữa của xe."
          />
          <form className="form-grid" onSubmit={handleSearch}>
            <TextField
              label="Scooter ID"
              type="number"
              name="searchScooterId"
              value={searchScooterId}
              onChange={(event) => setSearchScooterId(event.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tải...' : 'Tìm kiếm'}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          rows={logs}
          rowKey={(row) => row.id}
          emptyMessage="Chưa có dữ liệu nào."
        />
      </Card>

      <Modal
        open={isResolveOpen}
        title="Hoàn tất sửa chữa"
        onClose={() => setIsResolveOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsResolveOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="resolve-form" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        }
      >
        <form id="resolve-form" className="form-grid" onSubmit={handleResolve}>
          <TextField
            label="Scooter ID"
            type="number"
            name="resolveScooterId"
            value={resolveScooterId}
            onChange={(event) => setResolveScooterId(event.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  )
}
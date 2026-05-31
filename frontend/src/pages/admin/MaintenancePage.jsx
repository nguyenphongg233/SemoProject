// Admin maintenance page for creating logs, searching scooter history, and resolving service.
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
      setSuccess('Maintenance log created successfully.')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create maintenance log'))
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
      setError(getApiErrorMessage(err, 'Unable to load maintenance logs'))
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
      setSuccess(typeof message === 'string' ? message : 'Maintenance resolved successfully.')
      setIsResolveOpen(false)
      setResolveScooterId('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to resolve maintenance'))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'description', label: 'Description' },
    { key: 'cost', label: 'Cost', render: (row) => formatCurrency(row.cost) },
    { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) || '-' },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Admin"
        title="Maintenance"
        description="Create logs, search scooter history, and mark a scooter as resolved."
        actions={<Button onClick={() => setIsResolveOpen(true)}>Resolve scooter</Button>}
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="two-column-grid">
        <Card>
          <SectionHeader
            eyebrow="Create"
            title="New maintenance log"
            description="Record an issue, cost, and scooter ID when service is needed."
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
              label="Description"
              name="description"
              value={createForm.description}
              onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
              required
            />
            <TextField
              label="Cost"
              type="number"
              name="cost"
              min="0"
              step="0.01"
              value={createForm.cost}
              onChange={(event) => setCreateForm((current) => ({ ...current, cost: event.target.value }))}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Create log'}
            </Button>
          </form>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Search"
            title="Scooter history"
            description="Load the maintenance logs for one scooter using its ID."
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
              {loading ? 'Loading…' : 'Load logs'}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          rows={logs}
          rowKey={(row) => row.id}
          emptyMessage="No maintenance logs loaded yet."
        />
      </Card>

      <Modal
        open={isResolveOpen}
        title="Resolve scooter"
        onClose={() => setIsResolveOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsResolveOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="resolve-form" disabled={loading}>
              {loading ? 'Resolving…' : 'Resolve'}
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
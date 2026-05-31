// Admin scooters management page with create/update support.
import { useEffect, useMemo, useState } from 'react'

import { SectionHeader } from '../../components/layout'
import ScooterMap from '../../components/map/ScooterMap'
import { Alert, Button, Card, Modal, Table, TextField } from '../../components/ui'
import { SCOOTER_STATUSES } from '../../constants/statuses'
import { createScooter, getAllScooters, updateScooter } from '../../features/scooters'
import { formatBatteryLevel, formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

const initialForm = {
  id: null,
  name: '',
  batteryLevel: 100,
  status: SCOOTER_STATUSES.AVAILABLE,
  currentLat: '',
  currentLng: '',
}

function getStatusLabel(status) {
  const labels = {
    [SCOOTER_STATUSES.AVAILABLE]: 'Available',
    [SCOOTER_STATUSES.IN_USE]: 'In use',
    [SCOOTER_STATUSES.MAINTENANCE]: 'Maintenance',
  }

  return labels[status] || status || 'Unknown'
}

export default function ScootersPage() {
  const [scooters, setScooters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    let mounted = true

    async function loadScooters() {
      try {
        setLoading(true)
        setError('')
        const data = await getAllScooters()
        if (mounted) {
          setScooters(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err, 'Unable to load scooters'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadScooters()
    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    const total = scooters.length
    const available = scooters.filter((item) => item.status === SCOOTER_STATUSES.AVAILABLE).length
    const inUse = scooters.filter((item) => item.status === SCOOTER_STATUSES.IN_USE).length
    const maintenance = scooters.filter((item) => item.status === SCOOTER_STATUSES.MAINTENANCE).length

    return [
      { label: 'Total', value: total },
      { label: 'Available', value: available },
      { label: 'In use', value: inUse },
      { label: 'Maintenance', value: maintenance },
    ]
  }, [scooters])

  const columns = [
    { key: 'name', label: 'Scooter' },
    { key: 'batteryLevel', label: 'Battery', render: (row) => formatBatteryLevel(row.batteryLevel) },
    { key: 'status', label: 'Status', render: (row) => getStatusLabel(row.status) },
    {
      key: 'location',
      label: 'Location',
      render: (row) =>
        row.currentLat && row.currentLng ? `${Number(row.currentLat).toFixed(5)}, ${Number(row.currentLng).toFixed(5)}` : '-',
    },
    { key: 'updatedAt', label: 'Updated', render: (row) => formatDateTime(row.updatedAt || row.createdAt) || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]

  function openCreate() {
    setForm(initialForm)
    setIsModalOpen(true)
  }

  function handleMapClick({ lat, lng }) {
    setForm({
      id: null,
      name: '',
      batteryLevel: 100,
      status: SCOOTER_STATUSES.AVAILABLE,
      currentLat: lat?.toFixed ? lat.toFixed(5) : lat,
      currentLng: lng?.toFixed ? lng.toFixed(5) : lng,
    })
    setIsModalOpen(true)
  }

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || '',
      batteryLevel: row.batteryLevel ?? 100,
      status: row.status || SCOOTER_STATUSES.AVAILABLE,
      currentLat: row.currentLat ?? '',
      currentLng: row.currentLng ?? '',
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      batteryLevel: Number(form.batteryLevel),
      status: form.status,
      currentLat: form.currentLat === '' ? null : Number(form.currentLat),
      currentLng: form.currentLng === '' ? null : Number(form.currentLng),
    }

    try {
      if (form.id) {
        await updateScooter(form.id, payload)
      } else {
        await createScooter(payload)
      }

      const data = await getAllScooters()
      setScooters(Array.isArray(data) ? data : [])
      setIsModalOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save scooter'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Admin"
        title="Scooters"
        description="Create and update scooters, battery levels, and fleet status."
        actions={<Button onClick={openCreate}>New scooter</Button>}
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
        <div style={{ height: 420 }}>
          <ScooterMap scooters={scooters} onMapClick={handleMapClick} />
        </div>
        <p className="muted small" style={{ marginTop: 8 }}>
          Click on the map to add a scooter at that location.
        </p>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={scooters}
          rowKey={(row) => row.id}
          emptyMessage={loading ? 'Loading scooters…' : 'No scooters available.'}
        />
      </Card>

      <Modal
        open={isModalOpen}
        title={form.id ? 'Edit scooter' : 'New scooter'}
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="scooter-form" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="scooter-form" className="form-grid" onSubmit={handleSubmit}>
          <TextField
            label="Scooter name"
            name="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />

          <TextField
            label="Battery level"
            type="number"
            name="batteryLevel"
            min="0"
            max="100"
            value={form.batteryLevel}
            onChange={(event) => setForm((current) => ({ ...current, batteryLevel: event.target.value }))}
            required
          />

          <TextField
            label="Latitude"
            type="number"
            name="currentLat"
            step="0.00001"
            value={form.currentLat}
            onChange={(event) => setForm((current) => ({ ...current, currentLat: event.target.value }))}
            placeholder="21.00520"
          />

          <TextField
            label="Longitude"
            type="number"
            name="currentLng"
            step="0.00001"
            value={form.currentLng}
            onChange={(event) => setForm((current) => ({ ...current, currentLng: event.target.value }))}
            placeholder="105.84330"
          />

          <label className="ui-field">
            <span className="ui-field__label">Status</span>
            <select
              className="ui-input"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              {Object.values(SCOOTER_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Modal>
    </div>
  )
}
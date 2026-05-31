// Dashboard landing page backed by live scooter data from the API.
import { useEffect, useMemo, useState } from 'react'

import { SectionHeader } from '../../components/layout'
import { Card, Table } from '../../components/ui'
import ScooterMap from '../../components/map/ScooterMap'
import { getAllScooters } from '../../features/scooters'
import { SCOOTER_STATUSES } from '../../constants/statuses'
import { formatBatteryLevel, formatDateTime } from '../../utils/formatters'

const statusMeta = {
  [SCOOTER_STATUSES.AVAILABLE]: { label: 'Available', className: 'is-available' },
  [SCOOTER_STATUSES.IN_USE]: { label: 'In use', className: 'is-in-use' },
  [SCOOTER_STATUSES.MAINTENANCE]: { label: 'Maintenance', className: 'is-maintenance' },
}

function getStatusLabel(status) {
  return statusMeta[status]?.label || status || 'Unknown'
}

function getStatusClassName(status) {
  return statusMeta[status]?.className || 'is-unknown'
}

export default function DashboardPage() {
  const [scooters, setScooters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isActive = true

    async function loadScooters() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllScooters()

        if (!isActive) {
          return
        }

        setScooters(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!isActive) {
          return
        }

        setError(err?.response?.data?.message || err?.message || 'Unable to load scooters')
        setScooters([])
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadScooters()

    return () => {
      isActive = false
    }
  }, [])

  const summaryCards = useMemo(() => {
    const total = scooters.length
    const available = scooters.filter((scooter) => scooter.status === SCOOTER_STATUSES.AVAILABLE).length
    const inUse = scooters.filter((scooter) => scooter.status === SCOOTER_STATUSES.IN_USE).length
    const maintenance = scooters.filter((scooter) => scooter.status === SCOOTER_STATUSES.MAINTENANCE).length

    return [
      { label: 'Total scooters', value: total, note: 'Live from /api/scooters' },
      { label: 'Available', value: available, note: 'Ready to rent now' },
      { label: 'In use', value: inUse, note: 'Currently on trips' },
      { label: 'Maintenance', value: maintenance, note: 'Needs service attention' },
    ]
  }, [scooters])

  const scooterRows = useMemo(() => {
    return [...scooters]
      .sort((left, right) => {
        const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime()
        const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime()
        return rightTime - leftTime
      })
      .slice(0, 5)
  }, [scooters])

  const scooterColumns = [
    {
      key: 'name',
      label: 'Scooter',
      render: (row) => row.name || `#${row.id}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <span className={`status-pill ${getStatusClassName(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    {
      key: 'batteryLevel',
      label: 'Battery',
      render: (row) => formatBatteryLevel(row.batteryLevel),
    },
    {
      key: 'updatedAt',
      label: 'Last updated',
      render: (row) => formatDateTime(row.updatedAt || row.createdAt) || '-',
    },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A live snapshot of the scooter fleet pulled directly from the API."
      />

      <div className="stats-grid">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <p className="stat-card__label">{card.label}</p>
            <div className="stat-card__value">{loading ? '—' : card.value}</div>
            <p className="stat-card__note">{card.note}</p>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader
          eyebrow="Map view"
          title="Scooters around Bach Khoa"
          description="Live scooter positions rendered on a real OpenStreetMap layer using their current coordinates."
        />
        {error && <div className="ui-alert ui-alert--error dashboard__error">{error}</div>}
        <ScooterMap scooters={scooters} />
      </Card>

      <Card>
        <SectionHeader
          eyebrow="Fleet inventory"
          title="Recent scooters"
          description="The latest scooters returned by the backend, sorted by their last update time."
        />
        {error && <div className="ui-alert ui-alert--error dashboard__error">{error}</div>}
        <Table
          columns={scooterColumns}
          rows={scooterRows}
          rowKey={(row) => row.id}
          emptyMessage={loading ? 'Loading scooters…' : 'No scooters found yet.'}
        />
      </Card>
    </div>
  )
}
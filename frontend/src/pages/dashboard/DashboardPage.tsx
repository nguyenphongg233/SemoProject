// Dashboard người dùng — Tech Blue Luxury (phong cách cockpit phi thuyền / EV).
// Dữ liệu lấy trực tiếp từ API getAllScooters → /api/scooters.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bike,
  BatteryFull,
  MapPin,
  Wrench,
  Sparkles,
  Navigation,
  RefreshCcw,
  Gauge,
} from 'lucide-react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Table } from '../../components/ui'
import ScooterMap from '../../components/map/ScooterMap'
import { getAllScooters } from '../../features/scooters'
import { SCOOTER_STATUSES } from '../../constants/statuses'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import { formatBatteryLevel, formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'
import type { Scooter } from '../../types/models'

const statusMeta: Record<string, { label: string; className: string }> = {
  [SCOOTER_STATUSES.AVAILABLE]:   { label: 'Available',     className: 'is-available' },
  [SCOOTER_STATUSES.IN_USE]:      { label: 'In Use',      className: 'is-in-use' },
  [SCOOTER_STATUSES.MAINTENANCE]: { label: 'Under Maintenance', className: 'is-maintenance' },
}

function getStatusLabel(status: string): string {
  return statusMeta[status]?.label || status || 'Unknown'
}
function getStatusClassName(status: string): string {
  return statusMeta[status]?.className || 'is-unknown'
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [scooters, setScooters] = useState<Scooter[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  useEffect(() => {
    let isActive = true

    async function loadScooters() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllScooters()
        if (!isActive) return
        setScooters(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!isActive) return
        setError(getApiErrorMessage(err, 'Failed to load scooter list. Please try again later.'))
        setScooters([])
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadScooters()
    return () => { isActive = false }
  }, [refreshKey])

  const summary = useMemo(() => {
    const total = scooters.length
    const available = scooters.filter((s) => s.status === SCOOTER_STATUSES.AVAILABLE).length
    const inUse = scooters.filter((s) => s.status === SCOOTER_STATUSES.IN_USE).length
    const maintenance = scooters.filter((s) => s.status === SCOOTER_STATUSES.MAINTENANCE).length

    const batteryLevels = scooters
      .map((s) => Number(s.batteryLevel))
      .filter((n) => Number.isFinite(n))
    const avgBattery = batteryLevels.length
      ? Math.round(batteryLevels.reduce((a, b) => a + b, 0) / batteryLevels.length)
      : 0

    return { total, available, inUse, maintenance, avgBattery }
  }, [scooters])

  const summaryCards = useMemo(() => ([
    {
      label: 'Total scooters',
      value: summary.total,
      note: 'All scooters in the system',
      icon: <Bike size={20} strokeWidth={1.7} />,
    },
    {
      label: 'Available for Rent',
      value: summary.available,
      note: 'Scooters ready for rental',
      icon: <Sparkles size={20} strokeWidth={1.7} />,
    },
    {
      label: 'Average Battery',
      value: `${summary.avgBattery}%`,
      note: 'Calculated across all scooters',
      icon: <BatteryFull size={20} strokeWidth={1.7} />,
    },
    {
      label: 'Under Maintenance',
      value: summary.maintenance,
      note: 'Temporarily unavailable',
      icon: <Wrench size={20} strokeWidth={1.7} />,
    },
  ]), [summary])

  const scooterRows = useMemo(() => {
    return [...scooters]
      .sort((l, r) => {
        const lt = new Date(l.updatedAt || l.createdAt || 0).getTime()
        const rt = new Date(r.updatedAt || r.createdAt || 0).getTime()
        return rt - lt
      })
      .slice(0, 6)
  }, [scooters])

  const scooterColumns = [
    {
      key: 'name',
      label: 'Scooter',
      render: (row: Scooter) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Bike size={16} strokeWidth={1.8} style={{ color: 'var(--color-cyan-soft)' }} />
          {row.name || `#${row.id}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Scooter) => (
        <span className={`status-pill ${getStatusClassName(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'batteryLevel',
      label: 'Battery',
      render: (row: Scooter) => {
        const lvl = Number(row.batteryLevel)
        const tone =
          Number.isFinite(lvl) && lvl >= 50 ? 'var(--success)' :
          Number.isFinite(lvl) && lvl >= 25 ? 'var(--warning)' : 'var(--danger)'
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: tone, fontWeight: 600 }}>
            <BatteryFull size={16} strokeWidth={1.8} />
            {formatBatteryLevel(row.batteryLevel) || '—'}
          </span>
        )
      },
    },
    {
      key: 'updatedAt',
      label: 'Lastest update',
      render: (row: Scooter) => formatDateTime(row.updatedAt || row.createdAt) || '—',
    },
  ]

  const greetingName = user?.fullName || 'User'
  console.log(user)
  console.log(greetingName)

  return (
    <div className="page-stack">
      <section className="dashboard-hero">
        <div className="dashboard-hero__row">
          <div>
            <p className="dashboard-hero__eyebrow">Hello, {greetingName}</p>
            <h2 className="dashboard-hero__title">System is fully operational.</h2>
            <p className="dashboard-hero__sub">
              Track e-scooter fleet status in real-time, manage trips, and top
              up your wallet — all in one high-tech dashboard.
            </p>
          </div>
          <div className="dashboard-hero__cta">
            <Button
              variant="secondary"
              onClick={() => setRefreshKey((k) => k + 1)}
              leadingIcon={<RefreshCcw size={16} strokeWidth={1.8} />}
            >
              Refresh Data
            </Button>
            <Link to={ROUTES.PROFILE} style={{ textDecoration: 'none' }}>
              <Button leadingIcon={<Gauge size={16} strokeWidth={1.8} />}>
                Manage Wallet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {error && <Alert>{error}</Alert>}

      <div className="stats-grid stats-grid--compact">
        {summaryCards.map((card) => (
          <Card key={card.label} variant="glow">
            <div className="stat-card__head">
              <p className="stat-card__label">{card.label}</p>
              <span className="stat-card__icon">{card.icon}</span>
            </div>
            <div className="stat-card__value">{loading ? '—' : card.value}</div>
            <p className="stat-card__note">{card.note}</p>
          </Card>
        ))}
      </div>

      {/* Map view */}
      <Card>
        <SectionHeader
          eyebrow="Live map"
          title="Scooters around HUST campus"
          description="Scooter locations are plotted in real-time on OpenStreetMap based on current coordinates."
          actions={(
            <span className="inline-flex items-center gap-[0.4rem] text-(--color-cyan-soft) text-[0.85rem] font-semibold">
              <Navigation size={20} strokeWidth={1.8} /> Live
            </span>
          )}
        />
        <div style={{ height: 12 }} />
        <ScooterMap scooters={scooters} />
      </Card>

      {/* Recent list */}
      <Card>
        <SectionHeader
          eyebrow="Scooter List"
          title="Latest Updates"
          description="Scooters updated most recently, sorted by time."
          actions={(
            <span className="inline-flex items-center gap-1.5 text-(--text-muted) text-3">
              <MapPin size={16} strokeWidth={1.8} /> Total {summary.total} scooters
            </span>
          )}
        />
        <div style={{ height: 12 }} />
        <Table
          columns={scooterColumns}
          rows={scooterRows}
          rowKey={(row: Scooter, idx: number) => row.id?.toString() ?? `dash-scooter-idx-${idx}`}
          emptyMessage={loading ? 'Loading scooter list...' : 'No scooters available.'}
        />
      </Card>
    </div>
  )
}
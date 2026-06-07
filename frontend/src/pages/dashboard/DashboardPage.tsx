// Dashboard người dùng — Tech Blue Luxury (phong cách cockpit phi thuyền / EV).
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

import { TrendingUp, TrendingDown } from 'lucide-react'
import { SectionHeader,
  Alert, Button, Card, Table,
  ScooterMap
} from '@/components'
import { getAllScooters } from '@/features/scooters'
import { SCOOTER_STATUSES, ROUTES } from '@/constants'
import { useAuth } from '@/hooks/useAuth'
import { formatBatteryLevel, formatDateTime, getApiErrorMessage, cn } from '@/utils'
import type { Scooter } from '@/types/models'

const statusMeta: Record<string, { label: string; className: string }> = {
  [SCOOTER_STATUSES.AVAILABLE]:   { label: 'Available',     className: 'is-available' },
  [SCOOTER_STATUSES.IN_USE]:      { label: 'In Use',        className: 'is-in-use' },
  [SCOOTER_STATUSES.MAINTENANCE]: { label: 'Under Maintenance', className: 'is-maintenance' },
}

function getStatusLabel(status: string): string {
  return statusMeta[status]?.label || status || 'Unknown'
}
const getStatusClassName = (status: string): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'text-accent bg-accent/12 border-accent/32 shadow-[0_0_12px_rgba(0,209,255,0.18)]';
    
    case 'IN_USE':
      return 'text-electric-soft bg-brand/14 border-brand/32 shadow-[0_0_12px_rgba(0,82,255,0.2)]';
    
    case 'MAINTENANCE':
      return 'text-warning bg-warning/14 border-warning/32';
    
    default:
      return 'text-text-muted bg-[rgba(120,140,175,0.14)] border-[rgba(120,140,175,0.28)]';
  }
};

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
      trend: '+12% this week',
      trendPositive: true
    },
    {
      label: 'Available for Rent',
      value: summary.available,
      note: 'Scooters ready for rental',
      icon: <Sparkles size={20} strokeWidth={1.7} />,
      trend: '+5% this week',
      trendPositive: true
    },
    {
      label: 'Average Battery',
      value: `${summary.avgBattery}%`,
      note: 'Calculated across all scooters',
      icon: <BatteryFull size={20} strokeWidth={1.7} />,
      trend: '-2% today',
      trendPositive: false
    },
    {
      label: 'Under Maintenance',
      value: summary.maintenance,
      note: 'Temporarily unavailable',
      icon: <Wrench size={20} strokeWidth={1.7} />,
      trend: '-1 from yesterday',
      trendPositive: true
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
        <span className="inline-flex items-center gap-2 font-semibold">
          <Bike size={16} strokeWidth={1.8} className="text-cyan-soft" />
          {row.name || `#${row.id}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Scooter) => (
        <span 
          className={cn(
            "inline-flex items-center justify-center gap-[0.35rem] min-h-8",
            "px-[0.85rem] rounded-full text-[0.78rem] font-bold",
            "tracking-[0.04em] border border-transparent",
            getStatusClassName(row.status)
          )}
        >
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'batteryLevel',
      label: 'Battery',
      render: (row: Scooter) => {
        const lvl = Number(row.batteryLevel)
        const colorClass =
          Number.isFinite(lvl) && lvl >= 50 ? 'text-success' :
          Number.isFinite(lvl) && lvl >= 25 ? 'text-warning' : 'text-danger';
        return (
          <span className={cn("inline-flex items-center gap-[0.45rem] font-semibold", colorClass)}>
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

  return (
    <div className="grid gap-6">
      <section className="relative p-8 px-[2.2rem] rounded-lg
        bg-[radial-gradient(circle_at_90%_-20%,rgba(0,209,255,0.4),transparent_55%),radial-gradient(circle_at_-10%_120%,rgba(109,93,255,0.4),transparent_60%),linear-gradient(135deg,rgba(0,82,255,0.85),rgba(11,17,32,0.92))]
        border border-border-glow shadow-glow-blue overflow-hidden
        text-white after:content-[''] after:absolute after:inset-0
        after:pointer-events-none after:opacity-60"
      >
        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="m-0 text-cyan-soft uppercase tracking-[0.2em] text-[0.72rem] font-bold">
              Hello, {greetingName}
            </p>
            <h2 className="mt-[0.3rem] mr-0 mb-[0.6rem] ml-0 text-[clamp(1.8rem,3vw,2.5rem)] tracking-[-0.03em]">
              System is fully operational.
            </h2>
            <p className="m-0 text-[#e6eeff]/78 max-w-[50ch]">
              Track e-scooter fleet status in real-time, manage trips, and top
              up your wallet — all in one high-tech dashboard.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => setRefreshKey((k) => k + 1)}
              leadingIcon={<RefreshCcw size={16} strokeWidth={1.8} />}
            >
              Refresh Data
            </Button>
            <Link to={ROUTES.ACCOUNT} className="no-underline">
              <Button leadingIcon={<Gauge size={16} strokeWidth={1.8} />}>
                Manage Wallet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-[1.1rem] grid-cols-4 max-[980px]:grid-cols-2 max-sm:grid-cols-1">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-slate-800/80 backdrop-blur-md border border-white/5 p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs tracking-wider text-slate-400 uppercase font-semibold">
                  {card.label}
                </p>
                <span className="w-8 h-8 rounded-lg grid place-items-center bg-white/5 border border-white/10 text-cyan-400">
                  {card.icon}
                </span>
              </div>
              
              <div className="flex items-end justify-between mt-1">
                <div className="text-3xl font-bold text-white">
                  {loading ? '—' : card.value}
                </div>
                
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${card.trendPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                  {card.trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.trend}
                </div>
              </div>
            </div>
        ))}
      </div>

      <Card>
        <SectionHeader
          eyebrow="Live map"
          title="Scooters around HUST campus"
          description="Scooter locations are plotted in real-time
            on OpenStreetMap based on current coordinates."
          actions={(
            <span className="inline-flex items-center gap-1.5 text-cyan-soft font-semibold">
              <Navigation size={20} strokeWidth={1.8} /> Live
            </span>
          )}
        />
        <div className="mt-3">
          <ScooterMap scooters={scooters} />
        </div>
      </Card>


      <Card>
        <SectionHeader
          eyebrow="Scooter List"
          title="Latest Updates"
          description="Scooters updated most recently, sorted by time."
          actions={(
            <span className="inline-flex items-center gap-1.5 text-text-muted">
              <MapPin size={16} strokeWidth={1.8} /> Total {summary.total} scooters
            </span>
          )}
        />
        <div className="mt-3">
          <Table
            columns={scooterColumns}
            rows={scooterRows}
            rowKey={(row: Scooter, idx: number) => row.id?.toString() ?? `dash-scooter-idx-${idx}`}
            emptyMessage={loading ? 'Loading scooter list...' : 'No scooters available.'}
          />
        </div>
      </Card>
    </div>
  )
}
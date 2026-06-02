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
// FIX 1: Tái sử dụng Type Scooter chính xác của hệ thống
import type { Scooter } from '../../types/models'

const statusMeta: Record<string, { label: string; className: string }> = {
  [SCOOTER_STATUSES.AVAILABLE]:   { label: 'Sẵn sàng',     className: 'is-available' },
  [SCOOTER_STATUSES.IN_USE]:      { label: 'Đang đi',      className: 'is-in-use' },
  [SCOOTER_STATUSES.MAINTENANCE]: { label: 'Đang bảo trì', className: 'is-maintenance' },
}

// FIX 2: Thêm kiểu dữ liệu string cho tham số status
function getStatusLabel(status: string): string {
  return statusMeta[status]?.label || status || 'Không xác định'
}
function getStatusClassName(status: string): string {
  return statusMeta[status]?.className || 'is-unknown'
}

export default function DashboardPage() {
  const { user } = useAuth()

  // FIX 3: Ép kiểu dữ liệu mảng Scooter[] thay vì để mặc định thành never[]
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
        // FIX 4: Thay thế cách chấm chuỗi không an toàn bằng utils getApiErrorMessage có sẵn trong dự án của bạn
        setError(getApiErrorMessage(err, 'Không thể tải danh sách xe.'))
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
      label: 'Tổng số xe',
      value: summary.total,
      note: 'Dữ liệu trực tiếp từ /api/scooters',
      icon: <Bike size={20} strokeWidth={1.7} />,
    },
    {
      label: 'Sẵn sàng thuê',
      value: summary.available,
      note: 'Xe sẵn sàng phục vụ bạn ngay',
      icon: <Sparkles size={20} strokeWidth={1.7} />,
    },
    {
      label: 'Pin trung bình',
      value: `${summary.avgBattery}%`,
      note: 'Tính trên toàn đội xe',
      icon: <BatteryFull size={20} strokeWidth={1.7} />,
    },
    {
      label: 'Đang bảo trì',
      value: summary.maintenance,
      note: 'Tạm thời không khả dụng',
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

  // FIX 5: Chỉ định rõ kiểu dữ liệu row: Scooter cho các hàm render cột của bảng
  const scooterColumns = [
    {
      key: 'name',
      label: 'Xe điện',
      render: (row: Scooter) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Bike size={16} strokeWidth={1.8} style={{ color: 'var(--color-cyan-soft)' }} />
          {row.name || `#${row.id}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: Scooter) => (
        <span className={`status-pill ${getStatusClassName(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'batteryLevel',
      label: 'Pin',
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
      label: 'Cập nhật gần nhất',
      render: (row: Scooter) => formatDateTime(row.updatedAt || row.createdAt) || '—',
    },
  ]

  const greetingName = user?.fullName?.split(' ').slice(-1)[0] || 'bạn'

  return (
    <div className="page-stack">
      {/* Hero — phong cách cockpit EV */}
      <section className="dashboard-hero">
        <div className="dashboard-hero__row">
          <div>
            <p className="dashboard-hero__eyebrow">Xin chào, {greetingName}</p>
            <h2 className="dashboard-hero__title">Hệ thống đang sẵn sàng.</h2>
            <p className="dashboard-hero__sub">
              Theo dõi tình trạng đội xe điện theo thời gian thực, quản lý hành trình và nạp ví —
              tất cả trong một bảng điều khiển công nghệ cao.
            </p>
          </div>
          <div className="dashboard-hero__cta">
            <Button
              variant="secondary"
              onClick={() => setRefreshKey((k) => k + 1)}
              leadingIcon={<RefreshCcw size={16} strokeWidth={1.8} />}
            >
              Làm mới dữ liệu
            </Button>
            <Link to={ROUTES.PROFILE} style={{ textDecoration: 'none' }}>
              <Button leadingIcon={<Gauge size={16} strokeWidth={1.8} />}>
                Quản lý ví
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {error && <Alert>{error}</Alert>}

      {/* Stats grid — cockpit cards */}
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
          eyebrow="Bản đồ trực tiếp"
          title="Xe điện quanh Bách Khoa"
          description="Vị trí các xe được vẽ trực tiếp lên bản đồ OpenStreetMap từ toạ độ hiện tại."
          actions={(
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: 'var(--color-cyan-soft)', fontSize: '0.85rem', fontWeight: 600,
            }}>
              <Navigation size={16} strokeWidth={1.8} /> Live
            </span>
          )}
        />
        <div style={{ height: 12 }} />
        <ScooterMap scooters={scooters} />
      </Card>

      {/* Recent list */}
      <Card>
        <SectionHeader
          eyebrow="Danh sách xe"
          title="Cập nhật gần nhất"
          description="Các xe được backend cập nhật mới nhất, sắp xếp theo thời gian."
          actions={(
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: 'var(--text-muted)', fontSize: '0.85rem',
            }}>
              <MapPin size={16} strokeWidth={1.8} /> Tổng cộng {summary.total} xe
            </span>
          )}
        />
        <div style={{ height: 12 }} />
        <Table
          columns={scooterColumns}
          rows={scooterRows}
          // FIX 6: Xử lý an toàn null-check cho row.id bằng optional chaining + fallback index
          rowKey={(row: Scooter, idx: number) => row.id?.toString() ?? `dash-scooter-idx-${idx}`}
          emptyMessage={loading ? 'Đang tải danh sách xe…' : 'Chưa có xe nào.'}
        />
      </Card>
    </div>
  )
}
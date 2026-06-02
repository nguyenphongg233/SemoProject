// Trang Đặt xe — Tech Blue Luxury
// Flow trên frontend (state machine, persist trong localStorage):
//   idle → selected → reserved → unlocked → riding → completed
//
// Mapping với backend:
//   - Đặt xe / Mở khóa  → chỉ là trạng thái UI (giữ chỗ + xác nhận thao tác).
//   - Bắt đầu đi        → POST /api/rentals/start   (startRental)
//   - Kết thúc chuyến   → PUT  /api/rentals/{id}/end (endRental)  → trả totalPrice
//   - Pin quá nóng / Pin sụt nhanh → giả lập UI (backend chỉ cho ADMIN PUT scooter;
//                                    rental sẽ tự được kết thúc, hệ thống ghi nhận
//                                    báo cáo lên màn hình).
//
// Có dùng geolocation của trình duyệt + Haversine để hiện xe trong bán kính.
import { useEffect, useMemo, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, Circle, useMap } from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import {
  Search, Filter, MapPin, RefreshCcw, Crosshair, Zap, Unlock, Play, Square,
  Battery, Gauge, Thermometer, AlertTriangle, ShieldAlert, Sparkles, Clock,
} from 'lucide-react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, TextField } from '../../components/ui'
import { getAllScooters } from '../../features/scooters'
import { startRental, endRental } from '../../features/rentals'
import { useAuth } from '../../hooks/useAuth'
import { SCOOTER_STATUSES, SCOOTER_STATUS_OPTIONS } from '../../constants/statuses'
import { formatBatteryLevel, formatCoordinates, formatCurrency, formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

import '../../styles/booking.css'

// ----- Interfaces & Types -----
import type { Scooter } from '../../types/models'

// Đối với EnrichedScooter, kế thừa trực tiếp từ core Scooter:
interface EnrichedScooter extends Scooter {
  _lat: number
  _lng: number
  _hasPos: boolean
  _status: string
  _reported: boolean
  _distance: number | null
}

interface RideState {
  state: 'idle' | 'selected' | 'reserved' | 'unlocked' | 'riding'
  scooterId: number | string
  scooterName: string
  reservedAt?: number
  unlockedAt?: number
  startedAt?: number
  rentalId?: number | string
}

interface CompletedInfo {
  rentalId: number | string
  scooterName: string
  totalPrice: number
  endTime?: string | number
  startedAt?: number
}

interface ReportItem {
  status: string
  kind: string
  reportedAt: number
}

interface ReportsMap {
  [scooterId: string]: ReportItem
}

interface TimelineRowProps {
  icon: React.ReactNode
  label: string
  value: string
  done: boolean
}

const BACH_KHOA_CENTER: LatLngTuple = [21.0052, 105.8433]
const ACTIVE_RIDE_KEY = 'semo_active_ride'
const REPORTS_KEY = 'semo_scooter_reports'

const statusStyles: Record<string, { color: string; fillColor: string }> = {
  [SCOOTER_STATUSES.AVAILABLE]:   { color: '#00D1FF', fillColor: '#00D1FF' },
  [SCOOTER_STATUSES.IN_USE]:      { color: '#0052FF', fillColor: '#0052FF' },
  [SCOOTER_STATUSES.MAINTENANCE]: { color: '#FF5C7A', fillColor: '#FF5C7A' },
}

const statusLabel: Record<string, string> = {
  [SCOOTER_STATUSES.AVAILABLE]:   'Sẵn sàng',
  [SCOOTER_STATUSES.IN_USE]:      'Đang đi',
  [SCOOTER_STATUSES.MAINTENANCE]: 'Bảo trì',
}

// ----- Helpers -----
function toRad(deg: number): number { return (deg * Math.PI) / 180 }

function haversineKm(a: LatLngTuple, b: LatLngTuple): number | null {
  if (!a || !b) return null
  const R = 6371
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const lat1 = toRad(a[0]), lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

function fmtKm(km: number | null): string { return km == null ? '—' : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km` }

function fmtDuration(ms: number): string {
  if (!ms || ms < 0) return '00:00'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  const hh = Math.floor(m / 60)
  return hh > 0 ? `${String(hh).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}

function loadRide(): RideState | null {
  try { const v = localStorage.getItem(ACTIVE_RIDE_KEY); return v ? JSON.parse(v) : null } catch { return null }
}

function saveRide(ride: RideState | null): void {
  if (!ride) localStorage.removeItem(ACTIVE_RIDE_KEY)
  else localStorage.setItem(ACTIVE_RIDE_KEY, JSON.stringify(ride))
}

function loadReports(): ReportsMap {
  try { const v = localStorage.getItem(REPORTS_KEY); return v ? JSON.parse(v) : {} } catch { return {} }
}

function saveReports(map: ReportsMap): void { localStorage.setItem(REPORTS_KEY, JSON.stringify(map)) }

// Component nhỏ để recenter map khi user location thay đổi
function FlyTo({ center, zoom = 16 }: { center: LatLngTuple; zoom?: number }) {
  const map = useMap()
  useEffect(() => { if (center) map.flyTo(center, zoom, { duration: 0.8 }) }, [center, zoom, map])
  return null
}

export default function BookingPage() {
  const { user } = useAuth()

  // Dữ liệu xe
  const [scooters, setScooters] = useState<Scooter[]>([])
  const [scootersLoading, setScootersLoading] = useState<boolean>(true)
  const [scootersError, setScootersError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // Vị trí user
  const [userPos, setUserPos] = useState<LatLngTuple | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState<boolean>(false)

  // Bộ lọc
  const [query, setQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [useRadius, setUseRadius] = useState<boolean>(true)
  const [radiusKm, setRadiusKm] = useState<number>(1.5)

  // Trạng thái flow (persist localStorage)
  const [ride, setRide] = useState<RideState | null>(() => loadRide())
  const [selectedId, setSelectedId] = useState<number | string | null>(() => loadRide()?.scooterId || null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [completedInfo, setCompletedInfo] = useState<CompletedInfo | null>(null)
  const [reports, setReports] = useState<ReportsMap>(() => loadReports())

  // Tick timer mỗi giây khi đang riding
  const [now, setNow] = useState<number>(Date.now())
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (ride?.state === 'riding') {
      tickRef.current = setInterval(() => setNow(Date.now()), 1000)
      return () => { if (tickRef.current) clearInterval(tickRef.current) }
    }
  }, [ride?.state])

  // Load scooters
  useEffect(() => {
    let alive = true
    setScootersLoading(true)
    setScootersError(null)
    getAllScooters()
      .then((data) => { if (alive) setScooters(Array.isArray(data) ? data : []) })
      .catch((err) => { if (alive) setScootersError(getApiErrorMessage(err, 'Không thể tải danh sách xe.')) })
      .finally(() => { if (alive) setScootersLoading(false) })
    return () => { alive = false }
  }, [refreshKey])

  // Xin geolocation lần đầu
  useEffect(() => { requestLocation() }, []) // eslint-disable-line

  function requestLocation() {
    if (!navigator.geolocation) {
      setGeoError('Trình duyệt không hỗ trợ định vị.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
        setGeoLoading(false)
      },
      (err) => {
        setGeoError(err.message || 'Không thể lấy vị trí.')
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    )
  }

  // Map từng xe → có distance + report localStorage
  const enrichedScooters = useMemo<EnrichedScooter[]>(() => {
    return (scooters || []).map((s) => {
      const lat = Number(s.currentLat), lng = Number(s.currentLng)
      const hasPos = Number.isFinite(lat) && Number.isFinite(lng)
      const reportedStatus = reports[String(s.id)]?.status
      const effectiveStatus = reportedStatus || s.status
      const distance = userPos && hasPos ? haversineKm(userPos, [lat, lng]) : null
      return {
        ...s,
        _lat: lat, _lng: lng, _hasPos: hasPos,
        _status: effectiveStatus, _reported: Boolean(reportedStatus),
        _distance: distance,
      }
    })
  }, [scooters, userPos, reports])

  // Bộ lọc áp dụng
  const visibleScooters = useMemo<EnrichedScooter[]>(() => {
    return enrichedScooters
      .filter((s) => s._hasPos)
      .filter((s) => {
        if (statusFilter !== 'ALL' && s._status !== statusFilter) return false
        if (query) {
          const q = query.toLowerCase()
          const name = (s.name || s.codeName || `#${s.id}`).toLowerCase()
          if (!name.includes(q)) return false
        }
        if (useRadius && userPos && s._distance != null && s._distance > radiusKm) return false
        return true
      })
      .sort((a, b) => {
        const av = a._status === SCOOTER_STATUSES.AVAILABLE ? 0 : 1
        const bv = b._status === SCOOTER_STATUSES.AVAILABLE ? 0 : 1
        if (av !== bv) return av - bv
        return (a._distance ?? 9e9) - (b._distance ?? 9e9)
      })
  }, [enrichedScooters, statusFilter, query, useRadius, userPos, radiusKm])

  const selectedScooter = useMemo<EnrichedScooter | null>(
    () => enrichedScooters.find((s) => s.id === selectedId) || null,
    [enrichedScooters, selectedId],
  )

  function handleSelect(s: EnrichedScooter) {
    if (ride && ride.state !== 'idle' && ride.scooterId !== s.id) {
      setActionError('Bạn đang trong chuyến đi — kết thúc trước khi chọn xe khác.')
      return
    }
    if (s._status !== SCOOTER_STATUSES.AVAILABLE && !ride) return
    setSelectedId(s.id)
    setActionError(null)
    if (!ride) {
      const initRide: RideState = { state: 'selected', scooterId: s.id, scooterName: s.name || `#${s.id}` }
      setRide(initRide)
      saveRide(initRide)
    }
  }

  function setRideState(patch: Partial<RideState>) {
    if (!ride) return
    const next: RideState = { ...ride, ...patch }
    setRide(next)
    saveRide(next)
  }

  async function handleReserve() {
    if (!selectedScooter) return
    const reservedRide: RideState = {
      state: 'reserved',
      reservedAt: Date.now(),
      scooterId: selectedScooter.id,
      scooterName: selectedScooter.name || `#${selectedScooter.id}`,
    }
    setRide(reservedRide)
    saveRide(reservedRide)
  }

  async function handleUnlock() {
    if (!ride) return
    setRideState({ state: 'unlocked', unlockedAt: Date.now() })
  }

  async function handleStart() {
    if (!ride || !user?.id || !selectedScooter) return
    setActionLoading(true); setActionError(null)
    try {
      const rental = await startRental({ userId: user.id, scooterId: selectedScooter.id })
      setRideState({
        state: 'riding',
        rentalId: rental.id,
        startedAt: rental.startTime ? new Date(rental.startTime).getTime() : Date.now(),
      })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Không thể bắt đầu chuyến đi.'))
    } finally { setActionLoading(false) }
  }

  async function handleEnd() {
    if (!ride?.rentalId) return
    setActionLoading(true); setActionError(null)
    try {
      const res = await endRental(ride.rentalId)
      setCompletedInfo({
        rentalId: ride.rentalId,
        scooterName: ride.scooterName,
        totalPrice: res?.totalPrice ?? 0,
        endTime: res?.endTime,
        startedAt: ride.startedAt,
      })
      setRide(null); saveRide(null); setSelectedId(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Không thể kết thúc chuyến đi.'))
    } finally { setActionLoading(false) }
  }

  // Báo cáo giả lập
  function reportIssue(kind: string) {
    const sid = ride?.scooterId || selectedScooter?.id
    if (!sid) return
    const next: ReportsMap = {
      ...reports,
      [String(sid)]: {
        status: SCOOTER_STATUSES.MAINTENANCE,
        kind,
        reportedAt: Date.now(),
      },
    }
    setReports(next); saveReports(next)
    // Tự động kết thúc rental nếu đang đi
    if (ride?.state === 'riding' && ride?.rentalId) {
      handleEnd()
    } else if (ride && ride.state !== 'idle') {
      setRide(null); saveRide(null); setSelectedId(null)
    }
    setActionError(null)
  }

  function dismissCompleted() { setCompletedInfo(null) }

  function resetRide() {
    setRide(null); saveRide(null); setSelectedId(null); setActionError(null); setCompletedInfo(null)
  }

  const mapCenter: LatLngTuple = userPos || BACH_KHOA_CENTER
  const ridingMs = ride?.state === 'riding' && ride.startedAt ? now - ride.startedAt : 0

  return (
    <div className="page-stack">
      <div className="booking-header">
        <SectionHeader
          eyebrow="Đặt xe"
          title="Cổng đặt xe thông minh"
          description="Tìm xe gần nhất, đặt - mở khóa - bắt đầu chuyến đi và theo dõi pin theo thời gian thực."
        />
        <div className="booking-header__chips">
          <span className={`booking-chip ${userPos ? 'is-on' : 'is-warn'}`}>
            <Crosshair size={14} strokeWidth={1.9} />
            {userPos ? 'Đã có định vị' : geoError ? 'Lỗi định vị' : 'Chưa có định vị'}
          </span>
          <span className="booking-chip is-on">
            <Zap size={14} strokeWidth={1.9} />
            {visibleScooters.length} xe phù hợp
          </span>
        </div>
      </div>

      {scootersError && <Alert>{scootersError}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}
      {completedInfo && (
        <div className="total-banner">
          <span>
            <Sparkles size={18} strokeWidth={1.8} />{' '}
            Đã kết thúc chuyến trên <strong>{completedInfo.scooterName}</strong> · Tổng cước{' '}
            <strong>{formatCurrency(completedInfo.totalPrice)}</strong>
          </span>
          <button className="ui-button ui-button--secondary" onClick={dismissCompleted}>Đóng</button>
        </div>
      )}

      <div className="booking-layout">
        {/* ============== CỘT TRÁI: BỘ LỌC + DANH SÁCH ============== */}
        <Card>
          <SectionHeader eyebrow="Bộ lọc xe" title="Tìm xe phù hợp" description="Tìm xe gần bạn hoặc lọc theo trạng thái." />
          <form className="filter-form" onSubmit={(e) => e.preventDefault()}>
            <TextField
              label="Tìm theo tên / mã xe"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: VinFast"
              leadingIcon={<Search size={18} strokeWidth={1.7} />}
            />

            <div>
              <span className="ui-field__label" style={{ display: 'block', marginBottom: 6 }}>Trạng thái</span>
              <select
                className="select-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                {SCOOTER_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={useRadius}
                onChange={(e) => setUseRadius(e.target.checked)}
              />
              Chỉ hiện xe trong bán kính <strong>{radiusKm.toFixed(1)} km</strong>
            </label>
            <input
              type="range"
              className="range-input"
              min="0.3" max="5" step="0.1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              disabled={!useRadius}
            />

            <div className="filter-form__row">
              <Button
                variant="secondary"
                onClick={requestLocation}
                disabled={geoLoading}
                leadingIcon={<Crosshair size={16} strokeWidth={1.8} />}
              >
                {geoLoading ? 'Đang định vị…' : 'Cập nhật vị trí'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setRefreshKey((k) => k + 1)}
                leadingIcon={<RefreshCcw size={16} strokeWidth={1.8} />}
              >
                Tải lại
              </Button>
            </div>

            {geoError && <Alert>{geoError}</Alert>}
          </form>

          <div className="scooter-list">
            {scootersLoading && <p className="empty-state__text">Đang tải xe…</p>}
            {!scootersLoading && visibleScooters.length === 0 && (
              <p className="empty-state__text">Không có xe nào phù hợp bộ lọc.</p>
            )}
            {visibleScooters.map((s) => {
              const isSelected = s.id === selectedId
              const isLocked = s._status !== SCOOTER_STATUSES.AVAILABLE
              return (
                <div
                  key={s.id}
                  className={`scooter-item ${isSelected ? 'is-selected' : ''} ${isLocked && !isSelected ? 'is-disabled' : ''}`}
                  onClick={() => handleSelect(s)}
                >
                  <div className="scooter-item__top">
                    <div>
                      <p className="scooter-item__name">{s.name || s.codeName || `Xe #${s.id}`}</p>
                      <p className="scooter-item__sub">{formatCoordinates(Number(s._lat), Number(s._lng))}</p>
                    </div>
                    <span className={`status-pill ${
                      s._status === SCOOTER_STATUSES.AVAILABLE ? 'is-available' :
                      s._status === SCOOTER_STATUSES.IN_USE ? 'is-in-use' : 'is-maintenance'
                    }`}>
                      {statusLabel[s._status] || s._status}
                    </span>
                  </div>
                  <div className="scooter-item__meta">
                    <span><Battery size={12} strokeWidth={2} /> {formatBatteryLevel(s.batteryLevel) || '—'}</span>
                    {Number.isFinite(Number(s.temperature)) && (
                      <span><Thermometer size={12} strokeWidth={2} /> {Math.round(Number(s.temperature))}°C</span>
                    )}
                    {s._distance != null && (
                      <span><MapPin size={12} strokeWidth={2} /> {fmtKm(s._distance)}</span>
                    )}
                  </div>
                  <div className="scooter-item__foot">
                    <span className="scooter-item__sub">
                      {isSelected
                        ? (ride?.state && ride.state !== 'idle' ? 'Đang chọn' : 'Sẵn sàng để đặt')
                        : (isLocked ? 'Không thể đặt ngay lúc này' : 'Bấm để chọn')}
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        className={`scooter-item__action ${isSelected ? 'is-selected' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleSelect(s) }}
                      >
                        {isSelected ? 'Đang chọn' : 'Chọn xe'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ============== CỘT GIỮA: MAP ============== */}
        <Card className="map-card">
          <SectionHeader
            eyebrow="Bản đồ xe gần bạn"
            title="Chọn xe trực tiếp trên bản đồ"
            description="Chấm xanh nhạt = sẵn sàng · xanh đậm = đang đi · hồng = bảo trì."
            actions={(
              <span className="booking-chip is-on">
                <Filter size={14} strokeWidth={1.9} /> Bán kính {radiusKm.toFixed(1)} km
              </span>
            )}
          />
          <div className="scooter-map" style={{ marginTop: 12 }}>
            <MapContainer
              center={mapCenter}
              zoom={16}
              minZoom={11}
              maxZoom={18}
              scrollWheelZoom
              className="scooter-map__canvas"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyTo center={mapCenter} />

              {userPos && (
                <>
                  <CircleMarker
                    center={userPos}
                    radius={8}
                    pathOptions={{ color: '#00E0A4', fillColor: '#00E0A4', fillOpacity: 0.9, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} permanent>Bạn ở đây</Tooltip>
                  </CircleMarker>
                  {useRadius && (
                    <Circle
                      center={userPos}
                      radius={radiusKm * 1000}
                      pathOptions={{ color: '#00D1FF', fillColor: '#00D1FF', fillOpacity: 0.06, weight: 1, dashArray: '6 6' }}
                    />
                  )}
                </>
              )}

              {visibleScooters.map((s) => {
                const style = statusStyles[s._status] || { color: '#8BA0C7', fillColor: '#8BA0C7' }
                const isSel = s.id === selectedId
                return (
                  <CircleMarker
                    key={s.id}
                    center={[s._lat, s._lng]}
                    radius={isSel ? 14 : 10}
                    pathOptions={{
                      color: isSel ? '#fff' : style.color,
                      fillColor: style.fillColor,
                      fillOpacity: 0.9,
                      weight: isSel ? 3 : 2,
                    }}
                    eventHandlers={{ click: () => handleSelect(s) }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} permanent>
                      {s.name || `#${s.id}`}
                    </Tooltip>
                    <Popup>
                      <div className="scooter-map__popup">
                        <strong>{s.name || `Xe #${s.id}`}</strong>
                        <p>Trạng thái: {statusLabel[s._status]}</p>
                        <p>Pin: {formatBatteryLevel(s.batteryLevel) || '—'}</p>
                        {s._distance != null && <p>Cách bạn: {fmtKm(s._distance)}</p>}
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </Card>

        {/* ============== CỘT PHẢI: RIDE STATUS + ALERTS ============== */}
        <div style={{ display: 'grid', gap: '1.2rem' }}>
          <Card variant="glow">
            <div className="ride-status__head">
              <SectionHeader eyebrow="Trạng thái chuyến đi" title="Ride status" />
              {ride?.state === 'riding' && (
                <span className="booking-chip is-on"><Clock size={14} strokeWidth={1.9} /> {fmtDuration(ridingMs)}</span>
              )}
            </div>

            {!selectedScooter ? (
              <p className="empty-state__text">Chọn một xe khả dụng để bắt đầu.</p>
            ) : (
              <>
                <p style={{ margin: '0 0 0.3rem', color: 'var(--text-strong)', fontWeight: 700 }}>
                  {selectedScooter.name || `Xe #${selectedScooter.id}`}
                </p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {formatCoordinates(selectedScooter._lat, selectedScooter._lng)}{' '}
                  · Pin {formatBatteryLevel(selectedScooter.batteryLevel) || '—'}
                  {selectedScooter._distance != null && <> · Cách bạn {fmtKm(selectedScooter._distance)}</>}
                </p>

                {ride?.state === 'riding' && (
                  <div className="ride-timer" style={{ margin: '0.7rem 0' }}>{fmtDuration(ridingMs)}</div>
                )}

                <div className="timeline">
                  <TimelineRow
                    icon={<Zap size={16} strokeWidth={1.9} />}
                    label="Đặt xe"
                    value={ride?.reservedAt ? formatDateTime(ride.reservedAt) : '—'}
                    done={Boolean(ride?.reservedAt)}
                  />
                  <TimelineRow
                    icon={<Unlock size={16} strokeWidth={1.9} />}
                    label="Mở khóa"
                    value={ride?.unlockedAt ? formatDateTime(ride.unlockedAt) : '—'}
                    done={Boolean(ride?.unlockedAt)}
                  />
                  <TimelineRow
                    icon={<Play size={16} strokeWidth={1.9} />}
                    label="Bắt đầu"
                    value={ride?.startedAt ? formatDateTime(ride.startedAt) : '—'}
                    done={Boolean(ride?.startedAt)}
                  />
                  <TimelineRow
                    icon={<Square size={16} strokeWidth={1.9} />}
                    label="Kết thúc"
                    value={completedInfo?.endTime ? formatDateTime(completedInfo.endTime) : '—'}
                    done={Boolean(completedInfo)}
                  />
                </div>

                <div className="action-grid">
                  <Button
                    onClick={handleReserve}
                    disabled={!selectedScooter || ride?.state !== 'selected'}
                    leadingIcon={<Zap size={16} strokeWidth={1.8} />}
                  >
                    Đặt xe
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleUnlock}
                    disabled={ride?.state !== 'reserved'}
                    leadingIcon={<Unlock size={16} strokeWidth={1.8} />}
                  >
                    Mở khóa
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleStart}
                    disabled={ride?.state !== 'unlocked' || actionLoading}
                    leadingIcon={<Play size={16} strokeWidth={1.8} />}
                  >
                    {actionLoading && ride?.state === 'unlocked' ? 'Đang bắt đầu…' : 'Bắt đầu đi'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleEnd}
                    disabled={ride?.state !== 'riding' || actionLoading}
                    leadingIcon={<Square size={16} strokeWidth={1.8} />}
                  >
                    {actionLoading && ride?.state === 'riding' ? 'Đang kết thúc…' : 'Kết thúc chuyến'}
                  </Button>
                </div>

                {ride && ride.state !== 'riding' && ride.state !== 'idle' && (
                  <button
                    type="button"
                    className="ui-button ui-button--ghost"
                    style={{ marginTop: 8, width: '100%' }}
                    onClick={resetRide}
                  >
                    Hủy chọn xe
                  </button>
                )}
              </>
            )}
          </Card>

          <Card>
            <SectionHeader
              eyebrow="Giả lập cảnh báo hệ thống"
              title="Báo cáo sự cố xe"
              description="Dùng khi xe gặp vấn đề. Hệ thống sẽ ghi nhận và tự kết thúc chuyến hiện tại."
              actions={<AlertTriangle size={18} strokeWidth={1.7} style={{ color: 'var(--warning)' }} />}
            />
            <div className="alert-buttons" style={{ marginTop: 10 }}>
              <Button
                onClick={() => reportIssue('overheat')}
                disabled={!selectedScooter}
                className="ui-button--warn"
                leadingIcon={<Thermometer size={16} strokeWidth={1.8} />}
              >
                Pin quá nóng
              </Button>
              <Button
                onClick={() => reportIssue('battery-drop')}
                disabled={!selectedScooter}
                className="ui-button--danger"
                leadingIcon={<Gauge size={16} strokeWidth={1.8} />}
              >
                Pin sụt nhanh
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setReports({}); saveReports({}) }}
                leadingIcon={<ShieldAlert size={16} strokeWidth={1.8} />}
              >
                Xóa các báo cáo cục bộ
              </Button>
            </div>
            <p className="empty-state__text" style={{ marginTop: 10, fontSize: '0.82rem' }}>
              * Cập nhật trạng thái xe trên server cần quyền admin. Báo cáo này được lưu cục bộ và
              tự kết thúc chuyến đi của bạn (rental). Đội vận hành sẽ tiếp nhận và xử lý.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TimelineRow({ icon, label, value, done }: TimelineRowProps) {
  return (
    <div className={`timeline__row ${done ? 'is-done' : ''}`}>
      <span className="timeline__label">{icon} {label}</span>
      <span className="timeline__value">{value}</span>
    </div>
  )
}
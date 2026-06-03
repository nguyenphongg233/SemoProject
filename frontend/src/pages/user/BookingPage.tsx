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

import { SectionHeader } from '@/components/layout'
import { Alert, Button, Card, TextField } from '@/components/ui'
import { getAllScooters } from '@/features/scooters'
import { startRental, endRental } from '@/features/rentals'
import { useAuth } from '@/hooks/useAuth'
import { SCOOTER_STATUSES, SCOOTER_STATUS_OPTIONS } from '@/constants/statuses'
import { formatBatteryLevel, formatCoordinates, formatCurrency, formatDateTime } from '@/utils/formatters'
import { getApiErrorMessage } from '@/utils/apiError'


// ----- Interfaces & Types -----
import type { Scooter } from '@/types/models'

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
  [SCOOTER_STATUSES.AVAILABLE]:   'Available',
  [SCOOTER_STATUSES.IN_USE]:      'In Use',
  [SCOOTER_STATUSES.MAINTENANCE]: 'Maintenance',
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
      .catch((err) => { if (alive) setScootersError(getApiErrorMessage(err, 'Failed to load scooter list. Please try again later.')) })
      .finally(() => { if (alive) setScootersLoading(false) })
    return () => { alive = false }
  }, [refreshKey])

  // Xin geolocation lần đầu
  useEffect(() => { requestLocation() }, []) // eslint-disable-line

  function requestLocation() {
    if (!navigator.geolocation) {
      setGeoError('Browser does not support geolocation.')
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
        setGeoError(err.message || 'Failed to get location.')
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
      setActionError('You have an active ride. Please end it before selecting another scooter.')
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
      setActionError(getApiErrorMessage(err, 'Failed to start the trip.'))
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
      setActionError(getApiErrorMessage(err, 'Failed to end the trip.'))
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionHeader
          eyebrow="Booking"
          title="Smart Mobility, Smart Living"
          description="Find the nearest scooter, book - unlock - ride, and track battery life in real-time."
        />
        <div className="flex gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-2 p-2 rounded-full border font-semibold transition-colors
              ${userPos 
                ? 'text-(--color-cyan-soft) border-(--border-glow) bg-[rgba(0,209,255,0.08)]' 
                : 'text-(--warning) border-[rgba(218,12,12,0.4)] bg-[rgba(255,179,71,0.08)]'
              }`}
          >
            <Crosshair size={14} strokeWidth={1.9} />
            {userPos ? 'Location available' : geoError ? 'Location error' : 'Location unavailable'}
          </span>

          <span className="inline-flex items-center gap-1.5 p-2 rounded-full font-semibold text-(--color-cyan-soft) border border-(--border-glow) bg-[rgba(0,209,255,0.08)]">
            <Zap size={14} strokeWidth={1.9} />
            {visibleScooters.length} suitable scooters
          </span>
        </div>
      </div>

      {scootersError && <Alert>{scootersError}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}
      {completedInfo && (
        <div className="flex items-center justify-between gap-2.5 p-[0.8rem_1rem] rounded-[14px] bg-linear-to-br from-[rgba(0,224,164,0.18)] to-[rgba(0,82,255,0.18)] border border-[rgba(0,224,164,0.4)] mb-[0.7rem] text-(--text-strong) [&_strong]:text-white">
          <span>
            <Sparkles size={18} strokeWidth={1.8} />{' '}
            Trip ended on <strong>{completedInfo.scooterName}</strong> · Total fare{' '}
            <strong>{formatCurrency(completedInfo.totalPrice)}</strong>
          </span>
          <Button variant="secondary" onClick={dismissCompleted}>
            Close
          </Button>
        </div>
      )}

      <div className="grid gap-[1.2rem] items-start grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
        {/* ============== CỘT TRÁI: BỘ LỌC + DANH SÁCH ============== */}
        <Card>
        <SectionHeader eyebrow="Scooter Filter" title="Find the Right Ride" description="Find scooters near you or filter by status." />
          <form className="grid gap-[0.8rem] mb-4" onSubmit={(e) => e.preventDefault()}>
            <TextField
              label="Search by name / scooter ID"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: VinFast"
              leadingIcon={<Search size={18} strokeWidth={1.7} />}
            />

            <div>
              <span className="block mb-1.5 font-bold">Status</span>
              <select
                className="w-full min-h-11 p-[0.7rem_1rem] border border-(--border) rounded-xl bg-[rgba(11,17,32,0.65)] text-(--text-strong) appearance-none bg-no-repeat bg-position-[right_1rem_center] bg-size-[10px] bg-[url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22%3E%3Cpath fill=%22%2300D1FF%22 d=%22M6 8L0 0h12z%22/%3E%3C/svg%3E')] focus:outline-none focus:border-(--border-glow) focus:shadow-[0_0_0_4px_rgba(0,209,255,0.12)]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                {SCOOTER_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{statusLabel[s]}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-[0.6rem] text-[0.92rem] text-(--text) cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useRadius}
                onChange={(e) => setUseRadius(e.target.checked)}
                className="w-4 h-4 accent-(--color-electric) cursor-pointer"
              />
              <span>
                Show scooters within <strong className="font-bold">{radiusKm.toFixed(1)} km</strong> radius only
              </span>
            </label>

            <input
              type="range"
              className="w-full accent-(--color-electric)"
              min="0.3" max="5" step="0.1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              disabled={!useRadius}
            />

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={requestLocation}
                disabled={geoLoading}
                leadingIcon={<Crosshair size={24} strokeWidth={1.8} />}
              >
                {geoLoading ? 'Locating...' : 'Update location'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setRefreshKey((k) => k + 1)}
                leadingIcon={<RefreshCcw size={24} strokeWidth={1.8} />}
              >
                Refresh scooters
              </Button>
            </div>

            {geoError && <Alert>{geoError}</Alert>}
          </form>

          <div className="grid gap-1 max-h-[56vh] overflow-y-auto pr-0.5 max-xl:max-h-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[rgba(0,209,255,0.25)] [&::-webkit-scrollbar-thumb]:rounded-full">
            {scootersLoading && <p className="empty-state__text">Loading scooters...</p>}
            {!scootersLoading && visibleScooters.length === 0 && (
              <p className="empty-state__text">No scooters match your filters.</p>
            )}
            {visibleScooters.map((s) => {
              const isSelected = s.id === selectedId
              const isLocked = s._status !== SCOOTER_STATUSES.AVAILABLE
              return (
                <div
                  key={s.id}
                  className={`
                    relative grid gap-2 p-[0.95rem_1rem] rounded-[14px] border border-(--border) bg-(--surface-elevated) cursor-pointer
                    transition-[border-color,transform,box-shadow,background] duration-200 ease-out
                    hover:border-(--border-strong) hover:-translate-y-px hover:bg-[rgba(0,82,255,0.06)]
                    ${isSelected ? 'border-(--border-glow) bg-linear-to-br from-[rgba(0,82,255,0.18)] to-[rgba(0,209,255,0.06)] shadow-[0_0_0_1px_var(--border-glow),0_12px_28px_rgba(0,82,255,0.2)]' : ''}
                    ${isLocked && !isSelected ? 'opacity-55' : ''}
                  `}
                  onClick={() => handleSelect(s)}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <p className="font-bold text-(--text-strong) leading-tight">
                        {s.name || s.codeName || `Scooter #${s.id}`}
                      </p>
                      <p className="text-(--text-muted) text-[0.82rem]">
                        {formatCoordinates(Number(s._lat), Number(s._lng))}
                      </p>
                    </div>
                    <span className={`status-pill ${
                      s._status === SCOOTER_STATUSES.AVAILABLE ? 'is-available' :
                      s._status === SCOOTER_STATUSES.IN_USE ? 'is-in-use' : 'is-maintenance'
                    }`}>
                      {statusLabel[s._status] || s._status}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap text-[0.78rem] text-(--text-muted)">
                    <span className="inline-flex items-center gap-1 p-[0.22rem_0.55rem] rounded-full bg-[rgba(255,255,255,0.04)] border border-(--border)">
                      <Battery size={12} strokeWidth={2} /> {formatBatteryLevel(s.batteryLevel) || '—'}
                    </span>
                    
                    {Number.isFinite(Number(s.temperature)) && (
                      <span className="inline-flex items-center gap-1 p-[0.22rem_0.55rem] rounded-full bg-[rgba(255,255,255,0.04)] border border-(--border)">
                        <Thermometer size={12} strokeWidth={2} /> {Math.round(Number(s.temperature))}°C
                      </span>
                    )}
                    
                    {s._distance != null && (
                      <span className="inline-flex items-center gap-1 p-[0.22rem_0.55rem] rounded-full bg-[rgba(255,255,255,0.04)] border border-(--border)">
                        <MapPin size={12} strokeWidth={2} /> {fmtKm(s._distance)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-(--text-muted) text-sm">
                      {isSelected
                        ? (ride?.state && ride.state !== 'idle' ? 'Selected' : 'Ready to book')
                        : (isLocked ? 'Cannot book at the moment' : 'Click to select')}
                    </span>
                    
                    {!isLocked && (
                      <button
                        type="button"
                        className={`
                          p-1 rounded-full border border-(--border-glow) text-(--color-cyan-soft) cursor-pointer
                          transition-all duration-200 ease-out
                          bg-[rgba(0,82,255,0.16)]
                          hover:text-white hover:bg-[rgba(0,82,255,0.32)]
                          ${isSelected ? 'bg-[linear-gradient(135deg,#0052FF_0%,#00D1FF_100%)] text-white' : ''}
                        `}
                        onClick={(e) => { e.stopPropagation(); handleSelect(s) }}
                      >
                        <span className="font-bold text-sm">
                          {isSelected ? 'Currently selected' : 'Select scooter'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* ============== CỘT GIỮA: MAP ============== */}
        <Card className="min-h-135">
          <SectionHeader
            eyebrow="Scooters Near You"
            title="Select a Scooter on the Map"
            description=""
          />

          <div className="flex items-center justify-between gap-2.5 mb-4">
            <div className="flex flex-col items-start gap-2 mt-5 mb-5">
              <span className="inline-flex items-center gap-2"><i className="scooter-map__swatch scooter-map__swatch--available" /> Available</span>
              <span className="inline-flex items-center gap-2"><i className="scooter-map__swatch scooter-map__swatch--in-use" /> In Use</span>
              <span className="inline-flex items-center gap-2"><i className="scooter-map__swatch scooter-map__swatch--maintenance" /> Maintenance</span>
            </div>
            <span className="inline-flex items-center gap-1.5 p-2 rounded-full text-3 font-semibold text-(--color-cyan-soft) border border-(--border-glow) bg-[rgba(0,209,255,0.08)]">
              <Filter size={24} strokeWidth={1.9} />
              Radius: {radiusKm.toFixed(1)} km
            </span>
          </div>

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
                    <Tooltip direction="top" offset={[0, -8]} permanent>You are here</Tooltip>
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
                        <strong>{s.name || `Scooter #${s.id}`}</strong>
                        <p>Status: {statusLabel[s._status]}</p>
                        <p>Battery: {formatBatteryLevel(s.batteryLevel) || '—'}</p>
                        {s._distance != null && <p>Distance: {fmtKm(s._distance)}</p>}
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
            <div className="flex items-center justify-between gap-[0.6rem] mb-[0.6rem]">
              <SectionHeader eyebrow="Ride Status" title="" />
              {ride?.state === 'riding' && (
                <span className="inline-flex items-center p-2 rounded-full font-semibold tracking-[0.02em] text-(--color-cyan-soft) border-(--border-glow) bg-[rgba(0,209,255,0.08)]">
                  <Clock size={14} strokeWidth={1.9} /> {fmtDuration(ridingMs)}
                </span>
              )}
            </div>

            {!selectedScooter ? (
              <p className="empty-state__text">Select an available scooter to start.</p>
            ) : (
              <>
                <p className="text-(--text-strong) font-bold text-3xl">
                  {selectedScooter.name || `Scooter #${selectedScooter.id}`}
                </p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {formatCoordinates(selectedScooter._lat, selectedScooter._lng)}{' '}
                  · Battery {formatBatteryLevel(selectedScooter.batteryLevel) || '—'}
                  {selectedScooter._distance != null && <> · Distance: {fmtKm(selectedScooter._distance)}</>}
                </p>

                {ride?.state === 'riding' && (
                  <div className="[font-variant-numeric:tabular-nums] font-extrabold tracking-[-0.02em] text-[2rem] bg-linear-to-br from-white to-(--color-cyan-soft) bg-clip-text text-transparent bg-size-[auto_120%]">
                    {fmtDuration(ridingMs)}
                  </div>
                )}

                <div className="grid gap-2 my-3 mb-4 p-3 rounded-xl bg-[rgba(11,17,32,0.5)] border border-(--border)">
                  <TimelineRow
                    icon={<Zap size={16} strokeWidth={1.9} />}
                    label="Book Scooter"
                    value={ride?.reservedAt ? formatDateTime(ride.reservedAt) : '—'}
                    done={Boolean(ride?.reservedAt)}
                  />
                  <TimelineRow
                    icon={<Unlock size={16} strokeWidth={1.9} />}
                    label="Unlock Scooter"
                    value={ride?.unlockedAt ? formatDateTime(ride.unlockedAt) : '—'}
                    done={Boolean(ride?.unlockedAt)}
                  />
                  <TimelineRow
                    icon={<Play size={16} strokeWidth={1.9} />}
                    label="Start Ride"
                    value={ride?.startedAt ? formatDateTime(ride.startedAt) : '—'}
                    done={Boolean(ride?.startedAt)}
                  />
                  <TimelineRow
                    icon={<Square size={16} strokeWidth={1.9} />}
                    label="End Ride"
                    value={completedInfo?.endTime ? formatDateTime(completedInfo.endTime) : '—'}
                    done={Boolean(completedInfo)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleReserve}
                    disabled={!selectedScooter || ride?.state !== 'selected'}
                    leadingIcon={<Zap size={16} strokeWidth={1.8} />}
                  >
                    Book Scooter
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleUnlock}
                    disabled={ride?.state !== 'reserved'}
                    leadingIcon={<Unlock size={16} strokeWidth={1.8} />}
                  >
                    Unlock Scooter
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleStart}
                    disabled={ride?.state !== 'unlocked' || actionLoading}
                    leadingIcon={<Play size={16} strokeWidth={1.8} />}
                  >
                    {actionLoading && ride?.state === 'unlocked' ? 'Starting...' : 'Start Ride'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleEnd}
                    disabled={ride?.state !== 'riding' || actionLoading}
                    leadingIcon={<Square size={16} strokeWidth={1.8} />}
                  >
                    {actionLoading && ride?.state === 'riding' ? 'Ending...' : 'End Ride'}
                  </Button>
                </div>

                {ride && ride.state !== 'riding' && ride.state !== 'idle' && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 w-full"
                    onClick={resetRide}
                  >
                    Cancel Scooter Selection
                  </Button>
                )}
              </>
            )}
          </Card>

          <Card>
            <SectionHeader
              eyebrow="System Alert Simulation"
              title="Report Scooter Issues"
              description="Use this when the scooter encounters issues. The system will log and automatically end your current ride."
              actions={<AlertTriangle size={18} strokeWidth={1.7} style={{ color: 'var(--warning)' }} />}
            />
            <div className="mt-2.5 grid gap-3">
              <Button
                onClick={() => reportIssue('overheat')}
                disabled={!selectedScooter}
                className="text-white bg-linear-to-br from-[#ffb347] to-[#443a2d] shadow-[0_0_24px_rgba(255,179,71,0.35)]"
                leadingIcon={<Thermometer size={16} strokeWidth={1.8} />}
              >
                Battery overheating
              </Button>
              
              <Button
                onClick={() => reportIssue('battery-drop')}
                disabled={!selectedScooter}
                className="text-white bg-linear-to-br from-[#ff5c7a] to-[#c11d3f] shadow-[0_0_24px_rgba(255,92,122,0.35)]"
                leadingIcon={<Gauge size={16} strokeWidth={1.8} />}
              >
                Rapid battery drain
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => { setReports({}); saveReports({}) }}
                leadingIcon={<ShieldAlert size={16} strokeWidth={1.8} />}
              >
                Delete local Reports
              </Button>
            </div>
            <p className="empty-state__text" style={{ marginTop: 10, fontSize: '0.82rem' }}>
              Updating scooter status on the server requires admin privileges. This report is saved locally and
              will automatically end your current ride (rental). The operations team will receive and process it.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TimelineRow({ icon, label, value, done }: TimelineRowProps) {
  return (
    <div className={`flex items-center justify-between gap-2.5 text-3 group ${done ? 'is-done' : ''}`}>
      <span className="inline-flex items-center gap-2 text-(--text-muted) group-[.is-done]:text-(--text) [&>svg]:text-(--text-faded) group-[.is-done]:[&>svg]:text-(--color-cyan-soft)">
        {icon} 
        {label}
      </span>
      <span className="text-(--text-muted) tabular-nums group-[.is-done]:text-(--text-strong) group-[.is-done]:font-semibold">
        {value}
      </span>
    </div>
  )
}
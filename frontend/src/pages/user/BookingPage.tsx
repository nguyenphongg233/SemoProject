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
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, Circle, useMap, Polyline } from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import {
  Search, Filter, MapPin, RefreshCcw, Crosshair, Zap, Unlock, Play, Square,
  Battery, Gauge, Thermometer, ShieldAlert, Sparkles, Clock, Bike, Eye, EyeOff,
} from 'lucide-react'

import { Alert, Button } from '@/components'
import { getAllScooters } from '@/features/scooters'
import { startRental, endRental, getRentalHistory } from '@/features/rentals'
import { getRouteToScooter } from '@/features/routing'
import { useAuth } from '@/hooks/useAuth'
import { SCOOTER_STATUSES, SCOOTER_STATUS_OPTIONS } from '@/constants'
import { formatBatteryLevel, formatCoordinates, formatCurrency,
  formatDateTime, getApiErrorMessage, cn
 } from '@/utils'
import { APP_ENV } from '@/config/env'
import { axiosClient } from '@/config/axiosClient'


// ----- Interfaces & Types -----
import type { Scooter, RoutingResponse } from '@/types/models'

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
  userId?: number | string
}

interface CompletedInfo {
  rentalId: number | string
  scooterName: string
  totalPrice: number
  endTime?: string | number
  startedAt?: number
}

interface TimelineRowProps {
  icon: React.ReactNode
  label: string
  value: string
  done: boolean
}

const BACH_KHOA_CENTER: LatLngTuple = [21.0052, 105.8433]
const ACTIVE_RIDE_KEY = 'semo_active_ride'

const statusStyles: Record<string, { color: string; fillColor: string }> = {
  [SCOOTER_STATUSES.AVAILABLE]:   { color: 'var(--color-cyan)', fillColor: 'var(--color-cyan)' },
  [SCOOTER_STATUSES.IN_USE]:      { color: 'var(--color-brand)', fillColor: 'var(--color-brand)' },
  [SCOOTER_STATUSES.MAINTENANCE]: { color: 'var(--color-electric)', fillColor: 'var(--color-electric)' },
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

  // Bộ lọc
  const [query, setQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [useRadius, setUseRadius] = useState<boolean>(true)
  const [radiusKm, setRadiusKm] = useState<number>(1.5)
  const [showPanels, setShowPanels] = useState<boolean>(true)

  // Trạng thái flow (persist localStorage)
  const [ride, setRide] = useState<RideState | null>(() => loadRide())
  const [selectedId, setSelectedId] = useState<number | string | null>(() => loadRide()?.scooterId || null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [completedInfo, setCompletedInfo] = useState<CompletedInfo | null>(null)
  
  // Routing state
  const [routeData, setRouteData] = useState<RoutingResponse | null>(null)
  const [routeLoading, setRouteLoading] = useState<boolean>(false)

  // Tick timer mỗi giây khi đang riding
  const [now, setNow] = useState<number>(Date.now())
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Real-time balance monitoring
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Internal ticking for countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c !== null ? c - 1 : null), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (ride?.state === 'riding') {
      tickRef.current = setInterval(() => setNow(Date.now()), 1000)
      return () => { if (tickRef.current) clearInterval(tickRef.current) }
    }
  }, [ride?.state])

  // Error bảo mật fix: Clear ride if it belongs to another user
  useEffect(() => {
    if (user?.id && ride) {
      if (ride.userId && ride.userId !== user.id) {
        setRide(null);
        saveRide(null);
        setSelectedId(null);
      } else if (!ride.userId) {
        const nextRide = { ...ride, userId: user.id };
        setRide(nextRide);
        saveRide(nextRide);
      }
    }
  }, [user?.id, ride]);

  // Listen for WebSocket events (Balance warnings, Countdowns, Force-end)
  useEffect(() => {
    if (ride?.state !== 'riding' || !ride?.rentalId) {
      setCountdown(null)
      setShowWarning(false)
      return
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${APP_ENV.apiUrl}/ws`),
      onConnect: () => {
        client.subscribe(`/topic/rentals/${ride.rentalId}`, (message) => {
          const body = message.body;
          if (body === 'FORCE_END') {
            getRentalHistory('ALL').then(history => {
              const currentRental = history.find((r: any) => r.id === ride.rentalId)
              if (currentRental) {
                setCompletedInfo({
                  rentalId: currentRental.id,
                  scooterName: ride.scooterName,
                  totalPrice: currentRental.totalPrice ?? 0,
                  endTime: currentRental.endTime,
                  startedAt: ride.startedAt,
                })
              }
              setRide(null)
              saveRide(null)
              setSelectedId(null)
              setCountdown(null)
              setShowWarning(false)
              setRefreshKey((k) => k + 1)
              alert("Your ride has been ended by the system.");
            }).catch(err => console.error(err));
          } else if (body.startsWith('COUNTDOWN:')) {
            const secs = parseInt(body.split(':')[1], 10);
            setCountdown(secs);
            setShowWarning(false);
          } else if (body.startsWith('WARNING:')) {
            setShowWarning(true);
          }
        });
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [ride?.state, ride?.rentalId, ride?.scooterName, ride?.startedAt])

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

  // Sync active ride from backend on mount in case user changed devices
  useEffect(() => {
    let alive = true
    const syncActiveRide = async () => {
      try {
        const history = await getRentalHistory('IN_USE')
        if (!alive || !history || history.length === 0) return
        
        const activeRental = history[0]
        // Khôi phục lại state đang đi nếu có chuyến chưa hoàn tất trên backend
        const restoredRide: RideState = {
          state: 'riding',
          rentalId: activeRental.id,
          scooterId: activeRental.scooterId,
          scooterName: activeRental.scooterName || `Scooter #${activeRental.scooterId}`,
          startedAt: activeRental.startTime ? new Date(activeRental.startTime).getTime() : Date.now(),
          userId: user?.id || activeRental.userId,
        }
        
        setRide(restoredRide)
        saveRide(restoredRide)
        setSelectedId(activeRental.scooterId)
      } catch (err) {
        console.error('Failed to sync initial active ride', err)
      }
    }
    
    syncActiveRide()
    return () => { alive = false }
  }, [user?.id])

  // Xin geolocation lần đầu
  useEffect(() => { requestLocation() }, []) // eslint-disable-line

  function requestLocation() {
    if (!navigator.geolocation) {
      setGeoError('Browser does not support geolocation.')
      return
    }
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        setGeoError(err.message || 'Failed to get location.')
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    )
  }

  // Map từng xe → có distance
  const enrichedScooters = useMemo<EnrichedScooter[]>(() => {
    return (scooters || []).map((s) => {
      const lat = Number(s.currentLat), lng = Number(s.currentLng)
      const hasPos = Number.isFinite(lat) && Number.isFinite(lng)
      // Luôn sử dụng trạng thái thật từ Database thay vì bị ghi đè bởi localStorage của trình duyệt
      const effectiveStatus = s.status 
      const distance = userPos && hasPos ? haversineKm(userPos, [lat, lng]) : null
      return {
        ...s,
        _lat: lat, _lng: lng, _hasPos: hasPos,
        _status: effectiveStatus, _reported: false,
        _distance: distance,
      }
    })
  }, [scooters, userPos])

  // Bộ lọc áp dụng
  const visibleScooters = useMemo<EnrichedScooter[]>(() => {
    return enrichedScooters
      .filter((s) => s._hasPos)
      .filter((s) => {
        if (statusFilter !== 'ALL' && s._status !== statusFilter) return false
        if (query) {
          const q = query.toLowerCase()
          const name = (s.name || `#${s.id}`).toLowerCase()
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

  // Fetch route when selectedScooter or userPos changes
  useEffect(() => {
    let alive = true
    
    // Clear route if no scooter is selected, or if user has unlocked/started the ride
    if (!selectedScooter || !userPos || ride?.state === 'unlocked' || ride?.state === 'riding') {
      setRouteData(null)
      return
    }

    setRouteLoading(true)
    getRouteToScooter(selectedScooter.id, userPos[0], userPos[1])
      .then(data => {
        if (alive) setRouteData(data)
      })
      .catch(err => {
        console.error("Failed to load route to scooter", err)
        if (alive) setRouteData(null)
      })
      .finally(() => {
        if (alive) setRouteLoading(false)
      })

    return () => { alive = false }
  }, [selectedScooter?.id, userPos, ride?.state])

  function handleSelect(s: EnrichedScooter) {
    if (ride && ride.state !== 'idle' && ride.scooterId !== s.id) {
      setActionError('You have an active ride. Please end it before selecting another scooter.')
      return
    }
    if (s._status !== SCOOTER_STATUSES.AVAILABLE && !ride) return
    setSelectedId(s.id)
    setActionError(null)
    if (!ride) {
      const initRide: RideState = { state: 'selected', scooterId: s.id, scooterName: s.name || `#${s.id}`, userId: user?.id ?? undefined }
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
      userId: user?.id ?? undefined,
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
      const rental = await startRental({ scooterId: selectedScooter.id })
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

  // Báo cáo lỗi xe gửi về Backend
  async function reportIssue(kind: string) {
    const sid = ride?.scooterId || selectedScooter?.id
    if (!sid) return
    
    setActionLoading(true)
    try {
      // Gửi request báo lỗi lên backend
      await axiosClient.post(`/api/maintenance/${sid}/report`, null, { params: { issue: kind } })
      
      // Tự động kết thúc rental nếu đang đi
      if (ride?.state === 'riding' && ride?.rentalId) {
        await handleEnd()
      } else if (ride && ride.state !== 'idle') {
        setRide(null); saveRide(null); setSelectedId(null)
      }
      setActionError(null)
      setRefreshKey((k) => k + 1)
      alert("Cảm ơn bạn đã báo cáo. Xe đã được đánh dấu bảo trì trên hệ thống!")
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to report issue to the server.'))
    } finally {
      setActionLoading(false)
    }
  }

  function dismissCompleted() { setCompletedInfo(null) }

  function resetRide() {
    setRide(null); saveRide(null); setSelectedId(null); setActionError(null); setCompletedInfo(null)
  }

  const mapCenter: LatLngTuple = userPos || BACH_KHOA_CENTER
  const ridingMs = ride?.state === 'riding' && ride.startedAt ? now - ride.startedAt : 0

  return (
    <div className="flex gap-6 h-[calc(100vh-89px-4rem)] max-sm:h-[calc(100vh-89px-2.5rem)] max-sm:flex-col">
      {/* ============== CỘT TRÁI: MAP (Console Style) ============== */}
      <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 z-0">
        <div className="absolute inset-0">
          <MapContainer
          center={mapCenter}
          zoom={16}
          minZoom={11}
          maxZoom={18}
          scrollWheelZoom
          zoomControl={false}
          className="w-full h-full"
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
                pathOptions={{ color: 'var(--color-brand)', fillColor: 'var(--color-brand)', fillOpacity: 0.9, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -8]} permanent>You are here</Tooltip>
              </CircleMarker>
              {useRadius && (
                <Circle
                  center={userPos}
                  radius={radiusKm * 1000}
                  pathOptions={{ color: 'var(--color-brand)', fillColor: 'var(--color-brand)', fillOpacity: 0.06, weight: 1, dashArray: '6 6' }}
                />
              )}
            </>
          )}

          {routeData && routeData.points && routeData.points.length > 0 && (
            <Polyline 
              positions={routeData.points} 
              pathOptions={{ color: 'var(--color-brand)', weight: 4, opacity: 0.8, dashArray: '10 10', lineCap: 'round', lineJoin: 'round' }} 
            />
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
                  <div className="grid gap-1.5 min-w-50 text-text-strong">
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

        {/* ============== FLOATING ALERTS (Trực tiếp trên Map) ============== */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-3 w-full max-w-lg pointer-events-none px-4">
          {scootersError && <div className="pointer-events-auto w-full"><Alert tone="error">{scootersError}</Alert></div>}
          {actionError && <div className="pointer-events-auto w-full"><Alert tone="error">{actionError}</Alert></div>}
          {completedInfo && (
            <div className="pointer-events-auto w-full">
              <Alert tone="success">
                <div className="flex items-center justify-between gap-2.5">
                  <span>
                    <Sparkles size={18} strokeWidth={1.8} className="inline mr-2" />
                    Trip ended on <strong className="text-brand">{completedInfo.scooterName}</strong> · Total fare: {' '}
                    <strong className="text-brand">{formatCurrency(completedInfo.totalPrice)}</strong>
                  </span>
                  <Button variant="secondary" onClick={dismissCompleted}>
                    Close
                  </Button>
                </div>
              </Alert>
            </div>
          )}
          {showWarning && countdown === null && (
            <div className="pointer-events-auto w-full animate-in fade-in slide-in-from-top-4">
              <Alert tone="warning">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className="text-warning animate-pulse" />
                  <span>
                    Balance running low! The ride will <strong>automatically end</strong> in less than 5 minutes.
                  </span>
                </div>
              </Alert>
            </div>
          )}
        </div>

        {/* ============== COUNTDOWN OVERLAY ============== */}
        {countdown !== null && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm pointer-events-none animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center">
              <h2 className="text-rose-500 font-extrabold text-[8rem] leading-none drop-shadow-[0_0_40px_rgba(244,63,94,0.6)] tabular-nums">
                {countdown}
              </h2>
              <p className="text-white font-semibold text-xl tracking-wider mt-4 uppercase drop-shadow-md">
                Ride automatically ended
              </p>
            </div>
          </div>
        )}


        {/* ============== PANEL TOGGLE BUTTON (Trực tiếp trên Map) ============== */}
        <button
          onClick={() => setShowPanels(!showPanels)}
          className="absolute top-4 right-4 z-[1000] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold shadow-lg backdrop-blur-md transition-colors text-text-strong border-border bg-surface hover:bg-surface-muted pointer-events-auto"
        >
          {showPanels ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
          {showPanels ? 'Hide Panels' : 'Show Panels'}
        </button>
      </div>

      {/* ============== CỘT PHẢI: RIGHT SIDEBAR (ALL PANELS) ============== */}
      <div className={cn("flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-cyan-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-cyan-500/40 transition-all duration-300 ease-in-out shrink-0", showPanels ? "w-[420px] max-xl:w-96 max-sm:w-full opacity-100 pr-2" : "w-0 opacity-0 overflow-hidden pr-0")}>
        
        {/* RIDE STATUS CARD */}
        <div className="shrink-0 bg-surface border-border rounded-3xl shadow-2xl p-5 pointer-events-auto transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-strong tracking-tight">Ride Status</h2>
            {ride?.state === 'riding' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold text-brand bg-brand/10 border border-brand/20 animate-pulse">
                <Clock size={14} /> {fmtDuration(ridingMs)}
              </span>
            )}
          </div>

          {!selectedScooter ? (
            <div className="flex flex-col items-center justify-center py-6 text-text-muted bg-slate-800/20 rounded-2xl border border-white/5 border-dashed">
              <Bike size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Select a scooter on the map</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <p className="text-2xl font-bold text-text-strong mb-1">
                  {selectedScooter.name || `Scooter #${selectedScooter.id}`}
                </p>
                <div className="flex items-center gap-3 text-sm text-text-muted mt-2">
                  <span className="flex items-center gap-1"><Battery size={14} className="text-brand"/> {formatBatteryLevel(selectedScooter.batteryLevel) || '—'}</span>
                  
                  {routeLoading ? (
                    <span className="text-xs text-brand animate-pulse">Calculating route...</span>
                  ) : routeData ? (
                    <>
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-brand"/> {fmtKm(routeData.distance / 1000)} path</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="text-brand"/> {Math.ceil(routeData.time / 60000)} min walk</span>
                    </>
                  ) : selectedScooter._distance != null ? (
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-brand"/> {fmtKm(selectedScooter._distance)} straight</span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 mb-5 p-4 rounded-2xl bg-surface-muted border-border">
                <TimelineRow
                  icon={<Zap size={14} />}
                  label="Book Scooter"
                  value={ride?.reservedAt ? formatDateTime(ride.reservedAt) : '—'}
                  done={Boolean(ride?.reservedAt)}
                />
                <TimelineRow
                  icon={<Unlock size={14} />}
                  label="Unlock Scooter"
                  value={ride?.unlockedAt ? formatDateTime(ride.unlockedAt) : '—'}
                  done={Boolean(ride?.unlockedAt)}
                />
                <TimelineRow
                  icon={<Play size={14} />}
                  label="Start Ride"
                  value={ride?.startedAt ? formatDateTime(ride.startedAt) : '—'}
                  done={Boolean(ride?.startedAt)}
                />
                <TimelineRow
                  icon={<Square size={14} />}
                  label="End Ride"
                  value={completedInfo?.endTime ? formatDateTime(completedInfo.endTime) : '—'}
                  done={Boolean(completedInfo)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="rounded-xl h-11"
                  onClick={handleReserve}
                  disabled={!selectedScooter || ride?.state !== 'selected'}
                  leadingIcon={<Zap size={16} />}
                >
                  Book
                </Button>
                <Button
                  className="rounded-xl h-11 bg-surface-muted hover:bg-surface border border-border text-text-strong shadow-sm"
                  onClick={handleUnlock}
                  disabled={ride?.state !== 'reserved'}
                  leadingIcon={<Unlock size={16} />}
                >
                  Unlock
                </Button>
                <Button
                  className="rounded-xl h-11 bg-emerald-500 hover:bg-emerald-600 text-text-strong border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  onClick={handleStart}
                  disabled={ride?.state !== 'unlocked' || actionLoading}
                  leadingIcon={<Play size={16} />}
                >
                  {actionLoading && ride?.state === 'unlocked' ? 'Starting...' : 'Start'}
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-xl h-11"
                  onClick={handleEnd}
                  disabled={ride?.state !== 'riding' || actionLoading}
                  leadingIcon={<Square size={16} />}
                >
                  {actionLoading && ride?.state === 'riding' ? 'Ending...' : 'End'}
                </Button>
              </div>

              {ride && ride.state !== 'riding' && ride.state !== 'idle' && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 w-full rounded-xl text-text-muted hover:text-text-strong"
                  onClick={resetRide}
                >
                  Cancel Booking
                </Button>
              )}
            </>
          )}
        </div>

        {/* REPORT ISSUES CARD (Chỉ hiện khi có xe) */}
        {selectedScooter && (
          <div className="shrink-0 bg-surface border-border rounded-3xl shadow-2xl p-5 pointer-events-auto transition-all">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400" /> Report Issue
            </h3>
            <div className="grid gap-2">
              <Button
                variant="secondary"
                className="justify-start bg-surface hover:bg-surface-muted border-border rounded-xl text-sm"
                onClick={() => reportIssue('overheat')}
                leadingIcon={<Thermometer size={16} className="text-rose-400" />}
              >
                Battery overheating
              </Button>
              <Button
                variant="secondary"
                className="justify-start bg-surface hover:bg-surface-muted border-border rounded-xl text-sm"
                onClick={() => reportIssue('battery-drop')}
                leadingIcon={<Gauge size={16} className="text-amber-400" />}
              >
                Rapid battery drain
              </Button>
            </div>
          </div>
        )}

        {/* DYNAMIC RIGHT BOTTOM PANEL */}
        {(!ride || ride.state === 'idle') ? (
          <div className="flex-1 flex flex-col min-h-[400px] bg-surface border-border rounded-3xl shadow-2xl overflow-hidden p-5 pointer-events-auto">
            <div className="shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors
                  ${userPos 
                    ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' 
                    : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                  }`}
              >
                <Crosshair size={14} strokeWidth={2} />
                {userPos ? 'Located' : geoError ? 'Location error' : 'No location'}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand border border-brand/20 bg-brand/10">
                <Zap size={14} strokeWidth={2} />
                {visibleScooters.length} scooters
              </span>
            </div>

            <h2 className="text-xl font-bold text-text-strong tracking-tight mb-1">Find the Right Ride</h2>
            <p className="text-text-muted text-sm mb-4">Find scooters near you or filter by status.</p>
            
            <form className="grid gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name / ID..."
                  className="w-full bg-surface hover:bg-surface-muted border-border text-text-strong text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full bg-surface hover:bg-surface-muted border-border text-slate-200 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:border-cyan-500/50 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  {SCOOTER_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{statusLabel[s]}</option>
                  ))}
                </select>

                <Button
                  variant="secondary"
                  className="w-full rounded-full border-border bg-surface-muted hover:bg-surface-elevated justify-center h-auto py-2.5"
                  onClick={() => setRefreshKey((k) => k + 1)}
                >
                  <RefreshCcw size={16} className="mr-2" /> Refresh
                </Button>
              </div>

              <div className="px-1 py-1">
                <label className="flex items-center justify-between text-sm text-text-muted cursor-pointer select-none mb-2">
                  <span className="flex items-center gap-2">
                    <Filter size={14} className="text-brand" />
                    Radius: <strong className="text-text-strong">{radiusKm.toFixed(1)} km</strong>
                  </span>
                  <input
                    type="checkbox"
                    checked={useRadius}
                    onChange={(e) => setUseRadius(e.target.checked)}
                    className="w-4 h-4 accent-brand rounded cursor-pointer"
                  />
                </label>
                <input
                  type="range"
                  className="w-full accent-brand cursor-pointer disabled:opacity-50"
                  min="0.3" max="40" step="0.1"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  disabled={!useRadius}
                />
              </div>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-brand/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-brand/40">
            <div className="grid gap-3 pt-2">
              {scootersLoading && <p className="text-text-muted text-sm text-center py-4">Loading scooters...</p>}
              {!scootersLoading && visibleScooters.length === 0 && (
                <p className="text-text-muted text-sm text-center py-4">No scooters match your filters.</p>
              )}
              {visibleScooters.map((s) => {
                const isSelected = s.id === selectedId
                const isLocked = s._status !== SCOOTER_STATUSES.AVAILABLE
                
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "relative grid gap-3 p-4 rounded-2xl border cursor-pointer backdrop-blur-md",
                      "transition-all duration-200 ease-out",
                      isSelected 
                        ? "border-brand-strong bg-brand/10 shadow-[0_0_15px_var(--color-brand-soft)]" 
                        : "border-white/5 bg-surface-elevated border-border",
                      (isLocked && !isSelected) && "opacity-60"
                    )}
                    onClick={() => handleSelect(s)}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div>
                        <p className="font-bold text-text-strong leading-tight flex items-center gap-2">
                          {s.name || `Scooter #${s.id}`}
                          {isSelected && <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />}
                        </p>
                        <p className="text-text-muted text-[0.8rem] mt-0.5">
                          {formatCoordinates(Number(s._lat), Number(s._lng))}
                        </p>
                      </div>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        s._status === SCOOTER_STATUSES.AVAILABLE ? "text-cyan border-cyan/30 bg-cyan/10" :
                        s._status === SCOOTER_STATUSES.IN_USE ? "text-text-faded border-border bg-surface-muted" :
                        "text-brand border-brand/30 bg-brand/10"
                      )}>
                        {statusLabel[s._status] || s._status}
                      </span>
                    </div>

                    <div className="flex gap-2 flex-wrap text-[0.75rem] font-medium">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/40 text-slate-300 border border-white/5">
                        <Battery size={12} className={s.batteryLevel > 20 ? "text-emerald-400" : "text-rose-400"} /> 
                        {formatBatteryLevel(s.batteryLevel) || '—'}
                      </span>
                      
                      {s._distance != null && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/40 text-slate-300 border border-white/5">
                          <MapPin size={12} className="text-cyan-400" /> {fmtKm(s._distance)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        ) : (
          <div className="flex-1 flex flex-col bg-surface border-border rounded-3xl shadow-2xl p-5 pointer-events-auto">
            <h2 className="text-xl font-bold text-text-strong tracking-tight mb-4 flex items-center gap-2">
              <Bike size={20} className="text-brand" /> Scooter Details
            </h2>
            {selectedScooter ? (
              <div className="grid gap-4 mt-2">
                <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted mb-1 font-semibold tracking-wide uppercase">Temperature</span>
                    <span className="text-lg font-bold text-text-strong flex items-center gap-2">
                      <Thermometer size={18} className={selectedScooter.temperature && Number(selectedScooter.temperature) > 50 ? "text-rose-400" : "text-emerald-400"} />
                      {selectedScooter.temperature ? `${Number(selectedScooter.temperature).toFixed(1)} °C` : 'Optimal'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-text-muted mb-1 font-semibold tracking-wide uppercase">Status</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border text-brand border-brand/30 bg-brand/10">
                      IN USE
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-2xl border border-white/5">
                  <div className="flex flex-col w-full">
                    <span className="text-xs text-text-muted mb-1 font-semibold tracking-wide uppercase">Current Location</span>
                    <span className="text-sm font-mono text-text-strong flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-xl mt-1">
                      <MapPin size={16} className="text-cyan-400 shrink-0" />
                      <span className="truncate">{Number(selectedScooter.currentLat).toFixed(6)}, {Number(selectedScooter.currentLng).toFixed(6)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted mb-1 font-semibold tracking-wide uppercase">Battery Health</span>
                    <span className="text-lg font-bold text-text-strong flex items-center gap-2">
                      <Battery size={18} className={selectedScooter.batteryLevel > 20 ? "text-emerald-400" : "text-rose-400"} />
                      {selectedScooter.batteryLevel}% remaining
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-text-muted text-sm flex items-center gap-2">
                  <ShieldAlert size={16} /> Scooter information is not available.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TimelineRow({ icon, label, value, done }: TimelineRowProps) {
  return (
    <div className={`flex items-center justify-between gap-3 text-sm group ${done ? 'is-done' : ''}`}>
      <span className="inline-flex items-center gap-2.5 text-text-faded group-[.is-done]:text-text-strong transition-colors">
        <span className="text-text-muted group-[.is-done]:text-brand transition-colors">
          {icon} 
        </span>
        {label}
      </span>
      <span className="text-text-muted tabular-nums font-mono text-xs group-[.is-done]:text-brand group-[.is-done]:font-semibold transition-colors">
        {value}
      </span>
    </div>
  )
}
import {
    AlertTriangle,
    Battery,
    Bike,
    Filter,
    LocateFixed,
    MapPinned,
    Search,
    ShieldAlert,
    SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AppHeader from '../components/AppHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import GeofenceWarningModal from '../components/GeofenceWarningModal'
import RideStatusPanel from '../components/RideStatusPanel'
import ScooterList from '../components/ScooterList'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../contexts/AuthContext'
import { geofenceBoundary } from '../mock/mockData'
import { getAutoDecommissionReason, isActionLocked } from '../services/alertService'
import { bookingService, createIdleRide } from '../services/bookingService'
import { scooterService } from '../services/scooterService'

function getMapPointStyle(scooter) {
    const latRange = geofenceBoundary.north - geofenceBoundary.south
    const lngRange = geofenceBoundary.east - geofenceBoundary.west
    const top = ((geofenceBoundary.north - scooter.currentLat) / latRange) * 100
    const left = ((scooter.currentLng - geofenceBoundary.west) / lngRange) * 100

    return {
        top: `${Math.min(92, Math.max(8, top))}%`,
        left: `${Math.min(92, Math.max(8, left))}%`,
    }
}

function getMapBubbleClass(status, selected) {
    const base = `map-pin__bubble map-pin__bubble--${status}`
    return selected ? `${base} map-pin__bubble--selected` : base
}

export default function BookingPage() {
    const { user } = useAuth()
    const [scooters, setScooters] = useState([])
    const [selectedScooterId, setSelectedScooterId] = useState(null)
    const [ride, setRide] = useState(createIdleRide())
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState('')
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [availableOnly, setAvailableOnly] = useState(false)
    const [sortBy, setSortBy] = useState('nearest')
    const [minBattery, setMinBattery] = useState(0)
    const [showGeofenceModal, setShowGeofenceModal] = useState(false)

    useEffect(() => {
        let active = true

        async function loadScooters() {
            setLoading(true)
            setError('')

            try {
                const data = await scooterService.getScooters()

                if (!active) {
                    return
                }

                setScooters(data)
                setSelectedScooterId((current) => current ?? data.find((item) => item.status === 'available')?.id ?? data[0]?.id ?? null)
            } catch (loadError) {
                if (!active) {
                    return
                }

                setError('Không thể tải danh sách xe. Vui lòng thử lại.')
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadScooters()

        return () => {
            active = false
        }
    }, [])

    const selectedScooter = useMemo(
        () => scooters.find((scooter) => scooter.id === selectedScooterId) || null,
        [scooters, selectedScooterId],
    )

    const filteredScooters = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        const result = scooters
            .filter((scooter) => {
                if (availableOnly && scooter.status !== 'available') {
                    return false
                }

                if (scooter.batteryLevel < minBattery) {
                    return false
                }

                if (!normalizedSearch) {
                    return true
                }

                return [scooter.name, scooter.locationLabel]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalizedSearch))
            })
            .sort((first, second) => {
                if (sortBy === 'battery') {
                    return second.batteryLevel - first.batteryLevel
                }

                if (sortBy === 'status') {
                    return first.status.localeCompare(second.status)
                }

                return first.distanceKm - second.distanceKm
            })

        return result
    }, [availableOnly, minBattery, scooters, search, sortBy])

    async function withAction(type, task) {
        setActionLoading(type)
        try {
            await task()
        } finally {
            setActionLoading('')
        }
    }

    async function handleReserve() {
        if (!selectedScooter) {
            return
        }

        await withAction('reserve', async () => {
            const nextRide = await bookingService.reserveScooter(selectedScooter, user)
            setRide(nextRide)
            setScooters((current) =>
                scooterService.applyScooterPatch(current, selectedScooter.id, { status: 'in_use' }),
            )
            toast.success(`Đã giữ xe ${selectedScooter.name}`)
        })
    }

    async function handleUnlock() {
        await withAction('unlock', async () => {
            const nextRide = await bookingService.unlockRide(ride)
            setRide(nextRide)
            toast.success('Mở khóa thành công. Xe đã sẵn sàng.')
        })
    }

    async function handleStartRide() {
        await withAction('start', async () => {
            const nextRide = await bookingService.startRide(ride)
            setRide(nextRide)
            toast.success('Chuyến đi đã bắt đầu.')
        })
    }

    async function handleEndRide() {
        if (!selectedScooter) {
            return
        }

        await withAction('end', async () => {
            const completedRide = await bookingService.endRide(ride)
            setRide(completedRide)
            setShowGeofenceModal(false)
            setScooters((current) =>
                scooterService.applyScooterPatch(current, selectedScooter.id, {
                    status: 'available',
                    speedKmh: 0,
                    geoFence: { outOfZone: false },
                    health: { batteryOverheat: false, rapidBatteryDrop: false },
                }),
            )
            toast.success(`Đã kết thúc chuyến đi ${completedRide.distanceKm} km.`)
        })
    }

    function selectScooter(scooter) {
        const rideIsActive = !['idle', 'completed'].includes(ride.stage)

        if (rideIsActive && ride.scooterId && ride.scooterId !== scooter.id) {
            toast.error('Bạn đang có một chuyến đi đang xử lý. Hãy hoàn tất hoặc quay lại đúng xe đang dùng.')
            return
        }

        setSelectedScooterId(scooter.id)
    }

    function patchSelectedScooter(patch) {
        if (!selectedScooter) {
            return
        }

        setScooters((current) => scooterService.applyScooterPatch(current, selectedScooter.id, patch))
    }

    function triggerGeofence() {
        if (!selectedScooter) {
            return
        }

        patchSelectedScooter({ geoFence: { outOfZone: true } })
        setRide((current) => ({ ...current, warningActive: true }))
        setShowGeofenceModal(true)
        toast.error('Geofence warning: xe đã ra khỏi vùng cho phép.')
    }

    function clearGeofence() {
        patchSelectedScooter({ geoFence: { outOfZone: false } })
        setRide((current) => ({ ...current, warningActive: false }))
        setShowGeofenceModal(false)
        toast.success('Đã xóa cảnh báo geofence.')
    }

    function triggerBatteryOverheat() {
        if (!selectedScooter) {
            return
        }

        patchSelectedScooter({
            status: 'decommissioned',
            health: { batteryOverheat: true, rapidBatteryDrop: false },
        })
        toast.error('Pin quá nóng. Hệ thống đã khóa thao tác xe.')
    }

    function triggerRapidBatteryDrop() {
        if (!selectedScooter) {
            return
        }

        patchSelectedScooter({
            status: 'decommissioned',
            health: { batteryOverheat: false, rapidBatteryDrop: true },
        })
        toast.error('Phát hiện pin sụt nhanh. Xe tạm khóa an toàn.')
    }

    function clearSafetyLock() {
        if (!selectedScooter) {
            return
        }

        patchSelectedScooter({
            status: ride.stage === 'idle' || ride.stage === 'completed' ? 'available' : 'in_use',
            health: { batteryOverheat: false, rapidBatteryDrop: false },
        })
        toast.success('Đã xóa trạng thái khóa an toàn.')
    }

    const selectedLockReason = getAutoDecommissionReason(selectedScooter)
    const selectedActionLocked = isActionLocked(selectedScooter)

    return (
        <div className="page-shell">
            <AppHeader />
            <main className="dashboard">
                <section className="page-intro">
                    <div>
                        <h1>Customer booking portal</h1>
                        <p>
                            Tìm xe gần nhất, đặt xe, mở khóa và theo dõi cảnh báo geofence / pin trên cùng một màn hình.
                        </p>
                    </div>
                    <div className="page-chip-group">
                        <div className="page-chip">
                            <Bike size={16} />
                            {filteredScooters.length} xe hiển thị
                        </div>
                        <div className="page-chip">
                            <Battery size={16} />
                            Tối thiểu {minBattery}% pin
                        </div>
                        <div className="page-chip">
                            <LocateFixed size={16} />
                            Hoàn Kiếm geofence demo
                        </div>
                    </div>
                </section>

                <section className="booking-layout">
                    <aside className="panel">
                        <div className="panel__header">
                            <div>
                                <h2 className="panel__title">Danh sách xe</h2>
                                <p className="panel__subtitle">Tìm, lọc và chọn xe phù hợp nhất.</p>
                            </div>
                            <Filter size={18} color="#8091a7" />
                        </div>
                        <div className="panel__body" style={{ display: 'grid', gap: 18 }}>
                            <div className="filter-stack">
                                <div className="search-box">
                                    <Search size={18} />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Tìm theo mã xe hoặc vị trí"
                                    />
                                </div>

                                <div className="toggle">
                                    <label htmlFor="available-only">Chỉ hiện xe khả dụng</label>
                                    <input
                                        id="available-only"
                                        type="checkbox"
                                        checked={availableOnly}
                                        onChange={(event) => setAvailableOnly(event.target.checked)}
                                    />
                                </div>

                                <div className="filter-row">
                                    <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                                        <option value="nearest">Sắp xếp: gần nhất</option>
                                        <option value="battery">Sắp xếp: pin cao nhất</option>
                                        <option value="status">Sắp xếp: trạng thái</option>
                                    </select>
                                </div>

                                <div className="filter-stack">
                                    <div className="field__label">
                                        <span>Mức pin tối thiểu</span>
                                        <span className="field__hint">{minBattery}%</span>
                                    </div>
                                    <input
                                        className="range-input"
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={minBattery}
                                        onChange={(event) => setMinBattery(Number(event.target.value))}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <div className="scooter-list">
                                    <div className="skeleton skeleton-card" />
                                    <div className="skeleton skeleton-card" />
                                    <div className="skeleton skeleton-card" />
                                </div>
                            ) : error ? (
                                <EmptyState icon={AlertTriangle} title="Không tải được dữ liệu" description={error} />
                            ) : (
                                <ScooterList scooters={filteredScooters} selectedScooterId={selectedScooterId} onSelect={selectScooter} />
                            )}
                        </div>
                    </aside>

                    <section className="panel map-panel__stage">
                        <div className="panel__header">
                            <div>
                                <h2 className="panel__title">Booking map</h2>
                                <p className="panel__subtitle">Bản đồ mô phỏng vị trí xe và vùng geofence.</p>
                            </div>
                            <SlidersHorizontal size={18} color="#8091a7" />
                        </div>
                        <div className="panel__body" style={{ display: 'grid', gap: 20 }}>
                            <div className="mock-map">
                                <div className="mock-map__overlay" />
                                <div className="mock-map__legend">
                                    <div className="legend-row"><span className="legend-dot legend-dot--safe" /> Xe khả dụng</div>
                                    <div className="legend-row"><span className="legend-dot legend-dot--warning" /> Đang sử dụng</div>
                                    <div className="legend-row"><span className="legend-dot legend-dot--danger" /> Bảo trì / khóa an toàn</div>
                                </div>

                                {filteredScooters.map((scooter) => {
                                    const pointStyle = getMapPointStyle(scooter)
                                    const isSelected = scooter.id === selectedScooterId

                                    return (
                                        <button
                                            key={scooter.id}
                                            className="map-pin"
                                            style={pointStyle}
                                            onClick={() => selectScooter(scooter)}
                                        >
                      <span className={getMapBubbleClass(scooter.status, isSelected)}>
                        <MapPinned size={18} />
                      </span>
                                            <span className="map-pin__label">{scooter.name}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {selectedScooter ? (
                                <>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-item__label">Xe đang chọn</span>
                                            <span className="detail-item__value">{selectedScooter.name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-item__label">Trạng thái</span>
                                            <span className="detail-item__value">
                        <StatusBadge status={selectedScooter.status} />
                      </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-item__label">Vị trí gần nhất</span>
                                            <span className="detail-item__value">{selectedScooter.locationLabel}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-item__label">Khoảng cách</span>
                                            <span className="detail-item__value">{selectedScooter.distanceKm} km</span>
                                        </div>
                                    </div>

                                    {selectedActionLocked ? (
                                        <div className="lock-banner">
                                            <ShieldAlert size={18} />
                                            <div>
                                                <strong>Xe hiện không khả dụng do sự cố pin</strong>
                                                <p style={{ margin: '3px 0 0' }}>{selectedLockReason}</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="panel" style={{ boxShadow: 'none' }}>
                                        <div className="panel__header">
                                            <div>
                                                <h3 className="panel__title">Simulation controls</h3>
                                                <p className="panel__subtitle">Dùng để test geofence và auto-decommission trước khi nối realtime event.</p>
                                            </div>
                                        </div>
                                        <div className="panel__body">
                                            <div className="simulation-grid">
                                                <Button variant="secondary" size="sm" icon={AlertTriangle} onClick={triggerGeofence}>
                                                    Bật geofence
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={clearGeofence}>
                                                    Tắt geofence
                                                </Button>
                                                <Button variant="danger" size="sm" icon={ShieldAlert} onClick={triggerBatteryOverheat}>
                                                    Pin quá nóng
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={triggerRapidBatteryDrop}>
                                                    Pin sụt nhanh
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={clearSafetyLock}>
                                                    Xóa khóa an toàn
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <EmptyState
                                    icon={MapPinned}
                                    title="Hãy chọn một xe trên bản đồ"
                                    description="Sau khi chọn xe, panel chi tiết và thao tác đặt xe sẽ xuất hiện ở đây."
                                />
                            )}
                        </div>
                    </section>

                    <RideStatusPanel
                        ride={ride}
                        scooter={selectedScooter}
                        loading={actionLoading}
                        onReserve={handleReserve}
                        onUnlock={handleUnlock}
                        onStartRide={handleStartRide}
                        onEndRide={handleEndRide}
                    />
                </section>
            </main>

            <GeofenceWarningModal
                open={showGeofenceModal}
                scooterName={selectedScooter?.name}
                onClose={() => setShowGeofenceModal(false)}
            />
        </div>
    )
}

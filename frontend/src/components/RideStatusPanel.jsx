import { AlertTriangle, Bike, Clock3, LocateFixed, ShieldAlert } from 'lucide-react'
import { rideStages } from '../mock/mockData'
import { getAutoDecommissionReason, getGeofenceWarning } from '../services/alertService'
import { RIDE_STAGES } from '../services/bookingService'
import Button from './Button'
import EmptyState from './EmptyState'
import StatusBadge from './StatusBadge'

function formatDate(value) {
    if (!value) {
        return '—'
    }

    return new Date(value).toLocaleString('vi-VN')
}

export default function RideStatusPanel({
                                            ride,
                                            scooter,
                                            loading,
                                            onReserve,
                                            onUnlock,
                                            onStartRide,
                                            onEndRide,
                                        }) {
    if (!scooter) {
        return (
            <section className="panel">
                <div className="panel__header">
                    <div>
                        <h2 className="panel__title">Ride status</h2>
                        <p className="panel__subtitle">Theo dõi luồng đặt xe, mở khóa và chuyến đi.</p>
                    </div>
                </div>
                <div className="panel__body">
                    <EmptyState
                        icon={Bike}
                        title="Chưa có xe nào được chọn"
                        description="Chọn một xe ở danh sách hoặc trên bản đồ để xem trạng thái và thao tác."
                    />
                </div>
            </section>
        )
    }

    const lockReason = getAutoDecommissionReason(scooter)
    const geofenceWarning = getGeofenceWarning(scooter)
    const canReserve = [RIDE_STAGES.IDLE, RIDE_STAGES.COMPLETED].includes(ride.stage)
    const canUnlock = ride.stage === RIDE_STAGES.RESERVED
    const canStartRide = ride.stage === RIDE_STAGES.UNLOCKED
    const canEndRide = [RIDE_STAGES.RIDING, RIDE_STAGES.UNLOCKED].includes(ride.stage)

    return (
        <section className="panel">
            <div className="panel__header">
                <div>
                    <h2 className="panel__title">Ride status</h2>
                    <p className="panel__subtitle">Quản lý đặt xe, mở khóa và kết thúc chuyến.</p>
                </div>
                <StatusBadge status={ride.stage} />
            </div>

            <div className="panel__body" style={{ display: 'grid', gap: 20 }}>
                <div className="status-grid">
                    <div className="status-card">
                        <span className="status-card__label">Xe đang thao tác</span>
                        <span className="status-card__value">{scooter.name}</span>
                    </div>
                    <div className="status-card">
                        <span className="status-card__label">Battery</span>
                        <span className="status-card__value">{scooter.batteryLevel}%</span>
                    </div>
                    <div className="status-card">
                        <span className="status-card__label">Vị trí</span>
                        <span className="status-card__value">{scooter.locationLabel}</span>
                    </div>
                    <div className="status-card">
                        <span className="status-card__label">Availability</span>
                        <span className="status-card__value">{scooter.status.replace('_', ' ')}</span>
                    </div>
                </div>

                {geofenceWarning ? (
                    <div className="warning-note">
                        <AlertTriangle size={18} />
                        <div>
                            <strong>Cảnh báo geofence đang bật</strong>
                            <p style={{ margin: '3px 0 0' }}>{geofenceWarning}</p>
                        </div>
                    </div>
                ) : null}

                {lockReason ? (
                    <div className="lock-banner">
                        <ShieldAlert size={18} />
                        <div>
                            <strong>Auto-decommission đang khóa thao tác</strong>
                            <p style={{ margin: '3px 0 0' }}>{lockReason}</p>
                        </div>
                    </div>
                ) : null}

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <Clock3 size={16} />
                        <strong>Hành trình theo từng bước</strong>
                    </div>
                    <div className="ride-stage-timeline">
                        {rideStages.map((stage, index) => {
                            const currentIndex = rideStages.findIndex((item) => item.key === ride.stage)
                            const done = index < currentIndex
                            const active = stage.key === ride.stage

                            return (
                                <div
                                    key={stage.key}
                                    className={`ride-stage-row ${active ? 'ride-stage-row--active' : ''} ${done ? 'ride-stage-row--done' : ''}`.trim()}
                                >
                                    <div className="ride-stage-row__dot" />
                                    <div>
                                        <div className="ride-stage-row__label">{stage.label}</div>
                                        <div className="ride-stage-row__desc">{stage.description}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="meta-list">
                    <div className="meta-row">
                        <span>Reserved at</span>
                        <strong>{formatDate(ride.reservedAt)}</strong>
                    </div>
                    <div className="meta-row">
                        <span>Unlocked at</span>
                        <strong>{formatDate(ride.unlockedAt)}</strong>
                    </div>
                    <div className="meta-row">
                        <span>Started at</span>
                        <strong>{formatDate(ride.startedAt)}</strong>
                    </div>
                    <div className="meta-row">
                        <span>Ended at</span>
                        <strong>{formatDate(ride.endedAt)}</strong>
                    </div>
                    <div className="meta-row">
                        <span>Quãng đường</span>
                        <strong>{ride.distanceKm ? `${ride.distanceKm} km` : '—'}</strong>
                    </div>
                </div>

                <div className="action-stack">
                    {canReserve ? (
                        <Button loading={loading === 'reserve'} disabled={Boolean(lockReason) || scooter.status !== 'available'} onClick={onReserve}>
                            Đặt xe
                        </Button>
                    ) : null}

                    {canUnlock ? (
                        <Button loading={loading === 'unlock'} disabled={Boolean(lockReason)} onClick={onUnlock}>
                            Mở khóa
                        </Button>
                    ) : null}

                    {canStartRide ? (
                        <Button loading={loading === 'start'} disabled={Boolean(lockReason)} onClick={onStartRide}>
                            Bắt đầu chuyến đi
                        </Button>
                    ) : null}

                    {canEndRide ? (
                        <Button
                            variant="danger"
                            loading={loading === 'end'}
                            onClick={onEndRide}
                        >
                            Kết thúc chuyến
                        </Button>
                    ) : null}

                    {ride.stage === RIDE_STAGES.RIDING ? (
                        <div className="info-banner">
                            <LocateFixed size={18} />
                            <div>
                                <strong>Ride live</strong>
                                <p style={{ margin: '2px 0 0' }}>
                                    Theo dõi geofence và trạng thái pin trong khi di chuyển.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    )
}

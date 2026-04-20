import { BatteryCharging, Gauge, MapPin, ShieldAlert } from 'lucide-react'
import { getAutoDecommissionReason } from '../services/alertService'
import Button from './Button'
import StatusBadge from './StatusBadge'

export default function ScooterCard({ scooter, selected, onSelect }) {
    const lockReason = getAutoDecommissionReason(scooter)

    return (
        <article className={`scooter-card ${selected ? 'scooter-card--selected' : ''}`.trim()}>
            <div className="scooter-card__top">
                <div>
                    <h3 className="scooter-card__name">{scooter.name}</h3>
                    <div className="scooter-card__meta">{scooter.locationLabel}</div>
                </div>
                <StatusBadge status={scooter.status} />
            </div>

            <div className="metric-list">
                <div className="metric">
                    <span className="metric__label">Battery</span>
                    <span className="metric__value">{scooter.batteryLevel}%</span>
                </div>
                <div className="metric">
                    <span className="metric__label">Khoảng cách</span>
                    <span className="metric__value">{scooter.distanceKm} km</span>
                </div>
                <div className="metric">
                    <span className="metric__label">ETA</span>
                    <span className="metric__value">{scooter.estimatedMinutesAway} phút</span>
                </div>
            </div>

            <div className="inline-info">
        <span className="scooter-card__meta">
          <BatteryCharging size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
            {scooter.batteryLevel >= 60 ? 'Pin tốt' : scooter.batteryLevel >= 30 ? 'Pin trung bình' : 'Pin thấp'}
        </span>
                <span className="scooter-card__meta">
          <Gauge size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                    {scooter.speedKmh || 0} km/h
        </span>
            </div>

            {scooter.geoFence?.outOfZone ? (
                <div className="warning-note">
                    <MapPin size={18} />
                    <div>
                        <strong>Geofence active</strong>
                        <p style={{ margin: '2px 0 0' }}>Xe đang ở ngoài vùng quy định.</p>
                    </div>
                </div>
            ) : null}

            {lockReason ? (
                <div className="lock-banner">
                    <ShieldAlert size={18} />
                    <div>
                        <strong>Xe đang bị khóa an toàn</strong>
                        <p style={{ margin: '2px 0 0' }}>{lockReason}</p>
                    </div>
                </div>
            ) : null}

            <div className="scooter-card__bottom">
        <span className="scooter-card__meta">
          {scooter.status === 'available' ? 'Sẵn sàng để đặt' : 'Không thể đặt ngay lúc này'}
        </span>
                <Button variant={selected ? 'secondary' : 'primary'} size="sm" onClick={() => onSelect(scooter)}>
                    {selected ? 'Đang chọn' : 'Chọn xe'}
                </Button>
            </div>
        </article>
    )
}

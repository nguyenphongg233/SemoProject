import { AlertTriangle, CheckCircle2, Wrench, Zap } from 'lucide-react'

const badgeConfig = {
    available: { label: 'Khả dụng', icon: CheckCircle2, className: 'status-badge--available' },
    in_use: { label: 'Đang dùng', icon: Zap, className: 'status-badge--in_use' },
    maintenance: { label: 'Bảo trì', icon: Wrench, className: 'status-badge--maintenance' },
    decommissioned: {
        label: 'Khóa an toàn',
        icon: AlertTriangle,
        className: 'status-badge--decommissioned',
    },
    idle: { label: 'Chưa đặt', icon: CheckCircle2, className: 'status-badge--ride-idle' },
    reserved: { label: 'Đã đặt', icon: Zap, className: 'status-badge--ride-reserved' },
    unlocked: { label: 'Đã mở khóa', icon: Zap, className: 'status-badge--ride-unlocked' },
    riding: { label: 'Đang đi', icon: Zap, className: 'status-badge--ride-riding' },
    completed: { label: 'Đã kết thúc', icon: CheckCircle2, className: 'status-badge--ride-completed' },
    warning: { label: 'Geofence', icon: AlertTriangle, className: 'status-badge--warning' },
    danger: { label: 'Unsafe', icon: AlertTriangle, className: 'status-badge--danger' },
    neutral: { label: 'Trung tính', icon: CheckCircle2, className: 'status-badge--neutral' },
}

export default function StatusBadge({ status, label }) {
    const config = badgeConfig[status] || badgeConfig.neutral
    const Icon = config.icon

    return (
        <span className={`status-badge ${config.className}`}>
      <Icon size={14} />
      <span>{label || config.label}</span>
    </span>
    )
}

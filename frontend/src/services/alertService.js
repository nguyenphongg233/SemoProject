export function getAutoDecommissionReason(scooter) {
    if (!scooter) {
        return ''
    }

    const { batteryOverheat, rapidBatteryDrop } = scooter.health || {}

    if (batteryOverheat && rapidBatteryDrop) {
        return 'Pin quá nóng và sụt pin nhanh bất thường. Xe tạm khóa để bảo vệ hệ thống.'
    }

    if (batteryOverheat) {
        return 'Pin đang quá nóng. Hệ thống tự động khóa thao tác cho đến khi nhiệt độ an toàn.'
    }

    if (rapidBatteryDrop) {
        return 'Pin sụt nhanh bất thường. Xe tạm khóa để tránh rủi ro giữa chuyến đi.'
    }

    return ''
}

export function getScooterAvailabilityLabel(status) {
    switch (status) {
        case 'available':
            return 'Khả dụng'
        case 'in_use':
            return 'Đang được dùng'
        case 'maintenance':
            return 'Bảo trì'
        case 'decommissioned':
            return 'Đang khóa an toàn'
        default:
            return 'Không xác định'
    }
}

export function isActionLocked(scooter) {
    return Boolean(getAutoDecommissionReason(scooter))
}

export function getGeofenceWarning(scooter) {
    if (!scooter?.geoFence?.outOfZone) {
        return ''
    }

    return 'Xe đang ở ngoài vùng geofence được phép. Cần kết thúc hoặc điều chỉnh chuyến đi ngay.'
}

export const alertService = {
    getAutoDecommissionReason,
    getScooterAvailabilityLabel,
    isActionLocked,
    getGeofenceWarning,
}

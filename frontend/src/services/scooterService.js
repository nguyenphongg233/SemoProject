import apiClient from './apiClient'
import { mockScooters } from '../mock/mockData'

function wait(ms = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeStatus(status) {
    const value = String(status || '').trim().toLowerCase()

    if (['available', 'free'].includes(value)) {
        return 'available'
    }

    if (['in_use', 'inuse', 'busy', 'riding'].includes(value)) {
        return 'in_use'
    }

    if (['maintenance', 'repair'].includes(value)) {
        return 'maintenance'
    }

    if (['decommissioned', 'locked', 'unsafe'].includes(value)) {
        return 'decommissioned'
    }

    return 'available'
}

function cloneScooter(scooter) {
    return JSON.parse(JSON.stringify(scooter))
}

function hydrateBackendScooters(list) {
    return list.map((item, index) => {
        const fallback = mockScooters[index % mockScooters.length]
        const status = normalizeStatus(item.status)

        return {
            ...cloneScooter(fallback),
            id: item.id ?? fallback.id,
            name: item.name ?? item.codeName ?? fallback.name,
            codeName: item.name ?? item.codeName ?? fallback.codeName,
            batteryLevel: Number(item.batteryLevel ?? fallback.batteryLevel),
            status,
            currentLat: Number(item.currentLat ?? fallback.currentLat),
            currentLng: Number(item.currentLng ?? fallback.currentLng),
            health: {
                batteryOverheat: status === 'decommissioned',
                rapidBatteryDrop: false,
            },
            geoFence: {
                outOfZone: false,
            },
            locationLabel: fallback.locationLabel,
            distanceKm: fallback.distanceKm,
            estimatedMinutesAway: fallback.estimatedMinutesAway,
            speedKmh: status === 'in_use' ? 14 : 0,
        }
    })
}

export async function getScooters() {
    try {
        const response = await apiClient.get('/api/scooters')

        if (Array.isArray(response.data) && response.data.length) {
            return hydrateBackendScooters(response.data)
        }
    } catch {
        // fallback sang mock data để frontend chạy độc lập
    }

    await wait()
    return mockScooters.map(cloneScooter)
}

export function applyScooterPatch(scooters, scooterId, patch) {
    return scooters.map((scooter) => {
        if (scooter.id !== scooterId) {
            return scooter
        }

        return {
            ...scooter,
            ...patch,
            health: {
                ...scooter.health,
                ...(patch.health || {}),
            },
            geoFence: {
                ...scooter.geoFence,
                ...(patch.geoFence || {}),
            },
        }
    })
}

export const scooterService = {
    getScooters,
    applyScooterPatch,
}

// TODO: Khi backend trả thêm telemetry/geofence/health, map trực tiếp vào object scooter thay vì fallback mock.

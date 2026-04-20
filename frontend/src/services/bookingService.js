export const RIDE_STAGES = {
    IDLE: 'idle',
    RESERVED: 'reserved',
    UNLOCKED: 'unlocked',
    RIDING: 'riding',
    COMPLETED: 'completed',
}

function wait(ms = 650) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createIdleRide() {
    return {
        stage: RIDE_STAGES.IDLE,
        scooterId: null,
        reservedAt: null,
        unlockedAt: null,
        startedAt: null,
        endedAt: null,
        riderName: null,
        warningActive: false,
        distanceKm: 0,
    }
}

export async function reserveScooter(scooter, user) {
    await wait()

    return {
        stage: RIDE_STAGES.RESERVED,
        scooterId: scooter.id,
        reservedAt: new Date().toISOString(),
        unlockedAt: null,
        startedAt: null,
        endedAt: null,
        riderName: user?.name || 'Customer',
        warningActive: false,
        distanceKm: 0,
    }
}

export async function unlockRide(ride) {
    await wait()

    return {
        ...ride,
        stage: RIDE_STAGES.UNLOCKED,
        unlockedAt: new Date().toISOString(),
    }
}

export async function startRide(ride) {
    await wait()

    return {
        ...ride,
        stage: RIDE_STAGES.RIDING,
        startedAt: new Date().toISOString(),
    }
}

export async function endRide(ride) {
    await wait()

    return {
        ...ride,
        stage: RIDE_STAGES.COMPLETED,
        endedAt: new Date().toISOString(),
        distanceKm: Number((Math.random() * 3.6 + 0.8).toFixed(1)),
        warningActive: false,
    }
}

export const bookingService = {
    RIDE_STAGES,
    createIdleRide,
    reserveScooter,
    unlockRide,
    startRide,
    endRide,
}

// API helpers for maintenance log creation, lookup, and resolution.
import { axiosClient } from '@/config/axiosClient'

// Bổ sung kiểu any cho request
export async function createMaintenanceLog(request: any) {
  const { data } = await axiosClient.post('/api/maintenance', request)
  return data
}

// Bổ sung kiểu number | string cho scooterId
export async function getMaintenanceLogsByScooterId(scooterId: number | string) {
  const { data } = await axiosClient.get(`/api/maintenance/scooter/${scooterId}`)
  return data
}

// Bổ sung kiểu number | string cho scooterId, thêm tham số cost mặc định là 0
export async function resolveMaintenance(scooterId: number | string, cost: number = 0) {
  const { data } = await axiosClient.post(`/api/maintenance/${scooterId}/resolve`, { cost })
  return data
}

export async function getAllMaintenanceLogs() {
  const { data } = await axiosClient.get('/api/maintenance')
  return data
}
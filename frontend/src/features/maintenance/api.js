// API helpers for maintenance log creation, lookup, and resolution.
import { axiosClient } from '../../config/axiosClient'

export async function createMaintenanceLog(request) {
  const { data } = await axiosClient.post('/api/maintenance', request)
  return data
}

export async function getMaintenanceLogsByScooterId(scooterId) {
  const { data } = await axiosClient.get(`/api/maintenance/scooter/${scooterId}`)
  return data
}

export async function resolveMaintenance(scooterId) {
  const { data } = await axiosClient.post(`/api/maintenance/${scooterId}/resolve`)
  return data
}

import { axiosClient } from '@/config/axiosClient'

export async function getAllGeofenceZones() {
  const { data } = await axiosClient.get('/api/geofence')
  return data
}

export async function createGeofenceZone(request: any) {
  const { data } = await axiosClient.post('/api/geofence', request)
  return data
}

export async function updateGeofenceZone(id: number | string, request: any) {
  const { data } = await axiosClient.put(`/api/geofence/${id}`, request)
  return data
}

export async function deleteGeofenceZone(id: number | string) {
  const { data } = await axiosClient.delete(`/api/geofence/${id}`)
  return data
}

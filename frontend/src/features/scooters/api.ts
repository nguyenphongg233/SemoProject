// API helpers for scooter CRUD and status-based retrieval.
import { axiosClient } from '@/config/axiosClient'

export async function createScooter(request: any) {
  const { data } = await axiosClient.post('/api/scooters', request)
  return data
}

export async function getAllScooters() {
  const { data } = await axiosClient.get('/api/scooters')
  return data
}

export async function getAllScootersPaged(page = 0, size = 10) {
  const { data } = await axiosClient.get('/api/scooters/paged', {
    params: { page, size },
  })
  return data
}

export async function getScootersByStatus(status = 'AVAILABLE') {
  const { data } = await axiosClient.get('/api/scooters/status', {
    params: { status },
  })
  return data
}

export async function getScooterById(id: number | string) {
  const { data } = await axiosClient.get(`/api/scooters/${id}`)
  return data
}

export async function updateScooter(id: number | string, request: any) {
  const { data } = await axiosClient.put(`/api/scooters/${id}`, request)
  return data
}

export async function deleteScooter(id: number | string) {
  const { data } = await axiosClient.delete(`/api/scooters/${id}`)
  return data
}
export async function exportScootersExcel() {
  const response = await axiosClient.get('/api/scooters/export', {
    responseType: 'blob'
  });
  return response.data;
}

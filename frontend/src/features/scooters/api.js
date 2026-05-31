// API helpers for scooter CRUD and status-based retrieval.
import { axiosClient } from '../../config/axiosClient'

export async function createScooter(request) {
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

export async function getScooterById(id) {
  const { data } = await axiosClient.get(`/api/scooters/${id}`)
  return data
}

export async function updateScooter(id, request) {
  const { data } = await axiosClient.put(`/api/scooters/${id}`, request)
  return data
}

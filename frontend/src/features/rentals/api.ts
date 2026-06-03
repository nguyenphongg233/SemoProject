import { axiosClient } from '../../config/axiosClient'

export async function startRental(request: any) {
  const { data } = await axiosClient.post('/api/rentals/start', request)
  return data
}

export async function endRental(id: number | string) {
  const { data } = await axiosClient.put(`/api/rentals/${id}/end`)
  return data
}

export async function getActiveRental(userId: number | string) {
  const { data, status } = await axiosClient.get('/api/rentals/active', { params: { userId } })
  // backend returns 204 when none exists
  if (status === 204) return null
  return data
}

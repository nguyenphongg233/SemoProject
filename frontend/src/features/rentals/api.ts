import { axiosClient } from '@/config/axiosClient'

export async function startRental(request: any) {
  const { data } = await axiosClient.post('/api/rentals/start', request)
  return data
}

export async function endRental(id: number | string) {
  const { data } = await axiosClient.put(`/api/rentals/${id}/end`)
  return data
}

export async function getRentalHistory(status?: string) {
  const { data } = await axiosClient.get('/api/rentals/history', {
    params: status ? { status } : {},
  })
  return data
}

export async function forceEndAllRentals() {
  const { data } = await axiosClient.put('/api/rentals/force-end-all')
  return data
}


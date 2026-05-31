// API helpers for starting and ending rentals.
import { axiosClient } from '../../config/axiosClient'

export async function startRental(request) {
  const { data } = await axiosClient.post('/api/rentals/start', request)
  return data
}

export async function endRental(id) {
  const { data } = await axiosClient.put(`/api/rentals/${id}/end`)
  return data
}

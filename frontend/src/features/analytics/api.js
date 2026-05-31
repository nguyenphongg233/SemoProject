// API helpers for analytics and optimal charging station calculations.
import { axiosClient } from '../../config/axiosClient'

export async function getOptimalStations(k = 3) {
  const { data } = await axiosClient.get('/api/analytics/optimal-stations', {
    params: { k },
  })
  return data
}

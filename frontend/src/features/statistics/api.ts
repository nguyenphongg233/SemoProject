// API helpers for admin dashboard statistics.
import { axiosClient } from '@/config/axiosClient'

export async function getDashboardStats() {
  const { data } = await axiosClient.get('/api/statistics/dashboard')
  return data
}

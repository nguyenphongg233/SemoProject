import { axiosClient } from '@/config/axiosClient'

export async function autoScheduleCharging() {
  const { data } = await axiosClient.post('/api/charging/auto-schedule')
  return data
}

export async function completeCharging(id: number | string) {
  const { data } = await axiosClient.post(`/api/charging/${id}/complete`)
  return data
}

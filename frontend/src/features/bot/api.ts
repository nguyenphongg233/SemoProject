import { axiosClient } from '@/config/axiosClient'

export async function getBotStatus(): Promise<{ enabled: boolean }> {
  const { data } = await axiosClient.get('/api/admin/bot/status')
  return data
}

export async function toggleBotStatus(): Promise<{ enabled: boolean }> {
  const { data } = await axiosClient.post('/api/admin/bot/toggle')
  return data
}

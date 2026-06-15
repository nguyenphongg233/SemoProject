import { axiosClient } from '@/config/axiosClient'

export interface SystemConfig {
  key: string
  value: string
  description: string
  createdAt?: string
  updatedAt?: string
}

export async function getAllConfigs() {
  const { data } = await axiosClient.get('/api/admin/configs')
  return data as SystemConfig[]
}

export async function getConfigByKey(key: string) {
  const { data } = await axiosClient.get(`/api/admin/configs/${key}`)
  return data as SystemConfig
}

export async function createConfig(config: { key: string; value: string; description?: string }) {
  const { data } = await axiosClient.post('/api/admin/configs', config)
  return data as SystemConfig
}

export async function updateConfig(key: string, config: { value: string; description?: string }) {
  const { data } = await axiosClient.put(`/api/admin/configs/${key}`, config)
  return data as SystemConfig
}

export async function deleteConfig(key: string) {
  await axiosClient.delete(`/api/admin/configs/${key}`)
}

import { axiosClient } from '@/config/axiosClient'
import type { Station, Scooter } from '@/types/models'

export const getStations = async (activeOnly: boolean = false): Promise<Station[]> => {
  const { data } = await axiosClient.get('/api/stations', {
    params: { activeOnly }
  })
  return data
}

export const getStationById = async (id: number): Promise<Station> => {
  const { data } = await axiosClient.get(`/api/stations/${id}`)
  return data
}

export const getScootersByStation = async (id: number): Promise<Scooter[]> => {
  const { data } = await axiosClient.get(`/api/stations/${id}/scooters`)
  return data
}

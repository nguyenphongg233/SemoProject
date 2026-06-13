import { axiosClient } from '@/config/axiosClient'
import type { RoutingResponse } from '@/types/models'

export async function getRouteToScooter(
  scooterId: number | string,
  userLat: number,
  userLng: number
): Promise<RoutingResponse> {
  const { data } = await axiosClient.get(`/api/routing/scooter/${scooterId}`, {
    params: {
      userLat,
      userLng,
    },
  })
  return data
}

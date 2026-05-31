// API helpers for auth login and registration requests.
import { axiosClient } from '../../config/axiosClient'

export async function login(request) {
  const { data } = await axiosClient.post('/api/auth/login', request)
  return data
}

export async function register(request) {
  const { data } = await axiosClient.post('/api/auth/register', request)
  return data
}

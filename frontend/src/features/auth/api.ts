// API helpers for auth login and registration requests.
import { axiosClient } from '@/config/axiosClient'

// Bổ sung kiểu 'any' cho tham số request
export async function login(request: any) {
  const { data } = await axiosClient.post('/api/auth/login', request)
  return data
}

export async function register(request: any) {
  const { data } = await axiosClient.post('/api/auth/register', request)
  return data
}

export async function verifyEmail(request: { email: string, otp: string }) {
  const { data } = await axiosClient.post('/api/auth/verify-email', request)
  return data
}

export async function resendOtp(request: { email: string }) {
  const { data } = await axiosClient.post('/api/auth/resend-otp', request)
  return data
}
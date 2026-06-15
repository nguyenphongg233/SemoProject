// API helpers for user management, password actions, and wallet deposit.
import { axiosClient } from '@/config/axiosClient'

export async function createUser(request: any) {
  const { data } = await axiosClient.post('/api/users', request)
  return data
}

export async function getAllUsers() {
  const { data } = await axiosClient.get('/api/users')
  return data
}

export async function getUserById(id: number | string) {
  const { data } = await axiosClient.get(`/api/users/${id}`)
  return data
}

export async function getUserByEmail(email: string) {
  const { data } = await axiosClient.get('/api/users/by-email', {
    params: { email },
  })
  return data
}

export async function getUsersByRole(role: string) {
  const { data } = await axiosClient.get('/api/users/by-role', {
    params: { role },
  })
  return data
}

export async function checkEmailExists(email: string) {
  const { data } = await axiosClient.get('/api/users/check-email', {
    params: { email },
  })
  return data
}

export async function updateUser(id: number | string, request: any) {
  const { data } = await axiosClient.put(`/api/users/${id}`, request)
  return data
}

export async function updateProfile(request: { fullName?: string; email?: string; phoneNumber?: string }) {
  const { data } = await axiosClient.put('/api/users/update-profile', request)
  return data
}

export async function deleteUser(id: number | string) {
  const { data } = await axiosClient.delete(`/api/users/${id}`)
  return data
}

export async function adminResetPassword(id: number | string, request: any = {}) {
  const { data } = await axiosClient.post(`/api/users/${id}/reset-password`, request)
  return data
}

export async function changePassword(request: any) {
  const { data } = await axiosClient.put('/api/users/change-password', request)
  return data
}

export async function depositToWallet(request: any) {
  const { data } = await axiosClient.post('/api/users/wallet/deposit', request)
  return data
}

export async function toggleUserStatus(id: number | string) {
  const { data } = await axiosClient.put(`/api/users/${id}/toggle-status`)
  return data
}

export async function getUserTransactions(id: number | string) {
  const { data } = await axiosClient.get(`/api/users/${id}/transactions`)
  return data
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await axiosClient.post('/api/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
export async function exportUsersExcel() {
  const response = await axiosClient.get('/api/users/export', {
    responseType: 'blob'
  });
  return response.data;
}

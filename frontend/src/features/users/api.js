// API helpers for user management, password actions, and wallet deposit.
import { axiosClient } from '../../config/axiosClient'

export async function createUser(request) {
  const { data } = await axiosClient.post('/api/users', request)
  return data
}

export async function getAllUsers() {
  const { data } = await axiosClient.get('/api/users')
  return data
}

export async function getUserById(id) {
  const { data } = await axiosClient.get(`/api/users/${id}`)
  return data
}

export async function getUserByEmail(email) {
  const { data } = await axiosClient.get('/api/users/by-email', {
    params: { email },
  })
  return data
}

export async function getUsersByRole(role) {
  const { data } = await axiosClient.get('/api/users/by-role', {
    params: { role },
  })
  return data
}

export async function checkEmailExists(email) {
  const { data } = await axiosClient.get('/api/users/check-email', {
    params: { email },
  })
  return data
}

export async function updateUser(id, request) {
  const { data } = await axiosClient.put(`/api/users/${id}`, request)
  return data
}

export async function deleteUser(id) {
  const { data } = await axiosClient.delete(`/api/users/${id}`)
  return data
}

export async function adminResetPassword(id, request = {}) {
  const { data } = await axiosClient.post(`/api/users/${id}/reset-password`, request)
  return data
}

export async function changePassword(id, request) {
  const { data } = await axiosClient.put(`/api/users/${id}/change-password`, request)
  return data
}

export async function depositToWallet(request) {
  const { data } = await axiosClient.post('/api/users/wallet/deposit', request)
  return data
}

import { axiosClient } from '@/config/axiosClient'

export async function getAllTransactions() {
  const { data } = await axiosClient.get('/api/transactions/all')
  return data
}

export async function getTransactionsForUser(userId: string | number) {
  const { data } = await axiosClient.get(`/api/transactions/user/${userId}`)
  return data
}

export async function getMyTransactionHistory() {
  const { data } = await axiosClient.get('/api/transactions/history')
  return data
}

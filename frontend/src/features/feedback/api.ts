// API helpers for feedback submission.
import { axiosClient } from '@/config/axiosClient'

export async function submitFeedback(request: any) {
  const { data } = await axiosClient.post('/api/feedbacks', request)
  return data
}

export async function getAllFeedbacks() {
  const { data } = await axiosClient.get('/api/feedbacks')
  return data
}

export async function getMyFeedbacks() {
  const { data } = await axiosClient.get('/api/feedbacks/my')
  return data
}

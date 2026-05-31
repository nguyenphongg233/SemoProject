// API helpers for avatar and scooter image uploads.
import { axiosClient } from '../../config/axiosClient'

function createMultipartPayload(file) {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

export async function uploadAvatar(file) {
  const { data } = await axiosClient.post('/api/upload/avatar', createMultipartPayload(file), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function uploadScooterImage(scooterId, file) {
  const { data } = await axiosClient.post(
    `/api/upload/scooter/${scooterId}`,
    createMultipartPayload(file),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return data
}

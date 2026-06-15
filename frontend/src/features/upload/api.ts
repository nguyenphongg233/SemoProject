import { axiosClient } from '@/config/axiosClient'

function createMultipartPayload(file: File): FormData {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

export async function uploadAvatar(file: File) {
  const { data } = await axiosClient.post('/api/upload/avatar', createMultipartPayload(file), {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function uploadScooterImage(scooterId: number | string, file: File) {
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
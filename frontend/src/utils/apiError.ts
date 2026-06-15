export function getApiErrorMessage(error: any, fallback: string = 'An unexpected error occurred'): string {
  const responseData = error?.response?.data

  if (!responseData) {
    return error?.message || fallback
  }

  if (typeof responseData === 'string') {
    return responseData
  }

  if (typeof responseData === 'object') {
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message
    }

    // Ép kiểu 'value' thành string trong hàm filter để loại bỏ hoàn toàn cảnh báo implicit any bên trong callback
    const fieldMessages = Object.values(responseData).filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    )
    if (fieldMessages.length > 0) {
      return fieldMessages.join('; ')
    }
  }

  return error?.message || fallback
}
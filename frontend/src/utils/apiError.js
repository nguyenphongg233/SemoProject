// Normalizes backend validation and runtime errors into a displayable string.
export function getApiErrorMessage(error, fallback = 'An unexpected error occurred') {
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

    const fieldMessages = Object.values(responseData).filter((value) => typeof value === 'string' && value.trim())
    if (fieldMessages.length > 0) {
      return fieldMessages.join('; ')
    }
  }

  return error?.message || fallback
}
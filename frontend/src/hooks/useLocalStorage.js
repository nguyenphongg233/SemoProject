// Reusable localStorage hook for client-side persisted state.
import { useCallback, useState } from 'react'

function readStoredValue(key, initialValue) {
  if (typeof window === 'undefined') {
    return initialValue
  }

  const storedValue = window.localStorage.getItem(key)

  if (storedValue === null) {
    return initialValue
  }

  try {
    return JSON.parse(storedValue)
  } catch {
    window.localStorage.removeItem(key)
    return initialValue
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue))

  const updateValue = useCallback(
    (nextValue) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === 'function' ? nextValue(currentValue) : nextValue

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue))
        }

        return resolvedValue
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }

    setValue(initialValue)
  }, [initialValue, key])

  return [value, updateValue, removeValue]
}

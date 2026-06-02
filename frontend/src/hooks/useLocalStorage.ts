// Reusable localStorage hook for client-side persisted state.
import { useCallback, useState } from 'react'

function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue
  }

  const storedValue = window.localStorage.getItem(key)

  if (storedValue === null) {
    return initialValue
  }

  try {
    return JSON.parse(storedValue) as T
  } catch {
    window.localStorage.removeItem(key)
    return initialValue
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Định nghĩa state tuân thủ theo kiểu T
  const [value, setValue] = useState<T>(() => readStoredValue(key, initialValue))

  const updateValue = useCallback(
    (nextValue: T | ((val: T) => T)) => {
      setValue((currentValue: T) => {
        // Kiểm tra xem nextValue là một giá trị thuần túy hay là một callback function
        const resolvedValue =
          typeof nextValue === 'function'
            ? (nextValue as (val: T) => T)(currentValue)
            : nextValue

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

  // Sử dụng 'as const' để TS hiểu đây là một Tuple (mảng có số lượng phần tử cố định và đúng thứ tự kiểu dữ liệu)
  return [value, updateValue, removeValue] as const
}
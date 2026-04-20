import { useEffect, useState } from 'react'
import { safeJsonParse } from '../utils/auth'

export default function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }

        const item = window.localStorage.getItem(key)
        return item ? safeJsonParse(item, initialValue) : initialValue
    })

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.setItem(key, JSON.stringify(storedValue))
    }, [key, storedValue])

    return [storedValue, setStoredValue]
}

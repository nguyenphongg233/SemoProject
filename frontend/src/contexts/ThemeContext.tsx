import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'semo' | 'hust'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('semo_theme') as Theme
    if (savedTheme === 'semo' || savedTheme === 'hust') return savedTheme
    return 'semo'
  })

  useEffect(() => {
    localStorage.setItem('semo_theme', theme)
    if (theme === 'hust') {
      document.documentElement.classList.add('hust')
      document.documentElement.classList.remove('semo', 'light', 'dark')
    } else {
      document.documentElement.classList.add('semo')
      document.documentElement.classList.remove('hust', 'light', 'dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'semo' ? 'hust' : 'semo')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

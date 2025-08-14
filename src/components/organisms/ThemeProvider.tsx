import { useEffect } from 'react'

interface ThemeProviderProps {
  theme?: 'light' | 'dark' | 'system'
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme }) => {
  useEffect(() => {
    if (!theme) return
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return null
}
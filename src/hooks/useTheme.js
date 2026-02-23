import { useState, useEffect } from 'react'

const STORAGE_KEY = 'expense-tracker-theme'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'system'
    return window.localStorage.getItem(STORAGE_KEY) || 'system'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const apply = (isDark) => {
      if (isDark) root.classList.add('dark')
      else root.classList.remove('dark')
    }
    const resolve = (value) => {
      if (value === 'dark') return true
      if (value === 'light') return false
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    apply(resolve(theme))
    if (theme !== 'system') window.localStorage.setItem(STORAGE_KEY, theme)
    else window.localStorage.removeItem(STORAGE_KEY)
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => apply(mq.matches)
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    }
  }, [theme])

  // Apply theme to DOM immediately when setTheme is called (before React re-render)
  const setTheme = (value) => {
    if (typeof window === 'undefined') return
    setThemeState(value)
    const root = document.documentElement
    const isDark = value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
    if (value !== 'system') window.localStorage.setItem(STORAGE_KEY, value)
    else window.localStorage.removeItem(STORAGE_KEY)
  }

  return [theme, setTheme]
}

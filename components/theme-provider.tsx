'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  themes: Theme[]
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'theme'

const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const formatTheme = (theme: Theme) => (theme === 'system' ? getSystemTheme() : theme)

const applyTheme = (theme: Theme) => {
  const next = formatTheme(theme)
  const root = document.documentElement
  root.classList.toggle('dark', next === 'dark')
  root.dataset.theme = theme
  return next
}

const readStoredTheme = (): Theme | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value
    }
  } catch {
    // ignore
  }
  return null
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const storedTheme = readStoredTheme() ?? 'dark'
    setTheme(storedTheme)
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) {
      return
    }

    const next = applyTheme(theme)
    setResolvedTheme(next)

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)') as MediaQueryList & {
      addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void
      removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void
    }
    const handleMediaChange = () => {
      if (theme === 'system') {
        const nextResolved = applyTheme('system')
        setResolvedTheme(nextResolved)
      }
    }

    if (media.addEventListener) {
      media.addEventListener('change', handleMediaChange)
    } else {
      media.addListener?.(handleMediaChange)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleMediaChange)
      } else {
        media.removeListener?.(handleMediaChange)
      }
    }
  }, [theme, mounted])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      themes: ['light', 'dark', 'system'] as Theme[],
    }),
    [theme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

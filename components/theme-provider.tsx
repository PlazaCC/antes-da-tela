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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>('system')
  const [resolvedTheme] = React.useState<'light' | 'dark'>('dark')

  //TEMA ESCURO FORÇADO PARA SEMPREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

  // React.useLayoutEffect(() => {
  //   const storedTheme = readStoredTheme() ?? 'system'
  //   setTheme(storedTheme)
  //   const nextResolved = applyTheme(storedTheme)
  //   setResolvedTheme(nextResolved)
  //   setMounted(true)
  // }, [])

  // React.useEffect(() => {
  //   if (!mounted) {
  //     return
  //   }

  //   const next = applyTheme(theme)
  //   setResolvedTheme(next)

  //   try {
  //     window.localStorage.setItem(STORAGE_KEY, theme)
  //   } catch {
  //     // ignore
  //   }

  //   const media = window.matchMedia('(prefers-color-scheme: dark)') as MediaQueryList & {
  //     addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void
  //     removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void
  //   }
  //   const handleMediaChange = () => {
  //     if (theme === 'system') {
  //       const nextResolved = applyTheme('system')
  //       setResolvedTheme(nextResolved)
  //     }
  //   }

  //   if (media.addEventListener) {
  //     media.addEventListener('change', handleMediaChange)
  //   } else {
  //     media.addListener?.(handleMediaChange)
  //   }

  //   return () => {
  //     if (media.removeEventListener) {
  //       media.removeEventListener('change', handleMediaChange)
  //     } else {
  //       media.removeListener?.(handleMediaChange)
  //     }
  //   }
  // }, [theme, mounted])

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

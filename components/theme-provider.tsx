'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

import { STORAGE_KEY, type ColorThemeId } from '@/lib/themes'

type ColorThemeContextValue = {
  colorTheme: ColorThemeId
  setColorTheme: (theme: ColorThemeId) => void
}

const ColorThemeContext = React.createContext<ColorThemeContextValue>({
  colorTheme: 'default',
  setColorTheme: () => {},
})

export function useColorTheme() {
  return React.useContext(ColorThemeContext)
}

function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] =
    React.useState<ColorThemeId>('default')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorThemeId | null
    if (stored) {
      setColorThemeState(stored)
      document.documentElement.setAttribute('data-theme', stored)
    }
    setMounted(true)
  }, [])

  const setColorTheme = React.useCallback((theme: ColorThemeId) => {
    setColorThemeState(theme)
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem(STORAGE_KEY)
    } else {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [])

  // Prevent flash: apply stored theme before React hydrates
  // After mount, state is synced from localStorage
  const value = React.useMemo(
    () => ({
      colorTheme: mounted ? colorTheme : ('default' as ColorThemeId),
      setColorTheme,
    }),
    [colorTheme, setColorTheme, mounted]
  )

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ColorThemeProvider>{children}</ColorThemeProvider>
    </NextThemesProvider>
  )
}

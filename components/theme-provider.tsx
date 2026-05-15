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

const COLOR_THEME_EVENT = 'color-theme-change'

function subscribeToColorTheme(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(COLOR_THEME_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(COLOR_THEME_EVENT, callback)
  }
}

function getColorThemeSnapshot(): ColorThemeId {
  return (localStorage.getItem(STORAGE_KEY) as ColorThemeId | null) ?? 'default'
}

function getColorThemeServerSnapshot(): ColorThemeId {
  return 'default'
}

function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const colorTheme = React.useSyncExternalStore(
    subscribeToColorTheme,
    getColorThemeSnapshot,
    getColorThemeServerSnapshot
  )

  React.useEffect(() => {
    if (colorTheme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', colorTheme)
    }
  }, [colorTheme])

  const setColorTheme = React.useCallback((theme: ColorThemeId) => {
    if (theme === 'default') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, theme)
    }
    // 'storage' only fires for cross-tab changes; notify same-window subscribers.
    window.dispatchEvent(new Event(COLOR_THEME_EVENT))
  }, [])

  const value = React.useMemo(
    () => ({ colorTheme, setColorTheme }),
    [colorTheme, setColorTheme]
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

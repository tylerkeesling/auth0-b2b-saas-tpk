'use client'

import {
  CheckIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { COLOR_THEMES } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useColorTheme } from '@/components/theme-provider'

export function ModeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const { colorTheme, setColorTheme } = useColorTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <PaletteIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
        {COLOR_THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setColorTheme(t.id)}
            className="gap-2"
          >
            <span
              className="h-4 w-4 shrink-0 rounded-full border"
              style={{
                backgroundColor:
                  resolvedTheme === 'dark' ? t.primaryDark : t.primaryLight,
              }}
            />
            <span className="flex-1">{t.name}</span>
            {colorTheme === t.id && (
              <CheckIcon className="text-muted-foreground h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
          <SunIcon className="h-4 w-4" />
          <span className="flex-1">Light</span>
          {theme === 'light' && (
            <CheckIcon className="text-muted-foreground h-4 w-4" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
          <MoonIcon className="h-4 w-4" />
          <span className="flex-1">Dark</span>
          {theme === 'dark' && (
            <CheckIcon className="text-muted-foreground h-4 w-4" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
          <MonitorIcon className="h-4 w-4" />
          <span className="flex-1">System</span>
          {theme === 'system' && (
            <CheckIcon className="text-muted-foreground h-4 w-4" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

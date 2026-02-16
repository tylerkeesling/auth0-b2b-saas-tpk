export const COLOR_THEMES = [
  {
    id: 'default',
    name: 'Default',
    // Light primary color for the swatch preview
    primaryLight: 'oklch(0.5854 0.2041 277.1173)',
    primaryDark: 'oklch(0.6801 0.1583 276.9349)',
  },
  {
    id: 'violet-bloom',
    name: 'Violet Bloom',
    primaryLight: 'oklch(0.5393 0.2713 286.7462)',
    primaryDark: 'oklch(0.6132 0.2294 291.7437)',
  },
  {
    id: 'candyland',
    name: 'Candyland',
    primaryLight: 'oklch(0.8677 0.0735 7.0855)',
    primaryDark: 'oklch(0.8027 0.1355 349.2347)',
  },
  {
    id: 'pastel-dreams',
    name: 'Pastel Dreams',
    primaryLight: 'oklch(0.7090 0.1592 293.5412)',
    primaryDark: 'oklch(0.7874 0.1179 295.7538)',
  },
] as const

export type ColorThemeId = (typeof COLOR_THEMES)[number]['id']

export const STORAGE_KEY = 'color-theme'

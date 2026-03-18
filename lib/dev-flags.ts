import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach((l) => l())
}

export function getDevFlag(key: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`dev:${key}`) === '1'
}

export function setDevFlag(key: string, value: boolean) {
  if (value) {
    localStorage.setItem(`dev:${key}`, '1')
  } else {
    localStorage.removeItem(`dev:${key}`)
  }
  notify()
}

export function useDevFlag(key: string): [boolean, (v: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => getDevFlag(key),
    () => false
  )
  return [value, (v: boolean) => setDevFlag(key, v)]
}

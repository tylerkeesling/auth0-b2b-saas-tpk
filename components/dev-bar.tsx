'use client'

import { useState, useSyncExternalStore } from 'react'
import { ChevronDown, ChevronUp, Code } from 'lucide-react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'

const subscribe = () => () => {}
const getPortalTarget = () => document.getElementById('dev-bar-portal')
const getServerSnapshot = () => null

interface DevBarProps {
  children: React.ReactNode
}

export function DevBar({ children }: DevBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const portalTarget = useSyncExternalStore(
    subscribe,
    getPortalTarget,
    getServerSnapshot
  )

  const content = (
    <div className="sticky bottom-0 z-50">
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card/95 -mb-px rounded-b-none border-b-0 backdrop-blur-sm"
        >
          <Code className="mr-1.5 h-3.5 w-3.5" />
          Dev
          {isOpen ? (
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      {isOpen && (
        <div className="bg-card/95 border-t backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
            {children}
          </div>
        </div>
      )}
    </div>
  )

  if (!portalTarget) return null

  return createPortal(content, portalTarget)
}

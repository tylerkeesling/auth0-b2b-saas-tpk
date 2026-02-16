'use client'

import { DevBar } from '@/components/dev-bar'

import { MfaFactorsSection, type MfaFactor } from './mfa-factors-section'

interface MfaPageProps {
  factors: MfaFactor[]
  preferredMethod: string | null
}

export function MfaPage({ factors, preferredMethod }: MfaPageProps) {
  return (
    <div className="space-y-8">
      <MfaFactorsSection factors={factors} preferredMethod={preferredMethod} />

      <DevBar>
        <span className="text-muted-foreground text-sm">
          No controls configured
        </span>
      </DevBar>
    </div>
  )
}

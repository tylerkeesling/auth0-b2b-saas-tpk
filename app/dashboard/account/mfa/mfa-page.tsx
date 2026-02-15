'use client'

import { MfaFactorsSection, type MfaFactor } from './mfa-factors-section'

interface MfaPageProps {
  factors: MfaFactor[]
  preferredMethod: string | null
}

export function MfaPage({ factors, preferredMethod }: MfaPageProps) {
  return (
    <div className="space-y-8">
      <MfaFactorsSection factors={factors} preferredMethod={preferredMethod} />
    </div>
  )
}

'use client'

import { useDevFlag } from '@/lib/dev-flags'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DevBar } from '@/components/dev-bar'

import { MfaFactorsSection, type MfaFactor } from './mfa-factors-section'

interface MfaPageProps {
  factors: MfaFactor[]
  preferredMethod: string | null
}

export function MfaPage({ factors, preferredMethod }: MfaPageProps) {
  const [showMfaV2, setShowMfaV2] = useDevFlag('show-mfa-v2')

  return (
    <div className="space-y-8">
      <MfaFactorsSection factors={factors} preferredMethod={preferredMethod} />

      <DevBar>
        <div className="flex items-center gap-2">
          <Switch
            id="mfa-v2-toggle"
            checked={showMfaV2}
            onCheckedChange={setShowMfaV2}
          />
          <Label
            htmlFor="mfa-v2-toggle"
            className="text-muted-foreground text-sm"
          >
            Show MFA v2
          </Label>
        </div>
      </DevBar>
    </div>
  )
}

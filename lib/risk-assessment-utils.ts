import { MapPin, Phone, Shield, Smartphone } from 'lucide-react'

import { AssessmentCategory } from '@/types/risk-assessment'

export const ASSESSMENT_META: Record<
  AssessmentCategory,
  { label: string; description: string; icon: typeof Shield }
> = {
  UntrustedIP: {
    label: 'IP Reputation',
    description: 'Checks if the IP address is on known deny lists',
    icon: Shield,
  },
  NewDevice: {
    label: 'Device Recognition',
    description: 'Determines if the device and user agent are known',
    icon: Smartphone,
  },
  ImpossibleTravel: {
    label: 'Impossible Travel',
    description: 'Detects impossible geographic travel between logins',
    icon: MapPin,
  },
  PhoneNumber: {
    label: 'Phone Verification',
    description: 'Validates the phone number and assesses its risk',
    icon: Phone,
  },
}

export function getConfidenceColor(confidence: string) {
  switch (confidence) {
    case 'high':
      return 'safe' as const
    case 'medium':
      return 'caution' as const
    case 'low':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

export function getCodeStatus(code: string) {
  const safeCodes = [
    'not_found_on_deny_list',
    'match',
    'ok',
    'minimal_travel_from_last_login',
  ]
  const cautionCodes = ['partial_match', 'moderate_travel']
  if (safeCodes.includes(code)) return 'safe' as const
  if (cautionCodes.includes(code)) return 'caution' as const
  return 'danger' as const
}

export function formatCode(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export function formatDetailKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}

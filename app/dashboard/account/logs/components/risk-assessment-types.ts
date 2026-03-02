import { MapPin, Monitor, Phone, Shield, type LucideIcon } from 'lucide-react'

export type StatusType = 'safe' | 'caution' | 'danger' | 'neutral'

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'neutral'

export interface Assessment {
  confidence: ConfidenceLevel
  code: string
  details?: Record<string, unknown>
  version?: string
}

export interface RiskAssessment {
  confidence: ConfidenceLevel
  version: string
  assessments: {
    UntrustedIP?: Assessment
    NewDevice?: Assessment
    ImpossibleTravel?: Assessment
    PhoneNumber?: Assessment
  }
}

export type AssessmentType = keyof RiskAssessment['assessments']

interface AssessorMeta {
  key: AssessmentType
  label: string
  description: string
  icon: LucideIcon
}

export const ASSESSOR_META: Record<AssessmentType, AssessorMeta> = {
  UntrustedIP: {
    key: 'UntrustedIP',
    label: 'IP Reputation',
    description: 'Checks if the IP address is on known deny lists',
    icon: Shield,
  },
  NewDevice: {
    key: 'NewDevice',
    label: 'Device Recognition',
    description: 'Determines if the device and user agent are known',
    icon: Monitor,
  },
  ImpossibleTravel: {
    key: 'ImpossibleTravel',
    label: 'Impossible Travel',
    description: 'Detects impossible geographic travel between logins',
    icon: MapPin,
  },
  PhoneNumber: {
    key: 'PhoneNumber',
    label: 'Phone Verification',
    description: 'Validates the phone number and assesses its risk',
    icon: Phone,
  },
}

export function formatCode(code: string): string {
  return code
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatDetailKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

export function getConfidenceStatus(confidence: ConfidenceLevel): StatusType {
  switch (confidence) {
    case 'high':
      return 'safe'
    case 'medium':
      return 'caution'
    case 'low':
      return 'danger'
    case 'neutral':
      return 'neutral'
  }
}

const SAFE_CODES = new Set([
  'match',
  'ok',
  'not_found_on_deny_list',
  'minimal_travel_from_last_login',
])

const DANGER_CODES = new Set(['found_on_deny_list', 'mismatch', 'too_fast'])

export function getCodeStatus(code: string): StatusType {
  if (SAFE_CODES.has(code)) return 'safe'
  if (DANGER_CODES.has(code)) return 'danger'
  return 'caution'
}

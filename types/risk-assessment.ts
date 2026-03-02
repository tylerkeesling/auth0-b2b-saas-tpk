export interface RiskAssessmentData {
  confidence: 'low' | 'medium' | 'high' | 'neutral'
  version: string
  assessments: {
    UntrustedIP?: AssessmentItem
    NewDevice?: AssessmentItem
    ImpossibleTravel?: AssessmentItem
    PhoneNumber?: AssessmentItem
  }
}

export interface AssessmentItem {
  confidence: 'low' | 'medium' | 'high' | 'neutral'
  code: string
  details?: Record<string, unknown>
}

export type AssessmentCategory =
  | 'UntrustedIP'
  | 'NewDevice'
  | 'ImpossibleTravel'
  | 'PhoneNumber'

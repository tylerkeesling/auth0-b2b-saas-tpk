'use client'

import { ShieldCheck } from 'lucide-react'

import { AssessorCard } from './assessor-card'
import {
  ASSESSOR_META,
  getConfidenceStatus,
  type AssessmentType,
  type RiskAssessment,
} from './risk-assessment-types'
import { StatusBadge } from './status-badge'

const ASSESSOR_KEYS = Object.keys(ASSESSOR_META) as AssessmentType[]

interface RiskAssessmentTabProps {
  riskAssessment: RiskAssessment
}

export function RiskAssessmentTab({ riskAssessment }: RiskAssessmentTabProps) {
  const presentAssessors = ASSESSOR_KEYS.filter(
    (key) => riskAssessment.assessments[key] !== undefined
  )
  const passedCount = presentAssessors.filter(
    (key) => riskAssessment.assessments[key]?.confidence === 'high'
  ).length
  const totalCount = presentAssessors.length

  const overallStatus = getConfidenceStatus(riskAssessment.confidence)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-muted-foreground mt-0.5 size-5" />
          <div>
            <p className="text-sm font-medium">Risk Assessment</p>
            <p className="text-muted-foreground text-xs">
              {passedCount}/{totalCount} checks passed &middot; v
              {riskAssessment.version}
            </p>
          </div>
        </div>
        <StatusBadge
          status={overallStatus}
          label={`${riskAssessment.confidence} confidence`}
        />
      </div>

      <div className="space-y-3">
        {ASSESSOR_KEYS.map((key, index) => (
          <AssessorCard
            key={key}
            type={key}
            assessment={riskAssessment.assessments[key]}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

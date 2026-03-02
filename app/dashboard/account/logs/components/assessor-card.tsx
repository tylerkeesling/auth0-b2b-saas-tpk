'use client'

import {
  ASSESSOR_META,
  formatCode,
  formatDetailKey,
  getCodeStatus,
  getConfidenceStatus,
  type Assessment,
  type AssessmentType,
} from './risk-assessment-types'
import { StatusBadge } from './status-badge'

interface AssessorCardProps {
  type: AssessmentType
  assessment: Assessment | undefined
  index?: number
}

export function AssessorCard({
  type,
  assessment,
  index = 0,
}: AssessorCardProps) {
  const meta = ASSESSOR_META[type]
  if (!meta) return null

  const Icon = meta.icon

  if (!assessment) {
    return (
      <div
        className="animate-fade-in border-border rounded-lg border border-dashed p-4 opacity-60"
        style={{ animationDelay: `${index * 75}ms` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-status-neutral/10 text-status-neutral flex size-9 items-center justify-center rounded-md">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{meta.label}</p>
              <p className="text-muted-foreground text-xs">
                {meta.description}
              </p>
            </div>
          </div>
          <StatusBadge status="neutral" label="Not Available" />
        </div>
      </div>
    )
  }

  const confidenceStatus = getConfidenceStatus(assessment.confidence)
  const codeStatus = getCodeStatus(assessment.code)

  return (
    <div
      className="animate-fade-in border-border hover:border-primary/20 rounded-lg border p-4 transition-colors"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-md bg-status-${codeStatus}/10 text-status-${codeStatus}`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{meta.label}</p>
            <p className="text-muted-foreground text-xs">{meta.description}</p>
          </div>
        </div>
        <StatusBadge status={confidenceStatus} label={assessment.confidence} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Result
        </span>
        <StatusBadge status={codeStatus} label={formatCode(assessment.code)} />
      </div>

      {assessment.details && Object.keys(assessment.details).length > 0 && (
        <div className="mt-3">
          <div className="border-border bg-muted/50 grid gap-1.5 rounded-md border p-3">
            <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wide uppercase">
              Details
            </p>
            {Object.entries(assessment.details).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">
                  {formatDetailKey(key)}
                </span>
                {typeof value === 'boolean' ? (
                  <span
                    className={`font-mono font-medium ${value ? 'text-status-safe' : 'text-status-danger'}`}
                  >
                    {String(value)}
                  </span>
                ) : (
                  <span className="font-mono font-medium">{String(value)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

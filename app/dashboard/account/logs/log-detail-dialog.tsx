'use client'

import dynamic from 'next/dynamic'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { LogEntry } from './actions'
import { RiskAssessmentTab } from './components/risk-assessment-tab'
import { type RiskAssessment } from './components/risk-assessment-types'

const JsonViewer = dynamic(() => import('@/components/json-viewer'), {
  ssr: false,
})

interface LogDetailDialogProps {
  log: LogEntry | null
  onClose: () => void
}

export function LogDetailDialog({ log, onClose }: LogDetailDialogProps) {
  const riskAssessment = log?.details?.riskAssessment as
    | RiskAssessment
    | undefined
  const hasRiskAssessment = !!riskAssessment

  return (
    <Dialog open={log !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          {/* <DialogDescription>Full log entry information</DialogDescription> */}
        </DialogHeader>
        <Tabs
          defaultValue={hasRiskAssessment ? 'risk-assessment' : 'raw-log'}
          key={log?.log_id}
        >
          <TabsList className="bg-surface-2 border-border mb-4 w-full border">
            {hasRiskAssessment && (
              <TabsTrigger
                value="risk-assessment"
                className="data-[state=active]:bg-surface-3 flex-1 gap-1.5"
              >
                Risk Assessment
              </TabsTrigger>
            )}
            <TabsTrigger
              value="raw-log"
              className="data-[state=active]:bg-surface-3 flex-1 gap-1.5"
            >
              Raw Log
            </TabsTrigger>
          </TabsList>
          {hasRiskAssessment && (
            <TabsContent value="risk-assessment">
              <RiskAssessmentTab riskAssessment={riskAssessment} />
            </TabsContent>
          )}
          <TabsContent value="raw-log">
            <JsonViewer data={log} />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (log) {
                navigator.clipboard.writeText(JSON.stringify(log, null, 2))
                toast.success('Log details copied to clipboard')
              }
            }}
          >
            Copy JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

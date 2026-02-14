'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserLogsSkeleton } from '@/components/user-logs-skeleton'

import { getLogs, LogEntry } from './actions'

const JsonViewer = dynamic(() => import('@/components/json-viewer'), {
  ssr: false,
})

interface UserLogsProps {
  userId: string
}

// Common Auth0 log event types
const LOG_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 's', label: 'Success Login' },
  { value: 'f', label: 'Failed Login' },
  { value: 'fp', label: 'Failed Login (Incorrect Password)' },
  { value: 'fu', label: 'Failed Login (Invalid Email/Username)' },
  { value: 'ss', label: 'Success Signup' },
  { value: 'fs', label: 'Failed Signup' },
  { value: 'slo', label: 'Success Logout' },
  { value: 'flo', label: 'Failed Logout' },
  { value: 'seacft', label: 'Success Exchange' },
  { value: 'svr', label: 'Success Verification Email' },
  { value: 'fvr', label: 'Failed Verification Email' },
  { value: 'scpn', label: 'Success Change Password' },
  { value: 'fcpn', label: 'Failed Change Password' },
  { value: 'api', label: 'API Operation' },
  {
    value: 'oidc_backchannel_logout_succeeded',
    label: 'Successful OIDC Back-Channel Logout request',
  },
]

const LOG_TYPE_LABELS = new Map(LOG_TYPES.map((t) => [t.value, t.label]))

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export default function UserLogs({ userId }: UserLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [page, setPage] = useState(0)
  const [perPage] = useState(10)
  const [selectedType, setSelectedType] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const hadDataBefore = useRef(false)

  useEffect(() => {
    if (logs.length > 0) hadDataBefore.current = true
  }, [logs])

  const fetchLogs = async () => {
    const result = await getLogs({
      userId,
      page,
      perPage,
      type: selectedType,
      fromDate: fromDate,
      toDate: toDate,
    })

    if (result.error) {
      toast.error(result.error)
      setLogs([])
      setHasMore(false)
    } else {
      setLogs(result.logs)
      setHasMore(result.hasMore)
    }
    setIsInitialLoad(false)
  }

  useEffect(() => {
    startTransition(async () => {
      await fetchLogs()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleFilterChange = () => {
    setPage(0)
    startTransition(async () => {
      await fetchLogs()
    })
  }

  const handleClearFilters = () => {
    setSelectedType('all')
    setFromDate('')
    setToDate('')
    setPage(0)
    setTimeout(() => {
      startTransition(async () => {
        await fetchLogs()
      })
    }, 0)
  }

  const handleNextPage = () => {
    if (hasMore) {
      setPage((p) => p + 1)
    }
  }

  const handlePreviousPage = () => {
    setPage((p) => Math.max(0, p - 1))
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">Log Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select log type" />
              </SelectTrigger>
              <SelectContent>
                {LOG_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">From Date</label>
            <div className="relative">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full"
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-50" />
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium">To Date</label>
            <div className="relative">
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full"
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-50" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFilterChange} variant="default">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="outline">
              Clear
            </Button>
          </div>
        </div>

        {/* Loading State (only on initial load with no data) */}
        {isInitialLoad && logs.length === 0 && <UserLogsSkeleton />}

        {/* Empty State */}
        {!isInitialLoad && !isPending && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">No logs found</p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* Logs Table */}
        {logs.length > 0 && (
          <>
            <div
              className={`rounded-md border transition-opacity ${isPending && hadDataBefore.current ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[200px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.log_id}
                      onClick={() => setSelectedLog(log)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs">
                        <div className="flex flex-col">
                          <span>
                            {dateFormatter.format(new Date(log.date))}
                          </span>
                          <span className="text-muted-foreground">
                            {timeFormatter.format(new Date(log.date))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {LOG_TYPE_LABELS.get(log.type) ?? 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{log.description}</span>
                          {log.ip && (
                            <span className="text-muted-foreground text-xs">
                              IP: {log.ip}
                              {log.location_info?.city_name &&
                                ` • ${log.location_info.city_name}, ${log.location_info.country_name}`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Log Details Dialog */}
            <Dialog
              open={selectedLog !== null}
              onOpenChange={(open) => !open && setSelectedLog(null)}
            >
              <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log Details</DialogTitle>
                  <DialogDescription>
                    Full log entry information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <JsonViewer data={selectedLog} />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedLog) {
                        navigator.clipboard.writeText(
                          JSON.stringify(selectedLog, null, 2)
                        )
                        toast.success('Log details copied to clipboard')
                      }
                    }}
                  >
                    Copy JSON
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page + 1} - Showing {logs.length} log
                {logs.length !== 1 ? 's' : ''}
                {hasMore && ' (more available)'}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handlePreviousPage}
                  disabled={page === 0 || isPending}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={!hasMore || isPending}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

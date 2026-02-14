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

// Full Auth0 log event type labels
const LOG_TYPE_LABELS = new Map<string, string>([
  ['acls_summary', 'ACLs Summary'],
  ['actions_execution_failed', 'Action Execution Failed'],
  ['api_limit', 'API Rate Limit Reached'],
  ['api_limit_warning', 'API Rate Limit Warning'],
  ['appi', 'Elevated API Limits Activation'],
  ['ciba_exchange_failed', 'Failed CIBA Exchange'],
  ['ciba_exchange_succeeded', 'Successful CIBA Exchange'],
  ['ciba_start_failed', 'Failed CIBA Start'],
  ['ciba_start_succeeded', 'Successful CIBA Start'],
  ['cls', 'Passwordless Code/Link Sent'],
  ['cs', 'Passwordless Code Sent'],
  ['depnote', 'Deprecation Notice'],
  ['f', 'Failed Login'],
  ['fc', 'Failed by Connector'],
  ['fce', 'Failed Change Email'],
  ['fco', 'Failed Cross-Origin (Origin Not Allowed)'],
  ['fcoa', 'Failed Cross-Origin Authentication'],
  ['fcp', 'Failed Change Password'],
  ['fcph', 'Failed Post Change Password Hook'],
  ['fcpn', 'Failed Change Phone Number'],
  ['fcpr', 'Failed Change Password Request'],
  ['fcpro', 'Failed AD/LDAP Connector Provisioning'],
  ['fcu', 'Failed Change Username'],
  ['fd', 'Failed Delegation'],
  ['fdeac', 'Failed Device Activation'],
  ['fdeaz', 'Failed Device Authorization'],
  ['fdecc', 'Failed Device Confirmation'],
  ['fdu', 'Failed User Deletion'],
  ['feacft', 'Failed Auth Code Exchange'],
  ['feccft', 'Failed Client Credentials Exchange'],
  ['fecte', 'Failed Custom Token Exchange'],
  ['fede', 'Failed Device Code Exchange'],
  ['federated_logout_failed', 'Failed Federated Logout'],
  ['fens', 'Failed Native Social Login'],
  ['feoobft', 'Failed OOB Challenge Exchange'],
  ['feotpft', 'Failed OTP Challenge Exchange'],
  ['fepft', 'Failed Password Exchange'],
  ['fepotpft', 'Failed Passwordless OTP Exchange'],
  ['fercft', 'Failed MFA Recovery Code Exchange'],
  ['ferrt', 'Failed Rotating Refresh Token Exchange'],
  ['fertft', 'Failed Refresh Token Exchange'],
  ['fi', 'Failed User Invitation'],
  ['flo', 'Failed Logout'],
  ['flows_execution_completed', 'Flows Execution Completed'],
  ['flows_execution_failed', 'Flows Execution Failed'],
  ['fn', 'Failed Notification'],
  ['forms_submission_failed', 'Forms Submission Failed'],
  ['forms_submission_succeeded', 'Forms Submission Succeeded'],
  ['fp', 'Failed Login (Incorrect Password)'],
  ['fpar', 'Failed Pushed Authorization Request'],
  ['fpurh', 'Failed Post User Registration Hook'],
  ['fs', 'Failed Signup'],
  ['fsa', 'Failed Silent Auth'],
  ['fu', 'Failed Login (Invalid Email/Username)'],
  ['fui', 'Failed User Import'],
  ['fv', 'Failed Verification Email Send'],
  ['fvr', 'Failed Verification Email Request'],
  ['gd_auth_email_verification', 'MFA Email Verification Completed'],
  ['gd_auth_fail_email_verification', 'MFA Email Verification Failed'],
  ['gd_auth_failed', 'MFA Auth Failed'],
  ['gd_auth_rejected', 'MFA Auth Rejected'],
  ['gd_auth_succeed', 'MFA Auth Success'],
  ['gd_enrollment_complete', 'MFA Enrollment Complete'],
  ['gd_otp_rate_limit_exceed', 'MFA OTP Rate Limit Exceeded'],
  ['gd_recovery_failed', 'MFA Recovery Failed'],
  ['gd_recovery_rate_limit_exceed', 'MFA Recovery Rate Limit Exceeded'],
  ['gd_recovery_succeed', 'MFA Recovery Success'],
  ['gd_send_email', 'MFA Email Sent'],
  ['gd_send_email_verification', 'MFA Verification Email Sent'],
  ['gd_send_email_verification_failure', 'MFA Verification Email Failed'],
  ['gd_send_pn', 'MFA Push Notification Sent'],
  ['gd_send_pn_failure', 'MFA Push Notification Failed'],
  ['gd_send_sms', 'MFA SMS Sent'],
  ['gd_send_sms_failure', 'MFA SMS Failed'],
  ['gd_send_voice', 'MFA Voice Call Made'],
  ['gd_send_voice_failure', 'MFA Voice Call Failed'],
  ['gd_start_auth', 'MFA Auth Started'],
  ['gd_start_enroll', 'MFA Enrollment Started'],
  ['gd_start_enroll_failed', 'MFA Enrollment Start Failed'],
  ['gd_tenant_update', 'Guardian Tenant Update'],
  ['gd_unenroll', 'MFA Device Unenrolled'],
  ['gd_update_device_account', 'MFA Device Updated'],
  ['gd_webauthn_challenge_failed', 'WebAuthn Challenge Failed'],
  ['gd_webauthn_enrollment_failed', 'WebAuthn Enrollment Failed'],
  ['kms_key_management_failure', 'KMS Operation Failed'],
  ['kms_key_management_success', 'KMS Operation Success'],
  ['kms_key_state_changed', 'KMS Key State Changed'],
  ['limit_delegation', 'Rate Limit on Delegation'],
  ['limit_mu', 'IP Blocked (Too Many Failures)'],
  ['limit_sul', 'User Login Rate Limited'],
  ['limit_wc', 'IP Blocked (Single Account)'],
  ['mfar', 'MFA Required'],
  ['mgmt_api_read', 'Management API Read'],
  ['my_account_authentication_method_failed', 'My Account Auth Method Failed'],
  [
    'my_account_authentication_method_succeeded',
    'My Account Auth Method Success',
  ],
  ['oidc_backchannel_logout_failed', 'Failed OIDC Back-Channel Logout'],
  ['oidc_backchannel_logout_succeeded', 'Successful OIDC Back-Channel Logout'],
  ['organization_member_added', 'Organization Member Added'],
  ['passkey_challenge_failed', 'Passkey Challenge Failed'],
  ['passkey_challenge_started', 'Passkey Challenge Started'],
  ['pla', 'Pre-Login Assessment'],
  ['pwd_leak', 'Leaked Password Login Attempt'],
  ['reset_pwd_leak', 'Leaked Password Reset Attempt'],
  ['resource_cleanup', 'Resource Cleanup'],
  ['rich_consents_access_error', 'Rich Consent Access Error'],
  ['s', 'Successful Login'],
  ['sapi', 'Successful Management API Write'],
  ['sce', 'Success Change Email'],
  ['scoa', 'Success Cross-Origin Authentication'],
  ['scp', 'Success Change Password'],
  ['scpn', 'Success Change Phone Number'],
  ['scpr', 'Success Change Password Request'],
  ['scu', 'Success Change Username'],
  ['scv', 'Success Credential Validation'],
  ['sd', 'Success Delegation'],
  ['sdu', 'Success User Deletion'],
  ['seacft', 'Successful Auth Code Exchange'],
  ['seccft', 'Successful Client Credentials Exchange'],
  ['secte', 'Successful Custom Token Exchange'],
  ['sede', 'Successful Device Code Exchange'],
  ['sens', 'Successful Native Social Login'],
  ['seoobft', 'Successful OOB Challenge Exchange'],
  ['seotpft', 'Successful OTP Challenge Exchange'],
  ['sepft', 'Successful Password Exchange'],
  ['sepkoobft', 'Successful Passkey OOB Exchange'],
  ['sepkotpft', 'Successful Passkey OTP Exchange'],
  ['sepkrcft', 'Successful Passkey Recovery Code Exchange'],
  ['sercft', 'Successful MFA Recovery Code Exchange'],
  ['sertft', 'Successful Refresh Token Exchange'],
  ['si', 'Success User Invitation'],
  ['signup_pwd_leak', 'Leaked Password Signup Attempt'],
  ['slo', 'Successful Logout'],
  ['ss', 'Successful Signup'],
  ['ss_sso_failure', 'Self-Service SSO Failed'],
  ['ss_sso_info', 'Self-Service SSO Info'],
  ['ss_sso_success', 'Self-Service SSO Success'],
  ['ssa', 'Successful Silent Auth'],
  ['sscim', 'SCIM Operation Success'],
  ['sui', 'Success User Import'],
  ['sv', 'Verification Email Consumed'],
  ['svr', 'Success Verification Email Request'],
  ['too_many_records', 'Max Authenticators Reached'],
  ['ublkdu', 'User Block Released'],
  ['universal_logout_failed', 'Failed Universal Logout'],
  ['universal_logout_succeeded', 'Successful Universal Logout'],
  ['w', 'Warning During Login'],
  ['wn', 'Warning During Notification'],
  ['wum', 'Warning During User Management'],
])

// Common types shown in the filter dropdown
const LOG_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 's', label: 'Successful Login' },
  { value: 'f', label: 'Failed Login' },
  { value: 'fp', label: 'Failed Login (Incorrect Password)' },
  { value: 'fu', label: 'Failed Login (Invalid Email/Username)' },
  { value: 'ss', label: 'Successful Signup' },
  { value: 'fs', label: 'Failed Signup' },
  { value: 'slo', label: 'Successful Logout' },
  { value: 'flo', label: 'Failed Logout' },
  { value: 'seacft', label: 'Successful Auth Code Exchange' },
  { value: 'svr', label: 'Success Verification Email Request' },
  { value: 'fvr', label: 'Failed Verification Email Request' },
  { value: 'scpn', label: 'Success Change Phone Number' },
  { value: 'fcpn', label: 'Failed Change Phone Number' },
  {
    value: 'oidc_backchannel_logout_succeeded',
    label: 'Successful OIDC Back-Channel Logout',
  },
]

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
  const [showPendingOverlay, setShowPendingOverlay] = useState(false)

  const fetchLogs = async (showOverlay: boolean) => {
    if (showOverlay) setShowPendingOverlay(true)

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
    setShowPendingOverlay(false)
  }

  const isFirstRender = useRef(true)

  useEffect(() => {
    const showOverlay = !isFirstRender.current
    isFirstRender.current = false
    startTransition(async () => {
      await fetchLogs(showOverlay)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleFilterChange = () => {
    setPage(0)
    startTransition(async () => {
      await fetchLogs(true)
    })
  }

  const handleClearFilters = () => {
    setSelectedType('all')
    setFromDate('')
    setToDate('')
    setPage(0)
    setTimeout(() => {
      startTransition(async () => {
        await fetchLogs(true)
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
              className={`rounded-md border transition-opacity ${showPendingOverlay ? 'pointer-events-none opacity-50' : ''}`}
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

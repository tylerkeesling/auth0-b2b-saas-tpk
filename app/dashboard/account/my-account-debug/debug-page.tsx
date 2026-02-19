'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

import { myAccount, MyAccountApiError, type RequestLog } from '@/lib/my-account'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { JsonViewerSkeleton } from '@/components/json-viewer-skeleton'

const JsonViewer = dynamic(() => import('@/components/json-viewer'), {
  ssr: false,
  loading: () => <JsonViewerSkeleton />,
})

// --- Method badge colors ---

function MethodBadge({ method }: { method: string }) {
  const variant = method === 'DELETE' ? 'destructive' : 'secondary'

  return <Badge variant={variant}>{method}</Badge>
}

// --- Endpoint Card ---

function LogDetails({ log }: { log: RequestLog }) {
  return (
    <div className="bg-muted/50 space-y-1 rounded-md px-3 py-2 font-mono text-xs">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          <span className="text-muted-foreground">status </span>
          <span
            className={log.status >= 400 ? 'text-red-500' : 'text-green-500'}
          >
            {log.status}
          </span>
        </span>
        <span>
          <span className="text-muted-foreground">duration </span>
          {log.durationMs}ms
        </span>
        <span>
          <span className="text-muted-foreground">scope </span>
          {log.scope}
        </span>
        <span>
          <span className="text-muted-foreground">time </span>
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
      </div>
      {log.requestBody !== undefined && (
        <details>
          <summary className="text-muted-foreground cursor-pointer">
            request body
          </summary>
          <pre className="mt-1 whitespace-pre-wrap">
            {JSON.stringify(log.requestBody, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

interface EndpointCardProps {
  title: string
  method: string
  path: string
  execute: () => Promise<{ data: unknown; log: RequestLog }>
  children?: React.ReactNode
  destructive?: boolean
}

function EndpointCard({
  title,
  method,
  path,
  execute,
  children,
  destructive,
}: EndpointCardProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [log, setLog] = useState<RequestLog | null>(null)
  const [error, setError] = useState<{
    statusCode: number
    body: unknown
  } | null>(null)

  async function handleExecute() {
    setLoading(true)
    setResult(null)
    setLog(null)
    setError(null)
    try {
      const { data, log } = await execute()
      setResult(data ?? { status: '204 No Content' })
      setLog(log)
    } catch (err) {
      if (err instanceof MyAccountApiError) {
        setError({ statusCode: err.statusCode, body: err.body })
        setLog(err.log)
      } else {
        setError({
          statusCode: 0,
          body: { message: (err as Error).message },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MethodBadge method={method} />
          <span className="font-mono text-sm">{title}</span>
        </CardTitle>
        <CardDescription className="font-mono text-xs">{path}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <Button
          onClick={handleExecute}
          disabled={loading}
          variant={destructive ? 'destructive' : 'default'}
          size="sm"
        >
          {loading ? 'Executing...' : 'Execute'}
        </Button>

        {log && <LogDetails log={log} />}

        {error && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-500">
              Error {error.statusCode}
            </p>
            <JsonViewer data={error.body} />
          </div>
        )}

        {result !== null && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">
              Response
            </p>
            <JsonViewer data={result} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- Debug Page ---

export function DebugPage() {
  const [getId, setGetId] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [createType, setCreateType] = useState('totp')
  const [createBody, setCreateBody] = useState('')
  const [updateId, setUpdateId] = useState('')
  const [updateBody, setUpdateBody] = useState('{\n  "name": ""\n}')
  const [verifyId, setVerifyId] = useState('')
  const [verifyBody, setVerifyBody] = useState('{\n  "otp": ""\n}')

  return (
    <div className="grid gap-4 px-6 pb-6">
      {/* factors.list */}
      <EndpointCard
        title="factors.list()"
        method="GET"
        path="/me/v1/factors"
        execute={() => myAccount.factors.list()}
      />

      {/* authenticationMethods.list */}
      <EndpointCard
        title="authenticationMethods.list()"
        method="GET"
        path="/me/v1/authentication-methods"
        execute={() => myAccount.authenticationMethods.list()}
      />

      {/* authenticationMethods.get */}
      <EndpointCard
        title="authenticationMethods.get(id)"
        method="GET"
        path="/me/v1/authentication-methods/:id"
        execute={() => myAccount.authenticationMethods.get(getId)}
      >
        <Input
          placeholder="Authentication method ID"
          value={getId}
          onChange={(e) => setGetId(e.target.value)}
        />
      </EndpointCard>

      {/* authenticationMethods.create */}
      <EndpointCard
        title="authenticationMethods.create(body)"
        method="POST"
        path="/me/v1/authentication-methods"
        execute={() => {
          const body = createBody
            ? { type: createType, ...JSON.parse(createBody) }
            : { type: createType }
          return myAccount.authenticationMethods.create(body)
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
            value={createType}
            onChange={(e) => setCreateType(e.target.value)}
          >
            <option value="totp">totp</option>
            <option value="passkey">passkey</option>
            <option value="phone">phone</option>
            <option value="email">email</option>
          </select>
          <label className="text-sm font-medium">
            Additional JSON (optional)
          </label>
          <textarea
            className="border-input min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm"
            placeholder='e.g. { "phone_number": "+1..." }'
            value={createBody}
            onChange={(e) => setCreateBody(e.target.value)}
          />
        </div>
      </EndpointCard>

      {/* authenticationMethods.delete */}
      <EndpointCard
        title="authenticationMethods.delete(id)"
        method="DELETE"
        path="/me/v1/authentication-methods/:id"
        execute={() => myAccount.authenticationMethods.delete(deleteId)}
        destructive
      >
        <Input
          placeholder="Authentication method ID"
          value={deleteId}
          onChange={(e) => setDeleteId(e.target.value)}
        />
      </EndpointCard>

      {/* authenticationMethods.update */}
      <EndpointCard
        title="authenticationMethods.update(id, body)"
        method="PATCH"
        path="/me/v1/authentication-methods/:id"
        execute={() =>
          myAccount.authenticationMethods.update(
            updateId,
            JSON.parse(updateBody)
          )
        }
      >
        <Input
          placeholder="Authentication method ID"
          value={updateId}
          onChange={(e) => setUpdateId(e.target.value)}
        />
        <textarea
          className="border-input min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm"
          value={updateBody}
          onChange={(e) => setUpdateBody(e.target.value)}
        />
      </EndpointCard>

      {/* authenticationMethods.verify */}
      <EndpointCard
        title="authenticationMethods.verify(id, body)"
        method="POST"
        path="/me/v1/authentication-methods/:id/verify"
        execute={() =>
          myAccount.authenticationMethods.verify(
            verifyId,
            JSON.parse(verifyBody)
          )
        }
      >
        <Input
          placeholder="Authentication method ID"
          value={verifyId}
          onChange={(e) => setVerifyId(e.target.value)}
        />
        <textarea
          className="border-input min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 font-mono text-sm"
          placeholder='e.g. { "otp": "123456" }'
          value={verifyBody}
          onChange={(e) => setVerifyBody(e.target.value)}
        />
      </EndpointCard>
    </div>
  )
}

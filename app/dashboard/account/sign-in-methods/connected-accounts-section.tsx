'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type MyAccount } from '@auth0/myaccount-js'
import { CheckCircle2, Link2, Link2Off, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { myAccountClient } from '@/lib/my-account-client'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { initiateConnectedAccount } from './connected-accounts-actions'

const KNOWN_STRATEGIES: Record<string, string> = {
  'google-oauth2': 'Google',
  github: 'GitHub',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  apple: 'Apple',
  microsoft: 'Microsoft',
  windowslive: 'Microsoft',
  dropbox: 'Dropbox',
  bitbucket: 'Bitbucket',
  slack: 'Slack',
  discord: 'Discord',
  spotify: 'Spotify',
  twitch: 'Twitch',
}

function displayName(conn: MyAccount.ConnectedAccountConnection): string {
  return (
    KNOWN_STRATEGIES[conn.name] ??
    KNOWN_STRATEGIES[conn.strategy] ??
    conn.name
      .replace(/-oauth2?$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

export function ConnectedAccountsSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<
    MyAccount.ConnectedAccountConnection[]
  >([])
  const [accounts, setAccounts] = useState<MyAccount.ConnectedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [connectionsPage, accountsPage] = await Promise.all([
          myAccountClient.connectedAccounts.connections.list(),
          myAccountClient.connectedAccounts.list(),
        ])
        setConnections(connectionsPage.data)
        setAccounts(accountsPage.data)
      } catch (err) {
        console.error('Failed to fetch connected accounts', err)
        setError('Failed to load connected accounts.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Handle redirect back from the connect flow.
  // Returning from OAuth is a full page navigation so the component remounts
  // and the effect above already re-fetches — just show the toast and clean the URL.
  useEffect(() => {
    const connected = searchParams.get('connected')
    const connectError = searchParams.get('connect_error')

    if (connected === 'true') {
      toast.success('Account connected successfully.')
      router.replace('/dashboard/account/sign-in-methods')
    } else if (connectError) {
      const messages: Record<string, string> = {
        session_expired: 'Connection session expired. Please try again.',
        completion_failed: 'Failed to complete connection. Please try again.',
        access_denied: 'Connection was denied.',
      }
      toast.error(messages[connectError] ?? 'Failed to connect account.')
      router.replace('/dashboard/account/sign-in-methods')
    }
  }, [searchParams, router])

  async function handleConnect(conn: MyAccount.ConnectedAccountConnection) {
    setConnecting(conn.name)
    try {
      const { connectUrl } = await initiateConnectedAccount(conn.name)
      window.location.assign(connectUrl)
    } catch (err) {
      console.error('Failed to initiate connection', err)
      toast.error('Failed to start connection flow. Please try again.')
      setConnecting(null)
    }
  }

  async function handleDisconnect(account: MyAccount.ConnectedAccount) {
    setDisconnecting(account.id)
    try {
      await myAccountClient.connectedAccounts.delete(account.id)
      setAccounts((prev) => prev.filter((a) => a.id !== account.id))
      toast.success('Account disconnected.')
    } catch (err) {
      console.error('Failed to disconnect account', err)
      toast.error('Failed to disconnect account. Please try again.')
    } finally {
      setDisconnecting(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
        <div className="mb-4 lg:mb-0">
          <Skeleton className="mb-2 h-5 w-40" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="bg-card rounded-lg border">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              {i > 1 && <Separator />}
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
        <div />
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border px-4 py-10">
          <Link2Off className="text-muted-foreground/40 mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
      <div className="mb-4 lg:mb-0">
        <div className="mb-1.5 flex items-center gap-2.5">
          <Link2 className="text-muted-foreground h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">
            Connected accounts
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Link your account with social identity providers to enable single
          sign-on and access additional services.
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10">
            <Link2 className="text-muted-foreground/40 mb-3 h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              No connections available
            </p>
          </div>
        ) : (
          connections.map((conn, idx) => {
            const linkedAccount = accounts.find(
              (a) => a.connection === conn.name
            )
            const isConnecting = connecting === conn.name
            const isDisconnecting = disconnecting === linkedAccount?.id
            const name = displayName(conn)

            return (
              <div key={conn.name}>
                {idx > 0 && <Separator />}
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Link2 className="text-muted-foreground h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{name}</p>
                        {linkedAccount && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {linkedAccount
                          ? `Connected ${new Date(linkedAccount.created_at).toLocaleDateString()}`
                          : conn.strategy}
                      </p>
                    </div>
                  </div>

                  {!linkedAccount && (
                    <Button variant="secondary" size="sm" asChild>
                      <a
                        href={`/auth/connect?connection=${conn.name}&returnTo=/dashboard/account/sign-in-methods`}
                      >
                        <Link2 className="mr-1.5 h-4 w-4" />
                        Connect (SDK)
                      </a>
                    </Button>
                  )}

                  {linkedAccount ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={isDisconnecting}
                        >
                          {isDisconnecting ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <Link2Off className="mr-1.5 h-4 w-4" />
                          )}
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Disconnect {name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the connection between your account
                            and {name}. You can reconnect at any time.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Button
                            variant="destructive"
                            onClick={() => handleDisconnect(linkedAccount)}
                            disabled={isDisconnecting}
                          >
                            {isDisconnecting && (
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            )}
                            Disconnect
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(conn)}
                      disabled={isConnecting || connecting !== null}
                    >
                      {isConnecting ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="mr-1.5 h-4 w-4" />
                      )}
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

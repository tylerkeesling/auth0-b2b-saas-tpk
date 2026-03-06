'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  factorIcons,
  factorsMeta,
  getMyAccountError,
  getProviderName,
} from '@/lib/mfa-utils'
import {
  myAccount,
  MyAccountApiError,
  type AuthenticationMethod,
  type AuthenticationMethodType,
  type Factor,
} from '@/lib/my-account'
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
import { DevBar } from '@/components/dev-bar'

import { SmsEnrollmentDialog } from './sms-enrollment-dialog'
import { TotpEnrollmentDialog } from './totp-enrollment-dialog'

interface MfaV2FactorsSectionProps {
  orgEnabledProviders: string[]
}

export function MfaV2FactorsSection({
  orgEnabledProviders,
}: MfaV2FactorsSectionProps) {
  const [factors, setFactors] = useState<Factor[]>([])
  const [methods, setMethods] = useState<AuthenticationMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState<AuthenticationMethodType | null>(
    null
  )

  const refreshMethods = useCallback(async () => {
    try {
      const res = await myAccount.authenticationMethods.list()
      setMethods(res.data.authentication_methods)
    } catch (err) {
      console.error('Failed to refresh methods', err)
    }
  }, [])

  async function handleDelete(enrollmentId: string) {
    setDeleting(enrollmentId)
    try {
      await myAccount.authenticationMethods.delete(enrollmentId)
      setMethods((prev) => prev.filter((m) => m.id !== enrollmentId))
      toast.success('Enrollment removed successfully.')
    } catch (err) {
      const message =
        err instanceof MyAccountApiError
          ? getMyAccountError(err)
          : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [factorsRes, methodsRes] = await Promise.all([
          myAccount.factors.list(),
          myAccount.authenticationMethods.list(),
        ])

        setFactors(factorsRes.data.factors)
        setMethods(methodsRes.data.authentication_methods)
      } catch (err) {
        console.error('Failed to fetch MFA data', err)
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
        <div className="mb-4 lg:mb-0">
          <Skeleton className="mb-2 h-5 w-32" />
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
          <ShieldCheck className="text-muted-foreground/40 mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setLoading(true)
              setError(null)
              window.location.reload()
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:items-start lg:gap-10">
        <div className="mb-4 lg:mb-0">
          <div className="mb-1.5 flex items-center gap-2.5">
            <ShieldCheck className="text-muted-foreground h-4 w-4" />
            <h2 className="text-foreground text-sm font-semibold">
              MFA factors
            </h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Add a second layer of security to your account. When MFA is
            required, you&apos;ll need to verify your identity with one of these
            methods.
          </p>
        </div>

        <div className="bg-card rounded-lg border">
          {factors.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-10">
              <ShieldCheck className="text-muted-foreground/40 mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                No MFA factors available
              </p>
            </div>
          ) : (
            <div>
              {factors
                .map((factor) => {
                  const providerName = getProviderName(factor.type)
                  const orgEnabled =
                    orgEnabledProviders.length === 0 ||
                    orgEnabledProviders.includes(providerName)
                  const enrollment = methods.find((m) => m.type === factor.type)
                  return { factor, orgEnabled, enrollment }
                })
                .sort((a, b) => {
                  const aDisabled = !a.orgEnabled && !a.enrollment ? 1 : 0
                  const bDisabled = !b.orgEnabled && !b.enrollment ? 1 : 0
                  return aDisabled - bDisabled
                })
                .map(({ factor, orgEnabled, enrollment }, idx) => {
                  const meta = factorsMeta[factor.type]
                  const Icon = factorIcons[factor.type] ?? ShieldCheck
                  const isGreyedOut = !orgEnabled && !enrollment

                  return (
                    <div key={factor.type}>
                      {idx > 0 && <Separator />}
                      <div
                        className={`flex items-center justify-between gap-4 p-4 ${isGreyedOut ? 'opacity-50' : ''}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                            <Icon className="text-muted-foreground h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                {meta?.title ?? factor.type}
                              </p>
                              {enrollment && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Enrolled
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {isGreyedOut
                                ? 'Not enabled by your organization'
                                : (meta?.description ?? factor.type)}
                            </p>
                          </div>
                        </div>

                        {enrollment ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Remove
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove MFA enrollment
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove your{' '}
                                  {meta?.title ?? factor.type} enrollment. You
                                  will no longer be able to use it for
                                  multifactor authentication.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button
                                  variant="destructive"
                                  disabled={deleting === enrollment.id}
                                  onClick={() => handleDelete(enrollment.id)}
                                >
                                  {deleting === enrollment.id
                                    ? 'Removing…'
                                    : 'Remove'}
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          orgEnabled && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEnrolling(
                                  factor.type as AuthenticationMethodType
                                )
                              }
                            >
                              <Plus className="mr-1.5 h-4 w-4" />
                              Enroll
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      <SmsEnrollmentDialog
        open={enrolling === 'phone'}
        onOpenChange={(open) => !open && setEnrolling(null)}
        onSuccess={() => {
          setEnrolling(null)
          refreshMethods()
          toast.success('Phone enrollment added successfully.')
        }}
      />

      <TotpEnrollmentDialog
        open={enrolling === 'totp'}
        onOpenChange={(open) => !open && setEnrolling(null)}
        onSuccess={() => {
          setEnrolling(null)
          refreshMethods()
          toast.success('Authenticator app enrolled successfully.')
        }}
      />

      <DevBar>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/account/my-account-debug">
            My Account Debug
          </Link>
        </Button>
      </DevBar>
    </>
  )
}

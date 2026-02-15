'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, Pencil, SendHorizonal, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/submit-button'

import { sendPasswordResetEmail, updatePassword } from './actions'

interface PasswordSectionProps {
  lastPasswordReset: string | null
  createdAt: string | null
}

export function PasswordSection({
  lastPasswordReset,
  createdAt,
}: PasswordSectionProps) {
  const [editing, setEditing] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [mismatch, setMismatch] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:gap-10">
      <div className="mb-4 lg:mb-0">
        <div className="mb-1.5 flex items-center gap-2.5">
          <Lock className="text-muted-foreground h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">Password</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Keep your account secure with a strong password. We recommend using a
          unique password you don&apos;t use elsewhere.
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm tracking-wide select-none">
              ••••••••••••
            </span>
            {(lastPasswordReset || createdAt) && (
              <span className="text-muted-foreground text-xs">
                &middot; {lastPasswordReset ? 'Changed' : 'Set'}{' '}
                {new Date((lastPasswordReset ?? createdAt)!).toLocaleDateString(
                  'en-US',
                  {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  }
                )}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(!editing)
              setMismatch(false)
              setShowNew(false)
              setShowConfirm(false)
            }}
          >
            {editing ? (
              <X className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            <span className="ml-1.5">{editing ? 'Cancel' : 'Change'}</span>
          </Button>
        </div>

        {editing && (
          <div className="border-t px-4 py-4">
            <form
              className="space-y-4"
              action={async (formData: FormData) => {
                const newPassword = formData.get('newPassword') as string
                const confirmPassword = formData.get(
                  'confirmPassword'
                ) as string
                if (newPassword !== confirmPassword) {
                  setMismatch(true)
                  return
                }
                setMismatch(false)
                const { error } = await updatePassword(formData)
                if (error) {
                  toast.error(error)
                } else {
                  toast.success('Your password has been updated.')
                  setEditing(false)
                }
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? 'text' : 'password'}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNew(!showNew)}
                    >
                      {showNew ? (
                        <EyeOff className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <Eye className="text-muted-foreground h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
                        <EyeOff className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <Eye className="text-muted-foreground h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {mismatch && (
                <p className="text-destructive text-sm">
                  Passwords do not match.
                </p>
              )}

              <p className="text-muted-foreground text-xs">
                Password must be at least 8 characters.
              </p>

              <div className="flex items-center gap-2">
                <SubmitButton>Update password</SubmitButton>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(false)
                    setMismatch(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {!editing && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-muted-foreground text-xs">
              Forgot your password?
            </p>
            <Button
              variant="ghost"
              size="sm"
              disabled={sendingReset}
              onClick={async () => {
                setSendingReset(true)
                const { error } = await sendPasswordResetEmail()
                setSendingReset(false)
                if (error) {
                  toast.error(error)
                } else {
                  toast.success('Password reset email sent.')
                }
              }}
            >
              <SendHorizonal className="mr-1.5 h-4 w-4" />
              Send reset email
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Pencil,
  SendHorizonal,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/submit-button'

import { sendVerificationEmail, updateEmail } from './actions'

interface EmailSectionProps {
  email: string
  emailVerified: boolean
}

export function EmailSection({ email, emailVerified }: EmailSectionProps) {
  const [editing, setEditing] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] lg:gap-10">
      <div className="mb-4 lg:mb-0">
        <div className="mb-1.5 flex items-center gap-2.5">
          <Mail className="text-muted-foreground h-4 w-4" />
          <h2 className="text-foreground text-sm font-semibold">
            Email address
          </h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Used for sign-in, notifications, and account recovery.
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate font-mono text-sm">{email}</span>
            {emailVerified ? (
              <Badge
                variant="outline"
                className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="shrink-0 border-amber-500/20 bg-amber-500/10 text-amber-600"
              >
                <AlertCircle className="mr-1 h-3 w-3" />
                Unverified
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
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
              className="space-y-3"
              action={async (formData: FormData) => {
                const { error } = await updateEmail(formData)
                if (error) {
                  toast.error(error)
                } else {
                  toast.success('Your email has been updated.')
                  setEditing(false)
                }
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="new-email">New email address</Label>
                <p className="text-muted-foreground text-xs">
                  A verification email will be sent to your new address.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="new-email"
                  name="email"
                  type="email"
                  placeholder="Enter new email address"
                  required
                  className="max-w-sm"
                />
                <SubmitButton>Update email</SubmitButton>
              </div>
            </form>
          </div>
        )}

        {!emailVerified && !editing && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-muted-foreground text-xs">
              Your email is not verified.
            </p>
            <Button
              variant="ghost"
              size="sm"
              disabled={sendingVerification}
              onClick={async () => {
                setSendingVerification(true)
                const { error } = await sendVerificationEmail()
                setSendingVerification(false)
                if (error) {
                  toast.error(error)
                } else {
                  toast.success('Verification email sent.')
                }
              }}
            >
              <SendHorizonal className="mr-1.5 h-4 w-4" />
              Resend verification
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

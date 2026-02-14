'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/submit-button'

import { updateProfile } from './actions'

interface Profile {
  name: string
  email: string
  email_verified?: boolean
  phone_number?: string
}

interface Props {
  profile: Profile
}

export function DisplayProfileForm({ profile }: Props) {
  const [editMode, setEditMode] = useState(false)

  if (!editMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Name</Label>
              <Input value={profile.name} disabled />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={
                  profile.phone_number
                    ? formatPhoneNumber(profile.phone_number)
                    : ''
                }
                disabled
                placeholder="(not set)"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="flex flex-1 items-end">
              <div className="w-full space-y-2">
                <Label>Email Verified</Label>
                <div>
                  {profile.email_verified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="destructive">Not Verified</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="button" onClick={() => setEditMode(true)}>
            Edit
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="contents"
          action={async (formData: FormData) => {
            const { error } = await updateProfile(formData)

            if (error) {
              toast.error(error)
            } else {
              toast.success('Your profile has been updated.')
              setEditMode(false)
            }
          }}
        >
          <div className="mb-4 flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={profile.name}
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={
                  profile.phone_number
                    ? formatPhoneNumber(profile.phone_number)
                    : ''
                }
                disabled
                placeholder="(not set)"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>
            <div className="flex flex-1 items-end">
              <div className="w-full space-y-2">
                <Label>Email Verified</Label>
                <div>
                  {profile.email_verified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="destructive">Not Verified</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <SubmitButton>Save</SubmitButton>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function formatPhoneNumber(phone: string) {
  // Simple US formatting, can be improved for international
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

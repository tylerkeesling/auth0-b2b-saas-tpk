"use client"

import Image from "next/image"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/submit-button"

import { updateOrganization } from "./actions"

interface Props {
  organization: {
    id: string
    displayName: string
    slug: string
    logoUrl?: string
  }
}

export function DisplayNameForm({ organization }: Props) {
  return (
    <form
      action={async (formData: FormData) => {
        const { error } = await updateOrganization(formData)

        if (error) {
          toast.error(error)
        } else {
          toast.success("The organization has been updated.")
        }
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Update your organization&apos;s display name and branding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Organization Details Section */}

          <div className="grid grid-cols-2 gap-6">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                placeholder="acme"
                defaultValue={organization.displayName}
              />
              <div className="h-5"></div>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                placeholder="acme"
                defaultValue={organization.slug}
                disabled
                readOnly
              />
              <p className="text-muted-foreground text-sm">
                This cannot be changed.
              </p>
            </div>
          </div>

          {/* Branding Section */}
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {/* Logo URL Input */}
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                name="logo_url"
                type="url"
                placeholder="https://example.com/logo.png"
                defaultValue={organization.logoUrl || ""}
              />
              <p className="text-muted-foreground text-xs">
                Enter a URL for your organization logo. Recommended size:
                200x200px.
              </p>
            </div>

            {/* Logo Preview */}
            <div className="space-y-4">
              <Label>Organization Logo</Label>
              {organization.logoUrl ? (
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                    <Image
                      src={organization.logoUrl}
                      alt={`${organization.displayName} logo`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="border-muted-foreground/25 bg-muted/10 flex h-20 w-20 items-center justify-center rounded-lg border border-dashed">
                    <span className="text-muted-foreground text-xs">
                      No logo
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  )
}

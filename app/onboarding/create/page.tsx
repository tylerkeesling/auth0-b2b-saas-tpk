import Link from 'next/link'

import { Auth0Logo } from '@/components/auth0-logo'

import { CreateOrganizationForm } from './create-organization-form'

export default async function Create() {
  return (
    <div className="relative container hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Auth0Logo className="mr-2 size-8" />
          <span className="font-mono font-medium">SaaStart</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <div className="space-y-1">
              <p className="text-lg">
                SaaStart is a reference B2B SaaS application built using Next.js
                and Auth0 by Okta.
              </p>
              <p className="text-lg">
                It features multi-tenancy support, user management and access
                controls, security policies, self-service Single Sign-On
                configuration and more out-of-the-box.
              </p>
            </div>
            <footer className="text-muted-foreground text-sm">
              — Built by Auth0 by Okta
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your organization name to create an account.
            </p>
          </div>
          <CreateOrganizationForm />
          <p className="text-muted-foreground px-8 text-center text-sm">
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms"
              className="hover:text-primary underline underline-offset-4"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="hover:text-primary underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

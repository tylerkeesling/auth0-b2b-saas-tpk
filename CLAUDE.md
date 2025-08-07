# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **SaaStart**, a B2B SaaS starter application built with Next.js 14 and Auth0 by Okta. It provides a complete foundation for building multi-tenant SaaS applications with enterprise identity features including SSO, SCIM provisioning, MFA policies, and organization management.

## Key Technologies

- **Framework**: Next.js 14 with App Router and React Server Components
- **Authentication**: Auth0 with `@auth0/nextjs-auth0` SDK
- **Database**: Vercel Postgres (`@vercel/postgres`)
- **Session Storage**: Vercel KV (`@vercel/kv`)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **TypeScript**: Strict mode enabled
- **State Management**: React Server Components with server actions

## Development Commands

```bash
# Start development server (runs on https://saas.localho.st:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Bootstrap Auth0 tenant configuration
npm run auth0:bootstrap
```

## Architecture Overview

### Multi-Tenancy Pattern
Uses Auth0 Organizations for multi-tenancy with a shared user database. Each organization represents a tenant with its own settings, members, and configurations.

### Authentication Flow
- **App Client**: Main application authentication (`/api/auth/[auth0]`)
- **Onboarding Client**: Separate client for organization creation flow (`/onboarding/[auth0]`)
- **Management Client**: Server-side Auth0 Management API access

### Key Directories

- `app/` - Next.js App Router pages and API routes
  - `dashboard/` - Protected dashboard pages with nested layouts
  - `onboarding/` - Organization creation and verification flows
  - `api/auth/` - Auth0 authentication routes
  - `api/events/` - Webhook event handling
- `lib/` - Shared utilities, Auth0 clients, and server actions
- `components/` - Reusable UI components (shadcn/ui based)
- `actions/` - Auth0 Actions for custom authentication flows
- `scripts/` - Bootstrap script for Auth0 tenant setup

### Database Schema
Uses Vercel Postgres with a `webhook_events` table for storing Auth0 webhook events. Schema defined in `lib/definitions.ts`.

### Server Actions Pattern
Heavy use of React Server Actions for form handling and server-side operations. Actions are co-located with their respective pages in `actions.ts` files.

## Development Workflow

### Auth0 Setup
Before development, run `npm run auth0:bootstrap` to configure your Auth0 tenant with required applications, roles, actions, and email templates.

### Local Development
The app runs on `https://saas.localho.st:3000` by default to support Auth0 callbacks and proper SSL. This domain resolves to localhost.

### Environment Variables
Configuration is managed through `.env.local` file created by the bootstrap script. Key variables include Auth0 domain, client credentials, and database URLs.

## Key Features to Understand

### Organization Management
- Self-service organization creation during signup
- User invitation workflows with email verification
- Role-based access control (admin/member roles)

### Enterprise SSO
- SAML and OIDC connection management
- Domain verification for home realm discovery
- SCIM provisioning configuration

### Security Policies
- MFA enforcement at organization level
- Configurable session settings
- IP restriction capabilities

### User Profile Management  
- Self-service profile updates
- Password reset flows
- MFA enrollment management
- Account deletion

## Testing Considerations

No test framework is currently configured. When adding tests, examine the codebase structure and consult with the team on preferred testing approach.

## Common Patterns

### Form Handling
Forms use React Server Actions with `useFormState` and `useFormStatus` hooks. Submit buttons are abstracted into `SubmitButton` component.

### Error Handling
Server actions return `{ error: string }` objects for error states. UI components check for error properties to display validation messages.

### Data Fetching
Server Components fetch data directly using Auth0 Management API or database queries. No client-side data fetching patterns are used.

### Type Safety
Heavy use of TypeScript with Zod for runtime validation in server actions. Auth0 types are imported from the `auth0` package.
# Auth0 B2B SaaS Starter

## Commands

```bash
npm run dev          # Dev server on saas.localho.st:3000
npm run build        # Production build
npm run test         # Vitest (run once)
npm run lint         # ESLint
npm run format       # Prettier (write mode)
```

## Architecture

Next.js 16 App Router with React 19. Tailwind CSS v4, shadcn/ui (Radix primitives), lucide-react icons.

```
app/
├── api/events/.        # Auth0 webhooks sent here.
├── dashboard/
│   ├── account/        # Profile, sessions, logs, MFA, sign-in-methods, tokens
│   └── organization/   # Members, SSO, security policies, general settings
├── event-stream/       # Webhook event viewer
└── onboarding/         # Org creation flow
components/
├── ui/                 # shadcn/ui components
└── *.tsx               # Feature components (sidebar, nav, breadcrumbs)
lib/
├── auth0.ts            # Auth0 app + onboarding clients
├── auth0-manage.ts     # Management API client
├── session-store.ts    # Vercel KV session storage
├── roles.ts            # Role utilities (admin/member)
├── with-server-action-auth.ts  # Server action auth wrapper
└── with-organization-auth.ts   # Org session getter
actions/                # Auth0 Actions (deployed to Auth0 pipeline)
proxy.ts                # Middleware — routes to app vs onboarding client
```

## Auth0 Setup

- **Two clients:** `appClient` (main app, org-scoped) and `onboardingClient` (org creation)
- **Session storage:** Upstash Redis with backchannel logout support
- **Server actions** use `withServerActionAuth()` wrapper for auth + optional role check
- **Management API:** `managementClient` in `lib/auth0-manage.ts`
- **Roles:** Single role per user via custom claims (`CUSTOM_CLAIMS_NAMESPACE/roles`)

## Code Style

- No semicolons, single quotes, 2-space indent, trailing commas (es5)
- Imports sorted by: react → next → third-party → @/lib → @/hooks → @/components/ui → @/components → relative
- Use `@/` path alias for all imports (not relative paths)
- Server components by default; `'use client'` only when needed
- Server actions return `{ error?: string }`, never throw

## Testing

- **Vitest** with jsdom, React Testing Library
- Test files: `**/__tests__/**/*.test.{ts,tsx,js}`
- Setup: `__tests__/setup.ts` (polyfills matchMedia, ResizeObserver)
- Mock server actions with `vi.mock()`, toast with sonner mock

## Environment

See `.env.example` for required vars. Key ones:
- `APP_BASE_URL` — app URL
- `NEXT_PUBLIC_AUTH0_DOMAIN` / `AUTH0_MANAGEMENT_API_DOMAIN`
- `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` (app client)
- `AUTH0_MANAGEMENT_CLIENT_ID` / `AUTH0_MANAGEMENT_CLIENT_SECRET`
- `AUTH0_ADMIN_ROLE_ID` / `AUTH0_MEMBER_ROLE_ID`
- `CUSTOM_CLAIMS_NAMESPACE`

## Dev Bar

`components/dev-bar.tsx` — a collapsible bar fixed to the bottom of the dashboard for demo/dev toggles. Pages render `<DevBar>{controls}</DevBar>` from their client components; the DevBar uses a React portal to render into `#dev-bar-portal` (a direct child of `SidebarInset` in `app/dashboard/layout.tsx`), so it spans the content area without overlapping the sidebar.

## Gotchas

- Dev server **must** use `--hostname saas.localho.st` (Auth0 callback URLs expect this)
- `managementClient.users.get()` returns the user directly (not wrapped in `.data`), but list operations return `.data`
- `managementClient.logs.list()` uses `search` param for Lucene queries, not `q`
- Middleware is in `proxy.ts`, not `middleware.ts`

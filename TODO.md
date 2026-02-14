# Sidebar Refactor TODOs

## Phase 1: Install Dependencies
- [x] Install shadcn components: `sidebar`, `breadcrumb`, `collapsible`, `sheet`

## Phase 2: Create New Sidebar Components
- [x] Create `components/nav-main.tsx` — collapsible nav group (My Organization, My Account)
- [x] Create `components/org-sidebar-switcher.tsx` — org switcher adapted for sidebar header
- [x] Create `components/nav-user.tsx` — user info + dropdown in sidebar footer
- [x] Create `components/app-sidebar.tsx` — main sidebar orchestrator
- [x] Create `components/sidebar-breadcrumbs.tsx` — dynamic breadcrumbs from route

## Phase 3: Update Layouts
- [x] Rewrite `app/dashboard/layout.tsx` — replace top nav + footer with SidebarProvider + AppSidebar + SidebarInset
- [x] Simplify `app/dashboard/organization/layout.tsx` — remove SidebarNav, keep admin role check
- [x] Simplify `app/dashboard/account/layout.tsx` — remove SidebarNav
- [x] Simplify `app/dashboard/event-stream/layout.tsx` — minimal wrapper
- [x] Update `app/dashboard/page.tsx` — redirect to `/dashboard/account/profile`

## Phase 4: Cleanup
- [x] Delete `components/sidebar-nav.tsx`
- [x] Delete `components/app-breadcrumb.tsx`
- [x] Remove unused imports of old components

## Phase 5: Testing & Verification

### Setup
- [x] Install test dependencies (`@testing-library/react`, `@testing-library/dom`, `jsdom`)
- [x] Update `vitest.config.js` — add jsdom env, `@` alias, expand include pattern
- [x] Export `resolveBreadcrumbs` from `components/sidebar-breadcrumbs.tsx`

### Unit Tests (`__tests__/`)
- [x] `sidebar-breadcrumbs.test.ts` — exact routes, SSO sub-routes, fallbacks (Verification #4)
- [x] `app-sidebar.test.tsx` — renders all sections, role-based disabled, Event Stream link (Verifications #1, #5, #9)
- [x] `nav-main.test.tsx` — auto-expand on active route, disabled items styling (Verifications #3, #5)
- [x] `org-sidebar-switcher.test.tsx` — org redirect URL, create org navigation (Verification #2)
- [x] `nav-user.test.tsx` — theme setTheme calls, profile/logout links (Verification #8)
- [x] All tests pass via `npm test`

### Puppeteer MCP Verification
- [x] Mobile responsive — viewport 375x812, sidebar hidden, sheet overlay opens (Verification #6)
- [x] Rail collapse — click rail trigger, sidebar collapses to icon-only (Verification #7)
- [x] Theme toggle — open user dropdown, switch to Light, verify `class="light"` on html (Verification #8)

### Verification Checklist
- [x] Sidebar renders with org switcher, nav groups, and user footer
- [x] Org switching triggers Auth0 redirect correctly
- [x] Collapsible groups expand/collapse, auto-expand on active route
- [x] Breadcrumbs reflect current route accurately
- [x] Non-admin users see disabled/grayed-out My Organization items
- [x] Mobile responsive — sidebar becomes sheet overlay
- [x] Sidebar collapses to icon-only mode via rail
- [x] Theme toggle works from user dropdown
- [x] Event Stream accessible as top-level sidebar item

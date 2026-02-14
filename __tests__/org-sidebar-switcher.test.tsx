import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard",
}))

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { OrgSidebarSwitcher } from "@/components/org-sidebar-switcher"
import { SidebarProvider } from "@/components/ui/sidebar"

const organizations = [
  { id: "org-1", slug: "acme", displayName: "Acme Corp" },
  { id: "org-2", slug: "globex", displayName: "Globex Inc" },
  { id: "org-3", slug: "initech", displayName: "Initech" },
]

function renderSwitcher(props = {}) {
  return render(
    <SidebarProvider>
      <OrgSidebarSwitcher
        organizations={organizations}
        currentOrgId="org-1"
        {...props}
      />
    </SidebarProvider>
  )
}

function openDropdown() {
  const trigger = screen.getByText("Acme Corp").closest("button")!
  // Radix DropdownMenu requires pointer events to open
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" })
}

describe("OrgSidebarSwitcher", () => {
  beforeEach(() => {
    mockPush.mockClear()
    // Mock window.location.href as a writable property
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    })
  })

  it("renders the current organization name", () => {
    renderSwitcher()
    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
  })

  it("renders the current org avatar fallback", () => {
    renderSwitcher()
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("returns null when currentOrgId is not found", () => {
    renderSwitcher({ currentOrgId: "nonexistent" })
    expect(screen.queryByText("Acme Corp")).toBeNull()
    expect(screen.queryByText("Globex Inc")).toBeNull()
  })

  it("shows all orgs in dropdown when opened", () => {
    renderSwitcher()
    openDropdown()

    expect(screen.getByText("Organizations")).toBeInTheDocument()
    expect(screen.getByText("Globex Inc")).toBeInTheDocument()
    expect(screen.getByText("Initech")).toBeInTheDocument()
  })

  it("navigates via window.location.href when selecting an org", () => {
    renderSwitcher()
    openDropdown()

    const globexItem = screen.getByText("Globex Inc")
    fireEvent.click(globexItem)

    expect(window.location.href).toBe(
      "/auth/login?organization=globex&returnTo=/dashboard"
    )
  })

  it("shows Create Organization option", () => {
    renderSwitcher()
    openDropdown()

    expect(screen.getByText("Create Organization")).toBeInTheDocument()
  })

  it("navigates to /onboarding/create when Create Organization is clicked", () => {
    renderSwitcher()
    openDropdown()

    const createBtn = screen.getByText("Create Organization")
    fireEvent.click(createBtn)

    expect(mockPush).toHaveBeenCalledWith("/onboarding/create")
  })
})

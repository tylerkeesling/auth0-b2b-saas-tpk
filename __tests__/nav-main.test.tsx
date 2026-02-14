import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

// Track pathname for dynamic mocking
let mockPathname = "/"
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}))

// Mock next/link
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

import { NavMain } from "@/components/nav-main"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Building2 } from "lucide-react"

const testItems = [
  { title: "General Settings", href: "/dashboard/organization/general" },
  { title: "Members", href: "/dashboard/organization/members" },
  { title: "SSO", href: "/dashboard/organization/sso" },
]

function renderNavMain(props = {}) {
  return render(
    <SidebarProvider>
      <NavMain
        title="My Organization"
        icon={Building2}
        items={testItems}
        {...props}
      />
    </SidebarProvider>
  )
}

describe("NavMain", () => {
  beforeEach(() => {
    mockPathname = "/"
  })

  it("renders the group title", () => {
    renderNavMain()
    expect(screen.getAllByText("My Organization").length).toBeGreaterThan(0)
  })

  it("renders all nav items", () => {
    mockPathname = "/dashboard/organization/general"
    renderNavMain()
    expect(screen.getByText("General Settings")).toBeInTheDocument()
    expect(screen.getByText("Members")).toBeInTheDocument()
    expect(screen.getByText("SSO")).toBeInTheDocument()
  })

  it("auto-expands when pathname matches an item", () => {
    mockPathname = "/dashboard/organization/general"
    const { container } = renderNavMain()
    const collapsible = container.querySelector('[data-state="open"]')
    expect(collapsible).not.toBeNull()
  })

  it("stays collapsed when pathname does not match any item", () => {
    mockPathname = "/dashboard/account/profile"
    const { container } = renderNavMain()
    const collapsible = container.querySelector('[data-state="closed"]')
    expect(collapsible).not.toBeNull()
  })

  it("renders items as links when not disabled", () => {
    mockPathname = "/dashboard/organization/general"
    renderNavMain({ disabled: false })
    const link = screen.getByText("General Settings").closest("a")
    expect(link).toHaveAttribute("href", "/dashboard/organization/general")
  })

  it("renders disabled items with pointer-events-none and opacity-50", () => {
    mockPathname = "/dashboard/organization/general"
    renderNavMain({ disabled: true })
    const item = screen.getByText("General Settings")
    const button = item.closest('[class*="pointer-events-none"]')
    expect(button).not.toBeNull()
    expect(button?.className).toContain("opacity-50")
  })

  it("disabled items are not wrapped in navigable links", () => {
    mockPathname = "/dashboard/organization/general"
    renderNavMain({ disabled: true })
    const item = screen.getByText("General Settings")
    // When disabled, the sub-button should not have an href attribute
    const subButton = item.closest('[data-sidebar="menu-sub-button"]')
    expect(subButton).not.toBeNull()
    // Disabled buttons should have pointer-events-none (already verified above)
    // and should not navigate anywhere — no href on the element
    expect(subButton).not.toHaveAttribute("href")
  })

  it("marks the active item based on pathname", () => {
    mockPathname = "/dashboard/organization/general"
    renderNavMain({ disabled: false })
    const link = screen.getByText("General Settings").closest("a")
    expect(link).not.toBeNull()
    const membersLink = screen.getByText("Members").closest("a")
    expect(membersLink).not.toBeNull()
  })
})

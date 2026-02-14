import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

// Mock next/navigation with mutable pathname
let mockPathname = "/dashboard/account/profile"
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes
const mockSetTheme = vi.fn()
vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: mockSetTheme, theme: "light" }),
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

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const defaultProps = {
  organizations: [
    { id: "org-1", slug: "acme", displayName: "Acme Corp" },
    { id: "org-2", slug: "globex", displayName: "Globex Inc" },
  ],
  currentOrgId: "org-1",
  user: { name: "John Doe", email: "john@example.com", picture: "" },
  userRole: "admin",
}

function renderSidebar(props = {}) {
  return render(
    <SidebarProvider>
      <AppSidebar {...defaultProps} {...props} />
    </SidebarProvider>
  )
}

describe("AppSidebar", () => {
  it("renders the org switcher with current org name", () => {
    renderSidebar()
    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
  })

  it("renders My Organization nav group", () => {
    renderSidebar()
    expect(screen.getAllByText("My Organization").length).toBeGreaterThanOrEqual(1)
  })

  it("renders My Account nav group", () => {
    renderSidebar()
    expect(screen.getAllByText("My Account").length).toBeGreaterThanOrEqual(1)
  })

  it("renders the user footer with name and email", () => {
    renderSidebar()
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("john@example.com")).toBeInTheDocument()
  })

  it("renders Event Stream link in Other group", () => {
    renderSidebar()
    expect(screen.getByText("Event Stream")).toBeInTheDocument()
    const link = screen.getByText("Event Stream").closest("a")
    expect(link).toHaveAttribute("href", "/dashboard/event-stream")
  })

  it("renders Other group label", () => {
    renderSidebar()
    expect(screen.getByText("Other")).toBeInTheDocument()
  })

  it("disables My Organization items when user is not admin", () => {
    renderSidebar({ userRole: "member" })
    const generalSettings = screen.getByText("General Settings")
    const button = generalSettings.closest(
      '[class*="pointer-events-none"]'
    )
    expect(button).not.toBeNull()
  })

  it("enables My Organization items when user is admin", () => {
    renderSidebar({ userRole: "admin" })
    const generalSettings = screen.getByText("General Settings")
    const link = generalSettings.closest("a")
    expect(link).toHaveAttribute(
      "href",
      "/dashboard/organization/general"
    )
  })

  it("always enables My Account items regardless of role", () => {
    renderSidebar({ userRole: "member" })
    const profile = screen.getByText("Profile")
    const link = profile.closest("a")
    expect(link).toHaveAttribute("href", "/dashboard/account/profile")
  })
})

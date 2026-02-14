import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mockSetTheme = vi.fn()
vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: mockSetTheme, theme: "light" }),
}))

vi.mock("next/navigation", () => ({
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

import { NavUser } from "@/components/nav-user"
import { SidebarProvider } from "@/components/ui/sidebar"

const user = {
  name: "Jane Smith",
  email: "jane@example.com",
  picture: "https://example.com/avatar.jpg",
}

function renderNavUser(props = {}) {
  return render(
    <SidebarProvider>
      <NavUser user={user} {...props} />
    </SidebarProvider>
  )
}

function openUserDropdown() {
  const trigger = screen.getByText("Jane Smith").closest("button")!
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" })
}

describe("NavUser", () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
  })

  it("renders user name and email", () => {
    renderNavUser()
    expect(screen.getByText("Jane Smith")).toBeInTheDocument()
    expect(screen.getByText("jane@example.com")).toBeInTheDocument()
  })

  it("renders avatar fallback from first letter of name", () => {
    renderNavUser()
    expect(screen.getByText("J")).toBeInTheDocument()
  })

  it("opens dropdown with profile and logout links", () => {
    renderNavUser()
    openUserDropdown()

    const profileLink = screen.getByText("Profile").closest("a")
    expect(profileLink).toHaveAttribute("href", "/dashboard/account/profile")

    const logoutLink = screen.getByText("Log out").closest("a")
    expect(logoutLink).toHaveAttribute("href", "/auth/logout")
  })

  it("shows theme submenu with Light, Dark, System options", () => {
    renderNavUser()
    openUserDropdown()

    expect(screen.getByText("Theme")).toBeInTheDocument()

    // Open the theme submenu - Radix sub-triggers use pointerMove + pointerLeave
    const themeTrigger = screen.getByText("Theme").closest('[role="menuitem"]')!
    fireEvent.pointerMove(themeTrigger, { pointerType: "mouse" })
    fireEvent.click(themeTrigger)

    expect(screen.getByText("Light")).toBeInTheDocument()
    expect(screen.getByText("Dark")).toBeInTheDocument()
    expect(screen.getByText("System")).toBeInTheDocument()
  })

  it("calls setTheme('light') when Light is clicked", () => {
    renderNavUser()
    openUserDropdown()

    const themeTrigger = screen.getByText("Theme").closest('[role="menuitem"]')!
    fireEvent.pointerMove(themeTrigger, { pointerType: "mouse" })
    fireEvent.click(themeTrigger)

    fireEvent.click(screen.getByText("Light"))
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("calls setTheme('dark') when Dark is clicked", () => {
    renderNavUser()
    openUserDropdown()

    const themeTrigger = screen.getByText("Theme").closest('[role="menuitem"]')!
    fireEvent.pointerMove(themeTrigger, { pointerType: "mouse" })
    fireEvent.click(themeTrigger)

    fireEvent.click(screen.getByText("Dark"))
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("calls setTheme('system') when System is clicked", () => {
    renderNavUser()
    openUserDropdown()

    const themeTrigger = screen.getByText("Theme").closest('[role="menuitem"]')!
    fireEvent.pointerMove(themeTrigger, { pointerType: "mouse" })
    fireEvent.click(themeTrigger)

    fireEvent.click(screen.getByText("System"))
    expect(mockSetTheme).toHaveBeenCalledWith("system")
  })
})

import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: vi.fn(), theme: "light" }),
}))

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

function renderWithProvider(ui: React.ReactNode) {
  return render(<SidebarProvider>{ui}</SidebarProvider>)
}

describe("Sidebar components", () => {
  it("renders SidebarProvider", () => {
    const { container } = render(
      <SidebarProvider>
        <div>content</div>
      </SidebarProvider>
    )
    expect(container.querySelector(".group\\/sidebar-wrapper")).toBeInTheDocument()
  })

  it("forwards ref on SidebarProvider", () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <SidebarProvider ref={ref}>
        <div>content</div>
      </SidebarProvider>
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it("renders Sidebar with data-sidebar attribute", () => {
    renderWithProvider(
      <Sidebar>
        <SidebarContent>content</SidebarContent>
      </Sidebar>
    )
    expect(
      document.querySelector('[data-sidebar="sidebar"]')
    ).toBeInTheDocument()
  })

  it("forwards ref on SidebarHeader", () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithProvider(
      <Sidebar>
        <SidebarHeader ref={ref}>header</SidebarHeader>
        <SidebarContent>content</SidebarContent>
      </Sidebar>
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.getAttribute("data-sidebar")).toBe("header")
  })

  it("forwards ref on SidebarContent", () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithProvider(
      <Sidebar>
        <SidebarContent ref={ref}>content</SidebarContent>
      </Sidebar>
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.getAttribute("data-sidebar")).toBe("content")
  })

  it("forwards ref on SidebarFooter", () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithProvider(
      <Sidebar>
        <SidebarContent>content</SidebarContent>
        <SidebarFooter ref={ref}>footer</SidebarFooter>
      </Sidebar>
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.getAttribute("data-sidebar")).toBe("footer")
  })

  it("renders SidebarMenu and SidebarMenuItem", () => {
    const menuItemRef = React.createRef<HTMLLIElement>()
    renderWithProvider(
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem ref={menuItemRef}>
              <SidebarMenuButton>Click me</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    )
    expect(menuItemRef.current).toBeInstanceOf(HTMLLIElement)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("forwards ref on SidebarMenuButton", () => {
    const ref = React.createRef<HTMLButtonElement>()
    renderWithProvider(
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton ref={ref}>btn</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it("renders SidebarGroup and SidebarGroupLabel", () => {
    const groupRef = React.createRef<HTMLDivElement>()
    const labelRef = React.createRef<HTMLDivElement>()
    renderWithProvider(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup ref={groupRef}>
            <SidebarGroupLabel ref={labelRef}>Group Title</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
    expect(groupRef.current).toBeInstanceOf(HTMLDivElement)
    expect(groupRef.current?.getAttribute("data-sidebar")).toBe("group")
    expect(labelRef.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByText("Group Title")).toBeInTheDocument()
  })
})

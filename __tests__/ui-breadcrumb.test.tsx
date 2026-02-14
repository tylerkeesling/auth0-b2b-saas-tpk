import * as React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

describe("Breadcrumb", () => {
  it("renders nav with aria-label", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "breadcrumb"
    )
  })

  it("forwards ref on Breadcrumb", () => {
    const ref = React.createRef<HTMLElement>()
    render(<Breadcrumb ref={ref}>content</Breadcrumb>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
    expect(ref.current?.tagName).toBe("NAV")
  })

  it("forwards ref on BreadcrumbList", () => {
    const ref = React.createRef<HTMLOListElement>()
    render(
      <Breadcrumb>
        <BreadcrumbList ref={ref}>
          <BreadcrumbItem>item</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(ref.current).toBeInstanceOf(HTMLOListElement)
  })

  it("forwards ref on BreadcrumbItem", () => {
    const ref = React.createRef<HTMLLIElement>()
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem ref={ref}>item</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(ref.current).toBeInstanceOf(HTMLLIElement)
  })

  it("forwards ref on BreadcrumbLink", () => {
    const ref = React.createRef<HTMLAnchorElement>()
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink ref={ref} href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
  })

  it("renders BreadcrumbLink with asChild", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <a href="/test">Custom Link</a>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(screen.getByText("Custom Link")).toBeInTheDocument()
  })

  it("renders BreadcrumbPage with aria-current", () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage ref={ref}>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page")
  })
})

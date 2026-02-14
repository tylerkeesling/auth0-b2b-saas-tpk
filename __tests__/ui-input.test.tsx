import * as React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Input } from "@/components/ui/input"

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
  })

  it("forwards ref", () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it("accepts type prop", () => {
    render(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email")
  })

  it("applies custom className", () => {
    render(<Input className="custom-class" placeholder="test" />)
    expect(screen.getByPlaceholderText("test").className).toContain("custom-class")
  })
})

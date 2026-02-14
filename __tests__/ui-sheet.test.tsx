import * as React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
} from "@/components/ui/sheet"

describe("Sheet", () => {
  it("renders SheetContent when open", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>Description</SheetDescription>
          <p>Sheet body</p>
        </SheetContent>
      </Sheet>
    )
    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Description")).toBeInTheDocument()
    expect(screen.getByText("Sheet body")).toBeInTheDocument()
  })

  it("forwards ref on SheetTitle", () => {
    const ref = React.createRef<HTMLHeadingElement>()
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle ref={ref}>Title</SheetTitle>
          <SheetDescription>desc</SheetDescription>
        </SheetContent>
      </Sheet>
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it("forwards ref on SheetDescription", () => {
    const ref = React.createRef<HTMLParagraphElement>()
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription ref={ref}>desc</SheetDescription>
        </SheetContent>
      </Sheet>
    )
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it("renders close button in SheetContent", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Title</SheetTitle>
          <SheetDescription>desc</SheetDescription>
        </SheetContent>
      </Sheet>
    )
    expect(screen.getByText("Close")).toBeInTheDocument()
  })
})

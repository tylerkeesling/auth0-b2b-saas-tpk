import * as React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from '@/components/ui/separator'

describe('Separator', () => {
  it('renders a separator', () => {
    const { container } = render(<Separator />)
    const sep = container.querySelector('[data-orientation]')
    expect(sep).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Separator ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('applies horizontal orientation by default', () => {
    const { container } = render(<Separator />)
    const sep = container.querySelector('[data-orientation="horizontal"]')
    expect(sep).toBeInTheDocument()
    expect(sep?.className).toContain('h-[1px]')
    expect(sep?.className).toContain('w-full')
  })

  it('applies vertical orientation', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const sep = container.querySelector('[data-orientation="vertical"]')
    expect(sep).toBeInTheDocument()
    expect(sep?.className).toContain('h-full')
    expect(sep?.className).toContain('w-[1px]')
  })
})

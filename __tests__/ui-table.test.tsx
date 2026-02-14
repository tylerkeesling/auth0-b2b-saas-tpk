import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function renderFullTable() {
  return render(
    <Table>
      <TableCaption>A test table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Item 1</TableCell>
          <TableCell>100</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>100</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

describe('Table', () => {
  it('renders full table structure', () => {
    renderFullTable()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('A test table')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('forwards ref on Table', () => {
    const ref = React.createRef<HTMLTableElement>()
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableElement)
  })

  it('forwards ref on TableHeader', () => {
    const ref = React.createRef<HTMLTableSectionElement>()
    render(
      <Table>
        <TableHeader ref={ref}>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    expect(ref.current?.tagName).toBe('THEAD')
  })

  it('forwards ref on TableBody', () => {
    const ref = React.createRef<HTMLTableSectionElement>()
    render(
      <Table>
        <TableBody ref={ref}>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    expect(ref.current?.tagName).toBe('TBODY')
  })

  it('forwards ref on TableRow', () => {
    const ref = React.createRef<HTMLTableRowElement>()
    render(
      <Table>
        <TableBody>
          <TableRow ref={ref}>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableRowElement)
  })

  it('forwards ref on TableHead', () => {
    const ref = React.createRef<HTMLTableCellElement>()
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead ref={ref}>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableCellElement)
    expect(ref.current?.tagName).toBe('TH')
  })

  it('forwards ref on TableCell', () => {
    const ref = React.createRef<HTMLTableCellElement>()
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell ref={ref}>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableCellElement)
    expect(ref.current?.tagName).toBe('TD')
  })

  it('forwards ref on TableFooter', () => {
    const ref = React.createRef<HTMLTableSectionElement>()
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter ref={ref}>
          <TableRow>
            <TableCell>f</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement)
    expect(ref.current?.tagName).toBe('TFOOT')
  })

  it('forwards ref on TableCaption', () => {
    const ref = React.createRef<HTMLTableCaptionElement>()
    render(
      <Table>
        <TableCaption ref={ref}>cap</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(ref.current).toBeInstanceOf(HTMLTableCaptionElement)
  })
})

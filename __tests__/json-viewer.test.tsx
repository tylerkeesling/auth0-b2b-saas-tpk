import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import JsonViewer from '@/components/json-viewer'

vi.mock('react-syntax-highlighter', () => ({
  Light: Object.assign(
    ({ children, language, wrapLongLines }: any) => (
      <pre
        data-testid="syntax-highlighter"
        data-language={language}
        data-wrap={wrapLongLines}
      >
        {children}
      </pre>
    ),
    { registerLanguage: vi.fn() }
  ),
}))
vi.mock('react-syntax-highlighter/dist/esm/languages/hljs/json', () => ({
  default: {},
}))
vi.mock('react-syntax-highlighter/dist/esm/styles/hljs/monokai', () => ({
  default: {},
}))

describe('JsonViewer', () => {
  it('renders with object data', () => {
    render(<JsonViewer data={{ key: 'value' }} />)
    const el = screen.getByTestId('syntax-highlighter')
    expect(el).toHaveTextContent('"key": "value"')
  })

  it('renders with array data', () => {
    render(<JsonViewer data={[1, 2, 3]} />)
    const el = screen.getByTestId('syntax-highlighter')
    expect(el).toHaveTextContent('[')
    expect(el).toHaveTextContent('1')
  })

  it('renders with null data', () => {
    render(<JsonViewer data={null} />)
    const el = screen.getByTestId('syntax-highlighter')
    expect(el).toHaveTextContent('null')
  })

  it('passes correct props to SyntaxHighlighter', () => {
    render(<JsonViewer data={{ a: 1 }} />)
    const el = screen.getByTestId('syntax-highlighter')
    expect(el).toHaveAttribute('data-language', 'json')
    expect(el).toHaveAttribute('data-wrap', 'true')
  })
})

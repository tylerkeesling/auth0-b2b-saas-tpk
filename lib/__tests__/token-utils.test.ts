import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { decodeToken } from '@/lib/token-utils'

// Helper to create a valid JWT (header.payload.signature)
function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fake-signature`
}

describe('decodeToken', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns success with decoded payload for a valid JWT', () => {
    const payload = { sub: '1234567890', name: 'John Doe', iat: 1516239022 }
    const token = createJwt(payload)

    const result = decodeToken(token)

    expect(result).toEqual({ success: true, payload })
  })

  it('returns error for a malformed token', () => {
    const result = decodeToken('not-a-jwt')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('opaque or malformed')
      expect(result.error).toContain('community.auth0.com')
    }
  })

  it('returns error for an opaque token', () => {
    const result = decodeToken('dGhpcyBpcyBhbiBvcGFxdWUgdG9rZW4')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('opaque or malformed')
    }
  })
})

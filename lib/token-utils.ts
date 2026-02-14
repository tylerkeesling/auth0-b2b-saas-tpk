import { jwtDecode } from 'jwt-decode'

export type TokenDecodeResult =
  | { success: true; payload: Record<string, unknown> }
  | { success: false; error: string }

export function decodeToken(token: string): TokenDecodeResult {
  try {
    const jwtPayload = jwtDecode<Record<string, unknown>>(token)
    return { success: true, payload: jwtPayload }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error:
        'The token is opaque or malformed. Please refer to https://community.auth0.com/t/why-is-my-access-token-not-a-jwt-opaque-token/31028',
    }
  }
}

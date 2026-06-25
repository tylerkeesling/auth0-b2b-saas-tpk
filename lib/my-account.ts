// --- Factors ---

export type FactorUsage = 'primary' | 'secondary'

export interface Factor {
  type: string
  usage: FactorUsage[]
}

export interface ListFactorsResponse {
  factors: Factor[]
}

export interface ListAuthenticationMethodsResponse {
  authentication_methods: AuthenticationMethod[]
}

// --- Authentication Methods ---

export type AuthenticationMethodType =
  | 'passkey'
  | 'password'
  | 'email'
  | 'totp'
  | 'push-notification'
  | 'recovery-code'
  | 'phone'
  | 'webauthn-roaming'
  | 'webauthn-platform'

export interface AuthenticationMethod {
  id: string
  type: AuthenticationMethodType
  created_at: string
  identity_user_id: string
  usage: FactorUsage[]

  // common optional
  confirmed?: boolean
  last_auth_at?: string
  name?: string

  // passkey
  credential_backed_up?: boolean
  credential_device_type?: string
  key_id?: string
  public_key?: string
  user_handle?: string
  transports?: string[]
  user_agent?: string
  relying_party_id?: string

  // email
  email?: string

  // phone
  phone_number?: string
  preferred_authentication_method?: 'sms' | 'voice'
}

// --- Create request — discriminated union by type ---

type CreateOtpRequest = { type: 'totp' }
type CreatePhoneRequest = {
  type: 'phone'
  phone_number: string
  preferred_authentication_method: 'sms' | 'voice'
}
type CreateEmailRequest = { type: 'email' }
type CreatePushRequest = { type: 'push-notification' }
type CreateWebAuthnRoamingRequest = { type: 'webauthn-roaming' }
type CreateWebAuthnPlatformRequest = { type: 'webauthn-platform' }
type CreatePasskeyRequest = {
  type: 'passkey'
  connection: string
  identity_user_id: string
}

export type CreateAuthenticationMethodRequest =
  | CreateOtpRequest
  | CreatePhoneRequest
  | CreateEmailRequest
  | CreatePushRequest
  | CreateWebAuthnRoamingRequest
  | CreateWebAuthnPlatformRequest
  | CreatePasskeyRequest

// --- WebAuthn types (W3C spec, JSON-serialized form) ---

export interface WebAuthnCreationOptions {
  rp: { id: string; name: string }
  user: { id: string; name: string; displayName: string }
  challenge: string // base64url-encoded
  pubKeyCredParams: Array<{ type: 'public-key'; alg: number }>
  timeout?: number
  excludeCredentials?: Array<{
    type: 'public-key'
    id: string // base64url-encoded
    transports?: ('usb' | 'nfc' | 'ble' | 'internal' | 'hybrid')[]
  }>
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform'
    requireResidentKey?: boolean
    residentKey?: 'discouraged' | 'preferred' | 'required'
    userVerification?: 'discouraged' | 'preferred' | 'required'
  }
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise'
}

// --- Create response — discriminated union by type ---

interface EnrollmentBase {
  id: string
  type: string
}

export interface OtpEnrollment extends EnrollmentBase {
  type: 'totp'
  totp_uri: string
  barcode_uri: string
}

export interface PhoneEnrollment extends EnrollmentBase {
  type: 'phone'
  auth_session: string
}

export interface EmailEnrollment extends EnrollmentBase {
  type: 'email'
  auth_session: string
}

export interface PushEnrollment extends EnrollmentBase {
  type: 'push-notification'
  barcode_uri: string
}

export interface WebAuthnEnrollment extends EnrollmentBase {
  type: 'webauthn-roaming' | 'webauthn-platform'
  authn_params_public_key: WebAuthnCreationOptions
}

export interface PasskeyEnrollment {
  auth_session: string
  authn_params_public_key: WebAuthnCreationOptions
}

export type CreateAuthenticationMethodResponse =
  | OtpEnrollment
  | PhoneEnrollment
  | EmailEnrollment
  | PushEnrollment
  | WebAuthnEnrollment
  | PasskeyEnrollment

// --- Enrollment UI state ---

export type EnrollmentState =
  | { step: 'idle' }
  | { step: 'input'; factorType: string }
  | {
      step: 'verifying'
      factorType: string
      enrollmentId: string
      data: CreateAuthenticationMethodResponse
    }
  | { step: 'submitting' }

export interface VerifyAuthenticationMethodRequest {
  otp_code?: string
  auth_session?: string
  authn_response?: {
    id: string
    rawId: string
    response: {
      attestationObject: string
      clientDataJSON: string
    }
    type: 'public-key'
  }
}

export interface UpdateAuthenticationMethodRequest {
  name?: string
  [key: string]: unknown
}

// --- Error ---

export class MyAccountApiError extends Error {
  statusCode: number
  body: unknown
  log: RequestLog

  constructor(statusCode: number, body: unknown, log: RequestLog) {
    super(`My Account API error: ${statusCode}`)
    this.statusCode = statusCode
    this.body = body
    this.log = log
  }
}

// --- Request log ---

export interface RequestLog {
  method: string
  path: string
  scope: string
  requestBody?: unknown
  status: number
  responseBody: unknown
  durationMs: number
  timestamp: string
}

// --- Internal request helper ---

async function request<T>(
  path: string,
  scope: string,
  options?: { method?: string; body?: unknown }
): Promise<{ data: T; log: RequestLog }> {
  const method = options?.method ?? 'GET'
  const headers: Record<string, string> = { scope }
  if (options?.body) {
    headers['content-type'] = 'application/json'
  }

  const timestamp = new Date().toISOString()
  const start = performance.now()

  console.group(`[my-account] ${method} ${path}`)
  console.log('scope:', scope)
  if (options?.body) console.log('body:', options.body)

  const res = await fetch(path, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  const durationMs = Math.round(performance.now() - start)

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const log: RequestLog = {
      method,
      path,
      scope,
      requestBody: options?.body,
      status: res.status,
      responseBody: body,
      durationMs,
      timestamp,
    }
    console.error(`${res.status} (${durationMs}ms)`, body)
    console.groupEnd()
    throw new MyAccountApiError(res.status, body, log)
  }

  const text = await res.text()
  const responseBody = text ? JSON.parse(text) : null
  const log: RequestLog = {
    method,
    path,
    scope,
    requestBody: options?.body,
    status: res.status,
    responseBody,
    durationMs,
    timestamp,
  }

  console.log(`${res.status} (${durationMs}ms)`, responseBody)
  console.groupEnd()

  return { data: (responseBody ?? undefined) as T, log }
}

// --- Connected Accounts ---

export interface ConnectedAccountConnection {
  name: string
  strategy: string
  scopes?: string[]
}

export interface ListConnectedAccountConnectionsResponse {
  connections: ConnectedAccountConnection[]
  next?: string
}

export interface ConnectedAccount {
  id: string
  connection: string
  access_type: string
  scopes?: string[]
  created_at: string
  expires_at?: string
}

export interface ListConnectedAccountsResponse {
  accounts: ConnectedAccount[]
  next?: string
}

export interface CreateConnectedAccountRequest {
  connection: string
  redirect_uri: string
  state?: string
}

export interface CreateConnectedAccountResponse {
  connect_uri: string
  auth_session: string
  connect_params: { ticket: string }
  expires_in: number
}

// --- Client ---

export const myAccount = {
  factors: {
    list: () =>
      request<ListFactorsResponse>('/me/v1/factors', 'read:me:factors'),
  },

  authenticationMethods: {
    list: () =>
      request<ListAuthenticationMethodsResponse>(
        '/me/v1/authentication-methods',
        'read:me:authentication_methods'
      ),

    create: (body: CreateAuthenticationMethodRequest) =>
      request<CreateAuthenticationMethodResponse>(
        '/me/v1/authentication-methods',
        'create:me:authentication_methods',
        { method: 'POST', body }
      ),

    get: (id: string) =>
      request<AuthenticationMethod>(
        `/me/v1/authentication-methods/${id}`,
        'read:me:authentication_methods'
      ),

    delete: (id: string) =>
      request<void>(
        `/me/v1/authentication-methods/${id}`,
        'delete:me:authentication_methods',
        { method: 'DELETE' }
      ),

    update: (id: string, body: UpdateAuthenticationMethodRequest) =>
      request<AuthenticationMethod>(
        `/me/v1/authentication-methods/${id}`,
        'read:me:authentication_methods',
        { method: 'PATCH', body }
      ),

    verify: (id: string, body: VerifyAuthenticationMethodRequest) =>
      request<AuthenticationMethod>(
        `/me/v1/authentication-methods/${id}/verify`,
        'create:me:authentication_methods',
        { method: 'POST', body }
      ),
  },

  connectedAccounts: {
    connections: {
      list: () =>
        request<ListConnectedAccountConnectionsResponse>(
          '/me/v1/connected-accounts/connections',
          'read:me:connected_accounts'
        ),
    },

    list: () =>
      request<ListConnectedAccountsResponse>(
        '/me/v1/connected-accounts/accounts',
        'read:me:connected_accounts'
      ),

    create: (body: CreateConnectedAccountRequest) =>
      request<CreateConnectedAccountResponse>(
        '/me/v1/connected-accounts/connect',
        'create:me:connected_accounts',
        { method: 'POST', body }
      ),

    delete: (id: string) =>
      request<void>(
        `/me/v1/connected-accounts/accounts/${id}`,
        'delete:me:connected_accounts',
        { method: 'DELETE' }
      ),
  },
}

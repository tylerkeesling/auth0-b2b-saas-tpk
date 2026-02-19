# MFA Migration Analysis: Management API → MyAccount API

## 1. Current Architecture

### Server Component (`page.tsx`)

The MFA page is a server component that makes **4 Management API calls** on every page load:

| Call | Purpose | SDK Method |
|------|---------|------------|
| List tenant factors | Get globally enabled MFA factor types | `managementClient.guardian.factors.list()` |
| List user enrollments | Get the current user's enrolled methods | `managementClient.users.authenticationMethods.list(userId)` |
| Get user metadata | Read `preferred_mfa_method` from `user_metadata` | `managementClient.users.get(userId, { fields: 'user_metadata' })` |
| Get organization | Read org `metadata.mfaPolicy` for enabled providers | `managementClient.organizations.get(org_id)` |

The server component then merges these into a `filteredFactors` array with `{ name, tenantEnabled, orgEnabled, enrollmentId }` per factor and passes it to the client component along with `preferredMethod`.

### Server Actions (`actions.ts`)

Three server actions, all using Management API:

| Action | Management API Calls |
|--------|---------------------|
| `createEnrollment` | `managementClient.guardian.enrollments.createTicket({ user_id, factor, allow_multiple_enrollments })` — returns a `ticket_url` |
| `deleteEnrollment` | `managementClient.users.authenticationMethods.delete(userId, enrollmentId)` + conditional `users.get` + `users.update` to clear preferred method |
| `setPreferredMethod` | `managementClient.users.update(userId, { user_metadata: { preferred_mfa_method } })` |

### Client Component (`mfa-factors-section.tsx`)

The enrollment flow uses a **popup window** pattern:
1. User clicks "Enroll" → server action creates a Guardian enrollment ticket
2. `ticket_url` is returned to the client
3. Client opens a popup window pointing at the Guardian-hosted enrollment page
4. A 200ms interval polls `window.closed`, then calls `router.refresh()` on close

This is the UX we want to replace — the Guardian popup is an external UI with no styling control and a disjointed experience.

### Supporting Types (`lib/mfa-policy.ts`)

```
SUPPORTED_PROVIDERS = ['sms', 'email', 'otp', 'push-notification', 'webauthn-roaming', 'webauthn-platform']
```

The org MFA policy stores a `providers` array in org metadata, used to filter which factors a user sees.

---

## 2. MyAccount API Capabilities

### Already Configured

The BFF proxy is already set up. `lib/auth0.ts` configures the `appClient` with scopes for the MyAccount API:

```
scope: {
  [`https://${DOMAIN}/me/`]:
    "openid email profile offline_access read:me:authentication_methods remove:me:authentication_methods create:me:authentication_methods"
}
```

The `appClient.middleware()` in `proxy.ts` intercepts `/me/*` requests and forwards them to Auth0 with DPoP authentication.

### Client Library (`lib/my-account.ts`)

A browser-side client with these operations:

| Operation | Method | Scope |
|-----------|--------|-------|
| List factors | `myAccount.factors.list()` | `read:me:factors` |
| List enrollments | `myAccount.authenticationMethods.list()` | `read:me:authentication_methods` |
| Create enrollment | `myAccount.authenticationMethods.create(body)` | `create:me:authentication_methods` |
| Get enrollment | `myAccount.authenticationMethods.get(id)` | `read:me:authentication_methods` |
| Delete enrollment | `myAccount.authenticationMethods.delete(id)` | `remove:me:authentication_methods` |
| Update enrollment | `myAccount.authenticationMethods.update(id, body)` | `read:me:authentication_methods` |
| Verify enrollment | `myAccount.authenticationMethods.verify(id, body)` | `create:me:authentication_methods` |

### Enrollment Flow (Create → Verify)

The MyAccount API uses a two-step enrollment:
1. **Create** — `POST /me/v1/authentication-methods` with `{ type }` → returns factor-specific challenge data (TOTP URI, OTP binding, or WebAuthn creation options) plus an `auth_session` token
2. **Verify** — `POST /me/v1/authentication-methods/{id}/verify` with `{ auth_session, otp }` or `{ auth_session, authn_response }` → confirms enrollment

This replaces the Guardian ticket + popup pattern with an entirely in-app flow.

### Scope Gap

The `appClient` scopes currently include `read:me:authentication_methods`, `remove:me:authentication_methods`, and `create:me:authentication_methods`. Note that `read:me:factors` is **not currently requested** — this scope needs to be added to use `myAccount.factors.list()`.

---

## 3. Migration Path Per Factor Type

### TOTP (One-time Password / `otp`)

**Current:** Guardian popup shows a QR code, user scans with authenticator app, enters code in the popup.

**MyAccount flow:**
1. `myAccount.authenticationMethods.create({ type: 'totp' })`
2. Response includes `totp_uri` and `barcode_uri` (base64 QR code image)
3. Render the QR code inline in the app
4. User enters the 6-digit code from their authenticator
5. `myAccount.authenticationMethods.verify(id, { auth_session, otp: code })`

**Complexity:** Low. Straightforward two-step with OTP verification. The QR code can be displayed using a simple `<img>` with the `barcode_uri`.

### SMS (`sms`)

**Current:** Guardian popup collects phone number, sends SMS, user enters code in popup.

**MyAccount flow:**
1. `myAccount.authenticationMethods.create({ type: 'phone', phone_number: '+1...' })`
2. Auth0 sends an OTP to the phone number
3. Render an OTP input in the app
4. `myAccount.authenticationMethods.verify(id, { auth_session, otp: code })`

**Complexity:** Low-medium. Need a phone number input UI (with country code picker) that doesn't exist today. The factor name mapping (`sms` → `phone`) matches the existing mapping in `page.tsx:58`.

### Email (`email`)

**Current:** Guardian popup sends email with code, user enters code in popup.

**MyAccount flow:**
1. `myAccount.authenticationMethods.create({ type: 'email' })`
2. Auth0 sends an OTP to the user's email
3. Render an OTP input
4. `myAccount.authenticationMethods.verify(id, { auth_session, otp: code })`

**Complexity:** Low. Nearly identical to SMS but without needing a phone number input.

### Push Notification (`push-notification`)

**Current:** Guardian popup shows QR code to link the Auth0 Guardian app, user scans and confirms.

**MyAccount flow:**
1. `myAccount.authenticationMethods.create({ type: 'guardian' })`
2. Response includes data for linking the Guardian app (likely a `barcode_uri`)
3. Display QR code for Guardian app scanning
4. Verification may be automatic (push confirmation) or require `verify` call

**Complexity:** Medium. The push notification factor is tied to the Guardian app. The enrollment itself (scanning a QR to link the app) can be done inline, but the verification pattern is less documented. The factor name mapping (`push-notification` → `guardian`) already exists in the current code.

### WebAuthn — Roaming (`webauthn-roaming`) and Platform (`webauthn-platform`)

**Current:** Guardian popup triggers the WebAuthn browser ceremony.

**MyAccount flow:**
1. `myAccount.authenticationMethods.create({ type: 'webauthn-roaming' | 'webauthn-platform' })`
2. Response includes WebAuthn `publicKeyCredentialCreationOptions`
3. Call `navigator.credentials.create({ publicKey: creationOptions })` — browser triggers the platform/roaming ceremony (fingerprint, security key, etc.)
4. Extract attestation from the credential response
5. `myAccount.authenticationMethods.verify(id, { auth_session, authn_response: { id, rawId, response: { attestationObject, clientDataJSON }, type: 'public-key' } })`

**Complexity:** Medium-high. This is the most complex factor because:

- **Browser API integration:** Must call `navigator.credentials.create()` with the exact options from the create response, and serialize the response correctly (ArrayBuffer → base64url encoding)
- **Platform support detection:** Should check `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` for platform authenticators and `PublicKeyCredential.isConditionalMediationAvailable()` for roaming
- **Encoding:** The `rawId` and attestation fields are ArrayBuffers that need base64url encoding before sending to the verify endpoint
- **Error handling:** Browser ceremonies can fail (user cancellation, no authenticator available, timeout), each needing specific handling
- **The verify request shape is already typed** in `lib/my-account.ts` as `VerifyAuthenticationMethodRequest.authn_response` — this confirms the API expects the standard WebAuthn `AuthenticatorAttestationResponse` fields

The verify type definition in `my-account.ts` shows the exact shape:
```typescript
authn_response?: {
  id: string
  rawId: string
  response: {
    attestationObject: string
    clientDataJSON: string
  }
  type: 'public-key'
}
```

---

## 4. What Stays on Management API vs What Moves

### Moves to MyAccount API (client-side)

| Operation | Current | New |
|-----------|---------|-----|
| List available factors | `managementClient.guardian.factors.list()` | `myAccount.factors.list()` |
| List user enrollments | `managementClient.users.authenticationMethods.list(userId)` | `myAccount.authenticationMethods.list()` |
| Create enrollment | `managementClient.guardian.enrollments.createTicket()` + popup | `myAccount.authenticationMethods.create()` + `.verify()` |
| Delete enrollment | `managementClient.users.authenticationMethods.delete()` | `myAccount.authenticationMethods.delete(id)` |

### Stays on Management API (server-side)

| Operation | Reason |
|-----------|--------|
| Get org metadata (`managementClient.organizations.get`) | MyAccount API is user-scoped, not org-scoped. Org MFA policy is admin data stored in org metadata. |
| Preferred method read/write (`managementClient.users.get/update` for `user_metadata`) | MyAccount API has no concept of "preferred MFA method" — this is a custom `user_metadata` field. The MyAccount profile API could potentially be used if it exposes `user_metadata`, but that needs investigation. Alternatively, preferred method could be moved to a client-side cookie or local storage if it's purely a UI preference. |

### Eliminated Entirely

| What | Why |
|------|-----|
| Guardian enrollment tickets | Replaced by create/verify flow |
| Popup window (`openPopupWindow`) | Enrollment happens inline |
| Popup close polling (`setInterval`) | No popup to monitor |

---

## 5. Architectural Changes

### Before (current)

```
[Server Component] --Management API--> Auth0
        |
        v
[Client Component] --server action--> [Server Action] --Management API--> Auth0
        |
        v
   [Popup Window] --Guardian hosted UI--> Auth0 Guardian
```

### After (target)

```
[Client Component] --fetch /me/v1/*--> [BFF Proxy] --DPoP--> Auth0 MyAccount API
        |
[Server Component] --Management API--> Auth0 (org metadata only)
```

The page becomes primarily client-driven:
- **`page.tsx`** reduces to fetching org MFA policy (1 Management API call) and passing it as a prop. Factors, enrollments, and enrollment management all move client-side.
- **`actions.ts`** loses `createEnrollment` and `deleteEnrollment`. `setPreferredMethod` stays as a server action (or moves to a different storage mechanism).
- **`mfa-factors-section.tsx`** gains inline enrollment UI: OTP inputs, QR code displays, WebAuthn ceremony triggers. The popup code is deleted.

### New Scope Required

Add `read:me:factors` to the appClient scope configuration in `lib/auth0.ts`:

```
scope: {
  [`https://${DOMAIN}/me/`]:
    "openid email profile offline_access read:me:factors read:me:authentication_methods remove:me:authentication_methods create:me:authentication_methods"
}
```

---

## 6. Implementation Order (Suggested)

1. **Add `read:me:factors` scope** to `lib/auth0.ts`
2. **TOTP enrollment** — simplest create/verify flow, good proof of concept
3. **Email enrollment** — similar to TOTP but with OTP-over-email
4. **SMS enrollment** — requires phone number input UI
5. **WebAuthn (roaming + platform)** — most complex, requires browser API integration
6. **Push notification** — depends on Guardian app behavior with MyAccount API
7. **Delete enrollment** — straightforward swap from server action to client call
8. **Refactor page.tsx** — remove server-side Management API calls for factors/enrollments, keep org metadata call
9. **Clean up** — remove `openPopupWindow`, Guardian ticket code, unused server actions

---

## 7. Open Questions

1. **Preferred method storage:** Does the MyAccount profile API expose `user_metadata`? If so, preferred method could move off the Management API entirely. If not, options are: keep the server action, move to local storage, or store it in the session.

ANSWER: The MyAccount Profile API doesn't exist yet. We still must use the Management API to get the user's user_metadata to get their preferred MFA factor.

2. **Push notification verify flow:** Does the Guardian app enrollment via MyAccount API work the same as via tickets? Need to test whether `create({ type: 'guardian' })` returns a scannable barcode.
3. **WebAuthn credential options format:** Does the MyAccount API return standard `PublicKeyCredentialCreationOptions` directly, or a serialized form that needs parsing? The base64url encoding of ArrayBuffers in the response needs testing.
4. **Error mapping:** The MyAccount API returns `MyAccountApiError` with status codes. Need to map these to user-friendly messages (e.g., 409 = already enrolled, 400 = invalid OTP).
5. **Factor name mapping:** The current code maps between different naming conventions (`sms`↔`phone`, `push-notification`↔`guardian`). Need to confirm what type strings the MyAccount API expects vs what `factors.list()` returns.

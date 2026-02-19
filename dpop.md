DPoP (Demonstrating Proof-of-Possession)
DPoP is an OAuth 2.0 extension that enhances security by binding access tokens to a client's private key. This prevents token theft and replay attacks by requiring cryptographic proof that the client possessing the token also possesses the private key used to request it.

What is DPoP?
DPoP (Demonstrating Proof-of-Possession) provides application-level proof-of-possession security for OAuth 2.0. Key benefits include:

Token Binding: Access tokens are cryptographically bound to the client's key pair
Theft Protection: Stolen tokens cannot be used without the corresponding private key
Replay Attack Prevention: Each request includes a unique proof-of-possession signature
Enhanced Security: Complements OAuth 2.0 with additional cryptographic guarantees
Basic DPoP Setup
Choose one of three setup methods based on your deployment strategy:

1. Enable DPoP with Generated Keys
For dynamic key generation during application startup:

import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { generateKeyPair } from "oauth4webapi";

// Generate ES256 key pair for DPoP - use this for development or dynamic environments
const dpopKeyPair = await generateKeyPair("ES256");

export const auth0 = new Auth0Client({
  useDPoP: true,
  dpopKeyPair
});
2. Enable DPoP with Environment Variables
For production deployments with pre-generated keys:

# .env.local - Store your actual key values here
AUTH0_DPOP_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----"

AUTH0_DPOP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQ...
-----END PRIVATE KEY-----"
import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Auth0 client automatically loads keys from environment variables
export const auth0 = new Auth0Client({
  useDPoP: true
  // Keys loaded automatically from AUTH0_DPOP_* environment variables
});
3. Generate DPoP Keys Using the SDK
For generating keys and exporting them to environment variables:

import { generateDpopKeyPair } from "@auth0/nextjs-auth0/server";
import { exportPKCS8, exportSPKI } from "jose";

// Generate new key pair and export for environment variables
const keyPair = await generateDpopKeyPair();
const publicKeyPem = await exportSPKI(keyPair.publicKey);
const privateKeyPem = await exportPKCS8(keyPair.privateKey);

// Copy these values to your .env.local file
console.log("AUTH0_DPOP_PUBLIC_KEY=" + publicKeyPem);
console.log("AUTH0_DPOP_PRIVATE_KEY=" + privateKeyPem);
Making DPoP-Protected Requests
The recommended approach is to use the createFetcher method, which handles all DPoP complexity automatically.

DPoP Inheritance Behavior
Global Configuration Inheritance

When you enable DPoP globally in your Auth0Client, all fetchers automatically inherit this setting:

// lib/auth0.ts - Global DPoP configuration
export const auth0 = new Auth0Client({
  useDPoP: true, // Enable DPoP globally
  dpopKeyPair // Your key pair
});

// Fetchers inherit DPoP settings automatically
const fetcher = await auth0.createFetcher(req, {
  baseUrl: "https://api.example.com"
  // No need to specify useDPoP: true - inherited from global config
});
Per-Fetcher Override

You can override the global DPoP setting for specific fetchers when needed:

// Explicitly enable DPoP (when global setting is false)
const dpopFetcher = await auth0.createFetcher(req, {
  baseUrl: "https://secure-api.example.com",
  useDPoP: true // Override global setting
});

// Explicitly disable DPoP (when global setting is true)
const legacyFetcher = await auth0.createFetcher(req, {
  baseUrl: "https://legacy-api.example.com",
  useDPoP: false // Override global setting for legacy API
});
Fallback Behavior

The DPoP configuration follows this precedence order:

Explicit fetcher option: options.useDPoP (when specified)
Global Auth0Client setting: auth0.useDPoP (when fetcher option not specified)
Default: false (when neither is configured)
This inheritance pattern aligns with auth0-spa-js behavior, providing consistent developer experience across Auth0 SDKs.

Using the Fetcher (Recommended)
App Router Example - Server Components and Route Handlers:

import { auth0 } from "@/lib/auth0";

// Route Handler: app/api/data/route.ts
export async function GET() {
  // Create fetcher - DPoP inherited from global Auth0Client configuration
  const fetcher = await auth0.createFetcher(undefined, {
    baseUrl: "https://api.example.com"
    // useDPoP is inherited from global auth0 config
  });

  // Make authenticated request - DPoP proof generated automatically if enabled globally
  const response = await fetcher.fetchWithAuth("/protected-resource", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  return Response.json(data);
}
Pages Router Example - API Routes and getServerSideProps:

// API Route: pages/api/data.js
export default async function handler(req, res) {
  // Create fetcher with explicit DPoP override for legacy API compatibility
  const fetcher = await auth0.createFetcher(req, {
    baseUrl: "https://api.example.com",
    useDPoP: false // Explicitly disable DPoP for this legacy API
  });

  try {
    // fetchWithAuth handles access token retrieval (without DPoP)
    const response = await fetcher.fetchWithAuth("/protected-data");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
DPoP Configuration Options
Fine-tune DPoP behavior for your environment and security requirements.

Clock Tolerance and Skew
Configure timing validation to handle clock differences between client and server:

export const auth0 = new Auth0Client({
  useDPoP: true,
  dpopOptions: {
    // Clock tolerance: Allow up to 60 seconds difference between client/server clocks
    clockTolerance: 60,

    // Clock skew: Adjust if your server clock is consistently ahead/behind (rare)
    clockSkew: 0,

    // Retry configuration: Control behavior when DPoP nonce errors occur
    retry: {
      delay: 200, // Wait 200ms before retry (prevents server overload)
      jitter: true // Add randomness to prevent thundering herd effect
    }
  }
});
Environment Variable Configuration
Configure DPoP settings through environment variables for easier deployment:

# .env.local
# === Required: DPoP Keys ===
AUTH0_DPOP_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
AUTH0_DPOP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# === Optional: Timing Configuration ===
AUTH0_DPOP_CLOCK_SKEW=0           # Default: 0 (no adjustment)
AUTH0_DPOP_CLOCK_TOLERANCE=30     # Default: 30 seconds

# === Optional: Retry Configuration ===
AUTH0_RETRY_DELAY=100             # Default: 100ms delay before retry
AUTH0_RETRY_JITTER=true           # Default: true (add randomness)
Error Handling
Handle DPoP-specific errors gracefully with proper error detection and response strategies.

Handling DPoP Errors
Implement comprehensive error handling for DPoP configuration and runtime issues:

import { DPoPError, DPoPErrorCode } from "@auth0/nextjs-auth0/errors";

import { auth0 } from "@/lib/auth0";

try {
  const fetcher = await auth0.createFetcher(req, {
    baseUrl: "https://api.example.com",
    useDPoP: true
  });

  const response = await fetcher.fetchWithAuth("/protected-resource");
  const data = await response.json();

  return Response.json(data);
} catch (error) {
  // Check for DPoP-specific errors first
  if (error instanceof DPoPError) {
    console.error(`DPoP Error [${error.code}]:`, error.message);

    // Handle specific DPoP error types
    switch (error.code) {
      case DPoPErrorCode.DPOP_KEY_EXPORT_FAILED:
        // Key configuration problem - check environment variables
        return Response.json(
          { error: "DPoP key configuration error" },
          { status: 500 }
        );
      case DPoPErrorCode.DPOP_JKT_CALCULATION_FAILED:
        // Key thumbprint calculation failed - possible key corruption
        return Response.json(
          { error: "DPoP thumbprint calculation failed" },
          { status: 500 }
        );
      default:
        return Response.json(
          { error: "DPoP configuration error" },
          { status: 500 }
        );
    }
  }

  // Handle non-DPoP errors (network, API errors, etc.)
  return Response.json({ error: "Request failed" }, { status: 500 });
}
Automatic Nonce Error Retry
The SDK automatically handles DPoP nonce errors with intelligent retry logic:

// The fetcher automatically retries DPoP nonce errors - no manual handling needed
const response = await fetcher.fetchWithAuth("/api/endpoint");

// Retry flow (handled internally):
// 1. First request → DPoP nonce error (401 with use_dpop_nonce header)
// 2. SDK extracts new nonce from error response
// 3. SDK waits configured delay (with optional jitter)
// 4. SDK retries request with updated nonce
// 5. Success or final failure
Advanced Usage
Custom Access Token Factory
Override the default token retrieval with custom logic for specific use cases:

const fetcher = await auth0.createFetcher(req, {
  baseUrl: "https://api.example.com",
  useDPoP: true,
  // Custom access token factory - useful for special scopes or audiences
  getAccessToken: async (options) => {
    // Add custom logic: token caching, audience-specific tokens, etc.
    const accessToken = await auth0.getAccessToken(req, {
      ...options,
      audience: "https://special-api.example.com",
      scope: "admin:read admin:write"
    });
    return accessToken.token;
  }
});
Custom Access Token Scopes with DPoP
Pass token options directly to individual requests:

// Specify audience and scope per request
const response = await fetcher.fetchWithAuth("/protected-resource", {
  scope: "read:admin write:admin", // Request specific scopes
  audience: "https://api.example.com", // Target specific API
  refresh: true // Force token refresh if needed
});
Conditional DPoP Usage
Enable DPoP selectively based on environment or security requirements:

// Dynamic DPoP configuration based on environment or route sensitivity
const shouldUseDPoP =
  process.env.NODE_ENV === "production" ||
  request.url.includes("/sensitive-api");

const fetcher = await auth0.createFetcher(req, {
  baseUrl: "https://api.example.com",
  useDPoP: shouldUseDPoP // DPoP only for production or sensitive routes
});
Custom Fetch with DPoP
Add logging, metrics, or custom headers while preserving DPoP functionality:

const fetcher = await auth0.createFetcher(req, {
  baseUrl: "https://api.example.com",
  useDPoP: true,
  // Custom fetch implementation with logging and metrics
  fetch: async (request) => {
    console.log(`DPoP request to: ${request.url}`);

    const startTime = Date.now();
    const response = await fetch(request);
    const duration = Date.now() - startTime;

    // Log response metrics
    console.log(`Response: ${response.status} (${duration}ms)`);

    // Could add custom headers, retry logic, etc.
    return response;
  }
});
Token Audience Validation with Multiple APIs
When using DPoP with multiple audiences in the same application (e.g., via MRRT policies), ensure each access token is sent only to its intended API. Sending a token to the wrong API will result in audience validation failures.

How This Can Happen
When creating multiple fetcher instances for different APIs:

// Fetcher for API 1
const fetcher1 = createFetcher({
  url: "https://api1.example.com",
  accessTokenFactory: () =>
    getAccessToken({
      audience: "https://api1.example.com"
      // ...
    })
});

// Fetcher for API 2
const fetcher2 = createFetcher({
  url: "https://api2.example.com",
  accessTokenFactory: () =>
    getAccessToken({
      audience: "https://api2.example.com"
      // ...
    })
});
Common mistake: Accidentally using fetcher1 to call endpoints that should use fetcher2, or vice versa. The API will reject the request with an audience mismatch error like:

OAUTH_JWT_CLAIM_COMPARISON_FAILED: unexpected JWT "aud" (audience) claim value
Mitigation Strategies
1. Scope fetcher instances appropriately

Create one fetcher per API/audience combination
Use clear, descriptive variable names that indicate which API each fetcher targets
Consider namespacing or module organization to prevent confusion
2. Configure MRRT policies correctly

Ensure your MRRT policies include all audiences your application needs to access
Set skip_consent_for_verifiable_first_party_clients: true on all APIs in MRRT policies
Only include custom scopes in MRRT policies (OIDC scopes like openid, profile, offline_access are automatically included)
3. Validate in development

Log the aud claim from decoded tokens during development to verify correct routing
Implement error handling that clearly identifies audience mismatches
Test each fetcher instance against its intended API endpoint before production deployment
4. API server validation

Ensure your API servers validate the aud claim matches their expected audience identifier
Use the same audience string in both Auth0 API configuration and server-side validation
Example: Proper Token Routing
// ✅ Correct: Each fetcher calls its own API
await fetcher1.fetchWithAuth("/users"); // Uses token with aud: "https://api1.example.com"
await fetcher2.fetchWithAuth("/orders"); // Uses token with aud: "https://api2.example.com"

// ❌ Incorrect: Wrong fetcher for the API
await fetcher1.fetchWithAuth("https://api2.example.com/orders"); // Will fail with aud mismatch
Remember: JWT audience validation is a critical security feature that prevents token misuse across different resource servers. These errors indicate your security controls are working correctly—the solution is to ensure proper token-to-API routing in your application code.

Security Best Practices
Follow these guidelines for secure DPoP implementation:

Key Management: Use hardware security modules (HSMs) for key storage in production
Key Rotation: Implement regular key rotation policies for long-lived applications
Monitoring: Monitor DPoP error rates to detect potential attacks or configuration issues
Clock Tolerance: Keep clock tolerance as low as possible (≤ 30 seconds recommended)
Environment Isolation: Use unique key pairs per environment (dev, staging, production)
Key Security: Never commit DPoP keys to version control or logs
Troubleshooting
Diagnose and resolve common DPoP configuration and runtime issues.

Common Issues
DPoP keys not found:

WARNING: useDPoP is set to true but dpopKeyPair is not provided.
Solution: Ensure AUTH0_DPOP_PUBLIC_KEY and AUTH0_DPOP_PRIVATE_KEY are set correctly in your environment, or provide the dpopKeyPair option directly in the Auth0Client constructor.

Key pair validation failed:

WARNING: Private and public keys do not form a valid key pair
Solution: Verify that your keys are correctly paired, in PEM format, and use the P-256 elliptic curve. Regenerate keys if necessary using the SDK's generateDpopKeyPair() function.

Clock tolerance warnings:

WARNING: clockTolerance of 300s exceeds recommended maximum of 30s
Solution: Synchronize server clocks using NTP instead of increasing tolerance. High tolerance values weaken DPoP security.

DPoP nonce errors: If you see frequent nonce errors, check:

Server clock synchronization: Ensure clocks are accurate and synced
Network stability: Verify stable connection between client and authorization server
Rate limiting: Check if authorization server is rate limiting requests
Debug Logging
Enable detailed logging to diagnose DPoP request issues:

// Custom fetch with comprehensive DPoP debugging
const fetcher = await auth0.createFetcher(req, {
  baseUrl: "https://api.example.com",
  useDPoP: true,
  fetch: async (request) => {
    // Log outgoing request details
    console.log(
      "DPoP Request Headers:",
      Object.fromEntries(request.headers.entries())
    );

    const response = await fetch(request);

    // Log response details, especially for failures
    if (!response.ok) {
      console.error("DPoP Request Failed:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }

    return response;
  }
});
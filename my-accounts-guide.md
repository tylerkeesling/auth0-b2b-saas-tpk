Proxy Handler for My Account and My Organization APIs
The SDK provides built-in proxy support for Auth0's My Account and My Organization Management APIs, enabling secure browser-initiated requests while maintaining server-side DPoP authentication and token management.

How It Works
The proxy handler automatically intercepts requests to /me/* and /my-org/* paths in your Next.js application and forwards them to the respective Auth0 APIs with proper authentication headers. This implements a Backend-for-Frontend (BFF) pattern where:

Tokens and DPoP keys remain on the server
Access tokens are automatically retrieved or refreshed
DPoP proofs are generated for each request
Session updates occur transparently
Configuration
Configure audience and scopes for the APIs:
m
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  useDPoP: true,
  authorizationParameters: {
    audience: "urn:your-api-identifier",
    scope: {
      [`https://${process.env.AUTH0_DOMAIN}/me/`]: "profile:read profile:write",
      [`https://${process.env.AUTH0_DOMAIN}/my-org/`]: "org:read org:write"
    }
  }
});
Client-Side Usage
Make requests through the proxy paths:

// My Account API
const response = await fetch("/me/v1/profile", {
  headers: { "scope": "profile:read" }
});

// My Organization API
const response = await fetch("/my-org/organizations", {
  headers: { "scope": "org:read" }
});
The scope header specifies the required scope. The SDK retrieves an access token with the appropriate audience and scope, then forwards the request with authentication headers.

For complete documentation, examples, and integration patterns with UI Components, see Proxy Handler for My Account and My Organization APIs.
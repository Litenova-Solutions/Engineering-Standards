# Auth.js Frontend Authentication

## Intent

This extension defines interactive login and server-owned session handling when a Next.js frontend uses Auth.js. Backend token validation remains provider-neutral and continues to authorize every target resource.

## Activation

**Activation scope:** `project`. It applies to all project work whenever selected in `selectedExtensions`.

Enable `frontend-authjs` when Next.js owns interactive login, callback handling, and session cookies for a browser application.

The extension adds the pinned Auth.js and JOSE packages. It replaces no backend authentication rule.

## Agent Summary {#agent-summary}

- Keep session cookies and provider tokens server-side.
- Configure secure cookie attributes and trusted callback URLs.
- Call protected APIs through a server boundary when tokens are required.
- Distinguish expired authentication from forbidden authorization.
- Validate redirects and callback state.
- Test login, callback, logout, expiry, refresh failure, and protected API access.

## Standards

### Keep provider behavior in the extension (EXT.AUTHJS.ADOPT.001)

Auth.js owns frontend login and session concerns. WebApi validates standards-based access tokens and does not depend on Auth.js session types.

### Keep session processing server-side (EXT.AUTHJS.SESSION.001)

Store session cookies with `HttpOnly`, `Secure` outside local HTTP development, an explicit `SameSite` policy, bounded lifetime, and a narrow path. Read and refresh provider tokens on the server.

Do not expose refresh tokens to Client Components or browser storage.

The adoption decision selects a JWT or database session strategy, names the encryption and signing secret owner, and defines access-token refresh behavior. Store only the claims and provider values required by the application. A session cookie is not used as a bearer token for WebApi.

### Call protected APIs through a server boundary (EXT.AUTHJS.API.001)

Use Server Components, Server Actions, or Route Handlers to attach access tokens server-side. A browser request may use a same-origin server boundary without receiving the provider token.

### Validate callbacks and redirects (EXT.AUTHJS.CALLBACK.001)

Validate callback state, nonce where applicable, issuer, audience, and allowed redirect destinations. Reject external or protocol-relative return targets that are not explicitly allowed.

### Handle session failure explicitly (EXT.AUTHJS.FAILURE.001)

Expired or revoked sessions redirect to a safe login route or return a stable unauthenticated state. Keep authentication failures distinct from resource authorization failures. Do not retry 401 or 403 indefinitely.

### Keep frontend guards advisory (EXT.AUTHJS.AUTHZ.001)

Frontend session checks may hide controls or redirect users. WebApi remains responsible for resource authorization on every protected operation.

### Protect state-changing server boundaries (EXT.AUTHJS.CSRF.001)

Use Auth.js request verification for its authentication routes and validate origin or an approved anti-forgery token on project-owned cookie-authenticated Route Handlers and Server Actions that cross a browser trust boundary. Use `POST` for state changes and reject cross-site form submissions that the selected SameSite policy does not already prevent.

## Conventions

Keep Auth.js configuration under one server-owned module such as `lib/auth.ts`. Keep provider-specific claim mapping near that configuration. Feature code consumes a project-owned session view rather than provider response objects. Keep authentication Route Handlers thin and server-only.

## Dependencies

- `next-auth`
- `jose`

## Verification

- Test login, callback validation, safe return paths, logout, expiry, and refresh failure.
- Test authenticated API calls and forbidden target access.
- Test cross-site state-changing requests and invalid origins.
- Inspect browser storage and bundles for provider tokens.
- Verify cookie attributes in hosted configuration.

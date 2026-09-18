# Auth.js Frontend Authentication

## Intent

This extension defines interactive login and server-owned session handling when a Next.js frontend uses Auth.js. Backend token validation remains provider-neutral and authorizes each target resource.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `authjs` when Next.js owns interactive login, callback handling, and session cookies for a browser application.

## Baseline relationship

This extension adds pinned Auth.js and JOSE packages. It replaces no backend authentication rule.

## Agent Summary {#agent-summary}

- Keep Auth.js frontend-specific. (standards/rule/ext-authjs.keep-authjs-frontend-specific, standards/rule/ext-authjs.keep-webapi-provider-neutral)
- Keep provider tokens and refresh server-side. (standards/rule/ext-authjs.protect-session-cookies, standards/rule/ext-authjs.keep-provider-tokens-server-side)
- Define selected session strategy and secret ownership. (standards/rule/ext-authjs.record-session-secret-ownership)
- Call protected APIs through a server boundary. (standards/rule/ext-authjs.use-a-server-api-boundary)
- Verify callbacks and safe return destinations. (standards/rule/ext-authjs.validate-provider-callback-values, standards/rule/ext-authjs.reject-unsafe-return-targets)
- Handle failed sessions and authorization separately. (standards/rule/ext-authjs.handle-invalid-sessions-explicitly, standards/rule/ext-authjs.separate-authentication-from-authorization-failure)
- Protect cookie-authenticated state changes. (standards/rule/ext-authjs.verify-state-changing-browser-requests, standards/rule/ext-authjs.use-post-for-browser-state-changes)

## Standards

### Keep Auth.js frontend-specific (standards/rule/ext-authjs.keep-authjs-frontend-specific)

**Requirement:** A Next.js frontend using Auth.js MUST own interactive login and session behavior through Auth.js.

**Rationale:** Auth.js provides the browser-facing login and session boundary for the selected frontend.

### Keep WebApi provider-neutral (standards/rule/ext-authjs.keep-webapi-provider-neutral)

**Requirement:** WebApi MUST validate standards-based access tokens without depending on Auth.js session types.

**Rationale:** Backend authorization remains independent of the frontend session implementation.

### Protect session cookies (standards/rule/ext-authjs.protect-session-cookies)

**Requirement:** A session cookie MUST use `HttpOnly`, `Secure` outside local HTTP development, explicit `SameSite`, bounded lifetime, and a narrow path.

**Rationale:** Cookie attributes constrain browser exposure, cross-site use, lifetime, and delivery path. `SameSite=Lax` is the baseline, because it blocks the cross-site POST that request forgery relies on and still allows the top-level navigation a sign-in redirect needs. `SameSite=Strict` is the value for a cookie that authorizes a change with no safe reversal, and it breaks every inbound link into an authenticated page. `SameSite=None` requires `Secure` and a recorded decision naming the cross-site flow that needs it. [The OWASP session management guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) states the same split.

### Keep provider tokens server-side (standards/rule/ext-authjs.keep-provider-tokens-server-side)

**Requirement:** A frontend server MUST read and refresh provider tokens without exposing refresh tokens to Client Components or browser storage.

**Rationale:** Provider refresh tokens grant access beyond the browser's safe presentation boundary.

### Select a session strategy (standards/rule/ext-authjs.select-a-session-strategy)

**Requirement:** An Auth.js adoption decision MUST select a JWT or database session strategy.

**Rationale:** The strategy defines session storage, invalidation, and operational behavior.

### Record session secret ownership (standards/rule/ext-authjs.record-session-secret-ownership)

**Requirement:** An Auth.js adoption decision MUST name encryption and signing secret ownership and access-token refresh behavior.

**Rationale:** Named ownership defines who rotates secrets and how sessions obtain refreshed provider access.

### Minimize session content (standards/rule/ext-authjs.minimize-session-content)

**Requirement:** A session implementation MUST store only claims and provider values required by the application.

**Rationale:** Smaller session content reduces retained data and unintended browser exposure.

### Separate sessions from API bearer tokens (standards/rule/ext-authjs.separate-sessions-from-api-bearer-tokens)

**Requirement:** A frontend MUST NOT use its Auth.js session cookie as a WebApi bearer token.

**Rationale:** A session cookie and backend bearer token have different trust and transport boundaries.

### Use a server API boundary (standards/rule/ext-authjs.use-a-server-api-boundary)

**Requirement:** A frontend MUST use Server Components, Server Actions, Route Handlers, or the edge proxy to attach protected API tokens server-side.

**Rationale:** Server ownership keeps provider tokens outside browser bundles and browser storage.

The edge proxy is a server boundary and belongs in that list. It runs before the request reaches a route and reads a server environment variable without inlining it into the client bundle. It is where a session cookie becomes a header. `standards/rule/frontend-rendering.keep-proxy-behavior-at-the-edge` still bounds what it may decide, so it attaches a token and never authorizes a resource.

### Keep browser token access absent (standards/rule/ext-authjs.keep-browser-token-access-absent)

**Requirement:** A browser request MAY call a same-origin server boundary without receiving the provider token.

**Rationale:** The server boundary can attach the token after the browser request reaches trusted code.

### Validate provider callback values (standards/rule/ext-authjs.validate-provider-callback-values)

**Requirement:** An Auth.js callback handler MUST validate state, applicable nonce, issuer, audience, and allowed redirect destinations.

**Rationale:** Callback validation binds the provider response to the expected login request and application.

### Reject unsafe return targets (standards/rule/ext-authjs.reject-unsafe-return-targets)

**Requirement:** An Auth.js callback handler MUST reject unapproved external or protocol-relative return targets.

**Rationale:** Restricted return targets prevent an authentication flow from becoming an open redirect.

### Handle invalid sessions explicitly (standards/rule/ext-authjs.handle-invalid-sessions-explicitly)

**Requirement:** A frontend MUST redirect an expired or revoked session to a safe login route or return stable unauthenticated state.

**Rationale:** An explicit outcome lets the interface recover safely when a session is unusable.

### Separate authentication from authorization failure (standards/rule/ext-authjs.separate-authentication-from-authorization-failure)

**Requirement:** A frontend MUST keep authentication failures distinct from resource authorization failures.

**Rationale:** A missing or expired identity has different caller action and disclosure behavior than denied access.

### Avoid endless access retries (standards/rule/ext-authjs.avoid-endless-access-retries)

**Requirement:** A frontend MUST NOT retry 401 or 403 responses indefinitely.

**Rationale:** Repeated failures do not restore an expired session or insufficient authorization.

### Keep frontend guards advisory (standards/rule/ext-authjs.keep-frontend-guards-advisory)

**Requirement:** A frontend session check MAY hide controls or redirect a user without replacing backend resource authorization.

**Rationale:** Browser checks improve navigation but cannot establish a trusted resource decision.

### Authorize protected resources in WebApi (standards/rule/ext-authjs.authorize-protected-resources-in-webapi)

**Requirement:** WebApi MUST authorize every protected target resource.

**Rationale:** The backend remains the trusted owner of resource access decisions.

### Verify Auth.js authentication requests (standards/rule/ext-authjs.verify-authjs-authentication-requests)

**Requirement:** Auth.js authentication routes MUST use Auth.js request verification.

**Rationale:** Auth.js owns the request-integrity mechanism for its authentication endpoints.

### Verify state-changing browser requests (standards/rule/ext-authjs.verify-state-changing-browser-requests)

**Requirement:** A cookie-authenticated server boundary MUST validate origin or an approved anti-forgery token before state change.

**Rationale:** Project-owned Route Handlers and Server Actions cross the browser trust boundary.

The allowed origins come from validated configuration, which is the same source `standards/rule/quality-security.restrict-cross-origin-access` requires for the cross-origin allowlist. A wildcard, a suffix match, and a request header are not sources: each one accepts an origin the project never listed. A missing `Origin` header on a state-changing request is a rejection rather than a pass. [The OWASP request forgery guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) states the same.

### Use POST for browser state changes (standards/rule/ext-authjs.use-post-for-browser-state-changes)

**Requirement:** A cookie-authenticated state change MUST use `POST` and reject cross-site forms not blocked by selected `SameSite` policy.

**Rationale:** A state-changing request needs method and cross-site protections that a safe read does not need.

## Conventions

### Keep Auth.js configuration server-owned (standards/rule/ext-authjs.keep-authjs-configuration-server-owned)

**Default:** Keep Auth.js configuration in one server-owned module such as `lib/auth.ts`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One server module identifies the frontend's authentication configuration boundary.

### Keep provider claims nearby (standards/rule/ext-authjs.keep-provider-claims-nearby)

**Default:** Keep provider-specific claim mapping near Auth.js configuration.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Provider claim mapping changes with the provider configuration it interprets.

### Expose a project-owned session view (standards/rule/ext-authjs.expose-a-project-owned-session-view)

**Default:** Let feature code use a project-owned session view rather than provider response objects.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Feature code consumes application concepts rather than provider response shape.

### Keep authentication handlers thin (standards/rule/ext-authjs.keep-authentication-handlers-thin)

**Default:** Keep authentication Route Handlers thin and server-only.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Authentication route composition does not own provider configuration or feature behavior.

## Dependencies

- `next-auth`
- `jose`

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-authjs.keep-authjs-frontend-specific | inspection | Frontend authentication review identifies Auth.js ownership of login and sessions. |
| standards/rule/ext-authjs.keep-webapi-provider-neutral | test | `AuthJsAdoptTests` use standards-based tokens without Auth.js session types. |
| standards/rule/ext-authjs.protect-session-cookies | test | `AuthJsSessionTests` assert attributes, lifetime, and narrow path. |
| standards/rule/ext-authjs.keep-provider-tokens-server-side | static | `AuthJsSessionTests` asserts client source and browser storage scans expose no provider refresh token. |
| standards/rule/ext-authjs.select-a-session-strategy | inspection | Adoption decision selects JWT or database sessions. |
| standards/rule/ext-authjs.record-session-secret-ownership | inspection | Adoption decision names secret owner and refresh behavior. |
| standards/rule/ext-authjs.minimize-session-content | inspection | Session review identifies each stored claim and provider value. |
| standards/rule/ext-authjs.separate-sessions-from-api-bearer-tokens | test | `AuthJsSessionTests` asserts webApi rejects use of an Auth.js session cookie as bearer authentication. |
| standards/rule/ext-authjs.use-a-server-api-boundary | static | `AuthJsApiTests` asserts protected API calls attach tokens only in server-owned files. |
| standards/rule/ext-authjs.keep-browser-token-access-absent | test | `AuthJsApiTests` calls same-origin boundary without provider token exposure. |
| standards/rule/ext-authjs.validate-provider-callback-values | test | `AuthJsCallbackTests` reject invalid state, nonce, issuer, audience, and destination. |
| standards/rule/ext-authjs.reject-unsafe-return-targets | test | `AuthJsCallbackTests` reject external and protocol-relative destinations. |
| standards/rule/ext-authjs.handle-invalid-sessions-explicitly | test | `AuthJsFailureTests` yield safe login or unauthenticated outcomes. |
| standards/rule/ext-authjs.separate-authentication-from-authorization-failure | test | `AuthJsFailureTests` render authentication and authorization failures differently. |
| standards/rule/ext-authjs.avoid-endless-access-retries | test | `AuthJsFailureTests` asserts 401 and 403 fixtures stop retry after the documented bounded behavior. |
| standards/rule/ext-authjs.keep-frontend-guards-advisory | inspection | UI guard review identifies its advisory navigation behavior. |
| standards/rule/ext-authjs.authorize-protected-resources-in-webapi | test | `AuthJsAuthzTests` enforce target-resource authorization. |
| standards/rule/ext-authjs.verify-authjs-authentication-requests | test | `AuthJsCsrfTests` asserts auth.js route fixtures verify request-integrity behavior. |
| standards/rule/ext-authjs.verify-state-changing-browser-requests | test | `AuthJsCsrfTests` reject missing origin or anti-forgery evidence. |
| standards/rule/ext-authjs.use-post-for-browser-state-changes | test | `AuthJsCsrfTests` reject unsafe non-POST state changes. |
| standards/rule/ext-authjs.keep-authjs-configuration-server-owned | inspection | Auth.js configuration has one server-owned module or a local replacement. |
| standards/rule/ext-authjs.keep-provider-claims-nearby | inspection | Provider claim mapping remains beside its Auth.js configuration. |
| standards/rule/ext-authjs.expose-a-project-owned-session-view | static | `AuthJsTests` asserts feature source references the owned session view rather than provider responses. |
| standards/rule/ext-authjs.keep-authentication-handlers-thin | inspection | Authentication Route Handlers remain thin and server-only. |

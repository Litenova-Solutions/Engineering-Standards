# Auth.js Frontend Authentication

## Intent

This extension defines interactive login and server-owned session handling when a Next.js frontend uses Auth.js. Backend token validation remains provider-neutral and authorizes each target resource.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `frontend-authjs` when Next.js owns interactive login, callback handling, and session cookies for a browser application.

## Baseline relationship

This extension adds pinned Auth.js and JOSE packages. It replaces no backend authentication rule.

## Agent Summary {#agent-summary}

- Keep Auth.js frontend-specific. (EXT.AUTHJS.ADOPT.001, EXT.AUTHJS.ADOPT.002)
- Keep provider tokens and refresh server-side. (EXT.AUTHJS.SESSION.001, EXT.AUTHJS.SESSION.002)
- Define selected session strategy and secret ownership. (EXT.AUTHJS.SESSION.004)
- Call protected APIs through a server boundary. (EXT.AUTHJS.API.001)
- Verify callbacks and safe return destinations. (EXT.AUTHJS.CALLBACK.001, EXT.AUTHJS.CALLBACK.002)
- Handle failed sessions and authorization separately. (EXT.AUTHJS.FAILURE.001, EXT.AUTHJS.FAILURE.002)
- Protect cookie-authenticated state changes. (EXT.AUTHJS.CSRF.002, EXT.AUTHJS.CSRF.003)

## Standards

### Keep Auth.js frontend-specific (EXT.AUTHJS.ADOPT.001)

**Requirement:** A Next.js frontend using Auth.js MUST own interactive login and session behavior through Auth.js.

**Rationale:** Auth.js provides the browser-facing login and session boundary for the selected frontend.

### Keep WebApi provider-neutral (EXT.AUTHJS.ADOPT.002)

**Requirement:** WebApi MUST validate standards-based access tokens without depending on Auth.js session types.

**Rationale:** Backend authorization remains independent of the frontend session implementation.

### Protect session cookies (EXT.AUTHJS.SESSION.001)

**Requirement:** A session cookie MUST use `HttpOnly`, `Secure` outside local HTTP development, explicit `SameSite`, bounded lifetime, and a narrow path.

**Rationale:** Cookie attributes constrain browser exposure, cross-site use, lifetime, and delivery path.

### Keep provider tokens server-side (EXT.AUTHJS.SESSION.002)

**Requirement:** A frontend server MUST read and refresh provider tokens without exposing refresh tokens to Client Components or browser storage.

**Rationale:** Provider refresh tokens grant access beyond the browser's safe presentation boundary.

### Select a session strategy (EXT.AUTHJS.SESSION.003)

**Requirement:** An Auth.js adoption decision MUST select a JWT or database session strategy.

**Rationale:** The strategy defines session storage, invalidation, and operational behavior.

### Record session secret ownership (EXT.AUTHJS.SESSION.004)

**Requirement:** An Auth.js adoption decision MUST name encryption and signing secret ownership and access-token refresh behavior.

**Rationale:** Named ownership defines who rotates secrets and how sessions obtain refreshed provider access.

### Minimize session content (EXT.AUTHJS.SESSION.005)

**Requirement:** A session implementation MUST store only claims and provider values required by the application.

**Rationale:** Smaller session content reduces retained data and unintended browser exposure.

### Separate sessions from API bearer tokens (EXT.AUTHJS.SESSION.006)

**Requirement:** A frontend MUST NOT use its Auth.js session cookie as a WebApi bearer token.

**Rationale:** A session cookie and backend bearer token have different trust and transport boundaries.

### Use a server API boundary (EXT.AUTHJS.API.001)

**Requirement:** A frontend MUST use Server Components, Server Actions, or Route Handlers to attach protected API tokens server-side.

**Rationale:** Server ownership keeps provider tokens outside browser bundles and browser storage.

### Keep browser token access absent (EXT.AUTHJS.API.002)

**Requirement:** A browser request MAY call a same-origin server boundary without receiving the provider token.

**Rationale:** The server boundary can attach the token after the browser request reaches trusted code.

### Validate provider callback values (EXT.AUTHJS.CALLBACK.001)

**Requirement:** An Auth.js callback handler MUST validate state, applicable nonce, issuer, audience, and allowed redirect destinations.

**Rationale:** Callback validation binds the provider response to the expected login request and application.

### Reject unsafe return targets (EXT.AUTHJS.CALLBACK.002)

**Requirement:** An Auth.js callback handler MUST reject unapproved external or protocol-relative return targets.

**Rationale:** Restricted return targets prevent an authentication flow from becoming an open redirect.

### Handle invalid sessions explicitly (EXT.AUTHJS.FAILURE.001)

**Requirement:** A frontend MUST redirect an expired or revoked session to a safe login route or return stable unauthenticated state.

**Rationale:** An explicit outcome lets the interface recover safely when a session is unusable.

### Separate authentication from authorization failure (EXT.AUTHJS.FAILURE.002)

**Requirement:** A frontend MUST keep authentication failures distinct from resource authorization failures.

**Rationale:** A missing or expired identity has different caller action and disclosure behavior than denied access.

### Avoid endless access retries (EXT.AUTHJS.FAILURE.003)

**Requirement:** A frontend MUST NOT retry 401 or 403 responses indefinitely.

**Rationale:** Repeated failures do not restore an expired session or insufficient authorization.

### Keep frontend guards advisory (EXT.AUTHJS.AUTHZ.001)

**Requirement:** A frontend session check MAY hide controls or redirect a user without replacing backend resource authorization.

**Rationale:** Browser checks improve navigation but cannot establish a trusted resource decision.

### Authorize protected resources in WebApi (EXT.AUTHJS.AUTHZ.002)

**Requirement:** WebApi MUST authorize every protected target resource.

**Rationale:** The backend remains the trusted owner of resource access decisions.

### Verify Auth.js authentication requests (EXT.AUTHJS.CSRF.001)

**Requirement:** Auth.js authentication routes MUST use Auth.js request verification.

**Rationale:** Auth.js owns the request-integrity mechanism for its authentication endpoints.

### Verify state-changing browser requests (EXT.AUTHJS.CSRF.002)

**Requirement:** A cookie-authenticated server boundary MUST validate origin or an approved anti-forgery token before state change.

**Rationale:** Project-owned Route Handlers and Server Actions cross the browser trust boundary.

### Use POST for browser state changes (EXT.AUTHJS.CSRF.003)

**Requirement:** A cookie-authenticated state change MUST use `POST` and reject cross-site forms not blocked by selected `SameSite` policy.

**Rationale:** A state-changing request needs method and cross-site protections that a safe read does not need.

## Conventions

### Keep Auth.js configuration server-owned (EXT.AUTHJS.CONVENTION.001)

**Default:** Keep Auth.js configuration in one server-owned module such as `lib/auth.ts`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One server module identifies the frontend's authentication configuration boundary.

### Keep provider claims nearby (EXT.AUTHJS.CONVENTION.002)

**Default:** Keep provider-specific claim mapping near Auth.js configuration.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Provider claim mapping changes with the provider configuration it interprets.

### Expose a project-owned session view (EXT.AUTHJS.CONVENTION.003)

**Default:** Let feature code use a project-owned session view rather than provider response objects.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Feature code consumes application concepts rather than provider response shape.

### Keep authentication handlers thin (EXT.AUTHJS.CONVENTION.004)

**Default:** Keep authentication Route Handlers thin and server-only.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Authentication route composition does not own provider configuration or feature behavior.

## Dependencies

- `next-auth`
- `jose`

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.AUTHJS.ADOPT.001 | inspection | Frontend authentication review identifies Auth.js ownership of login and sessions. |
| EXT.AUTHJS.ADOPT.002 | test | `AuthJsAdoptTests` use standards-based tokens without Auth.js session types. |
| EXT.AUTHJS.SESSION.001 | test | `AuthJsSessionTests` assert attributes, lifetime, and narrow path. |
| EXT.AUTHJS.SESSION.002 | static | `AuthJsSessionTests` asserts client source and browser storage scans expose no provider refresh token. |
| EXT.AUTHJS.SESSION.003 | inspection | Adoption decision selects JWT or database sessions. |
| EXT.AUTHJS.SESSION.004 | inspection | Adoption decision names secret owner and refresh behavior. |
| EXT.AUTHJS.SESSION.005 | inspection | Session review identifies each stored claim and provider value. |
| EXT.AUTHJS.SESSION.006 | test | `AuthJsSessionTests` asserts webApi rejects use of an Auth.js session cookie as bearer authentication. |
| EXT.AUTHJS.API.001 | static | `AuthJsApiTests` asserts protected API calls attach tokens only in server-owned files. |
| EXT.AUTHJS.API.002 | test | `AuthJsApiTests` calls same-origin boundary without provider token exposure. |
| EXT.AUTHJS.CALLBACK.001 | test | `AuthJsCallbackTests` reject invalid state, nonce, issuer, audience, and destination. |
| EXT.AUTHJS.CALLBACK.002 | test | `AuthJsCallbackTests` reject external and protocol-relative destinations. |
| EXT.AUTHJS.FAILURE.001 | test | `AuthJsFailureTests` yield safe login or unauthenticated outcomes. |
| EXT.AUTHJS.FAILURE.002 | test | `AuthJsFailureTests` render authentication and authorization failures differently. |
| EXT.AUTHJS.FAILURE.003 | test | `AuthJsFailureTests` asserts 401 and 403 fixtures stop retry after the documented bounded behavior. |
| EXT.AUTHJS.AUTHZ.001 | inspection | UI guard review identifies its advisory navigation behavior. |
| EXT.AUTHJS.AUTHZ.002 | test | `AuthJsAuthzTests` enforce target-resource authorization. |
| EXT.AUTHJS.CSRF.001 | test | `AuthJsCsrfTests` asserts auth.js route fixtures verify request-integrity behavior. |
| EXT.AUTHJS.CSRF.002 | test | `AuthJsCsrfTests` reject missing origin or anti-forgery evidence. |
| EXT.AUTHJS.CSRF.003 | test | `AuthJsCsrfTests` reject unsafe non-POST state changes. |
| EXT.AUTHJS.CONVENTION.001 | inspection | Auth.js configuration has one server-owned module or a local replacement. |
| EXT.AUTHJS.CONVENTION.002 | inspection | Provider claim mapping remains beside its Auth.js configuration. |
| EXT.AUTHJS.CONVENTION.003 | static | `AuthJsTests` asserts feature source references the owned session view rather than provider responses. |
| EXT.AUTHJS.CONVENTION.004 | inspection | Authentication Route Handlers remain thin and server-only. |

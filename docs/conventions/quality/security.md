# Security

## Intent

Security boundaries follow identity, resource ownership, data classification, and trust transitions across API, persistence, frontend, external services, and operations. Authentication establishes identity; each use case still defines authorization for its target.

## Agent Summary {#agent-summary}

- Validate backend access tokens through generic OIDC and JWT configuration.
- Derive authenticated actor IDs from verified claims.
- Authorize the target resource and ownership on every protected operation.
- Validate untrusted input at transport and application boundaries.
- Parameterize SQL and keep provider details out of public errors.
- Keep secrets and sensitive data out of source, browser storage, logs, and traces.
- Pin dependencies and review supply-chain changes.
- Bound abuse on public and expensive endpoints.
- Restrict cross-origin access to declared clients.
- Record security-relevant audit events and retention.
- Maintain production secret rotation and recovery procedures.
- Treat frontend checks as user experience, never backend authorization.

## Standards

### Keep backend authentication provider-neutral (SECURITY.AUTHN.001)

Validate issuer, audience, signature, lifetime, and required claims through OIDC and JWT bearer standards. Provider-specific login and session behavior belongs in a frontend or infrastructure extension.

Do not accept unsigned tokens, decode a token without validation, or trust client-supplied identity headers.

Keep inbound claim mapping disabled so configured claim names remain stable. Require a valid `sub` claim for actor-backed endpoints. Configure the exact scope and role claim names supplied by the selected identity provider; do not search several claim aliases until one matches.

### Derive the actor from claims (SECURITY.ACTOR.001)

The authenticated actor ID comes from verified claims and is converted to the project's strongly typed ID at the WebApi boundary.

Do not accept the current actor ID from request data.

The current actor accessor exposes the typed subject plus the declared roles and scopes needed by endpoint policies. A protected endpoint fails authentication when the subject is missing or cannot be parsed. Anonymous access does not produce a default or empty actor.

### Authorize each target resource (SECURITY.AUTHZ.001)

Every protected query and command checks the policy relevant to its target, including role, ownership, tenant, state, or delegated access.

Collection queries apply authorization in the database filter. Do not load an unrestricted collection and filter it only in memory.

### Validate at trust boundaries (SECURITY.INPUT.001)

Validate transport shape, required values, lengths, ranges, formats, file metadata, and pagination bounds before use. Domain validates business invariants.

Treat database content, external provider responses, file contents, and generated text as untrusted when they cross into a new output context.

### Keep secrets out of tracked and observable data (SECURITY.SECRETS.001)

Do not commit secrets or place them in logs, traces, exception messages, generated files, browser storage, URLs, test snapshots, container layers, or pull request text.

Use platform secret stores and redact sensitive configuration from diagnostics.

### Parameterize database input (SECURITY.SQL.001)

Use Marten query APIs or parameterized SQL for every external value. Do not build SQL through string concatenation or interpolation into raw command text.

The reporting extension owns reviewed raw SQL patterns.

### Limit public error detail (SECURITY.ERRORS.001)

Public errors expose a stable code, safe message, trace ID, and allowed field errors. They do not expose stack traces, SQL, connection details, provider bodies, internal IDs not part of the contract, or authorization reasoning that leaks resource existence.

### Protect browser boundaries (SECURITY.FRONTEND.001)

Escape output through framework rendering. Sanitize approved rich content. Apply a documented Content Security Policy, secure headers, safe redirect validation, and request forgery protection appropriate to the selected session model.

Frontend route guards and hidden controls do not replace API authorization.

### Pin and review dependencies (SECURITY.SUPPLY.001)

Use exact manifest pins and a frozen lockfile. Review install scripts, transitive changes, source reputation, maintenance status, and security advisories before adopting a package.

Do not disable integrity or certificate verification to make an installation succeed.

### Minimize sensitive data (SECURITY.DATA.001)

Collect, return, log, export, and retain only fields required by the Use case. A Use case with the `sensitive-data` Risk documents classification, access, retention, deletion, and audit behavior.

### Bound abuse at exposed endpoints (SECURITY.ABUSE.001)

Public, authentication, webhook, search, upload, and expensive endpoints MUST define a rate or concurrency limit, the limiting key, the response for rejection, and the monitoring owner. Return 429 with a stable error code when a caller exceeds a declared limit. Use a shared store when multiple replicas enforce the limit.

### Restrict cross-origin access (SECURITY.CORS.001)

When a browser client is hosted on another origin, allow only the declared origins, methods, headers, and credential mode. Wildcard origins MUST NOT be combined with credentials. Keep the allowlist in validated configuration and test a rejected origin.

### Record security audit events (SECURITY.AUDIT.001)

Security-relevant actions MUST record the actor, action, target, outcome, timestamp, trace ID, and reason when supplied by the use case. Audit records follow the documented retention and access policy, exclude secrets, and remain available for incident review.

### Rotate production secrets (SECURITY.ROTATION.001)

Every production secret MUST have an owner, rotation interval, storage location, revocation procedure, and recovery test. Rotation MUST support overlap when clients cannot switch at one instant. Secret values MUST NOT appear in the procedure, logs, artifacts, or audit records.

### Enforce supply-chain gates in CI (SECURITY.SUPPLY.002)

CI MUST scan direct and transitive dependencies, pin GitHub Actions to immutable references or an approved repository pin, and publish an SBOM or equivalent inventory for release artifacts. A known high-severity vulnerability requires a documented exception before release.

## Conventions

### Use one current actor abstraction

WebApi owns a narrow current actor accessor that maps verified claims to typed identity and declared roles or scopes. Application receives the actor through command/query input created by WebApi or through a narrow trusted port when host-independent behavior requires it.

### Keep secure headers in host configuration

Define Content Security Policy, frame restrictions, content-type protection, referrer policy, and transport security in one reviewed host location. Tests verify required headers.

### Use deny-by-default policies

Set a fallback policy that requires an authenticated user. Public endpoints call `AllowAnonymous` intentionally. Endpoints add named role or scope policies when needed, while handlers retain resource authorization.

### Test the resource authorization matrix

For every protected operation, cover anonymous, invalid token, valid unrelated actor, valid owner, and each privileged grant that changes the outcome. Test both the chosen 403 or 404 disclosure behavior and the collection query predicate. A UI redirect or hidden control is not evidence for this matrix.

## Examples

`GET /api/posts/{id}` for a private draft filters by both post ID and the author ID derived from claims. A different author receives the documented not-found or forbidden response without learning protected fields.

## Verification

- Test missing, invalid, expired, and wrongly scoped tokens.
- Test a missing or malformed subject claim and the configured role and scope claim names.
- Test resource access by owner, permitted role, unrelated actor, and anonymous caller.
- Search for actor IDs accepted from request models.
- Scan logs, traces, generated files, and browser storage for sensitive data.
- Test security headers, rich content, redirects, and public error redaction.
- Review dependency and lockfile changes.
- Test rate limits, rejected origins, audit fields, secret rotation, and vulnerability gates when applicable.

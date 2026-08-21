# Security

## Intent


Security boundaries follow identity, resource ownership, data classification, and trust transitions across API, persistence, frontend, external services, and operations. Authentication establishes identity. Each use case still defines authorization for its target.

## Agent Summary {#agent-summary}


- Tokens are validated against issuer, audience, signature, lifetime, and claims. (QUALITY.SECURITY.AUTHN.001)
- The actor comes from claims and becomes a typed identifier. (QUALITY.SECURITY.ACTOR.001)
- Every protected operation authorizes its target resource. (QUALITY.SECURITY.AUTHZ.001)
- Trust boundaries validate shape, range, and bounds before use. (QUALITY.SECURITY.INPUT.001)
- Secrets stay out of source, logs, diagnostics, and storage. (QUALITY.SECURITY.SECRETS.001)
- Database input is always parameterized. (QUALITY.SECURITY.SQL.001)
- Public errors carry a code, safe message, trace, and field errors. (QUALITY.SECURITY.ERRORS.001)
- Frontends escape output and apply policy, headers, and forgery protection. (QUALITY.SECURITY.FRONTEND.001)
- Dependencies resolve from exact pins and a frozen lockfile. (QUALITY.SECURITY.SUPPLY.001)
- Use cases handle only the fields they require. (QUALITY.SECURITY.DATA.001)

## Standards


### Keep backend authentication provider-neutral (QUALITY.SECURITY.AUTHN.001)

**Requirement:** A backend MUST validate issuer, audience, signature, lifetime, and required claims through OIDC and JWT bearer standards.

**Rationale:** Provider-specific login and session behavior belongs to a frontend or an extension. An unsigned token, an unvalidated decode, or a client-supplied identity header is never accepted.

### Derive the actor from claims (QUALITY.SECURITY.ACTOR.001)

**Requirement:** The authenticated actor identifier MUST come from verified claims and convert to the project typed identifier at the WebApi boundary.

**Rationale:** The accessor exposes the typed subject plus the declared roles and scopes that endpoint policies need. Request data never supplies the current actor.

### Authorize each target resource (QUALITY.SECURITY.AUTHZ.001)

**Requirement:** A protected query or command MUST check role, ownership, tenant, state, or delegated access against its target.

**Rationale:** A collection query applies that check in the database filter, because loading an unrestricted set and filtering in memory already exposed the rows.

### Validate at trust boundaries (QUALITY.SECURITY.INPUT.001)

**Requirement:** A trust boundary MUST validate transport shape, required values, length, range, format, file metadata, and pagination bounds before use.

**Rationale:** Domain validates business invariants separately. Database content, provider responses, file contents, and generated text stay untrusted when they cross into a new output context.

### Keep secrets out of tracked and observable data (QUALITY.SECURITY.SECRETS.001)

**Requirement:** A secret MUST NOT appear in source, logs, traces, exception messages, generated files, URLs, snapshots, container layers, or browser storage.

**Rationale:** Platform secret stores hold the values and diagnostics redact sensitive configuration before it is emitted.

### Parameterize database input (QUALITY.SECURITY.SQL.001)

**Requirement:** An external value reaching the database MUST travel through a Marten query API or a parameterized SQL parameter.

**Rationale:** String concatenation or interpolation into raw command text makes the value part of the statement. The reporting extension owns the reviewed raw SQL patterns.

### Limit public error detail (QUALITY.SECURITY.ERRORS.001)

**Requirement:** A public error MUST expose only a stable code, safe message, trace identifier, and allowed field errors.

**Rationale:** A stack trace, SQL, connection detail, provider body, uncontracted internal identifier, or authorization reason that reveals resource existence gives an attacker structure.

### Protect browser boundaries (QUALITY.SECURITY.FRONTEND.001)

**Requirement:** A frontend MUST apply framework escaping, a documented Content Security Policy, secure headers, redirect validation, and request forgery protection.

**Rationale:** Approved rich content is sanitized before render. A route guard or hidden control is presentation, so it never replaces API authorization.

### Pin and review dependencies (QUALITY.SECURITY.SUPPLY.001)

**Requirement:** A dependency MUST resolve from an exact manifest pin and a frozen lockfile, with integrity and certificate verification enabled.

**Rationale:** Package review still covers install scripts, transitive changes, source reputation, maintenance status, and advisories before a pin changes.

### Minimize sensitive data (QUALITY.SECURITY.DATA.001)

**Requirement:** A use case MUST collect, return, log, export, and retain only the fields it requires.

**Rationale:** A use case carrying the `sensitive-data` risk also documents classification, access, retention, deletion, and audit behavior.

### Bound abuse at exposed endpoints (QUALITY.SECURITY.ABUSE.001)

**Requirement:** A public, authentication, webhook, search, upload, or expensive endpoint MUST declare a rate or concurrency limit and its rejection response.

**Rationale:** The declaration also names the limiting key and monitoring owner. A caller above the limit receives 429 with a stable code, and multiple replicas share one store.

### Restrict cross-origin access (QUALITY.SECURITY.CORS.001)

**Requirement:** A cross-origin policy MUST list its allowed origins, methods, headers, and credential mode without using a wildcard origin.

**Rationale:** Validated configuration owns the allowlist so an unlisted origin cannot be introduced by a deployment value.

### Record security audit events (QUALITY.SECURITY.AUDIT.001)

**Requirement:** A security audit event MUST record actor, action, target, outcome, timestamp, trace identifier, and available reason.

**Rationale:** Audit records follow a documented retention and access policy, exclude secrets, and stay available for incident review.

### Rotate production secrets (QUALITY.SECURITY.ROTATION.001)

**Requirement:** A production secret MUST have an owner, rotation interval, storage location, revocation procedure, and tested recovery.

**Rationale:** Rotation supports overlap when clients cannot switch at once. Procedures, logs, artifacts, and audit records carry no secret value.

### Enforce supply-chain gates in CI (QUALITY.SECURITY.SUPPLY.002)

**Requirement:** CI MUST scan direct and transitive dependencies, pin every action to an immutable reference, and publish an inventory per release.

**Rationale:** A known high-severity vulnerability then requires a documented exception before the release proceeds.

## Conventions


### Use one current actor abstraction (QUALITY.SECURITY.CONVENTION.001)

**Default:** Expose one narrow current-actor accessor in WebApi that maps verified claims to typed identity, roles, and scopes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Application receives the actor through input that WebApi creates, or through a narrow trusted port when behavior must stay host-independent.

### Keep secure headers in host configuration (QUALITY.SECURITY.CONVENTION.002)

**Default:** Define Content Security Policy, frame restrictions, content-type protection, referrer policy, and transport security in one host location.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One location keeps the header set reviewable instead of spread across middleware registrations.

### Use deny-by-default policies (QUALITY.SECURITY.CONVENTION.003)

**Default:** Set a fallback policy requiring an authenticated user, and mark each public endpoint with `AllowAnonymous` intentionally.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A new endpoint is then protected by default. Named role or scope policies add coarse checks while handlers retain resource authorization.

### Test the resource authorization matrix (QUALITY.SECURITY.CONVENTION.004)

**Default:** Cover anonymous, invalid-token, unrelated-actor, owner, and each privileged grant for every protected operation.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The matrix also covers disclosure behavior and the collection query predicate. A UI redirect or hidden control is not evidence.

## Reference example

This informative example demonstrates `QUALITY.SECURITY.AUTHZ.001` and `QUALITY.SECURITY.ERRORS.001`.

`GET /api/posts/{id}` for a private draft filters by both post ID and the author ID derived from claims. A different author receives the documented not-found or forbidden response without learning protected fields.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| QUALITY.SECURITY.AUTHN.001 | inspection | `AuthenticationTests` rejects tokens with a wrong issuer, audience, signature, or expiry, and rejects identity headers. |
| QUALITY.SECURITY.ACTOR.001 | inspection | `ActorIdentityTests` asserts the actor resolves from claims and that request-supplied identifiers are ignored. |
| QUALITY.SECURITY.AUTHZ.001 | inspection | `TargetAuthorizationTests` asserts each protected operation rejects a non-owner and filters collections in the query predicate. |
| QUALITY.SECURITY.INPUT.001 | static | `InputValidationTests` asserts each boundary rejects malformed shape, out-of-range values, and unbounded pagination. |
| QUALITY.SECURITY.SECRETS.001 | inspection | `SecretScanTests` and the CI secret scan assert no tracked file or emitted diagnostic carries a secret value. |
| QUALITY.SECURITY.SQL.001 | inspection | `SqlInjectionTests` asserts no query path concatenates an external value into command text. |
| QUALITY.SECURITY.ERRORS.001 | inspection | `ErrorDisclosureTests` asserts each public error carries only the four permitted elements. |
| QUALITY.SECURITY.FRONTEND.001 | inspection | `FrontendSecurityTests` asserts the policy, headers, redirect validation, and forgery protection are present on each response. |
| QUALITY.SECURITY.SUPPLY.001 | static | `pnpm install --frozen-lockfile` and the NuGet restore fail when a resolved version differs from its manifest pin. |
| QUALITY.SECURITY.DATA.001 | inspection | Data review compares each returned and logged field against the field list its use case declares. |
| QUALITY.SECURITY.ABUSE.001 | inspection | `RateLimitTests` asserts each declared endpoint returns 429 with its stable code above the configured limit. |
| QUALITY.SECURITY.CORS.001 | inspection | `CorsTests` asserts an unlisted origin is rejected and no wildcard origin is served with credentials. |
| QUALITY.SECURITY.AUDIT.001 | inspection | `AuditEventTests` asserts each security-relevant operation emits an event carrying all seven fields. |
| QUALITY.SECURITY.ROTATION.001 | operation | The secret inventory records owner, interval, location, revocation, and the date of the last recovery test. |
| QUALITY.SECURITY.SUPPLY.002 | inspection | The CI supply-chain job fails on an unpinned action reference or an unexcepted high-severity advisory. |
| QUALITY.SECURITY.CONVENTION.001 | inspection | `ArchitectureTests` asserts one actor accessor type exists and Application resolves no claims principal. |
| QUALITY.SECURITY.CONVENTION.002 | static | `SecureHeaderTests` asserts every required header is present on a representative response. |
| QUALITY.SECURITY.CONVENTION.003 | inspection | `AuthorizationPolicyTests` asserts every endpoint without `AllowAnonymous` rejects an anonymous caller. |
| QUALITY.SECURITY.CONVENTION.004 | test | `AuthorizationMatrixTests` asserts each protected operation across the five caller cases and its collection predicate. |

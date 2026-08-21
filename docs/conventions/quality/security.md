# Security

## Intent


Security boundaries follow identity, resource ownership, data classification, and trust transitions across API, persistence, frontend, external services, and operations. Authentication establishes identity. Each use case still defines authorization for its target.

## Agent Summary {#agent-summary}


- Keep backend authentication provider-neutral. (SECURITY.AUTHN.001)
- Derive the actor from claims. (SECURITY.ACTOR.001)
- Authorize each target resource. (SECURITY.AUTHZ.001)
- Validate at trust boundaries. (SECURITY.INPUT.001)
- Keep secrets out of tracked and observable data. (SECURITY.SECRETS.001)
- Parameterize database input. (SECURITY.SQL.001)
- Limit public error detail. (SECURITY.ERRORS.001)
- Protect browser boundaries. (SECURITY.FRONTEND.001)
- Pin and review dependencies. (SECURITY.SUPPLY.001)
- Minimize sensitive data. (SECURITY.DATA.001)

## Standards


### Keep backend authentication provider-neutral (SECURITY.AUTHN.001)

**Requirement:** Consumers MUST keep backend authentication provider-neutral.

**Rationale:** The implementation validates issuer, audience, signature, lifetime, and required claims through OIDC and JWT bearer standards. Provider-specific login and session behavior belongs in a frontend or infrastructure extension.

The implementation does not accept unsigned tokens, decode a token without validation, or trust client-supplied identity headers.

The implementation keeps inbound claim mapping disabled so configured claim names remain stable. The implementation requires a valid `sub` claim for actor-backed endpoints. The implementation configures the exact scope and role claim names supplied by the selected identity provider. The implementation does not search several claim aliases until one matches.

### Derive the actor from claims (SECURITY.ACTOR.001)

**Requirement:** Consumers MUST derive the actor from claims.

**Rationale:** The authenticated actor ID comes from verified claims and is converted to the project's strongly typed ID at the WebApi boundary.

The implementation does not accept the current actor ID from request data.

The current actor accessor exposes the typed subject plus the declared roles and scopes needed by endpoint policies. A protected endpoint fails authentication when the subject is missing or cannot be parsed. Anonymous access does not produce a default or empty actor.

### Authorize each target resource (SECURITY.AUTHZ.001)

**Requirement:** Consumers MUST authorize each target resource.

**Rationale:** Every protected query and command checks the policy relevant to its target, including role, ownership, tenant, state, or delegated access.

Collection queries apply authorization in the database filter. The implementation does not load an unrestricted collection and filter it only in memory.

### Validate at trust boundaries (SECURITY.INPUT.001)

**Requirement:** Consumers MUST validate at trust boundaries.

**Rationale:** The implementation validates transport shape, required values, lengths, ranges, formats, file metadata, and pagination bounds before use. Domain validates business invariants.

The implementation treats database content, external provider responses, file contents, and generated text as untrusted when they cross into a new output context.

### Keep secrets out of tracked and observable data (SECURITY.SECRETS.001)

**Requirement:** Consumers MUST keep secrets out of tracked and observable data.

**Rationale:** The implementation does not commit secrets or place them in logs, traces, exception messages, generated files, or browser storage. It also excludes secrets from URLs, test snapshots, container layers, and pull request text.

The implementation uses platform secret stores and redact sensitive configuration from diagnostics.

### Parameterize database input (SECURITY.SQL.001)

**Requirement:** Consumers MUST parameterize database input.

**Rationale:** The implementation uses Marten query APIs or parameterized SQL for every external value. The implementation does not build SQL through string concatenation or interpolation into raw command text.

The reporting extension owns reviewed raw SQL patterns.

### Limit public error detail (SECURITY.ERRORS.001)

**Requirement:** Consumers MUST limit public error detail.

**Rationale:** Public errors expose a stable code, safe message, trace ID, and allowed field errors. They do not expose stack traces, SQL, connection details, provider bodies, internal IDs not part of the contract, or authorization reasoning that leaks resource existence.

### Protect browser boundaries (SECURITY.FRONTEND.001)

**Requirement:** Consumers MUST protect browser boundaries.

**Rationale:** The frontend uses framework rendering to escape output. It sanitizes approved rich content. The implementation applies a documented Content Security Policy, secure headers, safe redirect validation, and request forgery protection appropriate to the selected session model.

Frontend route guards and hidden controls do not replace API authorization.

### Pin and review dependencies (SECURITY.SUPPLY.001)

**Requirement:** Consumers MUST pin and review dependencies.

**Rationale:** The implementation uses exact manifest pins and a frozen lockfile. Package review covers install scripts, transitive changes, source reputation, maintenance status, and security advisories.

The implementation does not disable integrity or certificate verification to make an installation succeed.

### Minimize sensitive data (SECURITY.DATA.001)

**Requirement:** Consumers MUST minimize sensitive data.

**Rationale:** The implementation collects, returns, logs, exports, and retains only fields that the Use case requires. A Use case with the `sensitive-data` Risk documents classification, access, retention, deletion, and audit behavior.

### Bound abuse at exposed endpoints (SECURITY.ABUSE.001)

**Requirement:** Consumers MUST bound abuse at exposed endpoints.

**Rationale:** Public, authentication, webhook, search, upload, and expensive endpoints define a rate or concurrency limit. They also define limiting key, rejection response, and monitoring owner. A caller above the limit receives 429 with a stable error code. Multiple enforcing replicas use a shared store.

### Restrict cross-origin access (SECURITY.CORS.001)

**Requirement:** Consumers MUST restrict cross-origin access.

**Rationale:** A cross-origin browser client receives only declared origins, methods, headers, and credential mode. Wildcard origins never combine with credentials. Validated configuration owns the allowlist. An integration test rejects an unlisted origin.

### Record security audit events (SECURITY.AUDIT.001)

**Requirement:** Consumers MUST record security audit events.

**Rationale:** A security audit event records actor, action, target, outcome, timestamp, trace ID, and available reason. Audit records follow documented retention and access policy. They exclude secrets and remain available for incident review.

### Rotate production secrets (SECURITY.ROTATION.001)

**Requirement:** Consumers MUST rotate production secrets.

**Rationale:** Every production secret has an owner, rotation interval, storage location, revocation procedure, and recovery test. Rotation supports overlap when clients cannot switch simultaneously. Procedures, logs, artifacts, and audit records contain no secret values.

### Enforce supply-chain gates in CI (SECURITY.SUPPLY.002)

**Requirement:** Consumers MUST enforce supply-chain gates in CI.

**Rationale:** CI scans direct and transitive dependencies. It pins GitHub Actions to immutable references or an approved repository pin. Each release publishes an SBOM or equivalent inventory. A known high-severity vulnerability requires a documented exception before release.

## Conventions


### Use one current actor abstraction (SECURITY.CONVENTION.001)

**Default:** Use one current actor abstraction.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** WebApi owns a narrow current actor accessor that maps verified claims to typed identity and declared roles or scopes. Application receives the actor through command/query input created by WebApi or through a narrow trusted port when host-independent behavior requires it.

### Keep secure headers in host configuration (SECURITY.CONVENTION.002)

**Default:** Keep secure headers in host configuration.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation defines Content Security Policy, frame restrictions, content-type protection, referrer policy, and transport security in one reviewed host location. Tests verify required headers.

### Use deny-by-default policies (SECURITY.CONVENTION.003)

**Default:** Use deny-by-default policies.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation sets a fallback policy that requires an authenticated user. Public endpoints call `AllowAnonymous` intentionally. Endpoints add named role or scope policies when needed, while handlers retain resource authorization.

### Test the resource authorization matrix (SECURITY.CONVENTION.004)

**Default:** Test the resource authorization matrix.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The authorization matrix covers anonymous, invalid-token, unrelated-actor, and owner cases for each protected operation. It covers each privileged grant that changes the outcome. Tests cover disclosure behavior and the collection query predicate. A UI redirect or hidden control is not evidence.

## Reference example

This informative example demonstrates `SECURITY.AUTHZ.001` and `SECURITY.ERRORS.001`.

`GET /api/posts/{id}` for a private draft filters by both post ID and the author ID derived from claims. A different author receives the documented not-found or forbidden response without learning protected fields.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| SECURITY.AUTHN.001 | inspection | Pull request review asserts `keep backend authentication provider-neutral` in the owning specification and source paths. |
| SECURITY.ACTOR.001 | inspection | Pull request review asserts `derive the actor from claims` in the owning specification and source paths. |
| SECURITY.AUTHZ.001 | inspection | Pull request review asserts `authorize each target resource` in the owning specification and source paths. |
| SECURITY.INPUT.001 | static | Repository static check asserts `validate at trust boundaries` for the owning paths. |
| SECURITY.SECRETS.001 | inspection | Pull request review asserts `keep secrets out of tracked and observable data` in the owning specification and source paths. |
| SECURITY.SQL.001 | inspection | Pull request review asserts `parameterize database input` in the owning specification and source paths. |
| SECURITY.ERRORS.001 | inspection | Pull request review asserts `limit public error detail` in the owning specification and source paths. |
| SECURITY.FRONTEND.001 | inspection | Pull request review asserts `protect browser boundaries` in the owning specification and source paths. |
| SECURITY.SUPPLY.001 | static | Repository static check asserts `pin and review dependencies` for the owning paths. |
| SECURITY.DATA.001 | inspection | Pull request review asserts `minimize sensitive data` in the owning specification and source paths. |
| SECURITY.ABUSE.001 | inspection | Pull request review asserts `bound abuse at exposed endpoints` in the owning specification and source paths. |
| SECURITY.CORS.001 | inspection | Pull request review asserts `restrict cross-origin access` in the owning specification and source paths. |
| SECURITY.AUDIT.001 | inspection | Pull request review asserts `record security audit events` in the owning specification and source paths. |
| SECURITY.ROTATION.001 | inspection | Pull request review asserts `rotate production secrets` in the owning specification and source paths. |
| SECURITY.SUPPLY.002 | inspection | Pull request review asserts `enforce supply-chain gates in CI` in the owning specification and source paths. |
| SECURITY.CONVENTION.001 | inspection | Pull request review asserts `use one current actor abstraction` in the owning specification and source paths. |
| SECURITY.CONVENTION.002 | static | Repository static check asserts `keep secure headers in host configuration` for the owning paths. |
| SECURITY.CONVENTION.003 | inspection | Pull request review asserts `use deny-by-default policies` in the owning specification and source paths. |
| SECURITY.CONVENTION.004 | test | An automated test citing `SECURITY.CONVENTION.004` asserts `test the resource authorization matrix` at the affected boundary. |

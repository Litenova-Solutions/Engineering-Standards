# Security

## Intent


Security boundaries follow identity, resource ownership, data classification, and trust transitions across API, persistence, frontend, external services, and operations. Authentication establishes identity. Each use case still defines authorization for its target.

## Agent Summary {#agent-summary}


- Tokens are validated against issuer, audience, signature, lifetime, and claims. (standards/rule/quality-security.keep-backend-authentication-provider-neutral)
- The actor comes from claims and becomes a typed identifier. (standards/rule/quality-security.derive-the-actor-from-claims)
- Every protected operation authorizes its target resource. (standards/rule/quality-security.authorize-each-target-resource)
- Trust boundaries validate shape, range, and bounds before use. (standards/rule/quality-security.validate-at-trust-boundaries)
- Secrets stay out of source, logs, diagnostics, and storage. (standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data)
- Database input is always parameterized. (standards/rule/quality-security.parameterize-database-input)
- Public errors carry a code, safe message, trace, and field errors. (standards/rule/quality-security.limit-public-error-detail)
- Frontends escape output and apply policy, headers, and forgery protection. (standards/rule/quality-security.protect-browser-boundaries)
- Dependencies resolve from exact pins and a frozen lockfile. (standards/rule/quality-security.pin-and-review-dependencies)
- Use cases handle only the fields they require. (standards/rule/quality-security.minimize-sensitive-data)

## Standards


### Keep backend authentication provider-neutral (standards/rule/quality-security.keep-backend-authentication-provider-neutral)

**Requirement:** A backend MUST validate issuer, audience, signature, lifetime, and required claims through OIDC and JWT bearer standards.

**Rationale:** Provider-specific login and session behavior belongs to a frontend or an extension. An unsigned token, an unvalidated decode, or a client-supplied identity header is never accepted.

### Derive the actor from claims (standards/rule/quality-security.derive-the-actor-from-claims)

**Requirement:** The authenticated actor identifier MUST come from verified claims and convert to the project typed identifier at the WebApi boundary.

**Rationale:** The accessor exposes the typed subject plus the declared roles and scopes that endpoint policies need. Request data never supplies the current actor.

### Authorize each target resource (standards/rule/quality-security.authorize-each-target-resource)

**Requirement:** A protected query or command MUST check role, ownership, tenant, state, or delegated access against its target.

**Rationale:** A single-target operation resolves its target and checks the caller against it.

### Restrict a protected collection in the database (standards/rule/quality-security.restrict-a-protected-collection-in-the-database)

**Requirement:** A protected collection query MUST apply its authorization scope as a database predicate, before paging, rather than filter a materialized result.

**Rationale:** A collection has no single target, so the check that `standards/rule/quality-security.authorize-each-target-resource` states has nothing to resolve against. Reading the unrestricted set already exposed the rows to the process. A page assembled from them leaks the total count even when every row is dropped. [OWASP lists this as broken object level authorization](https://owasp.org/www-project-top-ten/2021/A01_2021-Broken_Access_Control/).

**Example:** A query for an organization's orders adds the organization predicate to the database query. It does not load every order and drop the ones the caller may not read.

### Validate at trust boundaries (standards/rule/quality-security.validate-at-trust-boundaries)

**Requirement:** A trust boundary MUST validate transport shape, required values, length, range, format, file metadata, and pagination bounds before use.

**Rationale:** Domain validates business invariants separately. Database content, provider responses, file contents, and generated text stay untrusted when they cross into a new output context.

### Keep secrets out of tracked and observable data (standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data)

**Requirement:** A secret MUST NOT appear in source, logs, traces, exception messages, generated files, URLs, snapshots, container layers, or browser storage.

**Rationale:** Platform secret stores hold the values and diagnostics redact sensitive configuration before it is emitted.

### Parameterize database input (standards/rule/quality-security.parameterize-database-input)

**Requirement:** An external value reaching the database MUST travel through a provider query API or a parameterized SQL parameter.

**Rationale:** String concatenation or interpolation into raw command text makes the value part of the statement. The provider query API is Marten's under the baseline and EF Core's under its extension, and both parameterize. The reporting extension owns the reviewed raw SQL patterns.

### Limit public error detail (standards/rule/quality-security.limit-public-error-detail)

**Requirement:** A public error MUST expose only a stable code, safe message, trace identifier, and allowed field errors.

**Rationale:** A stack trace, SQL, connection detail, provider body, uncontracted internal identifier, or authorization reason that reveals resource existence gives an attacker structure.

### Protect browser boundaries (standards/rule/quality-security.protect-browser-boundaries)

**Requirement:** A frontend MUST apply framework escaping, a documented Content Security Policy, secure headers, redirect validation, and request forgery protection.

**Rationale:** Approved rich content is sanitized before render. A route guard or hidden control is presentation, so it never replaces API authorization.

### Pin and review dependencies (standards/rule/quality-security.pin-and-review-dependencies)

**Requirement:** A dependency MUST resolve from an exact manifest pin and a frozen lockfile, with integrity and certificate verification enabled.

**Rationale:** Package review still covers install scripts, transitive changes, source reputation, maintenance status, and advisories before a pin changes.

### Minimize sensitive data (standards/rule/quality-security.minimize-sensitive-data)

**Requirement:** A use case MUST collect, return, log, export, and retain only the fields it requires.

**Rationale:** A use case carrying the `sensitive-data` risk also documents classification, access, retention, deletion, and audit behavior.

### Bound abuse at exposed endpoints (standards/rule/quality-security.bound-abuse-at-exposed-endpoints)

**Requirement:** A public, authentication, webhook, search, upload, or expensive endpoint MUST declare a rate or concurrency limit and its rejection response.

**Rationale:** The declaration also names the limiting key and monitoring owner. A caller above the limit receives 429 with a stable code.

### Keep one limit store across replicas (standards/rule/quality-security.keep-one-limit-store-across-replicas)

**Requirement:** A deployment running more than one replica MUST hold its rate and concurrency counters in one store that every replica reads.

**Rationale:** A per-process counter multiplies the declared limit by the replica count, so the limit a specification states is not the limit the system applies. The multiplier also changes when the deployment scales, which makes the effective limit unstated. This was a rationale sentence, where it obliged nobody.

### Restrict cross-origin access (standards/rule/quality-security.restrict-cross-origin-access)

**Requirement:** A cross-origin policy MUST list its allowed origins, methods, headers, and credential mode without using a wildcard origin.

**Rationale:** Validated configuration owns the allowlist so an unlisted origin cannot be introduced by a deployment value.

### Record security audit events (standards/rule/quality-security.record-security-audit-events)

**Requirement:** A security audit event MUST record actor, action, target, outcome, timestamp, trace identifier, and available reason.

**Rationale:** Audit records follow a documented retention and access policy, exclude secrets, and stay available for incident review. A consumer that activates the audit extension records the event through that extension instead. The extension states a wider field set, a classification rule, and a tamper-evidence rule.

### Rotate production secrets (standards/rule/quality-security.rotate-production-secrets)

**Requirement:** A production secret MUST have an owner, rotation interval, storage location, revocation procedure, and tested recovery.

**Rationale:** Rotation supports overlap when clients cannot switch at once. Procedures, logs, artifacts, and audit records carry no secret value.

### Enforce supply-chain gates in CI (standards/rule/quality-security.enforce-supply-chain-gates-in-ci)

**Requirement:** CI MUST scan direct and transitive dependencies, pin every action to an immutable reference, and publish an inventory per release.

**Rationale:** A known high-severity vulnerability then requires a documented exception before the release proceeds.

## Conventions


### Use one current actor abstraction (standards/rule/quality-security.use-one-current-actor-abstraction)

**Default:** Expose one narrow current-actor accessor in WebApi that maps verified claims to typed identity, roles, and scopes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Application receives the actor through input that WebApi creates, or through a narrow trusted port when behavior must stay host-independent.

### Keep secure headers in host configuration (standards/rule/quality-security.keep-secure-headers-in-host-configuration)

**Default:** Define Content Security Policy, frame restrictions, content-type protection, referrer policy, and transport security in one host location.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One location keeps the header set reviewable instead of spread across middleware registrations.

### Use deny-by-default policies (standards/rule/quality-security.use-deny-by-default-policies)

**Default:** Set a fallback policy requiring an authenticated user, and mark each public endpoint with `AllowAnonymous` intentionally.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A new endpoint is then protected by default. Named role or scope policies add coarse checks while handlers retain resource authorization.

### Test the resource authorization matrix (standards/rule/quality-security.test-the-resource-authorization-matrix)

**Default:** Cover anonymous, invalid-token, unrelated-actor, owner, and each privileged grant for every protected operation.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The matrix also covers disclosure behavior and the collection query predicate. A UI redirect or hidden control is not evidence.

## Reference example

This informative example demonstrates `standards/rule/quality-security.authorize-each-target-resource` and `standards/rule/quality-security.limit-public-error-detail`.

`GET /api/posts/{id}` for a private draft filters by both post ID and the author ID derived from claims. A different author receives the documented not-found or forbidden response without learning protected fields.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/quality-security.keep-backend-authentication-provider-neutral | inspection | `AuthenticationTests` rejects tokens with a wrong issuer, audience, signature, or expiry, and rejects identity headers. |
| standards/rule/quality-security.derive-the-actor-from-claims | inspection | `ActorIdentityTests` asserts the actor resolves from claims and that request-supplied identifiers are ignored. |
| standards/rule/quality-security.authorize-each-target-resource | inspection | `TargetAuthorizationTests` asserts each protected single-target operation rejects a non-owner. |
| standards/rule/quality-security.restrict-a-protected-collection-in-the-database | test | `TargetAuthorizationTests` asserts each protected collection query emits its scope predicate in the captured SQL, before the paging clause. |
| standards/rule/quality-security.validate-at-trust-boundaries | static | `InputValidationTests` asserts each boundary rejects malformed shape, out-of-range values, and unbounded pagination. |
| standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data | inspection | `SecretScanTests` and the CI secret scan assert no tracked file or emitted diagnostic carries a secret value. |
| standards/rule/quality-security.parameterize-database-input | inspection | `SqlInjectionTests` asserts no query path concatenates an external value into command text. |
| standards/rule/quality-security.limit-public-error-detail | inspection | `ErrorDisclosureTests` asserts each public error carries only the four permitted elements. |
| standards/rule/quality-security.protect-browser-boundaries | inspection | `FrontendSecurityTests` asserts the policy, headers, redirect validation, and forgery protection are present on each response. |
| standards/rule/quality-security.pin-and-review-dependencies | static | `pnpm install --frozen-lockfile` and the NuGet restore fail when a resolved version differs from its manifest pin. |
| standards/rule/quality-security.minimize-sensitive-data | inspection | Data review compares each returned and logged field against the field list its use case declares. |
| standards/rule/quality-security.bound-abuse-at-exposed-endpoints | inspection | `RateLimitTests` asserts each declared endpoint returns 429 with its stable code above the configured limit. |
| standards/rule/quality-security.keep-one-limit-store-across-replicas | inspection | Deployment review confirms the limiter resolves a shared store wherever the replica count is above one. |
| standards/rule/quality-security.restrict-cross-origin-access | inspection | `CorsTests` asserts an unlisted origin is rejected and no wildcard origin is served with credentials. |
| standards/rule/quality-security.record-security-audit-events | inspection | `AuditEventTests` asserts each security-relevant operation emits an event carrying all seven fields. |
| standards/rule/quality-security.rotate-production-secrets | operation | The secret inventory records owner, interval, location, revocation, and the date of the last recovery test. |
| standards/rule/quality-security.enforce-supply-chain-gates-in-ci | inspection | The CI supply-chain job fails on an unpinned action reference or an unexcepted high-severity advisory. |
| standards/rule/quality-security.use-one-current-actor-abstraction | inspection | `ArchitectureTests` asserts one actor accessor type exists and Application resolves no claims principal. |
| standards/rule/quality-security.keep-secure-headers-in-host-configuration | static | `SecureHeaderTests` asserts every required header is present on a representative response. |
| standards/rule/quality-security.use-deny-by-default-policies | inspection | `AuthorizationPolicyTests` asserts every endpoint without `AllowAnonymous` rejects an anonymous caller. |
| standards/rule/quality-security.test-the-resource-authorization-matrix | test | `AuthorizationMatrixTests` asserts each protected operation across the five caller cases and its collection predicate. |

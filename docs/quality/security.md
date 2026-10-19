# Security

## Intent

Security boundaries follow identity, resource ownership, data classification, and trust transitions across API, persistence, frontend, external services, and operations. Authentication establishes identity. Each use case declares the permissions it needs, and the application guard authorizes from them.

## Agent Summary {#agent-summary}

- Tokens are validated and the actor comes from claims. (standards/rule/quality-security.keep-backend-authentication-provider-neutral, standards/rule/quality-security.derive-the-actor-from-claims)
- Breach notification meets its deadline, and live data at rest stays encrypted or excepted. (standards/rule/quality-security.report-a-breach-within-its-deadline, standards/rule/quality-security.protect-live-data-at-rest)
- The application guard authorizes every protected operation. (standards/rule/quality-security.authorize-each-target-resource, standards/rule/quality-security.restrict-a-protected-collection-in-the-database)
- Trust boundaries validate shape, range, and bounds before use. (standards/rule/quality-security.validate-at-trust-boundaries)
- Secrets and personal data stay out of source, logs, diagnostics, and storage. (standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data, standards/rule/quality-security.keep-personal-data-out-of-logs)
- Database input is always parameterized. (standards/rule/quality-security.parameterize-database-input)
- Public errors use the HTTP API error contract. (standards/rule/quality-security.limit-public-error-detail)
- Frontends escape output and apply policy, headers, and forgery protection. (standards/rule/quality-security.protect-browser-boundaries)
- Personal data stays inventoried, portable, and removable, and an unsalted digest counts as personal data. (standards/rule/quality-security.minimize-sensitive-data, standards/rule/quality-security.keep-a-personal-data-inventory-per-store, standards/rule/quality-security.apply-erasure-and-export-to-every-store, standards/rule/quality-security.treat-an-unsalted-digest-as-personal-data)
- Exposed endpoints declare limits, origins stay listed, audit events are recorded, and secrets rotate. (standards/rule/quality-security.bound-abuse-at-exposed-endpoints, standards/rule/quality-security.keep-one-limit-store-across-replicas, standards/rule/quality-security.restrict-cross-origin-access, standards/rule/quality-security.record-security-audit-events, standards/rule/quality-security.rotate-production-secrets)

## Standards

### Keep backend authentication provider-neutral (standards/rule/quality-security.keep-backend-authentication-provider-neutral)

**Requirement:** A backend MUST validate issuer, audience, signature, lifetime, and required claims through OIDC and JWT Bearer.

**Rationale:** Provider-specific login and session behavior belongs to a frontend or an extension. An unsigned token, an unvalidated decode, or a client-supplied identity header is never accepted.

### Derive the actor from claims (standards/rule/quality-security.derive-the-actor-from-claims)

**Requirement:** Actor resolution MUST follow `standards/rule/backend-api.derive-authenticated-identity-from-claims` and `standards/rule/backend-api.reject-a-client-supplied-actor-identifier`.

**Rationale:** Actor resolution has one owner: the WebApi boundary. Request data never supplies the current actor.

### Authorize each target resource (standards/rule/quality-security.authorize-each-target-resource)

**Requirement:** The application guard MUST authorize every protected operation from its use case's declared permissions, as `standards/rule/backend-application.enforce-target-authorization-in-the-pipeline` states, with endpoints adding only coarse policies.

**Rationale:** One decision from one declaration stops operations about the same record asking different questions. An actor holds a role at a scope, a role allows permissions, and a use case needs permissions.

### Restrict a protected collection in the database (standards/rule/quality-security.restrict-a-protected-collection-in-the-database)

**Requirement:** A protected collection query MUST apply its authorization scope as a database predicate, before paging, rather than filter a materialized result.

**Rationale:** A collection has no single target, so the check that `standards/rule/quality-security.authorize-each-target-resource` states has nothing to resolve against. Reading the unrestricted set already exposed the rows to the process. A page assembled from them leaks the total count even when every row is dropped. [OWASP lists this as broken object level authorization](https://owasp.org/www-project-top-ten/2021/A01_2021-Broken_Access_Control/).

**Example:** A query for an organization's orders adds the organization predicate to the database query. It does not load every order and drop the ones the caller may not read.

### Validate at trust boundaries (standards/rule/quality-security.validate-at-trust-boundaries)

**Requirement:** A trust boundary MUST validate transport shape and file metadata before use, leaving message checks to application validators as `standards/rule/backend-application.separate-input-validation-from-invariants` states.

**Rationale:** Message shape, required values, length, range, format, and pagination bounds are the validator checks `standards/rule/backend-application.separate-input-validation-from-invariants` names. Domain validates business invariants separately. Database content, provider responses, file contents, and generated text stay untrusted when they cross into a new output context.

### Keep secrets out of tracked and observable data (standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data)

**Requirement:** A secret MUST NOT appear in source, logs, traces, exception messages, generated files, URLs, snapshots, container layers, or browser storage.

**Rationale:** Platform secret stores hold the values and diagnostics redact sensitive configuration before it is emitted.

### Parameterize database input (standards/rule/quality-security.parameterize-database-input)

**Requirement:** An external value reaching the database MUST travel through a provider query API or a parameterized SQL parameter.

**Rationale:** String concatenation or interpolation into raw command text makes the value part of the statement. The provider query API is Marten's under the baseline and EF Core's under its extension, and both parameterize. The reporting extension owns the reviewed raw SQL patterns.

### Limit public error detail (standards/rule/quality-security.limit-public-error-detail)

**Requirement:** A public error MUST use the error contract `standards/rule/backend-api.return-stable-problem-details` and `standards/rule/backend-api.keep-error-responses-free-of-internal-detail` define.

**Rationale:** The error contract has one owner: the HTTP API rules. A stack trace, SQL, connection detail, provider body, uncontracted internal identifier, or authorization reason that reveals resource existence gives an attacker structure.

### Protect browser boundaries (standards/rule/quality-security.protect-browser-boundaries)

**Requirement:** A frontend MUST apply framework escaping, a documented Content Security Policy, secure headers, redirect validation, forgery protection, and sanitization of approved rich content.

**Rationale:** A route guard or hidden control is presentation, so it never replaces API authorization.

### Minimize sensitive data (standards/rule/quality-security.minimize-sensitive-data)

**Requirement:** A use case MUST collect, return, log, export, and retain only the fields its input and results declare.

**Rationale:** A use case handling sensitive data states its classification, access, retention, deletion, and audit behavior on its page.

### Keep a personal-data inventory per store (standards/rule/quality-security.keep-a-personal-data-inventory-per-store)

**Requirement:** A platform holding personal data MUST keep a personal-data inventory per store naming the fields, purposes, and retention of each store.

**Rationale:** An inventory the team can read is the map every export, erasure, and breach answer starts from.

### Apply erasure and export to every store (standards/rule/quality-security.apply-erasure-and-export-to-every-store)

**Requirement:** Erasure and export MUST reach every store holding personal data, with backups expiring inside the retention bound the Limit records state.

**Rationale:** Stores include logs, search indexes, and outboxes beside the database. A request the team honors in the database but leaves in a log export answers half the duty. A backup cannot answer field by field, so it carries a retention bound instead.

### Keep personal data out of logs (standards/rule/quality-security.keep-personal-data-out-of-logs)

**Requirement:** A log, trace, or diagnostic record MUST NOT carry personal data in clear.

**Rationale:** Redaction at the sink fails once, while a field never emitted fails nowhere.

### Treat an unsalted digest as personal data (standards/rule/quality-security.treat-an-unsalted-digest-as-personal-data)

**Requirement:** An unsalted digest of personal data MUST receive the same handling as the data itself.

**Rationale:** A digest without a salt reverses by table lookup, so it hides nothing from anyone holding the table.

### Report a breach within its deadline (standards/rule/quality-security.report-a-breach-within-its-deadline)

**Requirement:** A breach-notification procedure MUST name an owner and a backup person and meet the deadline the applicable Constraint record states.

**Rationale:** A deadline nobody owns slips past the team, and an owner without a backup fails on the first absence.

### Protect live data at rest (standards/rule/quality-security.protect-live-data-at-rest)

**Requirement:** Live data at rest MUST carry encryption or an Exception record naming this rule.

**Rationale:** Encryption is the default, and the Exception keeps the gap visible with its reason and review date.

### Bound abuse at exposed endpoints (standards/rule/quality-security.bound-abuse-at-exposed-endpoints)

**Requirement:** A public, authentication, webhook, search, or upload endpoint MUST declare its limit as a Limit record with key, owner, and rejection response.

**Rationale:** The key limits one caller, the owner monitors the limit, and the rejection response is 429 with a stable code.

### Keep one limit store across replicas (standards/rule/quality-security.keep-one-limit-store-across-replicas)

**Requirement:** A deployment running more than one replica MUST hold its rate and concurrency counters in one store that every replica reads.

**Rationale:** A per-process counter multiplies the declared limit by the replica count, so the limit a specification states is not the limit the system applies. The multiplier also changes when the deployment scales, which makes the effective limit unstated.

### Restrict cross-origin access (standards/rule/quality-security.restrict-cross-origin-access)

**Requirement:** A cross-origin policy MUST list its allowed origins, methods, headers, and credential mode without using a wildcard origin.

**Rationale:** Validated configuration owns the allowlist, so an unlisted origin cannot arrive by mistake. Deployment-owned origins are allowed when the allowlist shape is validated at startup.

### Record security audit events (standards/rule/quality-security.record-security-audit-events)

**Requirement:** A security audit event MUST record actor, action, target, outcome, timestamp, trace identifier, and available reason.

**Rationale:** Audit records follow a documented retention and access policy, exclude secrets, and stay available for incident review. A consumer that activates the audit extension records the event through that extension instead. The extension states a wider field set, a classification rule, and a tamper-evidence rule.

### Rotate production secrets (standards/rule/quality-security.rotate-production-secrets)

**Requirement:** A production secret MUST have a secret-inventory entry naming its owner, storage location, and next rotation date, with revocation and recovery in a runbook.

**Rationale:** Rotation allows overlap while clients switch. Procedures, logs, artifacts, and audit records carry no secret value, as `standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data` states.

## Conventions

### Use one current actor abstraction (standards/rule/quality-security.use-one-current-actor-abstraction)

**Default:** Expose one narrow current-actor accessor in WebApi that maps verified claims to typed identity, roles, and scopes.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** Application receives the actor through input that WebApi creates, or through a narrow trusted port when behavior must stay host-independent.

### Keep secure headers in host configuration (standards/rule/quality-security.keep-secure-headers-in-host-configuration)

**Default:** Define Content Security Policy, frame restrictions, content-type protection, referrer policy, and transport security in one host location.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** One location keeps the header set reviewable instead of spread across middleware registrations.

### Use deny-by-default policies (standards/rule/quality-security.use-deny-by-default-policies)

**Default:** Set a fallback policy requiring an authenticated user, and mark each public endpoint with `AllowAnonymous` intentionally.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** A new endpoint is then protected by default. Named role or scope policies add coarse checks while the guard retains resource authorization.

### Test the resource authorization matrix (standards/rule/quality-security.test-the-resource-authorization-matrix)

**Default:** Cover anonymous, invalid-token, unrelated-actor, owner, and each privileged grant for every protected operation.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** The matrix also covers disclosure behavior and the collection query predicate. A UI redirect or hidden control is not evidence.

## Reference example

This informative example demonstrates `standards/rule/quality-security.authorize-each-target-resource` and `standards/rule/quality-security.limit-public-error-detail`.

`GET /api/posts/{id}` for a private draft filters by both post ID and the author ID derived from claims. A different author receives the documented not-found or forbidden response without learning protected fields.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/quality-security.keep-backend-authentication-provider-neutral | guidance | Does the backend validate issuer, audience, signature, lifetime, and claims, and refuse identity headers? |
| standards/rule/quality-security.derive-the-actor-from-claims | guidance | Does actor resolution follow the WebApi boundary rules this rule cites? |
| standards/rule/quality-security.authorize-each-target-resource | guidance | Does the guard authorize every protected operation from its declared permissions? |
| standards/rule/quality-security.restrict-a-protected-collection-in-the-database | guidance | Does every protected collection query apply its scope as a database predicate before paging? |
| standards/rule/quality-security.validate-at-trust-boundaries | guidance | Does every trust boundary validate its shape and metadata before use? |
| standards/rule/quality-security.keep-secrets-out-of-tracked-and-observable-data | guidance | Is every secret absent from source, logs, traces, messages, files, URLs, snapshots, layers, and browser storage? |
| standards/rule/quality-security.parameterize-database-input | guidance | Does every external value reach the database through a query API or parameter? |
| standards/rule/quality-security.limit-public-error-detail | guidance | Does every public error use the HTTP API error contract? |
| standards/rule/quality-security.protect-browser-boundaries | guidance | Does every frontend apply escaping, policy, headers, redirect validation, and forgery protection? |
| standards/rule/quality-security.minimize-sensitive-data | guidance | Does every use case handle only the fields its input and results declare? |
| standards/rule/quality-security.keep-a-personal-data-inventory-per-store | guidance | Does the inventory name the fields, purposes, and retention of each store? |
| standards/rule/quality-security.apply-erasure-and-export-to-every-store | guidance | Do erasure and export reach every store, with backups expiring inside their bound? |
| standards/rule/quality-security.keep-personal-data-out-of-logs | guidance | Is personal data absent in clear from every log, trace, and diagnostic record? |
| standards/rule/quality-security.treat-an-unsalted-digest-as-personal-data | guidance | Does every unsalted digest of personal data receive personal-data handling? |
| standards/rule/quality-security.report-a-breach-within-its-deadline | guidance | Does the breach procedure name an owner, a backup person, and meet its deadline? |
| standards/rule/quality-security.protect-live-data-at-rest | guidance | Is every live store encrypted, or covered by an Exception naming this rule? |
| standards/rule/quality-security.bound-abuse-at-exposed-endpoints | guidance | Does every exposed endpoint declare its limit, and answer 429 above it? |
| standards/rule/quality-security.keep-one-limit-store-across-replicas | guidance | Do all replicas read rate and concurrency counters from one store? |
| standards/rule/quality-security.restrict-cross-origin-access | guidance | Does the cross-origin policy list origins, methods, headers, and credential mode without a wildcard origin? |
| standards/rule/quality-security.record-security-audit-events | guidance | Does every security audit event record actor, action, target, outcome, timestamp, trace, and reason? |
| standards/rule/quality-security.rotate-production-secrets | guidance | Does every production secret have a secret-inventory entry and a revocation runbook? |
| standards/rule/quality-security.use-one-current-actor-abstraction | guidance | Does WebApi expose one current-actor accessor, or does an Exception record the replacement? |
| standards/rule/quality-security.keep-secure-headers-in-host-configuration | guidance | Are the secure headers defined in one host location, or is an Exception recorded? |
| standards/rule/quality-security.use-deny-by-default-policies | guidance | Is every new endpoint protected by default, or is an Exception recorded? |
| standards/rule/quality-security.test-the-resource-authorization-matrix | guidance | Does every protected operation pass each caller case the convention lists, or is an Exception recorded? |

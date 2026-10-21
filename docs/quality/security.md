# Security

## Intent

Security answers 3 questions for every operation: who acts, what it touches, and what it keeps. This page states how a LiteSpec product answers them: authentication, actor resolution, authorization, trust boundaries, secrets, browser defenses, personal data, abuse limits, and audit events. It applies to anyone who builds or reviews an operation, an endpoint, a frontend, or a release. A product that follows it proves every operation runs for the right actor, touches only what it may, and keeps sensitive data safe.

## Concepts

### Actors, roles, and permissions

Every protected operation answers one question: who may do what to which target. An actor is whoever acts: a person, a company, a provider, a system, or a guest. An actor holds a role at a scope, such as one organization; a role allows permissions from the shared closed list; and each use case declares the permissions it needs. The application guard authorizes every protected operation from those declarations, so two operations about the same record ask the same question.

### Trust boundaries

A trust boundary is any point where data crosses from one owner to another: a request arriving at the API, a file upload, a provider response, database content rendered into a new output, or generated text shown to a user. Each boundary validates what crosses it before use, because data that was safe in its old context may be unsafe in the new one. Application validators then check message shape, while Domain checks business invariants.

### Personal data and its stores

Personal data spreads further than the database: logs, search indexes, outboxes, snapshots, and backups each hold their own copy. Each store that holds personal data keeps its own inventory entry naming the fields, the purposes, and the retention, so every export, erasure, and breach answer starts from the same map.

## Standards

### Keep backend authentication provider-neutral

**Requirement:** A backend MUST validate issuer, audience, signature, lifetime, and required claims through OIDC and JWT Bearer.

**Rationale:** The backend accepts one thing: a token whose issuer, audience, signature, lifetime, and required claims validate through OIDC and JWT Bearer. Provider-specific login and session behavior belongs to a frontend or an extension, because the API cannot recheck a login flow it cannot see. An unsigned token, an unvalidated decode, or a client-supplied identity header is never accepted: each one lets a caller mint its own identity.

### Derive the actor from claims

**Requirement:** Actor resolution MUST follow `litespec/quality/security#use-one-current-actor-abstraction`.

**Rationale:** Actor resolution has one owner: the WebApi boundary, which maps verified claims to identity, roles, and scopes through the one current-actor accessor. Request data never supplies the current actor, because anything the caller sends can name anyone. One resolution path keeps every operation answering "who acts" from the same verified source.

### Authorize each target resource

**Requirement:** The application guard MUST authorize every protected operation from its use case's declared permissions, as `litespec/backend/application#enforce-target-authorization-in-the-pipeline` states, with endpoints adding only coarse policies.

**Rationale:** One decision from one declaration stops two operations about the same record from asking different questions. The use case declares the permissions it needs, the guard resolves the actor's roles at the target's scope, and the decision follows. Endpoints add only coarse policies, because a policy that cannot see business data cannot decide about a business record.

### Restrict a protected collection in the database

**Requirement:** A protected collection query MUST apply its authorization scope as a database predicate, before paging, rather than filter a materialized result.

**Rationale:** A collection has no single target, so the check that `litespec/quality/security#authorize-each-target-resource` states has nothing to resolve against: the scope must become part of the database query itself. Reading the unrestricted set already exposes the rows to the process, and a page assembled from them leaks the total count even when every row is dropped. Filtering after the load is the shape [OWASP lists as broken object level authorization](https://owasp.org/www-project-top-ten/2021/A01_2021-Broken_Access_Control/).

**Example:** A query for an organization's orders adds the organization predicate to the database query. It does not load every order and drop the ones the caller may not read.

### Validate at trust boundaries

**Requirement:** A trust boundary MUST validate transport shape and file metadata before use, leaving message checks to application validators as `litespec/backend/application#separate-input-validation-from-invariants` states.

**Rationale:** Message shape, required values, length, range, format, and pagination bounds stay with the application validators that `litespec/backend/application#separate-input-validation-from-invariants` names, and business invariants stay with Domain. Each layer then answers only the questions it can see. Database content, provider responses, file contents, and generated text stay untrusted when they cross into a new output context, because validation for one context proves nothing about the next.

### Keep secrets out of tracked and observable data

**Requirement:** A secret MUST NOT appear in source, logs, traces, exception messages, generated files, URLs, snapshots, container layers, or browser storage.

**Rationale:** Every place a secret lands is a place it leaks from: source reaches every clone, logs and traces reach every dashboard reader, URLs reach every proxy log, snapshots and container layers outlive the process, and browser storage reaches the user. Platform secret stores hold the values instead, and diagnostics redact sensitive configuration before it is emitted, so the value never enters the observable stream.

### Parameterize database input

**Requirement:** An external value reaching the database MUST travel through a provider query API or a parameterized SQL parameter.

**Rationale:** String concatenation or interpolation into raw command text makes the value part of the statement, so a crafted value rewrites the query. A provider query API or a parameterized SQL parameter keeps the value as data. The provider query API is Marten's under the baseline and EF Core's under its extension, and both parameterize. The reporting extension owns the reviewed raw SQL patterns.

### Limit public error detail

**Requirement:** A public error MUST use the error contract `litespec/backend/api#return-stable-problem-details` defines.

**Rationale:** The error contract has one owner: the HTTP API rules. Every public error then carries the same stable shape with nothing extra. A stack trace, SQL, connection detail, provider body, uncontracted internal identifier, or authorization reason that reveals resource existence gives an attacker the system's structure with every error.

### Protect browser boundaries

**Requirement:** A frontend MUST apply framework escaping, a documented Content Security Policy, secure headers, redirect validation, forgery protection, and sanitization of approved rich content.

**Rationale:** The browser is hostile ground: injected scripts, forged requests, malicious redirects, and hostile markup all arrive as ordinary page content. Framework escaping, a documented Content Security Policy, secure headers, redirect validation, forgery protection, and sanitization of approved rich content each blocks one of those attacks. A route guard or hidden control is presentation, so it never replaces API authorization.

### Minimize sensitive data

**Requirement:** A use case MUST collect, return, log, export, and retain only the fields its input and results declare.

**Rationale:** Data the use case never collects cannot leak from it. Collecting, returning, logging, exporting, and retaining only the declared fields keeps each use case's exposure exactly what its page promises. A use case handling sensitive data states its classification, access, retention, deletion, and audit behavior on its page, so the promise is written where the fields are.

### Keep a personal-data inventory per store

**Requirement:** A platform holding personal data MUST keep a personal-data inventory per store naming the fields, purposes, and retention of each store.

**Rationale:** Export, erasure, and breach answers each ask the same opening question: which stores hold this person's data, which fields, for which purposes, and for how long. An inventory the team can read answers it in one place. Without it, each request starts with a search across logs, indexes, and outboxes, and the store nobody remembers stays out of the answer.

### Apply erasure and export to every store

**Requirement:** Erasure and export MUST reach every store holding personal data, with backups expiring inside the retention bound the Limit records state.

**Rationale:** Personal data lives in logs, search indexes, and outboxes beside the database. A request honored in the database but left in a log export answers half the duty and breaks the promise to the person. A backup cannot answer field by field, so it carries a retention bound instead, and the data ages out with the backup.

### Keep personal data out of logs

**Requirement:** A log, trace, or diagnostic record MUST NOT carry personal data in clear.

**Rationale:** Logs flow to stores the product does not control: collectors, dashboards, long-term archives. Redaction at the sink fails once, in one pipeline, and the cleartext is already downstream. A field never emitted fails nowhere.

### Treat an unsalted digest as personal data

**Requirement:** An unsalted digest of personal data MUST receive the same handling as the data itself.

**Rationale:** A digest without a salt reverses by table lookup: anyone holding a table of common values recovers the original. It hides nothing, so it gets none of the relaxed handling a truly one-way value earns. The same handling as the data itself keeps the digest from leaking what the data would.

### Report a breach within its deadline

**Requirement:** A breach-notification procedure MUST name an owner and a backup person and meet the deadline the applicable Constraint record states.

**Rationale:** A breach deadline starts running at discovery. The applicable Constraint record states the deadline the outside rule sets. A deadline nobody owns slips past the team, and an owner without a backup fails on the first absence. Naming both before anything happens keeps the procedure starting on time.

### Protect live data at rest

**Requirement:** Live data at rest MUST carry encryption or an Exception record naming this rule.

**Rationale:** Live data at rest outlives the process: disks, snapshots, and replicas each hold a copy outside the application's control. Encryption keeps each copy unreadable without its key. Where encryption does not apply yet, the Exception naming this rule keeps the gap visible with its reason and review date instead of silent.

### Bound abuse at exposed endpoints

**Requirement:** A public, authentication, webhook, search, or upload endpoint MUST declare its limit as a Limit record with key, owner, and rejection response.

**Rationale:** Public, authentication, webhook, search, and upload endpoints invite abuse: credential stuffing, scraping, flooding. Declaring the limit as a Limit record names the key that isolates one caller, the owner who monitors the limit, and the rejection response the caller sees. The rejection is `429` with a stable code, so legitimate callers can back off and retry.

### Keep one limit store across replicas

**Requirement:** A deployment running more than one replica MUST hold its rate and concurrency counters in one store that every replica reads.

**Rationale:** A per-process counter multiplies the declared limit by the replica count, so the limit the specification states is not the limit the system applies. The multiplier also changes whenever the deployment scales, which makes the effective limit unstated and unreviewable. One store every replica reads keeps the applied limit equal to the declared one.

### Restrict cross-origin access

**Requirement:** A cross-origin policy MUST list its allowed origins, methods, headers, and credential mode without using a wildcard origin.

**Rationale:** A wildcard origin lets any site call the API with the user's credentials, which turns every malicious page into an API client. Listing allowed origins, methods, headers, and credential mode keeps each cross-origin caller explicit. Validated configuration owns the allowlist, so an unlisted origin cannot arrive by mistake. Deployment-owned origins are allowed when the allowlist shape is validated at startup.

### Record security audit events

**Requirement:** A security audit event MUST record actor, action, target, outcome, timestamp, trace identifier, and available reason.

**Rationale:** An incident review reconstructs who did what to which target, with what outcome and why. Without actor, action, target, outcome, timestamp, trace identifier, and reason on each security event, the reconstruction is guesswork. Audit records follow a documented retention and access policy, exclude secrets, and stay available for incident review. A consumer that activates the audit extension records the event through that extension instead, which states a wider field set, a classification rule, and a tamper-evidence rule.

### Rotate production secrets

**Requirement:** A production secret MUST have a secret-inventory entry naming its owner, storage location, and next rotation date, with revocation and recovery in a runbook.

**Rationale:** Every secret leaks eventually: through a departing teammate, a copied file, an old backup. A secret-inventory entry with owner, storage location, and next rotation date keeps each secret's lifetime bounded, and rotation allows overlap while clients switch. Procedures, logs, artifacts, and audit records carry no secret value, as `litespec/quality/security#keep-secrets-out-of-tracked-and-observable-data` states, and revocation and recovery live in a runbook.

## Conventions

### Use one current actor abstraction

**Default:** Expose one narrow current-actor accessor in WebApi that maps verified claims to typed identity, roles, and scopes.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** One narrow accessor in WebApi keeps claims mapping in one place: typed identity, roles, and scopes, mapped once. Application receives the actor through input that WebApi creates, or through a narrow trusted port when behavior must stay host-independent. A second accessor invites a second interpretation of the same claims.

### Keep secure headers in host configuration

**Default:** Define Content Security Policy, frame restrictions, content-type protection, referrer policy, and transport security in one host location.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** Content Security Policy, frame restrictions, content-type protection, referrer policy, and transport security form one set: the browser reads them together. Spread across middleware registrations, one of them is always the header nobody remembers. One host location keeps the set reviewable as a whole.

### Use deny-by-default policies

**Default:** Set a fallback policy requiring an authenticated user, and mark each public endpoint with `AllowAnonymous` intentionally.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** A new endpoint nobody secured is a public endpoint by accident. A fallback policy requiring an authenticated user keeps each new endpoint protected until somebody marks it public on purpose with `AllowAnonymous`. Named role or scope policies add coarse checks while the guard retains resource authorization.

### Test the resource authorization matrix

**Default:** Cover anonymous, invalid-token, unrelated-actor, owner, and each privileged grant for every protected operation.

**Replacement:** A consumer replaces this default by recording an Exception that names this provision and states its reason, review date, and removal condition.

**Rationale:** Authorization fails one caller at a time: the anonymous caller who gets in, the unrelated actor who reads another tenant's row. Covering anonymous, invalid-token, unrelated-actor, owner, and each privileged grant for every protected operation proves each case separately. The matrix also covers disclosure behavior and the collection query predicate. A UI redirect or hidden control is not evidence.

## Reference example

This informative example demonstrates `litespec/quality/security#authorize-each-target-resource` and `litespec/quality/security#limit-public-error-detail`.

`GET /api/posts/{id}` for a private draft filters by both post ID and the author ID derived from claims. A different author receives the documented not-found or forbidden response without learning protected fields.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/quality/security#keep-backend-authentication-provider-neutral | guidance | Does the backend validate issuer, audience, signature, lifetime, and claims, and refuse identity headers? |
| litespec/quality/security#derive-the-actor-from-claims | guidance | Does actor resolution follow the WebApi boundary rules this rule cites? |
| litespec/quality/security#authorize-each-target-resource | guidance | Does the guard authorize every protected operation from its declared permissions? |
| litespec/quality/security#restrict-a-protected-collection-in-the-database | guidance | Does every protected collection query apply its scope as a database predicate before paging? |
| litespec/quality/security#validate-at-trust-boundaries | guidance | Does every trust boundary validate its shape and metadata before use? |
| litespec/quality/security#keep-secrets-out-of-tracked-and-observable-data | guidance | Is every secret absent from source, logs, traces, messages, files, URLs, snapshots, layers, and browser storage? |
| litespec/quality/security#parameterize-database-input | guidance | Does every external value reach the database through a query API or parameter? |
| litespec/quality/security#limit-public-error-detail | guidance | Does every public error use the HTTP API error contract? |
| litespec/quality/security#protect-browser-boundaries | guidance | Does every frontend apply escaping, policy, headers, redirect validation, and forgery protection? |
| litespec/quality/security#minimize-sensitive-data | guidance | Does every use case handle only the fields its input and results declare? |
| litespec/quality/security#keep-a-personal-data-inventory-per-store | guidance | Does the inventory name the fields, purposes, and retention of each store? |
| litespec/quality/security#apply-erasure-and-export-to-every-store | guidance | Do erasure and export reach every store, with backups expiring inside their bound? |
| litespec/quality/security#keep-personal-data-out-of-logs | guidance | Is personal data absent in clear from every log, trace, and diagnostic record? |
| litespec/quality/security#treat-an-unsalted-digest-as-personal-data | guidance | Does every unsalted digest of personal data receive personal-data handling? |
| litespec/quality/security#report-a-breach-within-its-deadline | guidance | Does the breach procedure name an owner, a backup person, and meet its deadline? |
| litespec/quality/security#protect-live-data-at-rest | guidance | Is every live store encrypted, or covered by an Exception naming this rule? |
| litespec/quality/security#bound-abuse-at-exposed-endpoints | guidance | Does every exposed endpoint declare its limit, and answer `429` above it? |
| litespec/quality/security#keep-one-limit-store-across-replicas | guidance | Do all replicas read rate and concurrency counters from one store? |
| litespec/quality/security#restrict-cross-origin-access | guidance | Does the cross-origin policy list origins, methods, headers, and credential mode without a wildcard origin? |
| litespec/quality/security#record-security-audit-events | guidance | Does every security audit event record actor, action, target, outcome, timestamp, trace, and reason? |
| litespec/quality/security#rotate-production-secrets | guidance | Does every production secret have a secret-inventory entry and a revocation runbook? |
| litespec/quality/security#use-one-current-actor-abstraction | guidance | Does WebApi expose one current-actor accessor, or does an Exception record the replacement? |
| litespec/quality/security#keep-secure-headers-in-host-configuration | guidance | Are the secure headers defined in one host location, or is an Exception recorded? |
| litespec/quality/security#use-deny-by-default-policies | guidance | Is every new endpoint protected by default, or is an Exception recorded? |
| litespec/quality/security#test-the-resource-authorization-matrix | guidance | Does every protected operation pass each caller case the convention lists, or is an Exception recorded? |

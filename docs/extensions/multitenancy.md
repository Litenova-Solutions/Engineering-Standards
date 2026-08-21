# Multi-tenancy

## Intent

Multi-tenancy makes tenant identity part of authorization, persistence, caches, jobs, exports, diagnostics, and recovery. A tenant ID column alone does not provide isolation.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `multitenancy` only when independent customer organizations share one deployment and require isolated data or policy.

## Baseline relationship

The adoption decision records tenant source, storage model, isolation guarantee, administrative access model, and data evolution path. This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Define tenancy storage and isolation guarantees. (EXT.TENANCY.ADOPT.001)
- Resolve tenant identity from trusted context. (EXT.TENANCY.RESOLVE.001)
- Match actor and resource tenants. (EXT.TENANCY.AUTHZ.001)
- Scope every tenant-owned persistence boundary. (EXT.TENANCY.STORAGE.002)
- Prevent cross-tenant disclosure in responses and diagnostics. (EXT.TENANCY.DISCLOSURE.001, EXT.TENANCY.DISCLOSURE.002)
- Declare tenant scope for operational work. (EXT.TENANCY.OPERATIONS.001)

## Standards

### Define tenant isolation (EXT.TENANCY.ADOPT.001)

**Requirement:** A multi-tenant decision MUST define shared-table, schema, or database isolation and state its guarantee and operating trade-off.

**Rationale:** The selected storage model determines data isolation, operational complexity, and scaling behavior.

### Avoid unplanned isolation models (EXT.TENANCY.ADOPT.002)

**Requirement:** A multi-tenant system MUST NOT mix isolation models without a decision and data evolution plan.

**Rationale:** Mixed models create unclear guarantees and operational recovery behavior.

### Resolve tenant identity from trusted context (EXT.TENANCY.RESOLVE.001)

**Requirement:** A trusted host boundary MUST resolve tenant identity from verified claims, host mapping, or another authenticated source.

**Rationale:** Trusted resolution prevents callers from selecting a tenant outside their authenticated context.

### Reject unrestricted tenant input (EXT.TENANCY.RESOLVE.002)

**Requirement:** A tenant resolver MUST NOT accept an unrestricted tenant ID from request data.

**Rationale:** Client-controlled identity can select another tenant's data boundary.

### Verify actor and target tenancy (EXT.TENANCY.AUTHZ.001)

**Requirement:** A protected multi-tenant operation MUST confirm that the actor and target resource belong to the resolved tenant.

**Rationale:** Both the caller and requested resource need the same authorized tenant scope.

### Isolate administrative cross-tenant access (EXT.TENANCY.AUTHZ.002)

**Requirement:** An administrative cross-tenant operation MUST use a distinct policy, actor permission, and audit trail.

**Rationale:** Exceptional access needs stronger visibility than normal tenant-scoped behavior.

### Use selected tenant storage support (EXT.TENANCY.STORAGE.001)

**Requirement:** A multi-tenant persistence implementation MUST use Marten tenancy support or a tested selected-provider mechanism.

**Rationale:** Provider-supported tenancy gives queries and storage a consistent isolation mechanism.

### Scope tenant-owned records (EXT.TENANCY.STORAGE.002)

**Requirement:** Every tenant-owned document, query, unique constraint, cache key, outbox record, job, export, and object-storage path MUST include tenant scope.

**Rationale:** Omitting scope from one storage or background boundary can disclose or mix tenant data.

### Apply cross-tenant disclosure policy (EXT.TENANCY.DISCLOSURE.001)

**Requirement:** A cross-tenant resource response MUST use the documented not-found or forbidden policy.

**Rationale:** The product chooses one disclosure outcome for unauthorized resource existence.

### Protect tenant diagnostics (EXT.TENANCY.DISCLOSURE.002)

**Requirement:** Errors, logs, metrics, and traces MUST NOT reveal another tenant's business identifiers or data.

**Rationale:** Diagnostics can bypass an API response's normal resource-disclosure boundary.

### Scope tenant operations (EXT.TENANCY.OPERATIONS.001)

**Requirement:** Backup, restore, replay, deletion, export, support access, and incident investigation MUST document one-tenant or all-tenant scope.

**Rationale:** Operating work can cause a broader data effect than one normal request.

## Conventions

### Use typed tenant identities (EXT.TENANCY.CONVENTION.001)

**Default:** Represent tenant identity with a strongly typed `TenantId`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A typed identity prevents accidental confusion with actor, aggregate, or string identifiers.

### Use one tenant accessor (EXT.TENANCY.CONVENTION.002)

**Default:** Use one current-tenant accessor at the trusted host boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One accessor centralizes trusted tenant resolution.

### Pass tenant scope explicitly (EXT.TENANCY.CONVENTION.003)

**Default:** Pass tenant scope through Application messages or trusted ports rather than ambient Domain request state.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Explicit scope preserves Domain independence from host request state.

## Dependencies

Marten tenancy support is part of the baseline persistence package. Another isolation provider needs a decision and manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.TENANCY.ADOPT.001 | inspection | Tenant decision records model, isolation guarantee, and operating trade-off. |
| EXT.TENANCY.ADOPT.002 | inspection | Any mixed isolation model records decision and data evolution plan. |
| EXT.TENANCY.RESOLVE.001 | test | `TenancyResolveTests` resolve tenant identity from each trusted source. |
| EXT.TENANCY.RESOLVE.002 | test | `TenancyResolveTests` asserts request tenant-ID tampering cannot select a tenant boundary. |
| EXT.TENANCY.AUTHZ.001 | test | `TenancyAuthzTests` reject mismatched scope. |
| EXT.TENANCY.AUTHZ.002 | test | `TenancyAuthzTests` require policy, permission, and audit evidence. |
| EXT.TENANCY.STORAGE.001 | test | `TenancyStorageTests` exercise selected provider tenancy behavior. |
| EXT.TENANCY.STORAGE.002 | static, test | `TenancyStorageTests` include tenant scope at every listed boundary. |
| EXT.TENANCY.DISCLOSURE.001 | test | `TenancyDisclosureTests` return the documented not-found or forbidden response. |
| EXT.TENANCY.DISCLOSURE.002 | test | `TenancyDisclosureTests` exclude foreign tenant identifiers and data. |
| EXT.TENANCY.OPERATIONS.001 | inspection | Operating procedures declare one-tenant or all-tenant scope. |
| EXT.TENANCY.CONVENTION.001 | static | Tenant references use `TenantId` or a documented local replacement. |
| EXT.TENANCY.CONVENTION.002 | inspection | Host code has one trusted current-tenant accessor. |
| EXT.TENANCY.CONVENTION.003 | static | `TenancyTests` asserts domain code reads no ambient tenant request state. |

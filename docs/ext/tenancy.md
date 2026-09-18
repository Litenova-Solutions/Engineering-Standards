# Multitenancy

## Intent

Multitenancy makes tenant identity part of authorization, persistence, caches, jobs, exports, diagnostics, and recovery. A tenant ID column alone does not provide isolation.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `tenancy` only when independent customer organizations share one deployment and require isolated data or policy.

## Baseline relationship

The adoption decision records tenant source, storage model, isolation guarantee, administrative access model, and data evolution path. This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Define tenancy storage and isolation guarantees. (standards/rule/ext-tenancy.define-tenant-isolation)
- Resolve tenant identity from trusted context. (standards/rule/ext-tenancy.resolve-tenant-identity-from-trusted-context)
- Match actor and resource tenants. (standards/rule/ext-tenancy.verify-actor-and-target-tenancy)
- Scope every tenant-owned persistence boundary. (standards/rule/ext-tenancy.scope-tenant-owned-records)
- Prevent cross-tenant disclosure in responses and diagnostics. (standards/rule/ext-tenancy.apply-cross-tenant-disclosure-policy, standards/rule/ext-tenancy.protect-tenant-diagnostics)
- Declare tenant scope for operational work. (standards/rule/ext-tenancy.scope-tenant-operations)

## Standards

### Define tenant isolation (standards/rule/ext-tenancy.define-tenant-isolation)

**Requirement:** A multi-tenant decision MUST define shared-table, schema, or database isolation and state its guarantee and operating trade-off.

**Rationale:** The selected storage model determines data isolation, operational complexity, and scaling behavior.

### Avoid unplanned isolation models (standards/rule/ext-tenancy.avoid-unplanned-isolation-models)

**Requirement:** A multi-tenant system MUST NOT mix isolation models without a decision and data evolution plan.

**Rationale:** Mixed models create unclear guarantees and operational recovery behavior.

### Resolve tenant identity from trusted context (standards/rule/ext-tenancy.resolve-tenant-identity-from-trusted-context)

**Requirement:** A trusted host boundary MUST resolve tenant identity from verified claims, host mapping, or another authenticated source.

**Rationale:** Trusted resolution prevents callers from selecting a tenant outside their authenticated context.

### Reject unrestricted tenant input (standards/rule/ext-tenancy.reject-unrestricted-tenant-input)

**Requirement:** A tenant resolver MUST NOT accept an unrestricted tenant ID from request data.

**Rationale:** Client-controlled identity can select another tenant's data boundary.

### Verify actor and target tenancy (standards/rule/ext-tenancy.verify-actor-and-target-tenancy)

**Requirement:** A protected multi-tenant operation MUST confirm that the actor and target resource belong to the resolved tenant.

**Rationale:** Both the caller and requested resource need the same authorized tenant scope.

### Isolate administrative cross-tenant access (standards/rule/ext-tenancy.isolate-administrative-cross-tenant-access)

**Requirement:** An administrative cross-tenant operation MUST use a distinct policy, actor permission, and audit trail.

**Rationale:** Exceptional access needs stronger visibility than normal tenant-scoped behavior.

### Use selected tenant storage support (standards/rule/ext-tenancy.use-selected-tenant-storage-support)

**Requirement:** A multi-tenant persistence implementation MUST resolve its tenant when the session is created, through the selected provider's own tenancy support.

**Rationale:** Provider-supported tenancy gives queries and storage a consistent isolation mechanism. Session creation is the point that matters. A session opened without a tenant has an unscoped next query. Adding the filter per query instead leaves every new query one omission away from reading across tenants. The baseline provider resolves it from the registered tenancy at session creation, so no query carries the concern.

### Scope tenant-owned records (standards/rule/ext-tenancy.scope-tenant-owned-records)

**Requirement:** Every tenant-owned document, query, unique constraint, cache key, outbox record, job, export, and object-storage path MUST include tenant scope.

**Rationale:** Omitting scope from one storage or background boundary can disclose or mix tenant data.

### Apply cross-tenant disclosure policy (standards/rule/ext-tenancy.apply-cross-tenant-disclosure-policy)

**Requirement:** A cross-tenant resource response MUST use the documented not-found or forbidden policy.

**Rationale:** The product chooses one disclosure outcome for unauthorized resource existence.

### Protect tenant diagnostics (standards/rule/ext-tenancy.protect-tenant-diagnostics)

**Requirement:** Errors, logs, metrics, and traces MUST NOT reveal another tenant's business identifiers or data.

**Rationale:** Diagnostics can bypass an API response's normal resource-disclosure boundary.

### Scope tenant operations (standards/rule/ext-tenancy.scope-tenant-operations)

**Requirement:** Backup, restore, replay, deletion, export, support access, and incident investigation MUST document one-tenant or all-tenant scope.

**Rationale:** Operating work can cause a broader data effect than one normal request.

### Record an all-tenant operation (standards/rule/ext-tenancy.record-an-all-tenant-operation)

**Requirement:** An operation running at all-tenant scope MUST produce a record naming the actor, the operation, the tenants reached, and the reason.

**Rationale:** A documented scope states what an operation is allowed to touch. It does not state what one run touched, which is the question a tenant asks after an incident. An all-tenant run is also the one case where no tenant's own audit trail holds the whole event. [The OWASP logging guidance](https://owasp.org/www-project-cheat-sheets/cheatsheets/Logging_Cheat_Sheet) treats an administrative action over many subjects as one event to record.

**Example:** A support export covering every tenant records the operator, the export, the tenant count, and the incident it was run for.

## Conventions

### Use typed tenant identities (standards/rule/ext-tenancy.use-typed-tenant-identities)

**Default:** Represent tenant identity with a strongly typed `TenantId`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A typed identity prevents accidental confusion with actor, aggregate, or string identifiers.

### Use one tenant accessor (standards/rule/ext-tenancy.use-one-tenant-accessor)

**Default:** Use one current-tenant accessor at the trusted host boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One accessor centralizes trusted tenant resolution.

### Pass tenant scope explicitly (standards/rule/ext-tenancy.pass-tenant-scope-explicitly)

**Default:** Pass tenant scope through Application messages or trusted ports rather than ambient Domain request state.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Explicit scope preserves Domain independence from host request state.

## Dependencies

Marten tenancy support is part of the baseline persistence package. Another isolation provider needs a decision and manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-tenancy.define-tenant-isolation | inspection | Tenant decision records model, isolation guarantee, and operating trade-off. |
| standards/rule/ext-tenancy.avoid-unplanned-isolation-models | inspection | Any mixed isolation model records decision and data evolution plan. |
| standards/rule/ext-tenancy.resolve-tenant-identity-from-trusted-context | test | `TenancyResolveTests` resolve tenant identity from each trusted source. |
| standards/rule/ext-tenancy.reject-unrestricted-tenant-input | test | `TenancyResolveTests` asserts request tenant-ID tampering cannot select a tenant boundary. |
| standards/rule/ext-tenancy.verify-actor-and-target-tenancy | test | `TenancyAuthzTests` reject mismatched scope. |
| standards/rule/ext-tenancy.isolate-administrative-cross-tenant-access | test | `TenancyAuthzTests` require policy, permission, and audit evidence. |
| standards/rule/ext-tenancy.use-selected-tenant-storage-support | test | `TenancyStorageTests` exercise selected provider tenancy behavior. |
| standards/rule/ext-tenancy.scope-tenant-owned-records | static, test | `TenancyStorageTests` include tenant scope at every listed boundary. |
| standards/rule/ext-tenancy.apply-cross-tenant-disclosure-policy | test | `TenancyDisclosureTests` return the documented not-found or forbidden response. |
| standards/rule/ext-tenancy.protect-tenant-diagnostics | test | `TenancyDisclosureTests` exclude foreign tenant identifiers and data. |
| standards/rule/ext-tenancy.scope-tenant-operations | inspection | Operating procedures declare one-tenant or all-tenant scope. |
| standards/rule/ext-tenancy.record-an-all-tenant-operation | test | `TenancyOperationTests` assert an all-tenant run writes a record naming the actor, the operation, and the tenants reached. |
| standards/rule/ext-tenancy.use-typed-tenant-identities | static | Tenant references use `TenantId` or a documented local replacement. |
| standards/rule/ext-tenancy.use-one-tenant-accessor | inspection | Host code has one trusted current-tenant accessor. |
| standards/rule/ext-tenancy.pass-tenant-scope-explicitly | static | `TenancyTests` asserts domain code reads no ambient tenant request state. |

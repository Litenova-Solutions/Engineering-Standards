# Multitenancy

## Intent

Multitenancy makes tenant identity part of authorization, persistence, caches, jobs, exports, diagnostics, and recovery. A tenant ID column alone does not provide isolation.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `tenancy` only when independent customer organizations share one deployment and require isolated data or policy.

## Baseline relationship

None. This extension adds tenant obligations the baseline does not state.

None. Tenant scope applies to records every project already requires.

## Standards

### Record the tenant adoption decision

**Requirement:** A consumer selecting `tenancy` MUST record a Decision naming tenant source, storage model, isolation guarantee, administrative access, evolution path, and enumeration bound.

**Rationale:** The Decision carries its owner, status, decider, and decide-by date. Approval waits while that Decision is a draft. The enumeration bound caps tenant identifiers in all-tenant records.

### Define tenant isolation

**Requirement:** A multi-tenant decision MUST define shared-table, schema, or database isolation and state its guarantee and operating trade-off.

**Rationale:** The selected storage model determines data isolation, operational complexity, and scaling behavior.

### Avoid unplanned isolation models

**Requirement:** A multi-tenant system MUST NOT mix isolation models without a decision and data evolution plan.

**Rationale:** Mixed models create unclear guarantees and operational recovery behavior.

### Resolve tenant identity from trusted context

**Requirement:** A trusted host boundary MUST resolve tenant identity from verified claims, host mapping, or another authenticated source.

**Rationale:** Trusted resolution prevents callers from selecting a tenant outside their authenticated context.

### Reject unrestricted tenant input

**Requirement:** A tenant resolver MUST NOT accept an unrestricted tenant ID from request data.

**Rationale:** Client-controlled identity can select another tenant's data boundary.

### Verify actor and target tenancy

**Requirement:** A protected multi-tenant operation MUST confirm actor and target tenancy, with the needed Permission held at the resolved scope and the target belonging to it.

**Rationale:** Both the caller and requested resource need the same authorized tenant scope. The chain runs Actor holds Role at scope, Role allows Permission, and use case needs Permission.

### Isolate administrative cross-tenant access

**Requirement:** An administrative cross-tenant operation MUST require a Permission the actor holds through a Role at platform scope, writing an audit record.

**Rationale:** Exceptional access needs stronger visibility than normal tenant-scoped behavior.

### Use selected tenant storage support

**Requirement:** A multi-tenant persistence implementation MUST resolve its tenant at session creation through the selected provider's own tenancy support.

**Rationale:** Provider-supported tenancy gives queries and storage a consistent isolation mechanism. Session creation is the point that matters. A session opened without a tenant has an unscoped next query. Adding the filter per query instead leaves every new query one omission away from reading across tenants. The baseline provider resolves it from the registered tenancy at session creation, so no query carries the concern. An Entity Framework Core implementation resolves the tenant when the context is created and applies it through a query filter convention.

### Scope tenant-owned records

**Requirement:** Every tenant-owned document, query, unique constraint, cache key, outbox record, job, export, and object-storage path MUST include tenant scope.

**Rationale:** Omitting scope from one storage or background boundary can disclose or mix tenant data.

### Apply cross-tenant disclosure policy

**Requirement:** A cross-tenant resource response MUST use the documented not-found or forbidden policy.

**Rationale:** The product chooses one disclosure outcome for unauthorized resource existence.

### Protect tenant diagnostics

**Requirement:** Errors, logs, metrics, and traces MUST NOT reveal another tenant's business identifiers or data.

**Rationale:** Diagnostics can bypass an API response's normal resource-disclosure boundary.

### Scope tenant operations

**Requirement:** Backup, restore, replay, deletion, export, support access, and incident investigation MUST document one-tenant or all-tenant scope.

**Rationale:** Operating work can cause a broader data effect than one normal request.

### Record an all-tenant operation

**Requirement:** An all-tenant operation MUST record actor, operation, reason, tenant count, and reached tenant identifiers up to the adoption Decision bound.

**Rationale:** A documented scope states what an operation is allowed to touch. It does not state what one run touched, which is the question a tenant asks after an incident. An all-tenant run is also the one case where no tenant's own audit trail holds the whole event. [The OWASP logging guidance](https://owasp.org/www-project-cheat-sheets/cheatsheets/Logging_Cheat_Sheet) treats an administrative action over many subjects as one event to record. When the audit extension is selected, the record is an audit record; otherwise it stays a standalone record.

**Example:** A support export covering every tenant records the operator, the export, the tenant count, and the incident it was run for.

## Conventions

### Use typed tenant identities

**Default:** Represent tenant identity with a strongly typed `TenantId`.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A typed identity prevents accidental confusion with actor, business record, or string identifiers.

### Use one tenant accessor

**Default:** Use one current-tenant accessor at the trusted host boundary.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** One accessor centralizes trusted tenant resolution.

### Pass tenant scope explicitly

**Default:** Pass tenant scope through Application messages or trusted ports rather than ambient Domain request state.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Explicit scope preserves Domain independence from host request state.

## Dependencies

Marten tenancy support is part of the baseline persistence package. Another isolation provider needs a decision and manifest pin.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/tenancy#record-the-tenant-adoption-decision | guidance | Does an owned Decision record the tenant source, model, guarantee, access, path, and bound? |
| litespec/ext/tenancy#define-tenant-isolation | guidance | Does the decision define the isolation model, guarantee, and trade-off? |
| litespec/ext/tenancy#avoid-unplanned-isolation-models | guidance | Does each mixed model record its decision and evolution plan? |
| litespec/ext/tenancy#resolve-tenant-identity-from-trusted-context | guidance | Does each trusted source resolve the tenant? |
| litespec/ext/tenancy#reject-unrestricted-tenant-input | guidance | Can request tampering with a tenant ID select another boundary? |
| litespec/ext/tenancy#verify-actor-and-target-tenancy | guidance | Do mismatched actor and target tenants fail? |
| litespec/ext/tenancy#isolate-administrative-cross-tenant-access | guidance | Does administrative access need its platform-scope Permission and write its audit record? |
| litespec/ext/tenancy#use-selected-tenant-storage-support | guidance | Does each provider resolve the tenant at session creation? |
| litespec/ext/tenancy#scope-tenant-owned-records | guidance | Does every listed boundary include tenant scope? |
| litespec/ext/tenancy#apply-cross-tenant-disclosure-policy | guidance | Does each cross-tenant response use the documented policy? |
| litespec/ext/tenancy#protect-tenant-diagnostics | guidance | Do diagnostics exclude foreign tenant identifiers and data? |
| litespec/ext/tenancy#scope-tenant-operations | guidance | Does each procedure declare one-tenant or all-tenant scope? |
| litespec/ext/tenancy#record-an-all-tenant-operation | guidance | Does each all-tenant run write its record with count and bounded list? |
| litespec/ext/tenancy#use-typed-tenant-identities | guidance | Do tenant references use `TenantId` or a recorded Exception? |
| litespec/ext/tenancy#use-one-tenant-accessor | guidance | Does the host boundary hold one current-tenant accessor or a recorded Exception? |
| litespec/ext/tenancy#pass-tenant-scope-explicitly | guidance | Does domain code read no ambient tenant state, or does an Exception record it? |

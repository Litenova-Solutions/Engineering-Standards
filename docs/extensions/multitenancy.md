# Multi-tenancy

## Intent

Multi-tenancy makes tenant identity part of authorization, persistence, caches, jobs, exports, diagnostics, and operating recovery. Adding a tenant ID column without those boundaries does not provide isolation.

## Activation

Enable `multitenancy` only when independent customer organizations share one deployment and require isolated data or policy.

Record the tenant resolution source, storage model, isolation guarantee, administrative access model, and migration path before implementation. This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Resolve tenant identity from verified context.
- Verify actor membership and target-resource tenant.
- Apply tenant scope in every persistence and derived-data path.
- Partition unique constraints, caches, outbox records, jobs, exports, and diagnostics.
- Separate administrative cross-tenant operations and audit them.
- Test negative cross-tenant behavior at every boundary.

## Standards

### Treat tenancy as a data boundary (EXT.TENANCY.ADOPT.001)

Define whether isolation uses shared tables, database schemas, or databases. State the guarantee and operating trade-off. Do not mix models without a decision and migration plan.

### Resolve tenant from trusted context (EXT.TENANCY.RESOLVE.001)

Resolve the tenant from verified claims, host mapping, or another authenticated source. Do not accept an unrestricted tenant ID from request data.

### Verify membership and resource tenant (EXT.TENANCY.AUTHZ.001)

Confirm the actor belongs to the resolved tenant and the target resource belongs to the same tenant. Administrative cross-tenant operations use a distinct policy, actor permission, and audit trail.

### Apply tenant scope in persistence (EXT.TENANCY.STORAGE.001)

Use Marten tenancy support or the selected persistence extension's tested mechanism. Every tenant-owned document, query, unique constraint, cache key, outbox record, job, export, and object-storage path includes tenant scope.

### Prevent tenant disclosure (EXT.TENANCY.DISCLOSURE.001)

Use the documented not-found or forbidden policy for cross-tenant resources. Errors, logs, metrics, and traces do not reveal another tenant's business identifiers or data.

### Keep operations tenant-aware (EXT.TENANCY.OPERATIONS.001)

Backup, restore, replay, deletion, export, support access, and incident investigation document whether they operate on one tenant or all tenants.

## Conventions

Represent tenant identity with a strongly typed `TenantId`. Use one current tenant accessor at the trusted host boundary. Pass tenant scope explicitly into Application messages or trusted ports rather than reading ambient request state inside Domain.

## Dependencies

Marten tenancy support is part of the baseline persistence package. Another isolation provider requires a decision and manifest pin.

## Verification

- Attempt cross-tenant reads, writes, deletes, cache access, background dispatch, and exports.
- Test unique constraints and idempotency keys across tenants.
- Test administrative access and audit records.
- Inspect diagnostics and errors for tenant data leakage.
- Test tenant-aware backup, restore, deletion, and replay.

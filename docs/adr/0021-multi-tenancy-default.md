# 0021. Multi-Tenancy Default

**Status:** Accepted

**Date:** 2026-05-19

## Context

Some business systems are naturally multi-tenant. Others are single-tenant or internal tools. Adding tenancy too early complicates every aggregate, query, index, authorization policy, cache key, and background job. Adding it too late can require a large migration.

The standards need a default that prevents accidental partial tenancy while allowing projects that truly need it to adopt a complete model.

Options considered:

1. Require tenant support in all projects. Strong isolation by default, but heavy for small internal systems.
2. Ignore tenancy in shared standards. Simple, but agents may implement partial and unsafe tenant filters inconsistently.
3. Treat tenancy as a project-level architectural decision with mandatory conventions once enabled.

## Decision

Multi-tenancy is out of scope by default. A project becomes multi-tenant only after a project ADR chooses the tenancy model.

When enabled, the project ADR MUST define:

- Tenant identity source.
- Tenant isolation model: shared database, schema per tenant, or database per tenant.
- Required `TenantId` placement on aggregates and read models.
- Authorization policy for tenant membership.
- Cache key tenant scope.
- Background job tenant scope.
- Migration and seeding strategy.

Partial tenancy is forbidden. Do not add `TenantId` to one feature without applying the project tenancy convention everywhere the tenant boundary matters.

## Consequences

### Positive

- Small projects avoid unnecessary tenant ceremony.
- Tenant-aware projects must choose an isolation model deliberately.
- Agents get a clear rule: no improvised tenant filters without a project ADR.

### Negative

- Retrofitting tenancy later is still expensive.
- Projects must make the tenancy decision early when there is credible product risk.

### Risks

- A project may delay the tenancy ADR until data already exists. Product discovery must answer the tenancy question before the first production release.


---
{
  "id": "recipe.multitenancy",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.application", "backend.infrastructure", "security.review"],
  "recipes": ["multitenancy"]
}
---
# Multi-tenancy

## RECIPE.TENANCY.ADOPT.001 - Treat tenancy as a data boundary

Enable this recipe only when independent customer organizations share one deployment. Record the isolation model and migration path before adding tenant IDs.

## RECIPE.TENANCY.RESOLVE.001 - Resolve tenant from trusted context

Resolve the tenant from authenticated claims, host mapping, or another verified source. Do not accept an unrestricted tenant ID from a request body.

## RECIPE.TENANCY.STORAGE.001 - Apply tenant scope in persistence

Use Marten tenancy support or the selected persistence recipe's tested isolation mechanism. Every tenant-owned document, query, unique constraint, cache key, outbox record, and job carries tenant scope.

## RECIPE.TENANCY.AUTHZ.001 - Verify membership and resource tenant

Confirm the actor belongs to the resolved tenant and the target resource has the same tenant. Administrative cross-tenant operations use a separate explicit policy and audit trail.

## RECIPE.TENANCY.GATES.001 - Test isolation as a negative case

Integration and acceptance tests attempt cross-tenant reads, updates, deletes, cache access, background dispatch, and export. Every attempt must fail without disclosing resource existence.

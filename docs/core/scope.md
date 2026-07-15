---
{
  "id": "core.scope",
  "kind": "core",
  "normative": true,
  "appliesTo": ["all"],
  "recipes": []
}
---
# Scope

Version 1 supports one specific application class so agents can act from explicit constraints.

## Agent Quick Rules {#agent-quick-rules}

- Apply this profile to a single bounded-context business web application.
- Use ASP.NET Core, PostgreSQL, Marten, and optional Next.js.
- Treat a production-capable primary journey as the v1 outcome.
- Enable advanced behavior through declared recipes.
- Record an explicit decision when work falls outside this boundary.

## CORE.SCOPE.001 - Use the supported application profile

The default profile covers business web applications with an ASP.NET Core API, PostgreSQL, Marten document persistence, and an optional Next.js frontend.

An API-only catalog service fits this profile. A native mobile application without a web API does not.

## CORE.SCOPE.002 - Keep one bounded context

The application has one bounded context. Feature folders group business capabilities inside that context; they are not separate bounded contexts or independently deployed services.

For example, `Posts` and `Authors` may be separate features while sharing one domain language and deployment.

## CORE.SCOPE.003 - Deliver a production-capable primary journey

Application v1 includes one deployed primary journey plus its security, persistence, diagnostics, CI, rollback, and operating instructions. It does not require scale work without measured demand.

For example, a publishing v1 may support author login, draft creation, publication, and public reading. Multi-region failover can remain outside v1.

## CORE.SCOPE.004 - Put conditional behavior in recipes

Caching, durable messaging, BDD, realtime updates, multi-tenancy, reporting, and provider-specific deployment are inactive until a declared trigger applies and the consumer enables the corresponding recipe.

Enabled recipes compose with the profile and with each other. When two applicable recipes conflict, record the conflict and the selected replacement in a project decision before implementation.

An email that may be retried manually can use post-commit in-process handling. A payment notification that cannot be lost triggers the outbox-worker recipe.

## Outside v1

The default profile does not govern microservices, multiple bounded contexts, native clients, non-.NET backends, non-Next.js frontends, event sourcing, multi-region active-active deployment, or large data pipelines.

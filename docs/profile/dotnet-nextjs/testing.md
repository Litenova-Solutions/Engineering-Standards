---
{
  "id": "profile.dotnet-nextjs.testing",
  "kind": "profile",
  "normative": true,
  "appliesTo": ["testing"],
  "recipes": []
}
---
# Testing

## Agent Quick Rules {#agent-quick-rules}

- Create Domain, Application, Integration, and Architecture test projects.
- Test Marten projections and HTTP behavior against real PostgreSQL.
- Reference every active acceptance ID from at least one automated test.
- Add Reqnroll only through the acceptance-bdd recipe.
- Collect coverage without a global percentage gate.

## TEST.PROJECTS.001 - Use four backend test projects

Create:

```text
apps/api/tests/{ProjectName}.Domain.Tests/
apps/api/tests/{ProjectName}.Application.Tests/
apps/api/tests/{ProjectName}.Integration.Tests/
apps/api/tests/{ProjectName}.Architecture.Tests/
```

Acceptance.Tests is conditional.

## TEST.DOMAIN.001 - Test domain behavior without infrastructure

Domain tests cover aggregate transitions, value objects, invariants, and raised domain events. They do not use a database, HTTP host, or mocks.

## TEST.APPLICATION.001 - Test command coordination and validation

Application tests use substitutes for aggregate repositories and external capability ports. Confirm commands load the correct aggregate, call domain behavior, and stage the result.

Do not mock Marten query internals. Test query projections through Integration.Tests.

## TEST.INTEGRATION.001 - Use real PostgreSQL for persistence and API tests

Integration.Tests use Testcontainers PostgreSQL, Marten, and `WebApplicationFactory`. Cover document mappings, query projections, commit behavior, Problem Details, authentication, authorization, and OpenAPI.

Reset test state between cases without sharing mutable fixtures across tests.

## TEST.ARCHITECTURE.001 - Enforce structural rules

Architecture.Tests cover:

- Project-reference direction.
- Forbidden package dependencies.
- Internal sealed handler and validator types.
- Public visibility for ports implemented by Infrastructure.
- Endpoint isolation from repositories and sessions.
- Frontend feature boundaries through the frontend lint configuration.

## TEST.TRACE.001 - Require criterion-to-test traceability

Every active acceptance criterion appears in at least one recognized test reference:

```csharp
[Trait("AcceptanceCriterion", "AC-POSTS-CREATE-01")]
```

```gherkin
@AC-POSTS-CREATE-01
```

```typescript
test('[AC-POSTS-CREATE-01] creates a draft', async () => { /* ... */ })
```

The gate is one-way. Internal tests do not need a criterion ID.

## TEST.FRONTEND.001 - Match frontend tests to risk

Use Vitest for behavior in utilities, schemas, hooks, and interactive components. Use Playwright for critical journeys and cross-route browser behavior. Do not add a browser test for every static route.

## TEST.COVERAGE.001 - Use evidence instead of a percentage target

Collect line and branch coverage for review. Do not fail v1 on one repository-wide percentage. Acceptance trace, critical negative cases, integration behavior, and architecture gates are required regardless of the reported percentage.

## TEST.GENERATED.001 - Verify generated contracts

Build the API, regenerate OpenAPI and TypeScript types, and fail when Git reports a difference. The same freshness rule applies to standards indexes and trace reports.


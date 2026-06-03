# Add a New Use Case

This guide shows the standard path for adding one backend use case and connecting it to the frontend. Use it as a checklist, not as a substitute for the layer convention files.

**Prerequisite:** Operation doc at `docs/domain/{feature}/{use-case}.md` and test spec at `docs/domain/{feature}/{use-case}.tests.md`. If missing, write them first using `docs/guides/write-use-case-doc.md`.

---

## 1. Read Context

Read in order:

1. `AGENTS.md`.
2. `docs/domain/README.md` and `docs/domain/{feature}/README.md`.
3. The operation doc and test spec at `docs/domain/{feature}/{use-case}.md` and `{use-case}.tests.md`.
4. `docs/architecture/clean-architecture.md`.
5. The convention files for each layer you will edit.
6. `docs/guides/definition-of-done.md` before marking the work complete.

---

## 2. Classify Acceptance Testing

After the use-case doc exists, classify acceptance testing before writing tests:

| Classification | When |
|:---|:---|
| **No BDD needed** | Simple internal CRUD or technical endpoint with no stakeholder-readable scenarios |
| **Plain API acceptance test** | Meaningful use case, but Gherkin adds no stakeholder value |
| **BDD acceptance test** | Business-critical, stakeholder-readable, security-sensitive, idempotent, event-producing, externally consumed, or complex workflow |
| **Contract test required** | Public API or independently deployed client |
| **E2E test required** | User-facing journey has frontend behavior backend tests cannot verify |

Record the decision in the test spec **Acceptance test classification** section. Do not default every use case to BDD.

See `docs/conventions/backend/api-acceptance-tests.md`.

---

## 3. Model the Domain Change

If the use case changes business state, update the aggregate first.

- Add or update aggregate method.
- Enforce invariants inside the aggregate.
- Raise a domain event when downstream work MUST react asynchronously.
- Add concrete domain exceptions.
- Add domain tests.

Do not put business rules in command handlers, endpoints, jobs, or frontend code.

---

## 4. Add the Write Path

In `Application.Write.Contracts`:

- Add the command record.
- Add the command result record if needed.
- Add command validation exception types.

In `Application.Write`:

- Add the command validator.
- Add the command handler.
- Inject repositories only on the write side.
- Do not call `SaveChangesAsync`.

---

## 5. Add the Read Path

In `Application.Read.Contracts`:

- Add the query record.
- Add the result record.
- Add query validation exception types if needed.
- Add `IDatabaseContext` properties only when a new aggregate must be queried.

In `Application.Read`:

- Inject `IDatabaseContext`.
- Use LINQ `Select` projections.
- Return `PagedResult` for lists.
- Throw `AggregateNotFoundException` subclasses for missing resources.

---

## 6. Add Reactions Only When Needed

Use `Application.Reactions` for event-driven side effects. Define narrow interfaces there and implement them in Infrastructure.

If the event cannot be lost, use the Outbox pattern from `docs/conventions/backend/reliability.md`.

---

## 7. Add Infrastructure

Update Infrastructure for:

- EF Core configuration.
- Repository implementation changes.
- `IDatabaseContext` implementation properties.
- Outbox, idempotency, cache, job, or external service implementations.
- Migrations.

Use expand and contract migration rules for production-impacting schema changes.

---

## 8. Add the Endpoint

In WebApi:

- Add an `IEndpoint` class.
- Add request and response records.
- Add an `ApiMappings` class.
- Dispatch with `ICommandMediator` or `IQueryMediator`.
- Add OpenAPI metadata.
- Add authorization, rate limiting, and idempotency where required.

---

## 9. Add Acceptance and Integration Tests

- Add API integration tests for endpoint wiring and smoke behavior (`Integration.Tests`).
- Add plain API acceptance tests or Reqnroll scenarios traced to acceptance criterion IDs when the use-case doc requires them (`AcceptanceTests`).
- Map each Test Coverage row in `{use-case}.tests.md` to Domain, Application, Integration, Acceptance, or E2E tests as appropriate.

Copy patterns from `docs/blueprints/backend/api-acceptance-tests/` when introducing Reqnroll.

---

## 10. Add Frontend Integration

In `apps/{app}/features/{feature}/{use-case}/`:

- Fetch initial read data in Server Components on read-heavy pages.
- Use Server Actions for form mutations.
- Use TanStack Query for client-side freshness.
- Keep server data out of Zustand.
- Add loading, empty, error, and forbidden states.
- Regenerate API types when the backend contract changes.
- Add or update Playwright happy-path tests in `apps/{app}/e2e/`.
- Add Vitest tests for new hooks, utilities, or Zod schemas.

When the project uses `docs/ui/` (recommended for multi-app frontends):

- Add or update `docs/ui/{app}/pages/{page}.md` for the route (copy from `standards/docs/templates/docs/ui-page.md` in the consuming project).
- Update `docs/ui/{app}/README.md` route index.
- Update `docs/ui/{app}/shell.md` when shared layout changes (copy from `standards/docs/templates/docs/ui-shell.md`).
- Update each affected operation doc § UI with links to the page doc(s).

See `docs/guides/agentic-domain-driven-design.md` § Page Composition Docs.

---

## 11. Update Documentation

In the same PR:

- Update `docs/domain/{feature}/{use-case}.md` and `{use-case}.tests.md` to reflect current behavior.
- Update `docs/domain/{feature}/README.md` if aggregates, language, events, or persistence changed.
- Update `docs/domain/README.md` if this is a new or retired use case.
- Update `docs/ui/{app}/` when routes, shell, or page composition changed.

---

## 12. Verify

Run every applicable gate in `docs/conventions/shared/ci.md`, then complete `docs/guides/definition-of-done.md`.

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm exec playwright test --config apps/web/playwright.config.ts
```

Skip frontend commands when the consuming project has no `apps/web/`.

# Add a New Use Case

This guide shows the standard path for adding one backend use case and connecting it to the frontend. Use it as a checklist, not as a substitute for the layer convention files.

**Prerequisite:** A use case doc at `docs/domain/{feature}/{use-case}.md`. If none exists, write one first using `docs/templates/domain-use-case.md` and `docs/guides/agentic-domain-driven-design.md`.

---

## 1. Read Context

Read in order:

1. `AGENTS.md`.
2. `docs/domain/README.md` and `docs/domain/{feature}/README.md`.
3. The use case doc at `docs/domain/{feature}/{use-case}.md`.
4. `docs/architecture/clean-architecture.md`.
5. The convention files for each layer you will edit.
6. `docs/guides/definition-of-done.md` before marking the work complete.

---

## 2. Model the Domain Change

If the use case changes business state, update the aggregate first.

- Add or update aggregate method.
- Enforce invariants inside the aggregate.
- Raise a domain event when downstream work MUST react asynchronously.
- Add concrete domain exceptions.
- Add domain tests.

Do not put business rules in command handlers, endpoints, jobs, or frontend code.

---

## 3. Add the Write Path

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

## 4. Add the Read Path

In `Application.Read.Contracts`:

- Add the query record.
- Add the result record.
- Add query validation exception types if needed.
- Add `IDatabaseContext` properties only when a new aggregate must be queried.

In `Application.Read`:

- Inject `IDatabaseContext`.
- Use LINQ `Select` projections.
- Return `PagedResult<T>` for lists.
- Throw `AggregateNotFoundException` subclasses for missing resources.

---

## 5. Add Reactions Only When Needed

Use `Application.Reactions` for event-driven side effects. Define narrow interfaces there and implement them in Infrastructure.

If the event cannot be lost, use the Outbox pattern from `docs/conventions/backend/10-reliability.md`.

---

## 6. Add Infrastructure

Update Infrastructure for:

- EF Core configuration.
- Repository implementation changes.
- `IDatabaseContext` implementation properties.
- Outbox, idempotency, cache, job, or external service implementations.
- Migrations.

Use expand and contract migration rules for production-impacting schema changes.

---

## 7. Add the Endpoint

In WebApi:

- Add an `IEndpoint` class.
- Add request and response records.
- Add an `ApiMappings` class.
- Dispatch with `ICommandMediator` or `IQueryMediator`.
- Add OpenAPI metadata.
- Add authorization, rate limiting, and idempotency where required.

---

## 8. Add Frontend Integration

In `apps/{app}/domain/{feature}/{use-case}/`:

- Fetch initial read data in Server Components on read-heavy pages.
- Use Server Actions for form mutations.
- Use TanStack Query for client-side freshness.
- Keep server data out of Zustand.
- Add loading, empty, error, and forbidden states.
- Regenerate API types when the backend contract changes.
- Add or update Playwright happy-path tests in `apps/{app}/e2e/`.
- Add Vitest tests for new hooks, utilities, or Zod schemas.

When the project uses `docs/ui/` (recommended for multi-app frontends):

- Add or update `docs/ui/{app}/pages/{page}.md` for the route (use `docs/templates/ui-page.md`).
- Update `docs/ui/{app}/README.md` route index.
- Update `docs/ui/{app}/shell.md` when shared layout changes (use `docs/templates/ui-shell.md`).

See `docs/guides/agentic-domain-driven-design.md` § UI Projection Docs.

---

## 9. Update Documentation

In the same PR:

- Update `docs/domain/{feature}/{use-case}.md` to reflect current behavior.
- Update `docs/domain/{feature}/README.md` if aggregates, language, events, or persistence changed.
- Update `docs/domain/README.md` if this is a new or retired use case.
- Update `docs/ui/{app}/` when routes, shell, or page composition changed.

---

## 10. Verify

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

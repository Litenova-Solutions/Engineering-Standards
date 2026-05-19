# Add a New Feature

This guide shows the standard path for adding one backend use case and connecting it to the frontend. Use it as a checklist, not as a substitute for the layer convention files.

---

## 1. Read Context

Read:

1. `AGENTS.md`.
2. `docs/architecture/clean-architecture.md`.
3. The convention files for each layer you will edit.
4. The project `docs/domain/` inventories.

---

## 2. Model the Domain Change

If the use case changes business state, update the aggregate first.

- Add or update aggregate method.
- Enforce invariants inside the aggregate.
- Raise a domain event when downstream work should react.
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

In `apps/web/`:

- Fetch initial read data in server components where possible.
- Use Server Actions for form mutations.
- Use TanStack Query for client-side freshness.
- Keep server data out of Zustand.
- Add loading, empty, error, and forbidden states.
- Regenerate API types when the backend contract changes.

---

## 9. Update Project Inventories

Update the project-specific files:

- `docs/domain/aggregate-inventory.md`.
- `docs/domain/feature-inventory.md`.
- `docs/domain/exception-inventory.md`.
- `docs/domain/read-model-inventory.md`.
- `docs/domain/frontend-feature-inventory.md`.
- `docs/domain/frontend-api-endpoints.md`.

---

## 10. Verify

Run:

```bash
dotnet build src/{ProjectName}.slnx
dotnet test src/{ProjectName}.slnx
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

Run only the frontend commands that exist in the consuming project.


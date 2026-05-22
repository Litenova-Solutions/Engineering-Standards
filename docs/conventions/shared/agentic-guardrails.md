# Agentic Guardrails and Anti-Drift Standards

Scaffolding sequence, XML rule tags, anti-drift patterns, and verification pipelines. Forbidden packages: `forbidden-packages.md`. Writing rules: `writing-style.md`.

Every automated agent **MUST** read `AGENTS.md` first, then this file when implementing features or running verification.

---

## 1. Rule Index (XML)

AI agents MUST parse and apply these `<Rule>` tags.

<Rule id="AGGREGATE_ENCAPSULATION">
All aggregate mutations MUST occur through public business methods on the aggregate root. Setting properties directly from handlers is forbidden.
</Rule>

<Rule id="READ_PATH_ISOLATION">
Query handlers MUST inject IDatabaseContext and write direct LINQ projections. They MUST NOT load full aggregate roots or reference domain repository interfaces.
</Rule>

<Rule id="TRANSACTION_COMMIT_BOUNDARY">
Command handlers and repositories MUST NOT invoke SaveChangesAsync or commit transactions. The SaveChangesCommandPostHandler pipeline commits.
</Rule>

<Rule id="NO_STUB_CODE">
Committed code MUST NOT contain TODO, FIXME, NotImplementedException stubs, or placeholder comments that defer required behavior.
</Rule>

<Rule id="FILE_SIZE_LIMIT">
A single source file MUST NOT exceed 300 lines. Split into composed modules when approaching the limit.
</Rule>

<Rule id="DOMAIN_IMPORT_BOUNDARY">
domain/{a}/ MUST NOT import from domain/{b}/. Promote shared code to @/shared/ or components/ui/.
</Rule>

<Rule id="UI_COPY_SOURCE">
User-visible strings MUST come from API fields, next-intl keys, or the use case doc UI section. Agents MUST NOT invent product or policy text.
</Rule>

<Rule id="TAILWIND_THEME_ONLY">
Styling MUST use @theme tokens and standard scales. Arbitrary values (p-[13px], custom hex in className) are forbidden unless a project ADR documents an exception.
</Rule>

<Rule id="TYPED_API_CLIENT">
Frontend HTTP calls MUST use getApiClient() with openapi-typescript paths. Raw fetch to ad-hoc URLs is forbidden except in Playwright mocks.
</Rule>

<Rule id="ARCHITECTURE_TESTS_REQUIRED">
Solutions following these standards MUST include {ProjectName}.Architecture.Tests with NetArchTest rules from `docs/decisions/architecture-tests-as-enforcement.md`.
</Rule>

<Rule id="MONOREPO_LAYOUT">
In monorepos, the .NET solution MUST live under apps/api/, not at the repository root src/. All runnable apps MUST live under apps/. See `docs/conventions/shared/monorepo-structure.md`.
</Rule>

---

## 2. Deterministic Scaffolding Sequence

When implementing a new aggregate or use case, developers and AI agents **MUST** follow this exact sequence. If a use case doc exists at `docs/domain/{feature}/{use-case}.md`, treat its acceptance criteria as the completion contract and the feature README as domain input for steps 1 through 3. Run verification checkpoints after steps 3, 5, 7, and 8. Do not skip steps or write outer layers before completing inner boundaries.

```mermaid
graph TD
    Step1["1. Domain Entity and ID"]
    Step2["2. Repository Interface"]
    Step3["3. EF Core Configuration"]
    Step3b["Checkpoint: dotnet build + dotnet ef migrations add"]
    Step4["4. Contracts Projects"]
    Step5["5. Handlers and Validators"]
    Step5b["Checkpoint: dotnet build + dotnet test Application.Tests"]
    Step6["6. Reactions (conditional)"]
    Step7["7. WebApi Endpoint and DI"]
    Step7b["Checkpoint: dotnet build + dotnet test Integration.Tests"]
    Step8["8. Frontend domain use case (if applicable)"]
    Step8b["Checkpoint: pnpm lint + type-check + test"]

    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step3b
    Step3b --> Step4
    Step4 --> Step5
    Step5 --> Step5b
    Step5b --> Step6
    Step6 --> Step7
    Step7 --> Step7b
    Step7b --> Step8
    Step8 --> Step8b
```

1. **Domain:** Strongly-typed ID and aggregate root.
2. **Repository interface** in `Domain`.
3. **EF configuration** in `Infrastructure`. **Checkpoint:** `dotnet build apps/api/{ProjectName}.slnx` and `dotnet ef migrations add {Name}` when schema changed.
4. **Command/query records** in Contracts projects.
5. **Handlers and validators** in `Application.Write` / `Application.Read`. **Checkpoint:** `dotnet test apps/api/tests/{ProjectName}.Application.Tests`.
6. **Narrow interface in `Application.Reactions` + Infrastructure implementation** (conditional: add only when an aggregate method raises a domain event that requires an external side effect).
7. **`IEndpoint` and DI** in `WebApi` / `Infrastructure`. **Checkpoint:** `dotnet test apps/api/tests/{ProjectName}.Integration.Tests` and architecture tests.
8. **Frontend domain use case** under `domain/{feature}/{use-case}/` (when the use case has UI). **Checkpoint:** `pnpm lint && pnpm type-check && pnpm test`.

Minimum commands between checkpoints:

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
dotnet ef migrations add {MigrationName} \
  --project apps/api/src/{ProjectName}.Infrastructure \
  --startup-project apps/api/src/{ProjectName}.WebApi
```

---

## 3. DO / DON'T Guardrails

#### Repository save boundary

```csharp
// DO: stage write; pipeline persists
public async Task AddAsync(Post post, CancellationToken cancellationToken)
{
    await _dbContext.Posts.AddAsync(post, cancellationToken);
}
```

```csharp
// DON'T: SaveChangesAsync in repository
await _dbContext.SaveChangesAsync(cancellationToken); // FORBIDDEN
```

#### Anti-drift: no stubs

```typescript
// DO: implement behavior or omit until spec exists
export async function publishPost(postId: PostId) {
  const client = await getApiClient()
  const { error } = await client.POST("/posts/{id}/publish", { params: { path: { id: postId } } })
  if (error) throw new Error("Publish failed")
}
```

```typescript
// DON'T: placeholder stub
export async function publishPost(_postId: PostId) {
  // TODO: implement later
  throw new Error("Not implemented")
}
```

#### Anti-drift: Tailwind

```tsx
// DO: theme token
<div className="p-4 text-foreground bg-background" />
```

```tsx
// DON'T: arbitrary spacing/color
<div className="p-[13px] text-[#3a3f51]" />
```

#### 3. LiteBus Module Registration

LiteBus registration is authoritative in `docs/blueprints/backend/program-cs.md` only. Other documents MUST reference that file instead of duplicating registration blocks.

```csharp
// DON'T: calling AddCommandModule twice causes a duplicate key error
builder.Services.AddLiteBus(liteBus =>
{
    liteBus.AddCommandModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationWriteAssemblyMarker).Assembly);
    });

    liteBus.AddCommandModule(module => // FORBIDDEN — duplicate module call
    {
        module.RegisterFromAssembly(typeof(InfrastructureAssemblyMarker).Assembly);
    });
});
```

#### 4. Domain Event Framework Coupling

```csharp
// DO: domain event is a plain record with no framework dependency
sealed record PostPublished(PostId PostId) : IDomainEvent;

// IDomainEvent is a project-defined marker — no base interface required:
interface IDomainEvent;
```

```csharp
// DON'T: coupling domain events to a framework interface
sealed record PostPublished(PostId PostId) : IEvent; // FORBIDDEN — IEvent is a LiteBus interface
sealed record PostPublished(PostId PostId) : IDomainEvent, IEvent; // FORBIDDEN — same problem
```

---

## 4. Mandatory Verification Pipeline

Before marking any task complete, an agent **MUST** complete `docs/guides/definition-of-done.md` and run every gate in `docs/conventions/shared/ci.md` that applies to the change.

Minimum commands:

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm exec playwright test --config apps/web/playwright.config.ts
```

Skip frontend steps when the project has no `apps/web/`.

### Self-Correction Checklist

- [ ] Completed `docs/guides/definition-of-done.md`.
- [ ] No forbidden packages (`docs/conventions/shared/forbidden-packages.md`).
- [ ] `snake_case` on all PostgreSQL mappings.
- [ ] `cancellationToken` naming on all async methods.
- [ ] `.AsNoTracking()` on read queries.
- [ ] No cross-domain imports when frontend changed.
- [ ] OpenAPI artifacts committed when API contract changed.

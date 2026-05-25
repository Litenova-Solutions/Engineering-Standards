# Engineering Principles

These principles apply to all projects following these standards, regardless of language or framework. They are the foundation from which all layer-specific conventions derive. When a specific convention appears to conflict with a general rule, the specific convention takes precedence, but that convention must itself be grounded in one of these principles.

---

## 1. Explicitness Over Magic

Code **MUST** be easy to follow over abstractions that hide behavior. Every behavior **MUST** be traceable from its call site without jumping through framework internals or documentation.

If a reader cannot understand what a piece of code does without reading framework source code, that is a signal to simplify. Auto-mapping libraries that infer transformations by convention, implicit framework behaviors configured via reflection, and magic string conventions all violate this principle.

The cost of verbosity is measured in keystrokes. The cost of magic is measured in debugging hours.

---

## 2. Screaming Architecture

Folder structure **MUST** communicate business intent. A developer **MUST** be able to identify the business domain from folder names alone, not from file or class names.

```
// GOOD: folder structure that communicates intent
Features/
  Posts/
    Create/
    Publish/
    GetById/
  Authors/
    Register/
    GetProfile/

// BAD: folder structure that reveals nothing
Services/
Helpers/
Utils/
Managers/
```

Every layer applies this principle. Domain folders are named after business concepts, not technical operations.

---

## 3. One-Way Dependencies

Layer dependencies are strictly one-directional: outer layers depend on inner layers. Inner layers never reference outer layers. No circular dependencies exist anywhere in the solution.

If you find yourself needing to reference an outer layer from an inner layer, the design is wrong. Extract an interface in the inner layer and implement it in the outer layer. This is how Infrastructure provides database access to Application without Application knowing about EF Core.

---

## 4. Aggregate as Consistency Boundary

A single database transaction **MUST** modify a single aggregate. If an operation appears to require modifying two aggregates in one transaction, either the aggregate boundaries are wrong or the operation **MUST** be modeled as a domain event that triggers a separate handler.

Cross-aggregate coordination happens via domain events, not by loading multiple aggregates in the same command handler and saving both. The transaction boundary is the aggregate, not the use case.

---

## 5. Ubiquitous Language

Names in code reflect the business domain. Domain experts and developers use the same words for the same concepts. There is no translation layer between what the business calls something and what the code calls it.

This applies at every layer:
- Do not name a handler `ProcessDataHandler` when the business operation is `PublishPost`.
- Do not name a property `Status` when the business domain calls it `PublishingState`.
- Do not name a folder `Items` when the domain calls them `OrderLines`.

If a business stakeholder would not recognize a name in the codebase, that name is wrong.

---

## 6. Promotion Rule for Shared Code

Code starts where it is first needed. It does not move to a `Shared/` folder preemptively.

- **Strike 0:** Code exists in exactly one place. It stays there.
- **Strike 1 (same domain):** A second use appears within the same domain. Extract to a domain-local `Shared/` subfolder.
- **Strike 2 (different domain):** A third use appears from a different domain. Extract to the layer-level `Shared/` folder.

The promotion rule prevents the accumulation of a `Shared/` folder full of types that are only used once, which is the most common source of unnecessary coupling.

The promotion rule applies within a single project. Types that are part of the public contract of a layer (commands, queries, result records, `IDatabaseContext`, pagination envelopes) belong in the Contracts project from the start, not after promotion. Promotion is for implementation-level code that unexpectedly becomes reusable.

### Promotion Workflow Checklist

When promoting code, engineers MUST follow this precise sequence to prevent circular dependencies, namespace drift, and compiler errors:

1. **Verify strike triggers:** Assert that the class, record, or helper is actively needed by multiple boundaries before initiating the move.
2. **Verify dependency directions:** Assert that the target shared folder does not violate one-way dependency rules (e.g., Application Shared code MUST NOT import Infrastructure assemblies).
3. **Relocate and namespace-refactor:** Move the physical file to the target `Shared/` folder and change its namespace declaration to match its new physical location.
4. **Compile and optimize imports:** Run the build system (`dotnet build` or equivalent) to capture broken imports. Update only the required call sites. Avoid importing global namespaces where single-type imports suffice.
5. **Verify against architecture tests:** Execute test verification to ensure the newly shared code does not introduce forbidden references or break internal boundaries.

---

## 7. Exception Hierarchy as Contract

Every exception type communicates its category. The category determines the HTTP response code. This mapping is a team contract enforced by the `GlobalExceptionHandler` middleware.

| Category | HTTP Status |
|:---|:---|
| Input validation failure | 400 |
| Resource not found | 404 |
| Domain invariant violation | 409 |
| Unhandled | 500 |

Throwing a generic `Exception` or `InvalidOperationException` breaks the contract and produces an incorrect HTTP response. All custom exception types are defined in `docs/conventions/backend/06-exception-hierarchy.md`.

---

## 8. No Linter Work in Agent Files

Rules that a linter, formatter, or static analyzer already enforces automatically MUST NOT appear in agent context files (`AGENTS.md`, Cursor rules, Copilot instructions). Agent context files are for rules that require human or AI reasoning.

If a rule can be expressed as an `.editorconfig` setting, a Roslyn analyzer, or an ESLint rule, it belongs in that tooling configuration, not in a prose document that agents must read. Keeping agent files free of mechanical rules makes them smaller and more effective.

One exception applies: rules that are *both* tooling-enforceable and consistently violated by AI agents may appear in agent files as a redundant safety net. The `CancellationToken` parameter naming rule and the `'use client'` comment requirement are examples. They belong in `.editorconfig` or ESLint config *and* in the agent file. Duplication here is intentional, not an oversight.

---

## 9. Contracts Before Implementation

Every public-facing type (commands, queries, results, shared read contracts) lives in a Contracts project before any handler or implementation is written. This enforces the dependency rule at the compiler level: a project that references only the Contracts project cannot accidentally depend on handler implementations.

The Contracts project is the API surface of a layer. The implementation project is the private body. A WebApi endpoint references `Application.Write.Contracts` for the command type and `LiteBus.Commands.Abstractions` for `ICommandMediator` to dispatch it. For queries, reference `LiteBus.Queries.Abstractions` for `IQueryMediator`. It never needs to reference `Application.Write` at all. The boundary is explicit, enforced by the project reference graph, and visible to any engineer reading the solution file.

```csharp
// GOOD: WebApi endpoint references only Contracts types and the specific mediator interface
sealed class CreatePostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/posts", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(
        CreatePostRequest request,
        ICommandMediator commandMediator,
        CancellationToken cancellationToken)
    {
        // CreatePostCommand is from Application.Write.Contracts
        // ICommandMediator is from LiteBus.Commands.Abstractions
        var command = request.ToCommand();
        var postId = await commandMediator.SendAsync(command, cancellationToken: cancellationToken);
        return Results.Created($"/posts/{postId.Value}", postId.ToResponse());
    }
}

// BAD: WebApi endpoint references handler implementation directly
sealed class CreatePostEndpoint : IEndpoint
{
    private readonly CreatePostCommandHandler _handler; // BAD: references implementation project
}
```

---

## 10. Input Validation vs. Invariant Enforcement

Every project MUST enforce a strict boundary between two categories of rule checks: input validation and domain invariant validation. Confusing these two roles leads to business rules bleeding into input validators and bad formatting checks crashing the domain.

| Category | Responsibility | Location | Exception |
|:---|:---|:---|:---|
| **Input Validation** | Validates shape, syntax, formatting, and presence of fields. | Validators (e.g., `ICommandValidator<T>`, React/Zod schemas) | `CommandValidationException` / `QueryValidationException` |
| **Domain Invariants** | Enforces state compliance, business policies, and aggregate consistency. | Domain Aggregates, Value Objects, and Domain Services | `DomainException` subclasses |

### Key Rules:
1. **Validators MUST NOT check database state or complex domain rules.** They inspect the shape and constraints of incoming data (e.g., string length, email formatting, UUID validity). Checking whether a username is unique or whether an account balance has sufficient funds belongs strictly within domain aggregates or domain query flows.
2. **Aggregates MUST NOT perform basic formatting validation.** By the time a command reaches the aggregate, the command payload is already syntactically correct. The aggregate's sole responsibility is enforcing state transitions (e.g., "a post can only be published if it is currently a draft").
3. **Never call validators or throw validation exceptions from inside the aggregate.** An aggregate throws specific domain exception subclasses (such as `PostAlreadyPublishedException`), never argument exceptions or generic validation exceptions.

---

## 11. Documentation Precedence

These standards define defaults for Litenova projects. Consumer repositories (for example LitePress) add project-specific docs under `docs/`, `apps/{name}/README.md`, and ADRs under `docs/decisions/`.

When guidance overlaps:

1. **Project use-case docs** (`docs/domain/{feature}/{use-case}.md`) win for that feature's commands, endpoints, UI flows, and acceptance criteria.
2. **Project app READMEs and ADRs** win for app-specific runbooks, env vars, auth, and UI choices.
3. **These standards** win when project docs are silent.

Agents and engineers MUST read standards first, then project docs, and follow the most specific applicable document. If project docs intentionally diverge from a standard (different UI library, extra frontend app, alternate API docs UI), the project doc MUST state the override explicitly.

During co-development of standards and a reference app, treat the latest committed text in both repositories as authoritative. Prefer current package versions in `standards.manifest.json` and project lockfiles over older examples in either repo.

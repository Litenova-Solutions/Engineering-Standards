# ValidationError Dual Contracts Placement

**Status:** Accepted

**Date:** 2026-06-03

**Canonical rules:** `docs/conventions/backend/exception-hierarchy.md` § ValidationError placement

## Context

`Application.Write.Contracts` and `Application.Read.Contracts` are separate projects by design (see `docs/decisions/contracts-projects-for-application-layer.md`). They MUST NOT reference each other. Both sides throw validation exceptions that map to the same RFC 7807 `invalidParams` shape in `GlobalExceptionHandler`.

`ValidationError` appears in command validation (`CommandValidationException`) and query validation (`QueryValidationException`). Agents and engineers need a single rule for where to import the type.

Three options were considered:

1. **Duplicate identical type in each Contracts project** (current approach).
2. **`Application.Shared.Contracts` project** referenced by both Write and Read Contracts.
3. **Move `ValidationError` to Domain** (rejected: validation errors are application-layer structural concerns, not domain invariants).

Option 2 adds a sixth application project for one two-property record. Option 1 keeps the compiler-enforced boundary between Write and Read Contracts intact with a documented duplication rule.

## Decision

`ValidationError` is defined as an **identical** `sealed record` in **both** Contracts projects:

| Import context | Canonical project | Path |
|:---|:---|:---|
| Command validators, write-side validation exceptions | `Application.Write.Contracts` | `Shared/Exceptions/ValidationError.cs` |
| Query validators, read-side validation exceptions | `Application.Read.Contracts` | `Shared/Exceptions/ValidationError.cs` |

Rules:

- The two definitions MUST remain byte-for-byte equivalent (same property names and types).
- Do not import `ValidationError` across the Write/Read Contracts boundary.
- Do not introduce `Application.Shared.Contracts` solely for this type unless a project ADR documents a migration and architecture tests are updated.
- Architecture tests SHOULD assert both definitions remain structurally equivalent when feasible.

## Consequences

### Positive

- Preserves the zero cross-reference rule between Write and Read Contracts.
- Each side has a local canonical import; no ambiguous third location.
- `GlobalExceptionHandler` maps both exception families to the same HTTP response shape.

### Negative

- Two files must be kept in sync when the shape changes.
- Agents may question the duplication without reading this decision.

### Risks

- Drift between the two definitions if one is updated without the other. Mitigate with architecture tests or a shared source generator only if duplication becomes painful.

## Related

- `docs/decisions/contracts-projects-for-application-layer.md`
- `docs/conventions/backend/exception-hierarchy.md`

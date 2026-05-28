# API Compatibility and OpenAPI Diff

OpenAPI **freshness** (generated spec matches committed spec) does not detect **breaking** changes. Public APIs, mobile APIs, partner APIs, and APIs consumed by independently deployed clients MUST diff the current spec against the last release baseline.

---

## Agent Quick Rules

- Internal-only APIs: freshness check only unless a frontend consumes generated types from another repo.
- Public or independently consumed APIs: freshness **and** breaking-change diff in CI.
- Breaking changes require a new API version or explicit consumer approval.
- Every operation MUST have a stable `operationId`.

---

## 1. Change Classification

| Change type | Breaking? | Action |
|:---|:---:|:---|
| Remove endpoint or field | Yes | New API version or approved exception |
| Rename field or change type | Yes | New API version |
| Change HTTP status code for same condition | Yes | New API version |
| Add optional field or new endpoint | No | Minor release |
| Add optional query parameter | No | Minor release |
| Clarify description only | No | Patch |

When in doubt, treat as breaking.

---

## 2. CI Workflow

Store the baseline OpenAPI artifact from each release tag (for example `packages/api-types/openapi.baseline.json` or GitHub Release asset).

```bash
# After build exports openapi.json
oasdiff breaking openapi.baseline.json bin/Release/net10.0/openapi.json
```

Alternative tools: `openapi-diff`, `swagger-diff`, or Spectral breaking rules.

Fail the pipeline on breaking changes unless:

- The PR bumps API version (`/api/v2/...`), or
- The PR includes an ADR with consumer sign-off.

---

## 3. Release Process

1. On release tag, copy current `openapi.json` to the baseline artifact.
2. Document additive changes in GitHub Release notes.
3. Regenerate frontend types (`openapi-typescript`) in the same release PR when the API is consumed by web or mobile clients.

See `docs/conventions/backend/08-testing.md` for freshness commands.

---

## 4. Error Schema Stability

Problem Details responses SHOULD expose stable `errorCode` values. See `docs/conventions/backend/06-exception-hierarchy.md`. Contract tests SHOULD assert error shape for documented failure cases.

---

## 5. Deprecation

Public APIs SHOULD use `Deprecation` and `Sunset` headers (or project-documented equivalent) before removing endpoints. Document the timeline in the use-case doc and release notes.

---

## 6. Swashbuckle Migration

Existing projects on Swashbuckle SHOULD migrate to `Microsoft.AspNetCore.OpenApi` plus Scalar for local development:

1. Add ADR documenting the migration window.
2. Replace Swashbuckle middleware with `AddOpenApi()` / `MapOpenApi()`.
3. Add Scalar in Development only (`docs/conventions/backend/05-api-layer.md`).
4. Export spec at build time with `Microsoft.Extensions.ApiDescription.Server`.
5. Run OpenAPI diff against baseline before cutover.
6. Remove Swashbuckle package references after consumers accept the new spec.

Swashbuckle remains acceptable only while a project ADR documents a legacy requirement.

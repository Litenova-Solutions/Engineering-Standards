# Enforcement Matrix

Maps high-risk MUST rules to verification tools. Consumer CI SHOULD implement gates marked **Required** before production. See `docs/conventions/shared/ci.md` for the template workflow.

| Rule | Severity if violated | Enforcement | CI gate | Status |
|:---|:---:|:---|:---:|:---:|
| Domain has no Infrastructure/Application references | Critical | NetArchTest | Required | Documented |
| No MVC controllers | High | NetArchTest | Required | Documented |
| Handlers `internal sealed` | Medium | NetArchTest | Required | Documented |
| No `SaveChangesAsync` outside pipeline | High | Roslyn analyzer or allow-list script | Required | Documented |
| No direct `configuration["Key"]!` | High | Roslyn / review | Recommended | Documented |
| Raw SQL parameterization | Critical | Static scan for string concat | Required | Documented |
| OpenAPI freshness | High | Build export + git diff | Required when frontend consumes API | Documented |
| OpenAPI breaking diff | High | `oasdiff` vs release baseline | Required for public APIs | Documented |
| Package versions match manifest | High | `validate-manifest` script | Required | Partial |
| Object-level auth tests | Critical | Integration tests | Required | Documented |
| Secret scanning | Critical | Gitleaks / GitHub | Required | Recommended |
| SAST | High | CodeQL | Required | Recommended |
| Third-party action SHA pins | High | actionlint / custom | Required | Documented |
| Submodule pinned to tag or SHA | High | `git describe --exact-match` or SHA check | Required | Documented |
| Manifest schema valid | Medium | JSON schema validation | Required | New |
| `LangVersion=preview` in production | High | Template validation script | Required | New |
| WebApi registers no durable `BackgroundService` | High | NetArchTest / review | Recommended | Documented |
| Domain value objects throw `DomainException` only | Critical | NetArchTest + review | Recommended | Documented |

---

## Agent-Enforceable vs Review-Only

Rules without automation depend on code review and agent guardrails. Prioritize automating **Critical** and **High** rows before v1 adoption.

Agent context loading plans live in `standards.manifest.json` → `agentLoadPlans`.

# Security Controls Matrix

Maps engineering standards to OWASP ASVS themes, OWASP API Security Top 10 (2023) items, enforcement mechanisms, and required tests. Use this during security reviews and release checklists.

Status legend: **M** = mandatory, **A** = advisory, **P** = project-specific (document in ADR or use-case doc).

---

## API Security Top 10 Mapping

| API Top 10 2023 | Control | Standard | Enforcement | Tests |
|:---|:---|:---|:---|:---|
| API1 Broken Object Level Authorization | Object-level auth on every `{id}` route | `backend/20-object-authorization.md`, `backend/15-authentication-and-authorization.md` | Integration tests | 403 negative tests per endpoint |
| API2 Broken Authentication | JWT validation, claims-only actor identity | `backend/15-authentication-and-authorization.md` | Auth middleware, options validation | 401 tests, `TestAuthHandler` |
| API3 Broken Object Property Level Authorization | Response DTOs expose only authorized fields | `backend/05-api-layer.md`, read projections | Code review | Contract tests |
| API4 Unrestricted Resource Consumption | Rate limits, pagination limits | `backend/05-api-layer.md`, `backend/19-raw-sql-and-reporting.md` | Rate limiter policies | Load test evidence in release checklist |
| API5 Broken Function Level Authorization | Policy constants, role checks | `backend/15-authentication-and-authorization.md` | `RequireAuthorization(policy)` | Role-based integration tests |
| API6 Unrestricted Access to Sensitive Business Flows | Idempotency, rate limits on sensitive flows | `backend/10-reliability.md`, `backend/05-api-layer.md` | Idempotency store | Replay tests |
| API7 Server Side Request Forgery | URL allow-lists for outbound HTTP | **P** — document in project ADR until dedicated standard | Code review | Sandbox contract tests |
| API8 Security Misconfiguration | Typed options, CORS, CSP | `backend/16-options-and-configuration.md`, `shared/security.md` | `ValidateOnStart`, CI | Startup validation |
| API9 Improper Inventory Management | OpenAPI freshness and diff | `shared/api-compatibility.md`, `backend/08-testing.md` | CI OpenAPI gates | Freshness + diff jobs |
| API10 Unsafe Consumption of APIs | Anti-corruption in Infrastructure | `backend/04-infrastructure-layer.md` | Code review | Provider sandbox tests |

---

## ASVS-Themed Baseline

| ASVS area | Control | Standard | Automation |
|:---|:---|:---|:---|
| V1 Architecture | Clean Architecture, one-way deps | `architecture/clean-architecture.md`, `00-principles.md` | NetArchTest |
| V2 Authentication | JWT bearer, no body actor IDs | `backend/15-authentication-and-authorization.md` | Integration tests |
| V3 Session Management | Bearer tokens; cookie auth **P** | `frontend/10-admin-api-auth.md` | Project ADR for CSRF |
| V4 Access Control | Policies + object-level checks | `backend/20-object-authorization.md` | Integration tests |
| V5 Validation | Validators vs domain invariants | `00-principles.md`, `backend/06-exception-hierarchy.md` | Unit + integration |
| V6 Stored Data | Parameterized SQL, no secrets in repo | `backend/19-raw-sql-and-reporting.md`, `shared/security.md` | Secret scan, static SQL scan |
| V7 Errors and Logging | Problem Details, no stack in 500 | `backend/06-exception-hierarchy.md` | Contract tests |
| V8 Data Protection | PII classification | `shared/security.md` | Project data classification doc |
| V9 Communications | TLS, CORS, CSP | `shared/security.md`, frontend CSP blueprint | CI, manual prod checklist |
| V10 Malicious Code | Dependency scanning, action SHA pins | `shared/supply-chain-security.md` | `pnpm audit`, `dotnet list package --vulnerable`, workflow lint |
| V11 Business Logic | Domain invariants in aggregates | `backend/02-domain-layer.md` | Domain tests |
| V12 Files and Resources | File upload safety | **P** — project ADR until dedicated standard | MIME/size tests |
| V13 API and Web Service | OpenAPI, versioning | `backend/05-api-layer.md`, `shared/api-compatibility.md` | CI |
| V14 Configuration | Strongly typed options | `backend/16-options-and-configuration.md` | Roslyn / review |

---

## CI Gates (Mandatory Before Production)

| Gate | Tool | Standard reference |
|:---|:---|:---|
| Secret scanning | GitHub Secret Protection, Gitleaks, or equivalent | `shared/security.md` |
| SAST | CodeQL or equivalent | This matrix |
| Dependency vulnerabilities | `pnpm audit`, `dotnet list package --vulnerable` | `shared/supply-chain-security.md` |
| Architecture tests | NetArchTest | `backend/08-testing.md` |
| OpenAPI freshness | Generated vs committed spec | `backend/08-testing.md` |
| OpenAPI breaking diff | `oasdiff` or equivalent | `shared/api-compatibility.md` |
| Action SHA / workflow lint | actionlint, zizmor, or custom | `shared/supply-chain-security.md` |

---

## Project Artifacts

Production launches MUST include:

| Artifact | Path (consumer project) |
|:---|:---|
| Data classification | `docs/security/data-classification.md` or ADR |
| Rate limit load test evidence | Release checklist attachment or runbook link |
| Public API compatibility baseline | Committed OpenAPI at last release tag |

See `docs/controls/enforcement-matrix.md` for the full rule-to-tool mapping.

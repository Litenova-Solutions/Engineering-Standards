# Reporting and Exports

## Intent

Reporting separates complex joins, aggregate analysis, and large exports from normal request projections when cost or duration exceeds the baseline read path.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

The consumer enables `reporting` for a documented query or export with complex relational SQL, large results, long processing, object storage, or exceptional latency budget.

## Baseline relationship

This extension does not replace the baseline rule for ordinary queries. Long-running exports activate Worker under `ARCH.WORKER.001`.

## Agent Summary {#agent-summary}

- Record cost before adding reporting infrastructure. (EXT.REPORT.ADOPT.001)
- Keep raw SQL parameterized in Infrastructure. (EXT.REPORT.SQL.001, EXT.REPORT.SQL.002)
- Apply item-read authorization to report data. (EXT.REPORT.AUTHZ.001)
- Run budget-exceeding exports in Worker. (EXT.REPORT.EXPORT.001)
- Bound report work and output retention. (EXT.REPORT.LIMITS.001)
- Escape spreadsheet formula-leading values. (EXT.REPORT.CONTENT.001)

## Standards

### Record reporting need (EXT.REPORT.ADOPT.001)

**Requirement:** A reporting proposal MUST record the report, representative data volume, plan or limitation, latency target, maximum result, and operating owner.

**Rationale:** The record establishes why a normal request projection cannot meet the documented boundary.

### Avoid speculative reporting systems (EXT.REPORT.ADOPT.002)

**Requirement:** A project MUST NOT create reporting infrastructure for possible future analytics.

**Rationale:** Reporting infrastructure needs an accepted query or export with a present cost boundary.

### Parameterize report SQL (EXT.REPORT.SQL.001)

**Requirement:** A reporting query MUST parameterize every actor, tenant, filter, range, sort, and pagination value.

**Rationale:** Parameters preserve data isolation and protect raw SQL from injection.

### Keep raw SQL in Infrastructure (EXT.REPORT.SQL.002)

**Requirement:** Infrastructure MUST own raw reporting SQL and connection handling.

**Rationale:** Provider-specific query and connection behavior stays outside Application and Domain.

### Review report plans (EXT.REPORT.SQL.003)

**Requirement:** A report owner MUST review query plans and indexes with representative data.

**Rationale:** Representative volumes reveal cost that small local datasets can hide.

### Apply item-read authorization (EXT.REPORT.AUTHZ.001)

**Requirement:** A report or export MUST enforce actor, role, ownership, tenant, and sensitive-field rules that apply to item reads.

**Rationale:** A bulk interface cannot bypass data access checks applied to individual resources.

### Run budget-exceeding exports in Worker (EXT.REPORT.EXPORT.001)

**Requirement:** An export exceeding its request budget MUST run through Worker.

**Rationale:** Worker execution frees the HTTP request from long-running report work.

### Protect export output (EXT.REPORT.EXPORT.002)

**Requirement:** An export worker MUST store output in approved object storage with an owner, expiry, and short-lived authorized download.

**Rationale:** Export files can contain sensitive data and need controlled access and retention.

### Define report limits (EXT.REPORT.LIMITS.001)

**Requirement:** A report specification MUST define maximum date range, rows, execution time, concurrent jobs, output size, and storage lifetime.

**Rationale:** Explicit limits bound database, Worker, and object-storage cost.

### Support report cancellation (EXT.REPORT.LIMITS.002)

**Requirement:** A report implementation MUST support cancellation and remove expired outputs.

**Rationale:** Cancellation and expiry prevent abandoned work and files from consuming resources indefinitely.

### Escape formula-leading export values (EXT.REPORT.CONTENT.001)

**Requirement:** A CSV or spreadsheet export MUST escape formula-leading values unless a reviewed field intentionally contains a formula.

**Rationale:** Spreadsheet applications can interpret unescaped values as executable formulas.

### Define export encoding and columns (EXT.REPORT.CONTENT.002)

**Requirement:** An export format MUST use explicit character encoding and a stable column contract.

**Rationale:** Stable output lets consumers parse data without locale or implementation assumptions.

## Conventions

### Keep report definitions in Application (EXT.REPORT.CONVENTION.001)

**Default:** Keep report definitions in Application under their business module.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Business meaning and authorization belong with the module that owns the report.

### Keep report providers in Infrastructure (EXT.REPORT.CONVENTION.002)

**Default:** Keep SQL, row mappings, and storage providers in Infrastructure.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Query and storage implementation details are provider boundaries.

### Separate Worker orchestration (EXT.REPORT.CONVENTION.003)

**Default:** Keep Worker orchestration separate from report business rules.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Worker scheduling and execution do not define report authorization or meaning.

## Dependencies

No report or object-storage package is selected by default. Each provider needs a decision and manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.REPORT.ADOPT.001 | inspection | Report specification records each required cost and ownership field. |
| EXT.REPORT.ADOPT.002 | inspection | Reporting decision names an accepted current query or export need. |
| EXT.REPORT.SQL.001 | test | `ReportSqlTests` bind actor, tenant, filter, range, sort, and pagination values. |
| EXT.REPORT.SQL.002 | inspection | Source review locates raw report SQL and connection handling in Infrastructure. |
| EXT.REPORT.SQL.003 | operation | Review record includes plans and indexes for representative report data. |
| EXT.REPORT.AUTHZ.001 | test | `ReportAuthzTests` cover actor, role, owner, tenant, and sensitive fields. |
| EXT.REPORT.EXPORT.001 | test | `ReportExportTests` queue work through Worker. |
| EXT.REPORT.EXPORT.002 | test | `ReportExportTests` require owner authorization and honor expiry. |
| EXT.REPORT.LIMITS.001 | inspection | Report specification declares each report cost and storage limit. |
| EXT.REPORT.LIMITS.002 | test | `ReportLimitsTests` stop work and remove expired output. |
| EXT.REPORT.CONTENT.001 | test | `ReportContentTests` asserts formula-leading export values are escaped except reviewed formula fields. |
| EXT.REPORT.CONTENT.002 | test | `ReportContentTests` assert explicit encoding and stable column order. |
| EXT.REPORT.CONVENTION.001 | inspection | Report definitions remain module-owned in Application or record a replacement. |
| EXT.REPORT.CONVENTION.002 | inspection | SQL and storage code remain in Infrastructure or record a replacement. |
| EXT.REPORT.CONVENTION.003 | inspection | Worker code does not contain report business rule ownership. |

# Reporting and Exports

## Intent

Reporting separates complex joins, aggregate analysis, and large exports from normal request projections when cost or duration exceeds the baseline read path.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

The consumer enables `report` for a documented query or export with complex relational SQL, large results, long processing, object storage, or exceptional latency budget.

## Baseline relationship

This extension does not replace the baseline rule for ordinary queries. Long-running exports activate `standards/rule/backend-architecture.declare-the-execution-host-for-work-that-outlives-a-request`, so the project declares the execution host that runs them.

## Agent Summary {#agent-summary}

- Record cost before adding reporting infrastructure. (standards/rule/ext-report.record-reporting-need)
- Keep raw SQL parameterized in Infrastructure. (standards/rule/ext-report.parameterize-report-sql, standards/rule/ext-report.keep-raw-sql-in-infrastructure)
- Apply item-read authorization to report data. (standards/rule/ext-report.apply-item-read-authorization)
- Run budget-exceeding exports in Worker. (standards/rule/ext-report.run-budget-exceeding-exports-in-worker)
- Bound report work and output retention. (standards/rule/ext-report.define-report-limits)
- Escape spreadsheet formula-leading values. (standards/rule/ext-report.escape-formula-leading-export-values)

## Standards

### Record reporting need (standards/rule/ext-report.record-reporting-need)

**Requirement:** A reporting proposal MUST record the report, representative data volume, plan or limitation, latency target, maximum result, and operating owner.

**Rationale:** The record establishes why a normal request projection cannot meet the documented boundary.

### Avoid speculative reporting systems (standards/rule/ext-report.avoid-speculative-reporting-systems)

**Requirement:** A project MUST NOT create reporting infrastructure for possible future analytics.

**Rationale:** Reporting infrastructure needs an accepted query or export with a present cost boundary.

### Parameterize report SQL (standards/rule/ext-report.parameterize-report-sql)

**Requirement:** A reporting query MUST parameterize every actor, tenant, filter, range, sort, and pagination value.

**Rationale:** Parameters preserve data isolation and protect raw SQL from injection.

### Keep raw SQL in Infrastructure (standards/rule/ext-report.keep-raw-sql-in-infrastructure)

**Requirement:** Infrastructure MUST own raw reporting SQL and connection handling.

**Rationale:** Provider-specific query and connection behavior stays outside Application and Domain.

### Review report plans (standards/rule/ext-report.review-report-plans)

**Requirement:** A report owner MUST review query plans and indexes with representative data.

**Rationale:** Representative volumes reveal cost that small local datasets can hide.

### Apply item-read authorization (standards/rule/ext-report.apply-item-read-authorization)

**Requirement:** A report or export MUST enforce actor, role, ownership, tenant, and sensitive-field rules that apply to item reads.

**Rationale:** A bulk interface cannot bypass data access checks applied to individual resources.

### Run budget-exceeding exports in Worker (standards/rule/ext-report.run-budget-exceeding-exports-in-worker)

**Requirement:** An export exceeding its request budget MUST run through Worker.

**Rationale:** Worker execution frees the HTTP request from long-running report work.

### Protect export output (standards/rule/ext-report.protect-export-output)

**Requirement:** An export worker MUST store output in approved object storage with an owner, expiry, and short-lived authorized download.

**Rationale:** Export files can contain sensitive data and need controlled access and retention.

### Define report limits (standards/rule/ext-report.define-report-limits)

**Requirement:** A report specification MUST define maximum date range, rows, execution time, concurrent jobs, output size, and storage lifetime.

**Rationale:** Explicit limits bound database, Worker, and object-storage cost.

### Support report cancellation (standards/rule/ext-report.support-report-cancellation)

**Requirement:** A report implementation MUST support cancellation and remove expired outputs.

**Rationale:** Cancellation and expiry prevent abandoned work and files from consuming resources indefinitely.

### Escape formula-leading export values (standards/rule/ext-report.escape-formula-leading-export-values)

**Requirement:** A CSV or spreadsheet export MUST escape formula-leading values unless a reviewed field intentionally contains a formula.

**Rationale:** Spreadsheet applications can interpret unescaped values as executable formulas.

### Reject formula-leading import values (standards/rule/ext-report.reject-formula-leading-import-values)

**Requirement:** A CSV or spreadsheet import MUST reject or neutralize a value that begins with a formula-leading character.

**Rationale:** The formula-leading characters are the equals sign, the plus sign, the minus sign, the at sign, the tab, and the carriage return. Escaping on the way out protects the reader of this export. It does not protect the reader of the next one. An imported value stored unchanged is re-exported by a different report that may not escape it. [CSV injection](https://owasp.org/www-community/attacks/CSV_Injection) travels through the store, so the boundary that admits the value is where it stops.

**Example:** An import that rejects the value reports the row and the field. An import that neutralizes it records what it changed, because a silently altered value is a data defect the owner cannot see.

### Define export encoding and columns (standards/rule/ext-report.define-export-encoding-and-columns)

**Requirement:** An export format MUST use explicit character encoding and a stable column contract.

**Rationale:** Stable output lets consumers parse data without locale or implementation assumptions.

## Conventions

### Keep report definitions in Application (standards/rule/ext-report.keep-report-definitions-in-application)

**Default:** Keep report definitions in Application under their business module.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Business meaning and authorization belong with the module that owns the report.

### Keep report providers in Infrastructure (standards/rule/ext-report.keep-report-providers-in-infrastructure)

**Default:** Keep SQL, row mappings, and storage providers in Infrastructure.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Query and storage implementation details are provider boundaries.

### Separate Worker orchestration (standards/rule/ext-report.separate-worker-orchestration)

**Default:** Keep Worker orchestration separate from report business rules.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Worker scheduling and execution do not define report authorization or meaning.

## Dependencies

No report or object-storage package is selected by default. Each provider needs a decision and manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-report.record-reporting-need | inspection | Report specification records each required cost and ownership field. |
| standards/rule/ext-report.avoid-speculative-reporting-systems | inspection | Reporting decision names an accepted current query or export need. |
| standards/rule/ext-report.parameterize-report-sql | test | `ReportSqlTests` bind actor, tenant, filter, range, sort, and pagination values. |
| standards/rule/ext-report.keep-raw-sql-in-infrastructure | inspection | Source review locates raw report SQL and connection handling in Infrastructure. |
| standards/rule/ext-report.review-report-plans | operation | Review record includes plans and indexes for representative report data. |
| standards/rule/ext-report.apply-item-read-authorization | test | `ReportAuthzTests` cover actor, role, owner, tenant, and sensitive fields. |
| standards/rule/ext-report.run-budget-exceeding-exports-in-worker | test | `ReportExportTests` queue work through Worker. |
| standards/rule/ext-report.protect-export-output | test | `ReportExportTests` require owner authorization and honor expiry. |
| standards/rule/ext-report.define-report-limits | inspection | Report specification declares each report cost and storage limit. |
| standards/rule/ext-report.support-report-cancellation | test | `ReportLimitsTests` stop work and remove expired output. |
| standards/rule/ext-report.escape-formula-leading-export-values | test | `ReportContentTests` asserts formula-leading export values are escaped except reviewed formula fields. |
| standards/rule/ext-report.define-export-encoding-and-columns | test | `ReportContentTests` assert explicit encoding and stable column order. |
| standards/rule/ext-report.reject-formula-leading-import-values | test | `ReportContentTests` assert an imported formula-leading value is rejected or recorded as neutralized. |
| standards/rule/ext-report.keep-report-definitions-in-application | inspection | Report definitions remain module-owned in Application or record a replacement. |
| standards/rule/ext-report.keep-report-providers-in-infrastructure | inspection | SQL and storage code remain in Infrastructure or record a replacement. |
| standards/rule/ext-report.separate-worker-orchestration | inspection | Worker code does not contain report business rule ownership. |

# Reporting and Exports

## Intent

Reporting separates complex joins, aggregate analysis, and large exports from normal request projections when cost or duration exceeds the baseline read path.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

The consumer enables `report` for a documented query or export with complex relational SQL, large results, long processing, object storage, or exceptional latency budget.

## Baseline relationship

None. Ordinary queries stay under `litespec/backend/persistence#query-through-the-read-session`; this extension governs reads whose cost or duration exceeds that path.

`limit`. Selecting `report` requires Limit records for the request budget and the report bounds.

## Standards

### Record reporting need

**Requirement:** A reporting proposal MUST record the report, representative data volume, plan or limitation, latency target, maximum result, and operating owner.

**Rationale:** The record establishes why a normal request projection cannot meet the documented boundary. The use-case page carries the record with its owner and status.

### Avoid speculative reporting systems

**Requirement:** A project MUST NOT create reporting infrastructure for possible future analytics.

**Rationale:** Reporting infrastructure needs an accepted query or export with a present cost boundary.

### Parameterize report SQL

**Requirement:** A reporting query MUST parameterize every actor, tenant, filter, range, sort, and pagination value.

**Rationale:** Parameters preserve data isolation and protect raw SQL from injection.

### Keep raw SQL in Infrastructure

**Requirement:** Infrastructure MUST own raw reporting SQL and connection handling.

**Rationale:** Provider-specific query and connection behavior stays outside Application and Domain.

### Review report plans

**Requirement:** A report owner MUST review query plans and indexes with representative data.

**Rationale:** Representative volumes reveal cost that small local datasets can hide.

### Apply item-read authorization

**Requirement:** A report or export MUST enforce actor, role, ownership, tenant, and sensitive-field rules that apply to item reads.

**Rationale:** A bulk interface cannot bypass data access checks applied to individual resources.

### Run budget-exceeding exports in Worker

**Requirement:** An export exceeding its request budget MUST run through Worker, with the budget a Limit record the export's use case names.

**Rationale:** Worker execution frees the HTTP request from long-running report work.

### Protect export output

**Requirement:** An export worker MUST store output in approved object storage with an owner, expiry, and short-lived authorized download.

**Rationale:** Export files can contain sensitive data and need controlled access and retention.

### Scope export output to the tenant

**Requirement:** An export MUST store its output under a tenant-scoped object-storage path.

**Rationale:** A shared output path lets one tenant guess another tenant's export address.

### Define report limits

**Requirement:** A report specification MUST state each bound as a Limit record: maximum date range, rows, execution time, concurrent jobs, output size, and storage lifetime.

**Rationale:** Explicit limits bound database, Worker, and object-storage cost.

### Support report cancellation

**Requirement:** A report implementation MUST support cancellation and remove expired outputs.

**Rationale:** Cancellation and expiry prevent abandoned work and files from consuming resources indefinitely.

### Escape formula-leading export values

**Requirement:** A CSV or spreadsheet export MUST escape formula-leading values unless a reviewed field intentionally contains a formula.

**Rationale:** Spreadsheet applications can interpret unescaped values as executable formulas.

### Define export encoding and columns

**Requirement:** An export format MUST use explicit character encoding and a stable column contract.

**Rationale:** Stable output lets consumers parse data without locale or implementation assumptions.

## Conventions

### Keep report definitions in Application

**Default:** Keep report definitions in Application under their business module.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Business meaning and authorization belong with the module that owns the report.

### Keep report providers in Infrastructure

**Default:** Keep SQL, row mappings, and storage providers in Infrastructure.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Query and storage implementation details are provider boundaries.

### Separate Worker orchestration

**Default:** Keep Worker orchestration separate from report business rules.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Worker scheduling and execution do not define report authorization or meaning.

## Dependencies

The extension selects no report or object-storage package by default. Each provider needs a decision and manifest pin.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/report#record-reporting-need | guidance | Does the use-case page record the report, volume, plan, target, maximum, and owner? |
| litespec/ext/report#avoid-speculative-reporting-systems | guidance | Does reporting serve an accepted current query or export? |
| litespec/ext/report#parameterize-report-sql | guidance | Does every report query bind actor, tenant, filter, range, sort, and pagination values? |
| litespec/ext/report#keep-raw-sql-in-infrastructure | guidance | Do raw report SQL and connection handling live in Infrastructure? |
| litespec/ext/report#review-report-plans | guidance | Did the owner review plans and indexes on representative data? |
| litespec/ext/report#apply-item-read-authorization | guidance | Does each report and export enforce the item-read rules? |
| litespec/ext/report#run-budget-exceeding-exports-in-worker | guidance | Does each export past its request budget run through Worker? |
| litespec/ext/report#protect-export-output | guidance | Does export output carry an owner and expiry with short-lived authorized download? |
| litespec/ext/report#scope-export-output-to-the-tenant | guidance | Does each export store its output under a tenant-scoped path? |
| litespec/ext/report#define-report-limits | guidance | Does each report bound live as a Limit record? |
| litespec/ext/report#support-report-cancellation | guidance | Does report work cancel, and does expired output clear? |
| litespec/ext/report#escape-formula-leading-export-values | guidance | Are formula-leading export values escaped except for reviewed formula fields? |
| litespec/ext/report#define-export-encoding-and-columns | guidance | Does each export state its encoding and stable columns? |
| litespec/ext/report#keep-report-definitions-in-application | guidance | Do report definitions live in their module or a recorded Exception? |
| litespec/ext/report#keep-report-providers-in-infrastructure | guidance | Do SQL and storage code live in Infrastructure or a recorded Exception? |
| litespec/ext/report#separate-worker-orchestration | guidance | Is Worker orchestration separate from report business rules or a recorded Exception? |

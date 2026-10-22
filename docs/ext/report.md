# Reporting and Exports

## Intent

Reporting and exports answer questions too heavy for a normal request: complex joins, analysis over large data sets, or exports too large to build inside one HTTP call. This page states when a team moves such work off the request path, which protections the heavy query carries, and how Worker-built exports reach their reader safely. A team selects it for each documented query or export whose cost or duration exceeds the normal read path, so one heavy report cannot slow or expose the product's normal reads.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`.

A use case selects this extension for one documented query or export that the normal request path cannot serve: complex relational SQL, a large result, long processing, output in object storage, or a latency budget beyond a normal request. The use-case page carries the measurements that prove the normal path falls short.

## Baseline relationship

This extension replaces no baseline provision. Ordinary queries stay under `litespec/backend/persistence#query-through-the-read-session`; this extension governs only the reads whose cost or duration exceeds that path.

Selecting `report` switches on the Limit record type: the request budget and each report bound live in Limit records.

## Standards

### Record reporting need

**Statement:** A reporting proposal MUST record the report, representative data volume, plan or limitation, latency target, maximum result, and operating owner.

**Rationale:** Reporting infrastructure costs a Worker, storage, and operating attention, so the team writes down the report, a representative data volume, the plan or limitation, the latency target, the maximum result, and the operating owner before building any of it. The use-case page carries that record with its owner and status, and it shows why a normal request projection cannot meet the boundary.

### Avoid speculative reporting systems

**Statement:** A project MUST NOT create reporting infrastructure for possible future analytics.

**Rationale:** A reporting system built for analytics the product may never need charges its full operating cost from day one while serving no accepted query. Each report or export earns its infrastructure with a current cost boundary, not a guess about future analysis.

### Parameterize report SQL

**Statement:** A reporting query MUST parameterize every actor, tenant, filter, range, sort, and pagination value.

**Rationale:** A report concatenates actor, tenant, filters, ranges, sorting, and pagination into SQL that reads across the database. Binding every one of those values as a parameter keeps tenant and actor isolation intact and closes the injection hole string concatenation opens.

### Keep raw SQL in Infrastructure

**Statement:** Infrastructure MUST own raw reporting SQL and connection handling.

**Rationale:** Raw SQL names tables, dialects, and connection handling that belong to one provider. Keeping it in Infrastructure lets Application and Domain state what the report means without depending on how one database phrases it.

### Review report plans

**Statement:** A report owner MUST review query plans and indexes with representative data.

**Rationale:** A query that flies over a hundred local rows can scan millions in production. The report owner reviews query plans and indexes against representative data, so the true cost shows before the report ships rather than after it slows the database.

### Apply item-read authorization

**Statement:** A report or export MUST enforce actor, role, ownership, tenant, and sensitive-field rules that apply to item reads.

**Rationale:** A report that reads ten thousand rows at once crosses the same actor, role, ownership, tenant, and sensitive-field boundaries as ten thousand single reads. Enforcing the item-read rules on the bulk path stops the report from exposing rows its reader may not open one by one.

### Run budget-exceeding exports in Worker

**Statement:** An export exceeding its request budget MUST run through Worker, with the budget a Limit record the export's use case names.

**Rationale:** An export that outlasts its request budget holds an HTTP connection open while the reader waits and the server counts threads. Running it in a Worker returns the request immediately, and the budget in its Limit record tells the team exactly when an export outgrows the request path.

### Protect export output

**Statement:** An export worker MUST store output in approved object storage with an owner, expiry, and short-lived authorized download.

**Rationale:** An export file concentrates sensitive rows into one downloadable object that outlives the request that built it. Approved object storage with an owner, an expiry, and a short-lived authorized download gives that object controlled access and a defined end instead of a permanent public link.

### Scope export output to the tenant

**Statement:** An export MUST store its output under a tenant-scoped object-storage path.

**Rationale:** Export addresses are predictable, and a shared folder lets one tenant guess another tenant's file name. A tenant-scoped storage path puts each tenant's exports under its own prefix, so a guessed address stays inside the guesser's own data.

### Define report limits

**Statement:** A report specification MUST state each bound as a Limit record: maximum date range, rows, execution time, concurrent jobs, output size, and storage lifetime.

**Rationale:** Date range, rows, execution time, concurrent jobs, output size, and storage lifetime each cap one dimension of report cost. Limit records hold all six, so a runaway report hits a documented bound instead of an exhausted database, a full disk, or a surprise invoice.

### Support report cancellation

**Statement:** A report implementation MUST support cancellation and remove expired outputs.

**Rationale:** A reader who closes the tab leaves the report running, and an export nobody downloads still occupies storage. Cancellation stops the abandoned work, and expiry removes the abandoned file, so neither consumes resources indefinitely.

### Escape formula-leading export values

**Statement:** A CSV or spreadsheet export MUST escape formula-leading values unless a reviewed field intentionally contains a formula.

**Rationale:** A value starting with `=`, `+`, `-`, or `@` becomes a live formula when the export opens in a spreadsheet, running in the opener's application with the opener's data. Escaping those values keeps data as data, except in a reviewed field the team intentionally fills with a formula.

### Define export encoding and columns

**Statement:** An export format MUST use explicit character encoding and a stable column contract.

**Rationale:** An export without a stated encoding arrives garbled on the first machine that guesses differently, and columns that shift per release break every parser built on them. Explicit encoding with a stable column contract lets consumers parse the file without guessing either.

## Conventions

### Keep report definitions in Application

**Default:** Keep report definitions in Application under their business module.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** What a report means and who may run it are business choices. Keeping the definition in Application under its business module puts those choices beside the module's other rules instead of buried in query code.

### Keep report providers in Infrastructure

**Default:** Keep SQL, row mappings, and storage providers in Infrastructure.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** SQL text, row mappings, and storage calls change per provider while the report's meaning stays fixed. Keeping them in Infrastructure swaps the provider without touching the report's business rules.

### Separate Worker orchestration

**Default:** Keep Worker orchestration separate from report business rules.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Scheduling, chunking, and progress tracking run the report without defining it. Keeping Worker orchestration apart from the report's business rules lets either change without dragging the other along.

## Dependencies

This extension selects no report or object-storage package. Each provider the project uses needs a Decision and a manifest pin.

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

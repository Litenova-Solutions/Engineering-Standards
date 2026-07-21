# Reporting and Exports

## Intent

Reporting separates complex joins, aggregate analysis, and large exports from normal request projections when their cost or duration exceeds the baseline read path.

## Activation

**Activation scope:** `local`. Applicable specification kinds: Use case. List it in `applicableExtensions` only on those kinds.

Enable `reporting` for a documented query or export that requires complex relational SQL, large result sets, long processing, object storage, or a latency budget outside normal requests.

The extension replaces no baseline read rule for ordinary queries. Long-running exports activate Worker under `ARCH.WORKER.001`.

## Agent Summary {#agent-summary}

- Keep normal request reads in `IQuerySession`.
- Own raw SQL and provider access in Infrastructure.
- Parameterize every external value.
- Apply the same actor, tenant, and sensitive-field authorization as item reads.
- Move long exports to Worker and issue short-lived authorized downloads.
- Bound ranges, rows, execution time, storage lifetime, and cancellation.
- Test query plans with representative data.

## Standards

### Separate reporting after a real query requires it (EXT.REPORT.ADOPT.001)

Record the accepted report, representative data volume, current plan or limitation, latency target, maximum result, and operating owner. Do not create a reporting subsystem for possible future analytics.

### Keep SQL parameterized and reviewed (EXT.REPORT.SQL.001)

Infrastructure owns raw SQL and connection handling. Parameterize every actor, tenant, filter, range, sort, and pagination value. Review query plans and indexes using representative data.

### Apply the same data authorization (EXT.REPORT.AUTHZ.001)

Reports and exports enforce actor, role, ownership, tenant, and sensitive-field rules. A bulk endpoint cannot bypass checks applied to item reads.

### Move long work outside the request (EXT.REPORT.EXPORT.001)

Run work exceeding the request budget through Worker. Store output in approved object storage, record owner and expiry, and issue a short-lived authorized download.

### Bound report cost (EXT.REPORT.LIMITS.001)

Define maximum date range, rows, execution time, concurrent jobs, output size, and storage lifetime. Support cancellation and remove expired outputs.

### Protect spreadsheet output (EXT.REPORT.CONTENT.001)

Escape formula-leading values in CSV or spreadsheet exports unless the field intentionally contains a reviewed formula. Use an explicit character encoding and stable column contract.

## Conventions

Keep report definitions in Application under their business module. Keep SQL, row mappings, and storage providers in Infrastructure. Keep Worker orchestration separate from report business rules.

## Dependencies

No report or object-storage package is selected by default. Each provider requires a decision and manifest pin.

## Verification

- Test results, authorization, tenant scope, cancellation, timeout, range, rows, and output expiry.
- Review the PostgreSQL plan with recorded representative data volume.
- Test spreadsheet formula injection and encoding.
- Test Worker restart, duplicate job execution, download authorization, and cleanup.

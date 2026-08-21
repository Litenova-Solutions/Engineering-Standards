# API Compatibility

## Intent

OpenAPI freshness proves that committed artifacts match source code. It does not prove that independently deployed consumers can continue using the API.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer enables `api-compatibility` for public APIs, partner clients, mobile clients, or independently deployed consumers. Same-release internal APIs retain the baseline freshness check.

## Baseline relationship

This extension replaces no baseline rule.

## Agent Summary {#agent-summary}

- Classify every independent-consumer contract change. (EXT.COMPAT.COMPATIBILITY.001)
- Treat removals and narrowed contracts as breaking. (EXT.COMPAT.COMPATIBILITY.002)
- Diff current OpenAPI against a retained baseline. (EXT.COMPAT.DIFF.002)
- Keep operation IDs during compatible changes. (EXT.COMPAT.OPERATION.002)
- Version and support breaking contracts. (EXT.COMPAT.VERSION.001, EXT.COMPAT.VERSION.002)
- Deprecate public removals before sunset. (EXT.COMPAT.DEPRECATION.001, EXT.COMPAT.DEPRECATION.002)
- Preserve error-contract compatibility. (EXT.COMPAT.ERRORS.001, EXT.COMPAT.ERRORS.002)

## Standards

### Classify independent-consumer changes (EXT.COMPAT.COMPATIBILITY.001)

**Requirement:** An API change reviewer MUST classify each contract change that affects an independently deployed consumer.

**Rationale:** Classification determines whether consumers need a new contract version, review, or no action.

### Classify breaking contract changes (EXT.COMPAT.COMPATIBILITY.002)

**Requirement:** An API change reviewer MUST classify removal, rename, required input, narrowed value, response, status, or authentication changes as breaking.

**Rationale:** Existing consumers can depend on every removed, renamed, narrowed, or retyped contract element.

### Classify compatible additions (EXT.COMPAT.COMPATIBILITY.003)

**Requirement:** An API change reviewer MAY classify an optional field, endpoint, or query parameter as compatible when existing clients retain behavior.

**Rationale:** Optional additions do not require existing callers to send or interpret new values.

### Review exhaustive consumer changes (EXT.COMPAT.COMPATIBILITY.004)

**Requirement:** An API change reviewer MUST require consumer review for an added enum value or polymorphic subtype.

**Rationale:** Generated exhaustive clients can reject a newly valid enum value or discriminator case.

### Preserve stable error codes (EXT.COMPAT.COMPATIBILITY.005)

**Requirement:** An API change reviewer MUST classify removal or reassignment of a stable Problem Details code as breaking.

**Rationale:** A consumer can branch on a stable code even when the HTTP status remains unchanged.

### Resolve uncertain classifications safely (EXT.COMPAT.COMPATIBILITY.006)

**Requirement:** An API change reviewer MUST classify an unclear contract change as breaking and require consumer review.

**Rationale:** A conservative outcome protects consumers when a structural diff cannot prove compatibility.

### Retain release baselines (EXT.COMPAT.DIFF.001)

**Requirement:** An API owner MUST store each release OpenAPI document as a retained baseline artifact.

**Rationale:** A retained document gives later changes an immutable comparison target.

### Diff release contracts (EXT.COMPAT.DIFF.002)

**Requirement:** Continuous integration MUST compare the current OpenAPI document with the selected supported baseline.

**Rationale:** The same diff detects structural compatibility changes locally and during continuous integration.

### Reject unapproved breaking diffs (EXT.COMPAT.DIFF.003)

**Requirement:** Continuous integration MUST fail a breaking diff unless a new API version or approved consumer decision authorizes it.

**Rationale:** The failure makes a compatibility decision explicit before release.

### Assign operation IDs (EXT.COMPAT.OPERATION.001)

**Requirement:** Every operation exposed to an independent consumer MUST have a deliberate `operationId`.

**Rationale:** Generated clients and tools use the identifier as an operation-level contract name.

### Retain compatible operation IDs (EXT.COMPAT.OPERATION.002)

**Requirement:** A compatible API change MUST retain the existing `operationId`.

**Rationale:** A changed identifier can break generated client names and operation references.

### Assign versioned operation IDs (EXT.COMPAT.OPERATION.003)

**Requirement:** A new API version MAY assign a new operation ID when its operation contract changes.

**Rationale:** A new version can own a contract name without mutating the retained version.

### Version breaking contracts (EXT.COMPAT.VERSION.001)

**Requirement:** An API owner MUST use a new route or documented media-type version for a breaking contract.

**Rationale:** A version boundary lets existing and changed contracts coexist.

### Retain supported versions (EXT.COMPAT.VERSION.002)

**Requirement:** An API owner MUST keep the previous version available for its declared support window.

**Rationale:** Independently deployed consumers need the published support interval to adopt a changed contract.

### Record version retirement (EXT.COMPAT.VERSION.003)

**Requirement:** A versioning decision MUST name the consumer owner, deadline, and removal condition.

**Rationale:** Named ownership makes a future removal reviewable rather than implicit.

### Signal planned public removal (EXT.COMPAT.DEPRECATION.001)

**Requirement:** A public operation scheduled for removal MUST expose a documented deprecation signal.

**Rationale:** `Deprecation` and `Sunset` headers are examples of observable deprecation signals.

### Publish deprecation context (EXT.COMPAT.DEPRECATION.002)

**Requirement:** A public operation scheduled for removal MUST appear in the consumer `CHANGELOG.md`.

**Rationale:** The changelog gives consumers one release-note location for planned removal.

### Record deprecation conditions (EXT.COMPAT.DEPRECATION.003)

**Requirement:** A deprecation decision MUST record the sunset date and replacement operation.

**Rationale:** Consumers need a fixed end date and a named supported alternative.

### Treat errors as contracts (EXT.COMPAT.ERRORS.001)

**Requirement:** An API owner MUST treat Problem Details type, code, field-error codes, and documented statuses as versioned contract elements.

**Rationale:** Consumers can branch on error structures as well as successful response structures.

### Gate new error outcomes (EXT.COMPAT.ERRORS.002)

**Requirement:** An API owner MAY add an error outcome only when existing consumers safely handle an unknown code.

**Rationale:** Safe fallback behavior avoids consumer failure on a previously unseen outcome.

### Exercise generated consumers (EXT.COMPAT.ERRORS.003)

**Requirement:** An API owner MUST test representative generated clients against the changed OpenAPI document.

**Rationale:** Generated clients expose exhaustive handling and schema differences that a structural diff can miss.

## Conventions

### Store current OpenAPI source (EXT.COMPAT.CONVENTION.001)

**Default:** Store the current source artifact at `apps/api/openapi/{ProjectName}.json`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The path gives source generation and contract review one predictable location.

### Keep baseline references immutable (EXT.COMPAT.CONVENTION.002)

**Default:** Store each supported baseline beside its contract owner or under an immutable retained-release reference.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Immutable baseline references prevent a diff from comparing against a mutable artifact.

### Use one diff tool (EXT.COMPAT.CONVENTION.003)

**Default:** Use the same OpenAPI diff tool in local verification and continuous integration.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One classifier avoids differences between local and continuous integration outcomes.

### Keep Problem Details codes stable (EXT.COMPAT.CONVENTION.004)

**Default:** Keep Problem Details error codes stable across compatible versions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A stable code supports consumer error handling over time.

## Dependencies

The extension adds no required package. An introduced OpenAPI diff tool needs a manifest pin.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.COMPAT.COMPATIBILITY.001 | inspection | Pull request review classifies each independent-consumer API contract change. |
| EXT.COMPAT.COMPATIBILITY.002 | inspection | Review marks each removed, renamed, narrowed, retyped, or authentication change as breaking. |
| EXT.COMPAT.COMPATIBILITY.003 | inspection | Review records why each optional addition preserves existing consumer behavior. |
| EXT.COMPAT.COMPATIBILITY.004 | test, inspection | `ApiCompatibilityTests` and review cover added enum values and discriminator cases. |
| EXT.COMPAT.COMPATIBILITY.005 | static | `ApiCompatibilityTests` rejects removed or reassigned stable Problem Details codes. |
| EXT.COMPAT.COMPATIBILITY.006 | inspection | Unclear compatibility classifications record breaking treatment and consumer review. |
| EXT.COMPAT.DIFF.001 | operation | Release artifacts retain the generated OpenAPI baseline for each supported version. |
| EXT.COMPAT.DIFF.002 | test | `ApiDiffTests` asserts local and continuous integration execute the selected baseline diff command. |
| EXT.COMPAT.DIFF.003 | test, inspection | `ApiDiffTests` asserts breaking-diff failure requires a version boundary or approved consumer decision. |
| EXT.COMPAT.OPERATION.001 | static | OpenAPI validation reports a deliberate `operationId` for each independent-consumer operation. |
| EXT.COMPAT.OPERATION.002 | test | `ApiOperationTests` reports unchanged IDs for compatible operations. |
| EXT.COMPAT.OPERATION.003 | inspection | Versioned operation review records each deliberately changed operation ID. |
| EXT.COMPAT.VERSION.001 | inspection | Breaking contract review identifies its new route or media-type version. |
| EXT.COMPAT.VERSION.002 | operation | Release records show prior-version availability through the declared support window. |
| EXT.COMPAT.VERSION.003 | inspection | The versioning decision names consumer owner, deadline, and removal condition. |
| EXT.COMPAT.DEPRECATION.001 | test | `ApiDeprecationTests` assert the documented deprecation signal for planned removal. |
| EXT.COMPAT.DEPRECATION.002 | inspection | Consumer `CHANGELOG.md` names each operation scheduled for removal. |
| EXT.COMPAT.DEPRECATION.003 | inspection | The deprecation decision records the sunset date and replacement operation. |
| EXT.COMPAT.ERRORS.001 | inspection | OpenAPI and error-contract review include type, code, field codes, and statuses. |
| EXT.COMPAT.ERRORS.002 | test | `ApiErrorsTests` safely handle each added unknown error code. |
| EXT.COMPAT.ERRORS.003 | test | `ApiErrorsTests` asserts representative generated clients compile and exercise the changed contract. |
| EXT.COMPAT.CONVENTION.001 | static | `ApiTests` asserts generated OpenAPI exists at the documented source path or recorded local replacement. |
| EXT.COMPAT.CONVENTION.002 | inspection | Baseline storage review confirms immutable retained references. |
| EXT.COMPAT.CONVENTION.003 | test | `ApiTests` asserts local and continuous integration invoke the same diff tool. |
| EXT.COMPAT.CONVENTION.004 | test | `ApiTests` reports stable Problem Details error codes across compatible versions. |

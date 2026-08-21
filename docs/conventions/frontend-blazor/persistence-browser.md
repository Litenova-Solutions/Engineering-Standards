# Browser Persistence

## Intent

Browser storage is the only durable store in a client-only product. It is small, shared, and can disappear. Access runs through one adapter, keys carry versions, and shapes migrate. The user can always export what they made.

## Agent Summary {#agent-summary}

- Storage is reached only through an Infrastructure adapter. (BLAZOR.BROWSER.PERSISTENCE.001)
- Every key is a declared constant carrying product, area, and version. (BLAZOR.BROWSER.KEYS.001)
- A changed shape ships a migration that reads every released version. (BLAZOR.BROWSER.MIGRATION.001)
- A read returns a typed result covering unavailable, absent, corrupt, and present. (BLAZOR.BROWSER.READS.001)
- A growing collection declares its bound and eviction rule. (BLAZOR.BROWSER.LIMITS.001)
- Durable state exports to one file and imports from it. (BLAZOR.BROWSER.PORTABILITY.001)

## Standards

### Own storage in Infrastructure (BLAZOR.BROWSER.PERSISTENCE.001)

**Requirement:** Browser storage MUST be reached only through an Infrastructure adapter implementing an Application-declared interface.

**Rationale:** No Domain type, component, or page touches storage, so a test substitutes an in-memory implementation of the same interface.

### Version and scope every storage key (BLAZOR.BROWSER.KEYS.001)

**Requirement:** A storage key MUST use the form `{product}.{area}.v{n}` and be declared once as a constant beside its adapter.

**Rationale:** The version segment increments when the stored shape changes incompatibly. A raw string literal elsewhere in the code is a second, unversioned declaration.

**Example:** `taal.progress.v1` names its product, its area, and its shape version.

### Provide a migration for every changed shape (BLAZOR.BROWSER.MIGRATION.001)

**Requirement:** A change to a persisted shape MUST ship a migration that reads every previously released version and produces the current one.

**Rationale:** The migration runs at startup before the store reports ready. Data it cannot interpret is preserved under a quarantine key and reported, because deleting unreadable user data is not a recovery.

### Treat reads as fallible (BLAZOR.BROWSER.READS.001)

**Requirement:** A storage adapter MUST return a typed result covering unavailable, absent, corrupt, and present.

**Rationale:** Storage can be full, disabled, or partitioned by the browser. The application starts and stays usable when it is unavailable, with durable writes disabled and the user told once.

### Bound what is stored (BLAZOR.BROWSER.LIMITS.001)

**Requirement:** A specification persisting a growing collection MUST state its bound and its eviction rule.

**Rationale:** Browser quotas are small and shared across the origin, so unbounded append eventually fails a write the user cannot diagnose. Large generated assets are cached by the service worker rather than written to key storage.

### Provide export and import (BLAZOR.BROWSER.PORTABILITY.001)

**Requirement:** Durable state MUST export to one file the user can save and import from that same file.

**Rationale:** This is the only recovery path in a product with no server, so it is required rather than optional. Device-local state is excluded from the export.

## Conventions

### Select the storage mechanism per shape (BLAZOR.BROWSER.CONVENTION.001)

**Default:** Use key-value storage for small records, an indexed store for growing or multi-key collections, and the cache API for generated assets.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Serializing a large collection into a single key-value entry rewrites the whole entry on every change.

### Keep a stable serialization contract (BLAZOR.BROWSER.CONVENTION.002)

**Default:** Give persisted records explicit property names and tolerate unknown properties on read.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A newer build writing an extra field then does not break an older build still installed on another device.

### Record the classification (BLAZOR.BROWSER.CONVENTION.003)

**Default:** Store durable and device-local state under separate key prefixes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Export, clearing, and any future sync can then address each kind independently.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| BLAZOR.BROWSER.PERSISTENCE.001 | test | `ClientArchitectureTests` asserts every storage call resolves the Application interface. |
| BLAZOR.BROWSER.KEYS.001 | test | `StorageKeyTests` asserts each key is a declared constant matching the naming form. |
| BLAZOR.BROWSER.MIGRATION.001 | test | `StorageMigrationTests` reads a record written in each released version and asserts the current shape. |
| BLAZOR.BROWSER.READS.001 | test | `StorageAdapterTests` covers the unavailable, absent, corrupt, and present outcomes. |
| BLAZOR.BROWSER.LIMITS.001 | inspection | Each persisting specification names its collection bound and eviction rule. |
| BLAZOR.BROWSER.PORTABILITY.001 | test | `PortabilityTests` asserts an export reimports to identical durable state. |
| BLAZOR.BROWSER.CONVENTION.001 | inspection | Storage review matches each persisted shape to its declared mechanism. |
| BLAZOR.BROWSER.CONVENTION.002 | test | `SerializationTests` asserts a record with an unknown property still reads. |
| BLAZOR.BROWSER.CONVENTION.003 | test | `StorageKeyTests` asserts durable and device-local keys use separate prefixes. |

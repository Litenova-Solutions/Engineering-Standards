# Browser Persistence

## Intent

Browser storage is the only durable store in a client-only product. It is small, shared, and can disappear. Access runs through one adapter, keys carry versions, and shapes migrate. The user can always export what they made.

## Agent Summary {#agent-summary}

- Storage is reached only through an Infrastructure adapter. (standards/rule/blazor-browser.own-storage-in-infrastructure)
- Every key is a declared constant carrying product, area, and version. (standards/rule/blazor-browser.version-and-scope-every-storage-key)
- A changed shape ships a migration that reads every released version. (standards/rule/blazor-browser.provide-a-migration-for-every-changed-shape)
- A read returns a typed result covering unavailable, absent, corrupt, and present. (standards/rule/blazor-browser.treat-reads-as-fallible)
- A growing collection declares its bound and eviction rule. (standards/rule/blazor-browser.bound-what-is-stored)
- Durable state exports to one file and imports from it. (standards/rule/blazor-browser.provide-export-and-import)

## Standards

### Own storage in Infrastructure (standards/rule/blazor-browser.own-storage-in-infrastructure)

**Requirement:** Browser storage MUST be reached only through an Infrastructure adapter implementing an Application-declared interface.

**Rationale:** No Domain type, component, or page touches storage, so a test substitutes an in-memory implementation of the same interface.

### Version and scope every storage key (standards/rule/blazor-browser.version-and-scope-every-storage-key)

**Requirement:** A storage key MUST use the form `{product}.{area}.v{n}` and be declared once as a constant beside its adapter.

**Rationale:** The version segment increments when the stored shape changes incompatibly. A raw string literal elsewhere in the code is a second, unversioned declaration.

**Example:** `taal.progress.v1` names its product, its area, and its shape version.

### Provide a migration for every changed shape (standards/rule/blazor-browser.provide-a-migration-for-every-changed-shape)

**Requirement:** A change to a persisted shape MUST ship a migration that reads every previously released version and produces the current one.

**Rationale:** The migration runs at startup before the store reports ready. Data it cannot interpret is preserved under a quarantine key and reported, because deleting unreadable user data is not a recovery.

### Treat reads as fallible (standards/rule/blazor-browser.treat-reads-as-fallible)

**Requirement:** A storage adapter MUST return a typed result covering unavailable, absent, corrupt, and present.

**Rationale:** Storage can be full, disabled, or partitioned by the browser. The application starts and stays usable when it is unavailable, with durable writes disabled and the user told once.

### Bound what is stored (standards/rule/blazor-browser.bound-what-is-stored)

**Requirement:** A specification persisting a growing collection MUST state its bound and its eviction rule.

**Rationale:** Browser quotas are small and shared across the origin, so unbounded append eventually fails a write the user cannot diagnose. Large generated assets are cached by the service worker rather than written to key storage.

### Provide export and import (standards/rule/blazor-browser.provide-export-and-import)

**Requirement:** Durable state MUST export to one file the user can save and import from that same file.

**Rationale:** This is the only recovery path in a product with no server, so it is required rather than optional. Device-local state is excluded from the export.

The file carries its own schema version, and the import path states what it does with each one it can meet. The same version imports. An older version imports through a stated transformation. A newer version is refused, with a message naming the application version that wrote it. A partial import of an unknown shape loses data silently.

## Conventions

### Select the storage mechanism per shape (standards/rule/blazor-browser.select-the-storage-mechanism-per-shape)

**Default:** Use key-value storage for small records, an indexed store for growing or multi-key collections, and the cache API for generated assets.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Serializing a large collection into a single key-value entry rewrites the whole entry on every change.

### Keep a stable serialization contract (standards/rule/blazor-browser.keep-a-stable-serialization-contract)

**Default:** Give persisted records explicit property names and tolerate unknown properties on read.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A newer build writing an extra field then does not break an older build still installed on another device.

### Record the classification (standards/rule/blazor-browser.record-the-classification)

**Default:** Store durable and device-local state under separate key prefixes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Export, clearing, and any future sync can then address each kind independently.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/blazor-browser.own-storage-in-infrastructure | test | `ClientArchitectureTests` asserts every storage call resolves the Application interface. |
| standards/rule/blazor-browser.version-and-scope-every-storage-key | test | `StorageKeyTests` asserts each key is a declared constant matching the naming form. |
| standards/rule/blazor-browser.provide-a-migration-for-every-changed-shape | test | `StorageMigrationTests` reads a record written in each released version and asserts the current shape. |
| standards/rule/blazor-browser.treat-reads-as-fallible | test | `StorageAdapterTests` covers the unavailable, absent, corrupt, and present outcomes. |
| standards/rule/blazor-browser.bound-what-is-stored | inspection | Each persisting specification names its collection bound and eviction rule. |
| standards/rule/blazor-browser.provide-export-and-import | test | `PortabilityTests` asserts an export reimports to identical durable state. |
| standards/rule/blazor-browser.select-the-storage-mechanism-per-shape | inspection | Storage review matches each persisted shape to its declared mechanism. |
| standards/rule/blazor-browser.keep-a-stable-serialization-contract | test | `SerializationTests` asserts a record with an unknown property still reads. |
| standards/rule/blazor-browser.record-the-classification | test | `StorageKeyTests` asserts durable and device-local keys use separate prefixes. |

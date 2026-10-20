# Browser Persistence

## Intent

Browser storage is the only durable store in a client-only product. It is small, shared, and can disappear. Access runs through one adapter, keys carry versions, and shapes migrate. The user can always export what they made.

## Agent Summary {#agent-summary}

- Storage is reached only through an Infrastructure adapter. (litespec/rule/blazor-browser.own-storage-in-infrastructure)
- Every key is a declared constant carrying product, area, and version. (litespec/rule/blazor-browser.version-and-scope-every-storage-key)
- A changed shape ships a migration that reads every released version. (litespec/rule/blazor-browser.provide-a-migration-for-every-changed-shape)
- A read returns a typed result covering unavailable, absent, corrupt, and present. (litespec/rule/blazor-browser.treat-reads-as-fallible)
- A growing collection declares its bound and eviction rule. (litespec/rule/blazor-browser.bound-what-is-stored)
- Durable state exports to one versioned file and imports from it. (litespec/rule/blazor-browser.provide-export-and-import)

## Standards

### Own storage in Infrastructure (litespec/rule/blazor-browser.own-storage-in-infrastructure)

**Requirement:** Browser storage MUST be reached only through an Infrastructure adapter implementing an Application-declared interface.

**Rationale:** No Domain type, component, or page touches storage, so a test substitutes an in-memory implementation of the same interface.

### Version and scope every storage key (litespec/rule/blazor-browser.version-and-scope-every-storage-key)

**Requirement:** A storage key MUST use the form `{product}.{area}.v{n}` and be declared once as a constant beside its adapter.

**Rationale:** The version segment increments when the stored shape changes incompatibly. A raw string literal elsewhere in the code is a second, unversioned declaration.

**Example:** `shop.cart.v1` names its product, its area, and its shape version.

### Provide a migration for every changed shape (litespec/rule/blazor-browser.provide-a-migration-for-every-changed-shape)

**Requirement:** A change to a persisted shape MUST ship a migration that reads every previously released version and produces the current one.

**Rationale:** The migration runs at startup before the store finishes loading. Data it cannot interpret is preserved under a quarantine key and reported, because deleting unreadable user data is not a recovery.

### Treat reads as fallible (litespec/rule/blazor-browser.treat-reads-as-fallible)

**Requirement:** A storage adapter MUST return a typed result covering unavailable, absent, corrupt, and present.

**Rationale:** Storage can be full, disabled, or partitioned by the browser. The application starts and stays usable when it is unavailable, with durable writes disabled and the user told once.

### Bound what is stored (litespec/rule/blazor-browser.bound-what-is-stored)

**Requirement:** A specification persisting a growing collection MUST state its bound and its eviction rule.

**Rationale:** Browser quotas are small and shared across the origin, so unbounded append eventually fails a write the user cannot diagnose. Large generated assets are cached by the service worker rather than written to key storage.

### Provide export and import (litespec/rule/blazor-browser.provide-export-and-import)

**Requirement:** Durable state MUST export to one versioned file that imports the same version, transforms an older version, and refuses a newer version.

**Rationale:** The user saves the file, which is the only recovery path in a product with no server. Device-local state is excluded from the export. The file carries its own schema version. A refusal names the application version that wrote the file. A partial import of an unknown shape loses data silently.

## Conventions

### Select the storage mechanism per shape (litespec/rule/blazor-browser.select-the-storage-mechanism-per-shape)

**Default:** Use key-value storage for small records, an indexed store for growing or multi-key collections, and the cache API for generated assets.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Serializing a large collection into a single key-value entry rewrites the whole entry on every change.

### Keep a stable serialization contract (litespec/rule/blazor-browser.keep-a-stable-serialization-contract)

**Default:** Give persisted records explicit property names and tolerate unknown properties on read.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A newer build writing an extra field then does not break an older build still installed on another device.

### Record the classification (litespec/rule/blazor-browser.record-the-classification)

**Default:** Store durable and device-local state under separate key prefixes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Export, clearing, and any future sync can then address each kind independently.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/blazor-browser.own-storage-in-infrastructure | guidance | Does every storage call resolve the Application interface? |
| litespec/rule/blazor-browser.version-and-scope-every-storage-key | guidance | Is each key a declared constant carrying product, area, and version? |
| litespec/rule/blazor-browser.provide-a-migration-for-every-changed-shape | guidance | Does each changed shape ship a migration reading every released version? |
| litespec/rule/blazor-browser.treat-reads-as-fallible | guidance | Does the adapter return unavailable, absent, corrupt, and present as typed outcomes? |
| litespec/rule/blazor-browser.bound-what-is-stored | guidance | Does each persisting specification state its collection bound and eviction rule? |
| litespec/rule/blazor-browser.provide-export-and-import | guidance | Does an export reimport to identical durable state, refusing a newer version? |
| litespec/rule/blazor-browser.select-the-storage-mechanism-per-shape | guidance | Does each persisted shape use its declared mechanism? |
| litespec/rule/blazor-browser.keep-a-stable-serialization-contract | guidance | Does a record with an unknown property still read? |
| litespec/rule/blazor-browser.record-the-classification | guidance | Do durable and device-local keys use separate prefixes? |

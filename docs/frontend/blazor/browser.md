# Browser Persistence

## Intent

Browser persistence is how a product with no server of its own keeps what the user made in browser storage, which is small, shared with other data on the same origin, and can disappear when the browser clears it. This page states how to store that state: one adapter per store, versioned keys, migrations for changed shapes, typed read failures, bounds on growing collections, and export with import. A team that applies these rules when it first persists state keeps user work recoverable instead of silently lost.

## Concepts

### Storage through an adapter

A component never calls a browser storage API directly. Application declares an interface for what the product stores, Infrastructure implements it against the browser API, and tests substitute an in-memory implementation of the same interface.

### Versioned keys and migrations

Each storage key carries its product, its area, and its shape version. When a stored shape changes incompatibly, the version increments and a migration reads every released version into the current shape.

### Durable and device-local state

Durable state is what the user made: it is persisted, versioned, and exported. Device-local state is persisted but stays on the device, excluded from export. [Blazor data](data.md) states the full classification.

## Standards

### Own storage in Infrastructure

**Requirement:** Browser storage MUST be reached only through an Infrastructure adapter implementing an Application-declared interface.

**Rationale:** When storage sits behind an Application interface, a test replaces the browser with an in-memory implementation and every component keeps working. If a component or page called the browser API directly, its tests would need a browser host, and swapping the storage mechanism would touch every caller.

### Version and scope every storage key

**Requirement:** A storage key MUST use the form `{product}.{area}.v{n}` and be declared once as a constant beside its adapter.

**Rationale:** The version segment marks which shape a stored value holds, so a migration knows what it is reading. A literal key written anywhere else is a second declaration that no version bump reaches, so one part of the product reads the old shape while another writes the new one.

**Example:** `shop.cart.v1` names its product, its area, and its shape version.

### Provide a migration for every changed shape

**Requirement:** A change to a persisted shape MUST ship a migration that reads every previously released version and produces the current one.

**Rationale:** Users keep data written by installs older than the current build, and the product starts against whatever those installs left behind. Without a migration the new build either crashes on the old shape or discards it. The migration runs at startup before the store finishes loading. Data it cannot interpret waits under a quarantine key, reported but never silently deleted, because deleting unreadable user data destroys work the user cannot recreate.

### Treat reads as fallible

**Requirement:** A storage adapter MUST return a typed result covering unavailable, absent, corrupt, and present.

**Rationale:** The browser can deny, partition, or fill storage at any time, and each of those differs from nothing stored yet. A typed result forces the caller to handle each case: the application starts and stays usable when storage is unavailable, with durable writes disabled and the user told once, instead of crashing or mistaking a failure for empty state.

### Bound what is stored

**Requirement:** A specification persisting a growing collection MUST state its bound and its eviction rule.

**Rationale:** Browser quotas are small and shared across the origin, so a collection that grows without a bound eventually fails a write the user cannot diagnose. A stated bound with an eviction rule keeps the collection inside the quota, so a write never fails for lack of room. Large generated assets are cached by the service worker rather than written to key storage.

### Provide export and import

**Requirement:** Durable state MUST export to one versioned file that imports the same version, transforms an older version, and refuses a newer version.

**Rationale:** With no server, the exported file is the only copy of the user's work outside the browser that holds it. A versioned file that imports its own version, transforms older ones, and refuses newer ones keeps that copy trustworthy across installs. Device-local state is excluded from the export. The file carries its own schema version. A refusal names the application version that wrote the file. A partial import of an unknown shape would drop fields silently, so the rule refuses instead.

## Conventions

### Select the storage mechanism per shape

**Default:** Use key-value storage for small records, an indexed store for growing or multi-key collections, and the cache API for generated assets.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Each mechanism fits a different access pattern: key-value storage reads one small record, an indexed store queries a growing collection, and the cache API serves generated assets. Serializing a large collection into a single key-value entry rewrites the whole entry on every change.

### Keep a stable serialization contract

**Default:** Give persisted records explicit property names and tolerate unknown properties on read.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Explicit property names keep the stored shape readable to any build, and tolerating unknown properties lets an older install read a record a newer install wrote without crashing. Without that tolerance, one extra field breaks every install that has not updated yet.

### Record the classification

**Default:** Store durable and device-local state under separate key prefixes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Export, clearing, and any future sync each need one kind of state without the other. Separate prefixes let each operation address durable and device-local state independently, instead of filtering key by key and risking a device-local value leaking into an export.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/browser#own-storage-in-infrastructure | guidance | Does every storage call resolve the Application interface? |
| litespec/frontend/blazor/browser#version-and-scope-every-storage-key | guidance | Is each key a declared constant carrying product, area, and version? |
| litespec/frontend/blazor/browser#provide-a-migration-for-every-changed-shape | guidance | Does each changed shape ship a migration reading every released version? |
| litespec/frontend/blazor/browser#treat-reads-as-fallible | guidance | Does the adapter return unavailable, absent, corrupt, and present as typed outcomes? |
| litespec/frontend/blazor/browser#bound-what-is-stored | guidance | Does each persisting specification state its collection bound and eviction rule? |
| litespec/frontend/blazor/browser#provide-export-and-import | guidance | Does an export reimport to identical durable state, refusing a newer version? |
| litespec/frontend/blazor/browser#select-the-storage-mechanism-per-shape | guidance | Does each persisted shape use its declared mechanism? |
| litespec/frontend/blazor/browser#keep-a-stable-serialization-contract | guidance | Does a record with an unknown property still read? |
| litespec/frontend/blazor/browser#record-the-classification | guidance | Do durable and device-local keys use separate prefixes? |

# Engineering Principles

## Intent

These principles resolve choices that a narrower convention does not cover. They favor explicit intent, complete use cases, and evidence over speculative abstractions or large inventories of partially implemented code.

## Agent Summary {#agent-summary}

- Keep one authored source for each fact.
- Give each authored document an owner, status, canonical source, and verification date.
- Keep code and documentation names and behavior synchronized.
- Complete one vertical use case before starting secondary work.
- Encode structural boundaries in compiler, architecture, and test checks.
- Add complexity only when a current requirement activates it.
- Prefer business names and narrow dependencies over generic abstractions.

## Standards

### Keep one authored source for each fact (CORE.SOURCE.001)

Write each rule, package version, status, route, and acceptance criterion once. Other documents link to that source. Generated application artifacts may derive from authored sources.

Package versions belong in `standards.manifest.json`. Use-case status belongs in the use-case specification. Tests cite the acceptance IDs they prove.

### Assign document ownership and freshness (CORE.DOCUMENTS.001)

Consumer-authored product, domain, capability, use-case, architecture, API, operations, decision, page, and runbook documents MUST declare an owner, document status, last verified date, canonical source, and implementation evidence. The [repository writing convention](../conventions/repository/writing.md) defines the metadata block.

Document status is one of `current`, `planned`, `retired`, or `reference`:

- `current` is the authoritative record for the documented scope.
- `planned` describes a target that is not an implementation claim.
- `retired` preserves a record whose supported behavior or decision is no longer active.
- `reference` explains a standard or implementation without owning product or behavior facts.

A `current` document MUST NOT present planned behavior as implemented. A document with implementation claims MUST name code, test, generated-contract, or operating evidence. Use `None` when the document makes no implementation claim. Mark the document `retired` after its supported public entry points are removed.

The existing ADDD routing `status` field remains authoritative for a capability or use-case operation. Document status describes the document's authority and freshness; one field MUST NOT replace the other.

### Deliver vertical use cases (CORE.SLICE.001)

Implement the smallest complete path from domain behavior through persistence, API, optional UI, automated evidence, and operating impact.

Finish `posts.create-draft` across its required layers before creating an inventory of unfinished Post operations.

### Prove enforceable boundaries mechanically (CORE.ENFORCE.001)

Use project references, compiler visibility, architecture tests, lint rules, and behavior tests for boundaries a tool can prove. Use prose for intent and decisions that require judgment.

A project-reference test can prove Domain does not reference Infrastructure. A use-case specification explains why only the owning author may publish a post.

### Require an activation criterion for added complexity (CORE.COMPLEXITY.001)

Do not add a package, project, wrapper, background process, cache, queue, or distributed pattern without a current use case that needs it.

Enable an extension when its activation criteria apply. A preference or possible future need is not an activation criterion.

### Name intent at boundaries (CORE.NAMING.001)

Use business operation names, specific command and query mediators, and capability-specific external ports. Avoid generic bus, manager, helper, processor, and service names when a narrower name is available.

`IPostPublicationNotifier` communicates one capability. `IExternalService` does not.

## Conventions

### Prefer direct dependencies until a boundary exists

Use the selected framework type directly inside the layer that owns it. Introduce a project-owned abstraction only for an architectural boundary, provider replacement, test boundary, or stable domain concept.

### Prefer local clarity over speculative reuse

Keep operation-specific code in its operation folder. Move code to a shared location after two real consumers need the same behavior and the shared name remains precise.

## Examples

- Application query handlers use `IQuerySession` directly because Marten is part of the selected profile.
- Domain repository interfaces remain project-owned because persistence must not enter Domain.
- A two-line mapping used once stays beside its endpoint rather than becoming a generic mapper.

## Verification

- Search for generic abstractions added without a named consumer.
- Confirm every new package, project, or process has an active use case or extension.
- Confirm shared code has at least two concrete consumers.
- Confirm generated artifacts identify their authored source.

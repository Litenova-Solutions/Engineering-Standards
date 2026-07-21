# Engineering Principles

## Intent

These principles resolve choices that a narrower convention does not cover. They favor explicit intent, complete use cases, and evidence over speculative abstractions or large inventories of partially implemented code.

## Agent Summary {#agent-summary}

- Keep one authored source for each fact.
- Give each structured specification kind-specific authority, ownership, and review metadata.
- Keep code and documentation names and behavior synchronized.
- Complete one vertical use case before starting secondary work.
- Encode structural boundaries in compiler, architecture, and test checks.
- Add complexity only when a current requirement activates it.
- Prefer business names and narrow dependencies over generic abstractions.

## Standards

### Keep one authored source for each fact (CORE.SOURCE.001)

Write each rule, package version, status, route, and acceptance criterion once. Other documents link to that source. Generated application artifacts may derive from authored sources.

Package versions belong in `standards.manifest.json`. Use-case record and delivery status belong in Specification Metadata. Tests cite the acceptance IDs they prove.

### Assign document ownership and freshness (CORE.DOCUMENTS.001)

Structured consumer specifications MUST declare `kind`, `id`, `recordStatus`, `owner`, and `lastReviewed` plus fields required for that kind. The [repository writing convention](../conventions/repository/writing.md) defines the metadata block.

`recordStatus` is `draft`, `current`, or `retired`:

- `draft` is under review and is not authoritative.
- `current` is authoritative for the documented scope.
- `retired` preserves history after the contract no longer applies.

Behavior specifications also use `deliveryStatus: planned` or `deliveryStatus: verified`. A current planned record can describe an approved target without claiming implementation. A verified record MUST name code, test, generated-contract, and operating evidence in its relevant sections. Retire the record after supported public Entry Points are removed.

Do not encode record authority and delivery state in one field.

### Deliver vertical use cases (CORE.SLICE.001)

Implement the smallest complete path from domain behavior through persistence, API, optional UI, automated evidence, and operating impact.

Finish `posts.create-draft` across its required layers before creating an inventory of unfinished Post operations.

### Prove enforceable boundaries mechanically (CORE.ENFORCE.001)

Use project references, compiler visibility, architecture tests, lint rules, and behavior tests for boundaries a tool can prove. Use prose for intent and decisions that require judgment.

A project-reference test can prove Domain does not reference Infrastructure. A use-case specification explains why only the owning author may publish a post.

### Require an activation criterion for added complexity (CORE.COMPLEXITY.001)

Do not add a package, project, wrapper, background process, cache, queue, or distributed pattern without a current Use case, Workflow, or project requirement that needs it.

Enable an extension when its activation criteria apply. A preference or possible future need is not an activation criterion.

### Name intent at boundaries (CORE.NAMING.001)

Use business operation names, specific command and query mediators, and business-action-specific external ports. Avoid generic bus, manager, helper, processor, and service names when a narrower name is available.

`IPostPublicationNotifier` communicates one business action. `IExternalService` does not.

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
- Confirm every new package, project, or process has a current Use case, Workflow, project requirement, or applicable extension.
- Confirm shared code has at least two concrete consumers.
- Confirm generated artifacts identify their authored source.

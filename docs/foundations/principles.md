# Engineering Principles

## Intent

These principles resolve choices not covered by narrower conventions. They favor explicit intent, complete use cases, and evidence over speculative abstractions.

## Agent Summary {#agent-summary}

- Keep one authored source for every fact. (CORE.SOURCE.001)
- Record specification ownership and status separately. (CORE.DOCUMENTS.001, CORE.DOCUMENTS.003)
- Deliver complete vertical use cases. (CORE.SLICE.001)
- Mechanically prove enforceable boundaries. (CORE.ENFORCE.001)
- Add complexity only after an activation criterion applies. (CORE.COMPLEXITY.001)
- Name intent at public and architectural boundaries. (CORE.NAMING.001)

## Standards

### Keep one authored source (CORE.SOURCE.001)

**Requirement:** A consumer MUST author each rule, package version, status, route, and acceptance criterion in one canonical source.

**Rationale:** Other documents link to the source, and generated application artifacts can derive from it.

### Locate package versions in the manifest (CORE.SOURCE.002)

**Requirement:** A consumer MUST store package versions in `standards.manifest.json`.

**Rationale:** One manifest provides the selected profile's version authority.

### Locate specification status in metadata (CORE.SOURCE.003)

**Requirement:** A consumer MUST store use-case specification and implementation status in Specification Metadata.

**Rationale:** Structured metadata exposes status to repository tools and reviewers.

### Cite proved acceptance criteria (CORE.SOURCE.004)

**Requirement:** An automated test MUST cite every acceptance criterion that it proves.

**Rationale:** A stable criterion citation connects executable evidence to approved behavior.

### Declare specification ownership (CORE.DOCUMENTS.001)

**Requirement:** A structured consumer specification MUST declare kind, ID, authority status, owner, review date, and required kind fields.

**Rationale:** The [authoring standard](authoring-standard.md) defines the opening metadata block and schema requirements.

### Classify specification authority (CORE.DOCUMENTS.002)

**Requirement:** A specification status MUST use `draft`, `approved`, or `retired` with its declared authority meaning.

**Rationale:** Draft records are under review, approved records are authoritative, and retired records preserve prior scope.

### Separate authority from implementation (CORE.DOCUMENTS.003)

**Requirement:** A behavior specification MUST declare an implementation status in addition to its specification authority status.

**Rationale:** An approved planned target is not an implemented behavior claim. `AGENTIC.METADATA.001` and `schemas/specification-metadata.schema.json` own the permitted values for both fields.

### Retire public behavior deliberately (CORE.DOCUMENTS.004)

**Requirement:** A retired specification MUST remove supported public entry points before retirement.

**Rationale:** A retired record cannot remain the owner of a still-supported public behavior.

### Deliver complete use-case slices (CORE.SLICE.001)

**Requirement:** A consumer MUST implement each selected use case as the smallest complete path through Domain, persistence, entry points, evidence, and operating impact.

**Rationale:** A vertical slice provides usable behavior rather than an inventory of disconnected inner-layer work.

**Example:** `posts.create-draft` completes required layers before another unfinished Post operation starts.

### Prove enforceable boundaries mechanically (CORE.ENFORCE.001)

**Requirement:** A consumer MUST use project references, compiler visibility, architecture tests, lint rules, or behavior tests for enforceable boundaries.

**Rationale:** Tools prove structural constraints, while specifications explain decisions that require judgment.

**Example:** A project-reference test proves Domain has no Infrastructure reference.

### Require current complexity activation (CORE.COMPLEXITY.001)

**Requirement:** A consumer MUST add packages, projects, wrappers, background processes, caches, queues, or distributed patterns only for a current documented requirement.

**Rationale:** A current use case, Workflow, or project need supplies an activation criterion for added complexity.

### Select extensions by criteria (CORE.COMPLEXITY.002)

**Requirement:** A consumer MUST enable an extension when its activation criteria apply.

**Rationale:** Preference and possible future need do not establish an activation criterion.

### Name boundary intent (CORE.NAMING.001)

**Requirement:** A consumer MUST use business operation names, specific command and query mediators, and business-action external ports at boundaries.

**Rationale:** Specific names reveal purpose and ownership at the point where components interact.

### Avoid generic boundary names (CORE.NAMING.002)

**Requirement:** A consumer MUST NOT use generic bus, manager, helper, processor, or service names when a narrower name exists.

**Rationale:** Generic names obscure the business action and invite unrelated responsibility.

**Example:** `IPostPublicationNotifier` names an action; `IExternalService` does not.

## Conventions

### Prefer direct owned dependencies (CORE.CONVENTION.001)

**Default:** Use a selected framework type directly inside the layer that owns it until an architectural boundary exists.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A project-owned abstraction exists for provider replacement, test boundary, stable domain concept, or architecture boundary.

### Prefer local code until reuse is real (CORE.CONVENTION.002)

**Default:** Keep operation-specific code in its operation folder until two real consumers need the same precise behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Shared code requires a name and responsibility that remain accurate for both consumers.

## Reference example

This informative example demonstrates `CORE.CONVENTION.001` and `CORE.CONVENTION.002`.

- Application query handlers use `IQuerySession` because Marten is part of the selected profile.
- Domain repository interfaces remain project-owned because persistence cannot enter Domain.
- A two-line mapping used once stays beside its endpoint.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| CORE.SOURCE.001 | inspection | Review identifies one canonical authored source for each changed fact. |
| CORE.SOURCE.002 | static | Dependency review resolves each selected version from the manifest. |
| CORE.SOURCE.003 | static | Consumer validator resolves specification and implementation status from metadata. |
| CORE.SOURCE.004 | static | Test scan resolves cited acceptance criteria to owned use-case specifications. |
| CORE.DOCUMENTS.001 | static | Consumer validator validates required metadata fields for each specification kind. |
| CORE.DOCUMENTS.002 | static | Metadata validator accepts only declared authority-status values. |
| CORE.DOCUMENTS.003 | static | `node tools/validate-consumer.mjs` resolves both status fields against the metadata schema. |
| CORE.DOCUMENTS.004 | inspection | Retirement review identifies removed public entry points. |
| CORE.SLICE.001 | inspection | Use-case review links Domain, persistence, entry points, tests, and operations. |
| CORE.ENFORCE.001 | test | Architecture, lint, or behavior evidence proves each enforceable boundary. |
| CORE.COMPLEXITY.001 | inspection | Added complexity cites its current use case, Workflow, or project requirement. |
| CORE.COMPLEXITY.002 | inspection | Selected extension record cites its activation criteria. |
| CORE.NAMING.001 | inspection | Boundary review identifies specific business names. |
| CORE.NAMING.002 | static | Naming scan flags generic boundary names lacking a narrower replacement. |
| CORE.CONVENTION.001 | inspection | Dependency review identifies owned framework types or explicit abstractions. |
| CORE.CONVENTION.002 | inspection | Shared-code review records two real consumers and a precise shared name. |

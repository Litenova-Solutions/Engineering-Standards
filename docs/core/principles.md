# Engineering Principles

## Intent

These principles resolve choices not covered by narrower conventions. They favor explicit intent, complete use cases, and evidence over speculative abstractions.

## Agent Summary {#agent-summary}

- Keep one authored source for every fact. (standards/rule/core-principles.keep-one-authored-source)
- Record specification ownership and status separately. (standards/rule/core-principles.declare-specification-ownership, standards/rule/core-principles.separate-authority-from-implementation)
- Deliver complete vertical use cases. (standards/rule/core-principles.deliver-complete-use-case-slices)
- Mechanically prove enforceable boundaries. (standards/rule/core-principles.prove-enforceable-boundaries-mechanically)
- Add complexity only after an activation criterion applies. (standards/rule/core-principles.require-current-complexity-activation)
- Name intent at public and architectural boundaries. (standards/rule/core-principles.name-boundary-intent)

## Standards

### Keep one authored source (standards/rule/core-principles.keep-one-authored-source)

**Requirement:** A consumer MUST author each rule, package version, status, route, and acceptance criterion in one canonical source.

**Rationale:** Other documents link to the source, and generated application artifacts can derive from it.

### Locate package versions in the manifest (standards/rule/core-principles.locate-package-versions-in-the-manifest)

**Requirement:** A consumer MUST store package versions in `standards.manifest.json`.

**Rationale:** One manifest provides the selected profile's version authority.

### Locate specification status in metadata (standards/rule/core-principles.locate-specification-status-in-metadata)

**Requirement:** A consumer MUST store use-case specification and implementation status in Specification Metadata.

**Rationale:** Structured metadata exposes status to repository tools and reviewers.

### Cite proved acceptance criteria (standards/rule/core-principles.cite-proved-acceptance-criteria)

**Requirement:** An automated test MUST cite every acceptance criterion that it proves.

**Rationale:** A stable criterion citation connects executable evidence to approved behavior.

### Declare specification ownership (standards/rule/core-principles.declare-specification-ownership)

**Requirement:** A structured consumer specification MUST declare kind, ID, authority status, owner, review date, and required kind fields.

**Rationale:** The [authoring standard](authoring.md) defines the opening metadata block and schema requirements.

### Classify specification authority (standards/rule/core-principles.classify-specification-authority)

**Requirement:** A specification status MUST use `draft`, `approved`, or `retired` with its declared authority meaning.

**Rationale:** Draft records are under review, approved records are authoritative, and retired records preserve prior scope.

### Separate authority from implementation (standards/rule/core-principles.separate-authority-from-implementation)

**Requirement:** A behavior specification MUST declare an implementation status in addition to its specification authority status.

**Rationale:** An approved planned target is not an implemented behavior claim. `standards/rule/core-system.declare-specification-metadata` and `schemas/specification-metadata.schema.json` own the permitted values for both fields.

### Retire public behavior deliberately (standards/rule/core-principles.retire-public-behavior-deliberately)

**Requirement:** A retired specification MUST remove supported public entry points before retirement.

**Rationale:** A retired record cannot remain the owner of a still-supported public behavior.

### Deliver complete use-case slices (standards/rule/core-principles.deliver-complete-use-case-slices)

**Requirement:** A consumer MUST implement each selected use case as the smallest complete path through Domain, persistence, entry points, evidence, and operating impact.

**Rationale:** A vertical slice provides usable behavior rather than an inventory of disconnected inner-layer work.

**Example:** `posts.create-draft` completes required layers before another unfinished Post operation starts.

### Prove enforceable boundaries mechanically (standards/rule/core-principles.prove-enforceable-boundaries-mechanically)

**Requirement:** A consumer MUST use project references, compiler visibility, architecture tests, lint rules, or behavior tests for enforceable boundaries.

**Rationale:** Tools prove structural constraints, while specifications explain decisions that require judgment.

**Example:** A project-reference test proves Domain has no Infrastructure reference.

### Require current complexity activation (standards/rule/core-principles.require-current-complexity-activation)

**Requirement:** A consumer MUST add packages, projects, wrappers, background processes, caches, queues, or distributed patterns only for a current documented requirement.

**Rationale:** A current use case, Workflow, or project need supplies an activation criterion for added complexity.

### Select extensions by criteria (standards/rule/core-principles.select-extensions-by-criteria)

**Requirement:** A consumer MUST enable an extension when its activation criteria apply.

**Rationale:** Preference and possible future need do not establish an activation criterion.

### Name boundary intent (standards/rule/core-principles.name-boundary-intent)

**Requirement:** A consumer MUST use business operation names, specific command and query mediators, and business-action external ports at boundaries.

**Rationale:** Specific names reveal purpose and ownership at the point where components interact.

### Avoid generic boundary names (standards/rule/core-principles.avoid-generic-boundary-names)

**Requirement:** A consumer MUST NOT use generic bus, manager, helper, processor, or service names when a narrower name exists.

**Rationale:** Generic names obscure the business action and invite unrelated responsibility.

**Example:** `IPostPublicationNotifier` names an action; `IExternalService` does not.

## Conventions

### Prefer direct owned dependencies (standards/rule/core-principles.prefer-direct-owned-dependencies)

**Default:** Use a selected framework type directly inside the layer that owns it until an architectural boundary exists.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A project-owned abstraction exists for provider replacement, test boundary, stable domain concept, or architecture boundary.

### Prefer local code until reuse is real (standards/rule/core-principles.prefer-local-code-until-reuse-is-real)

**Default:** Keep operation-specific code in its operation folder until two real consumers need the same precise behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Shared code requires a name and responsibility that remain accurate for both consumers.

## Reference example

This informative example demonstrates `standards/rule/core-principles.prefer-direct-owned-dependencies` and `standards/rule/core-principles.prefer-local-code-until-reuse-is-real`.

- Application query handlers use `IQuerySession` because Marten is part of the selected profile.
- Domain repository interfaces remain project-owned because persistence cannot enter Domain.
- A two-line mapping used once stays beside its endpoint.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/core-principles.keep-one-authored-source | inspection | Review identifies one canonical authored source for each changed fact. |
| standards/rule/core-principles.locate-package-versions-in-the-manifest | static | `CoreSourceTests` asserts dependency review resolves each selected version from the manifest. |
| standards/rule/core-principles.locate-specification-status-in-metadata | static | `CoreSourceTests` asserts consumer validator resolves specification and implementation status from metadata. |
| standards/rule/core-principles.cite-proved-acceptance-criteria | static | `CoreSourceTests` resolves cited acceptance criteria to owned use-case specifications. |
| standards/rule/core-principles.declare-specification-ownership | static | `CoreDocumentsTests` asserts consumer validator validates required metadata fields for each specification kind. |
| standards/rule/core-principles.classify-specification-authority | static | `CoreDocumentsTests` asserts metadata validator accepts only declared authority-status values. |
| standards/rule/core-principles.separate-authority-from-implementation | static | `node tools/validate-consumer.mjs` resolves both status fields against the metadata schema. |
| standards/rule/core-principles.retire-public-behavior-deliberately | inspection | Retirement review identifies removed public entry points. |
| standards/rule/core-principles.deliver-complete-use-case-slices | inspection | Use-case review links Domain, persistence, entry points, tests, and operations. |
| standards/rule/core-principles.prove-enforceable-boundaries-mechanically | test | `CoreEnforceTests` asserts architecture, lint, or behavior evidence proves each enforceable boundary. |
| standards/rule/core-principles.require-current-complexity-activation | inspection | Added complexity cites its current use case, Workflow, or project requirement. |
| standards/rule/core-principles.select-extensions-by-criteria | inspection | Selected extension record cites its activation criteria. |
| standards/rule/core-principles.name-boundary-intent | inspection | Boundary review identifies specific business names. |
| standards/rule/core-principles.avoid-generic-boundary-names | static | `CoreNamingTests` flags generic boundary names lacking a narrower replacement. |
| standards/rule/core-principles.prefer-direct-owned-dependencies | inspection | Dependency review identifies owned framework types or explicit abstractions. |
| standards/rule/core-principles.prefer-local-code-until-reuse-is-real | inspection | Shared-code review records two real consumers and a precise shared name. |

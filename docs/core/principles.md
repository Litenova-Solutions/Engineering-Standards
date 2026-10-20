# Engineering Principles

## Intent

These principles resolve choices no narrower rule covers. They favor explicit intent, proved behavior, and evidence over speculative abstractions.

## Agent Summary {#agent-summary}

- Author each record once; derive every other appearance from the model. (litespec/core/principles#keep-one-authored-source)
- Resolve stack versions from the manifest. (litespec/core/principles#locate-package-versions-in-the-manifest)
- Carry status, owner, decider, and decide-by date in frontmatter. (litespec/core/principles#locate-record-status-in-frontmatter, litespec/core/principles#classify-record-authority)
- Approve nothing behind a draft decision; never write implementation status. (litespec/core/principles#refuse-approval-behind-a-draft-decision, litespec/core/principles#separate-authority-from-implementation)
- Prove each Case with a test that calls its use case. (litespec/core/principles#prove-cases-with-tests)
- Retire behavior by removing its entry points first. (litespec/core/principles#retire-public-behavior-deliberately)
- Prove enforceable boundaries with references, tests, or lint rules. (litespec/core/principles#prove-enforceable-boundaries-mechanically)
- Add complexity only for a current documented requirement. (litespec/core/principles#require-current-complexity-activation)
- Name business intent at boundaries; avoid generic names. (litespec/core/principles#name-boundary-intent, litespec/core/principles#avoid-generic-boundary-names)
- Use framework types directly; share code only for two real consumers. (litespec/core/principles#prefer-direct-owned-dependencies, litespec/core/principles#prefer-local-code-until-reuse-is-real)

## Standards

### Keep one authored source

**Requirement:** A consumer MUST author each record once, in its home file, and derive every other appearance from the model.

**Rationale:** A requirement lives on its product topic page. A rule lives on its home page. A use case lives on its page.

A term lives in the language record. Stack versions live in the manifest. Coverage, history, and status derive from the model and are never typed by hand.

### Locate package versions in the manifest

**Requirement:** A consumer MUST resolve the standards-selected stack versions from `litespec.manifest.json`.

**Rationale:** The manifest is the version authority for the stack the standards select. Consumer dependencies live in package manifests and lockfiles.

### Locate record status in frontmatter

**Requirement:** A consumer MUST carry each record's status, owner, decider, and decide-by date in its frontmatter.

**Rationale:** Frontmatter exposes status to tools and reviewers. Entries inherit their page's owner and status unless they set one. [docs/core/model.md](model.md) defines the common fields.

### Prove cases with tests

**Requirement:** A test MUST prove a Case only by calling its use case and asserting its Result.

**Rationale:** A passing test that never calls the use case proves nothing. A Case without a proving test is a Known gap. [docs/core/model.md](model.md) defines the proves link.

### Classify record authority

**Requirement:** A record MUST carry exactly one status of draft, approved, or retired, with a draft naming its decider and decide-by date.

**Rationale:** Draft records are under review. Approved records are authoritative. Retired records stay readable as the past.

### Refuse approval behind a draft decision

**Requirement:** A record MUST NOT be approved while a decision behind it is a draft.

**Rationale:** Approval on a draft turns an undecided choice into an authoritative record. The decision is approved first, then the records behind it.

### Separate authority from implementation

**Requirement:** A record MUST NOT write its own implementation status, since implemented and verified are computed from code and test runs.

**Rationale:** An approved planned target is not an implemented behavior claim. [docs/core/model.md](model.md) defines how the model computes both.

### Retire public behavior deliberately

**Requirement:** A retired use case MUST name no entry point in `reachedThrough`.

**Rationale:** A retired record cannot own still-supported public behavior. Removal of the route precedes retirement of the record.

### Prove enforceable boundaries mechanically

**Requirement:** A consumer MUST prove each enforceable boundary mechanically: a reference, visibility, an architecture test, a behavior test, or a lint rule.

**Rationale:** Tools prove structural constraints, while specifications explain decisions that require judgment. Enforceable boundaries are project and package references, compiler visibility, permission guards, store constraints, and lint rules.

**Example:** A project-reference test proves Domain has no Infrastructure reference.

### Require current complexity activation

**Requirement:** A consumer MUST add packages, projects, wrappers, background processes, caches, queues, or distributed patterns only for a current documented requirement.

**Rationale:** A use case, a decision, or a requirement names the activation criterion. Preference and possible future need do not establish one.

### Name boundary intent

**Requirement:** A consumer MUST use business operation names, specific command and query mediators, and business-action external ports at boundaries.

**Rationale:** Specific names reveal purpose and ownership at the point where components interact.

### Avoid generic boundary names

**Requirement:** A consumer MUST NOT use generic bus, manager, helper, processor, or service names when a narrower name exists.

**Rationale:** Generic names obscure the business action and invite unrelated responsibility.

**Example:** `IPostPublicationNotifier` names an action; `IExternalService` does not.

## Conventions

### Prefer direct owned dependencies

**Default:** Use a selected framework type directly inside the layer that owns it until an architectural boundary exists.

**Replacement:** A consumer records an Exception naming this provision, with its reason and review date.

**Rationale:** A project-owned abstraction exists for provider replacement, test boundary, stable domain concept, or architecture boundary.

### Prefer local code until reuse is real

**Default:** Keep operation-specific code in its operation folder until two real consumers need the same precise behavior.

**Replacement:** A consumer records an Exception naming this provision, with its reason and review date.

**Rationale:** Shared code requires a name and responsibility that remain accurate for both consumers.

## Reference example

This informative example demonstrates `litespec/core/principles#prefer-direct-owned-dependencies` and `litespec/core/principles#prefer-local-code-until-reuse-is-real`.

- Application query handlers use `IQuerySession` because Marten is part of the selected profile.
- Domain repository interfaces remain project-owned because persistence cannot enter Domain.
- A two-line mapping used once stays beside its endpoint.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/principles#keep-one-authored-source | guidance | Does every fact on the changed pages trace to one authored record? |
| litespec/core/principles#locate-package-versions-in-the-manifest | checkable | `litespec consumer` fails a project whose stack versions do not resolve from the manifest. |
| litespec/core/principles#locate-record-status-in-frontmatter | checkable | `litespec consumer` fails a record whose frontmatter misses a required common field. |
| litespec/core/principles#prove-cases-with-tests | guidance | Does every Case have a passing test that calls its use case and asserts its Result? |
| litespec/core/principles#classify-record-authority | checkable | `litespec consumer` fails a record with a missing or unknown status, or a draft without decider and decide-by date. |
| litespec/core/principles#refuse-approval-behind-a-draft-decision | guidance | Is every decision behind an approved record approved itself? |
| litespec/core/principles#separate-authority-from-implementation | checkable | `litespec consumer` fails a record that writes its own implementation status. |
| litespec/core/principles#retire-public-behavior-deliberately | checkable | `litespec consumer` fails a retired use case that still names an entry point. |
| litespec/core/principles#prove-enforceable-boundaries-mechanically | guidance | Does a reference, test, or lint rule prove each changed enforceable boundary? |
| litespec/core/principles#require-current-complexity-activation | guidance | Does a current use case, decision, or requirement name the added complexity? |
| litespec/core/principles#name-boundary-intent | guidance | Does every changed boundary name state its business action and owner? |
| litespec/core/principles#avoid-generic-boundary-names | guidance | Does every changed boundary name carry the narrowest accurate business name? |
| litespec/core/principles#prefer-direct-owned-dependencies | guidance | Is each new abstraction justified by a boundary, or recorded as an Exception? |
| litespec/core/principles#prefer-local-code-until-reuse-is-real | guidance | Does each new shared unit serve two real consumers under one accurate name? |

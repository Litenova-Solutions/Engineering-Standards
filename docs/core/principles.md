# Engineering Principles

## Intent

Engineering principles are the rules of thumb that settle a design choice when no narrower rule prefers one design: where each fact lives, how one record, a written statement of intent, outranks another, what proves a boundary, and when new machinery is justified. This page states those principles. Applying them keeps the same ambiguity from resolving two ways in one project.

## Concepts

### One source for each fact

Each fact lives in exactly one home: a requirement on its product topic page, a rule on its home page, a use case on its page, a term in the language record, stack versions in the manifest. Coverage, history, and status derive from the model; nobody types them by hand.

Each record carries its `status`, `owner`, `decider`, and `decideBy` date in its frontmatter, where tools and reviewers read them. Entries inherit their page's `owner` and `status` unless they set their own. The [model page](model.md) defines the common fields and the computed links.

### Authority, proof, and restraint

A record carries exactly one status: draft records are under review, approved records are authoritative, and retired records stay readable as the past. No record is approved behind a draft decision, and no record writes its own implementation status: implemented and verified come from code and test runs, as the [model page](model.md) defines. A test proves a case only by calling its use case and asserting its result.

Structural boundaries need mechanical proof: a project or package reference, compiler visibility, an architecture test, a behavior test, a permission guard, a store constraint, or a lint rule. Specifications explain the decisions that need judgment; tools prove the constraints that do not. New machinery, such as packages, projects, wrappers, background processes, caches, queues, or distributed patterns, arrives only for a current documented requirement, and boundary names state the business action they guard.

## Standards

### Keep one authored source

**Statement:** A consumer MUST author each record once in its home file and derive every other appearance from the model.

**Rationale:** Two homes for one fact become two facts with the next edit: each copy changes on its own schedule while readers guess which one rules. Deriving every other appearance from the model keeps the authored record as the single place a change lands. Coverage, history, and status computed from the model stay true without anyone typing them by hand.

### Locate package versions in the manifest

**Statement:** A consumer MUST resolve the standards-selected stack versions from `litespec.manifest.json`.

**Rationale:** The manifest is the version authority for the stack the standards select, so every consumer resolves the same tested combination. A version pinned in prose or remembered by an agent drifts from that authority with the next manifest change. Consumer dependencies still live in package manifests and lockfiles; only the standards-selected stack versions resolve from `litespec.manifest.json`.

### Locate record status in frontmatter

**Statement:** A consumer MUST carry each record's `status`, `owner`, `decider`, and `decideBy` date in its frontmatter.

**Rationale:** Status in frontmatter exposes it to tools and reviewers in one predictable place. Entries inherit their page's `owner` and `status` unless they set their own, so one header governs the whole page. Status kept in prose hides from every check and goes stale with the next edit. The [model page](model.md) defines the common fields.

### Prove cases with tests

**Statement:** A test MUST prove a case only by calling its use case and asserting its result.

**Rationale:** A passing test that never calls the use case proves nothing about the behavior it claims. Calling the use case and asserting its result ties the proof to the shipped path. A case without such a test is a known gap with an owner and an end date, not silent coverage. The [model page](model.md) defines the `proves` link.

### Classify record authority

**Statement:** A record MUST carry exactly one status of draft, approved, or retired, with a draft naming its `decider` and `decideBy` date.

**Rationale:** Exactly one status tells every reader what a record is: under review, authoritative, or past. A draft without a `decider` and `decideBy` date waits on nobody and decides nothing. Two statuses, or none, leave agents guessing whether the record governs their task.

### Refuse approval behind a draft decision

**Statement:** A record MUST NOT be approved while a decision behind it is a draft.

**Rationale:** Approval on a draft turns an undecided choice into an authoritative record that later readers trust. The records then rest on a choice nobody made. Approving the decision first keeps the chain sound: decided choice, then the records behind it.

### Separate authority from implementation

**Statement:** A record MUST NOT write its own implementation status, because implemented and verified are computed from code and test runs.

**Rationale:** An approved record states a planned target, not a claim that behavior runs. Writing implemented or verified by hand turns the plan into a false completion report with the next commit. The [model page](model.md) defines how the model computes both from code and test runs.

### Retire public behavior deliberately

**Statement:** A retired use case MUST name no entry point in `reachedThrough`.

**Rationale:** A retired record stays readable as the past and cannot own still-supported public behavior. A use case that still names an entry point in `reachedThrough` claims a route the team no longer supports. Removing the route before retiring the record keeps the retirement honest.

### Prove enforceable boundaries mechanically

**Statement:** A consumer MUST prove each enforceable boundary mechanically: a reference, visibility, an architecture test, a behavior test, or a lint rule.

**Rationale:** A boundary stated only in prose holds until the first commit that ignores it. Mechanical proof, such as a reference, a visibility rule, an architecture test, a behavior test, or a lint rule, fails the build or the check the day the boundary breaks. Specifications then explain the decisions that need judgment, while tools guard the constraints that do not. Enforceable boundaries include project and package references, compiler visibility, permission guards, store constraints, and lint rules.

**Example:** A project-reference test proves Domain has no Infrastructure reference.

### Require current complexity activation

**Statement:** A consumer MUST add packages, projects, wrappers, background processes, caches, queues, or distributed patterns only for a current documented requirement.

**Rationale:** Each package, project, wrapper, background process, cache, queue, or distributed pattern adds maintenance, failure modes, and concepts every later reader must learn. A current use case, decision, or requirement names the activation criterion that justifies that cost. Preference and possible future need never establish one, so speculative machinery never enters on a guess.

### Name boundary intent

**Statement:** A consumer MUST use business operation names, specific command and query mediators, and business-action external ports at boundaries.

**Rationale:** Boundaries are where components meet and where future readers orient themselves. Business operation names, specific command and query mediators, and business-action external ports state the purpose and owner at that meeting point. A precise name lets a newcomer place the interaction without opening either side.

### Avoid generic boundary names

**Statement:** A consumer MUST NOT use generic `bus`, `manager`, `helper`, `processor`, or `service` names when a narrower name exists.

**Rationale:** Names such as `bus`, `manager`, `helper`, `processor`, and `service` say nothing about the business action, so unrelated responsibility collects behind them with every change. The narrower name keeps each boundary to the action it names.

**Example:** `IPostPublicationNotifier` names an action; `IExternalService` does not.

## Conventions

### Prefer direct owned dependencies

**Default:** Use a selected framework type directly inside the layer that owns it until an architectural boundary exists.

**Replacement:** A consumer records an Exception naming this provision, with its reason and review date.

**Rationale:** Using a selected framework type directly keeps one concept where two would add nothing: the abstraction and what it hides. A project-owned abstraction earns its place for provider replacement, a test boundary, a stable domain concept, or an architecture boundary. Wrapping the framework everywhere else doubles the API the team maintains without isolating any real change.

### Prefer local code until reuse is real

**Default:** Keep operation-specific code in its operation folder until two real consumers need the same precise behavior.

**Replacement:** A consumer records an Exception naming this provision, with its reason and review date.

**Rationale:** Operation-specific code kept beside its operation stays easy to change with the operation. Shared code needs a name and responsibility that stay accurate for both consumers, and the first consumer rarely knows what the second needs. Waiting for two real consumers means the shared unit covers behavior both actually need.

## Reference example

This informative example demonstrates `litespec/core/principles#prefer-direct-owned-dependencies` and `litespec/core/principles#prefer-local-code-until-reuse-is-real`.

- Application query handlers use `IQuerySession` directly because Marten is part of the selected stack, so no wrapper isolates a change.
- Domain repository interfaces stay project-owned because persistence cannot enter Domain: the architecture boundary justifies the abstraction.
- A two-line mapping used once stays beside its endpoint until a second consumer needs the same behavior.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/principles#keep-one-authored-source | guidance | Does every fact on the changed pages trace to one authored record? |
| litespec/core/principles#locate-package-versions-in-the-manifest | checkable | `litespec consumer` fails a project whose stack versions do not resolve from the manifest. |
| litespec/core/principles#locate-record-status-in-frontmatter | checkable | `litespec consumer` fails a record whose frontmatter is missing a required common field. |
| litespec/core/principles#prove-cases-with-tests | guidance | Does every case have a passing test that calls its use case and asserts its result? |
| litespec/core/principles#classify-record-authority | checkable | `litespec consumer` fails a record with a missing or unknown status, or a draft without `decider` and `decideBy` date. |
| litespec/core/principles#refuse-approval-behind-a-draft-decision | guidance | Is every decision behind an approved record approved itself? |
| litespec/core/principles#separate-authority-from-implementation | checkable | `litespec consumer` fails a record that writes its own implementation status. |
| litespec/core/principles#retire-public-behavior-deliberately | checkable | `litespec consumer` fails a retired use case that still names an entry point. |
| litespec/core/principles#prove-enforceable-boundaries-mechanically | guidance | Does a reference, test, or lint rule prove each changed enforceable boundary? |
| litespec/core/principles#require-current-complexity-activation | guidance | Does a current use case, decision, or requirement name the added complexity? |
| litespec/core/principles#name-boundary-intent | guidance | Does every changed boundary name state its business action and owner? |
| litespec/core/principles#avoid-generic-boundary-names | guidance | Does every changed boundary name carry the narrowest accurate business name? |
| litespec/core/principles#prefer-direct-owned-dependencies | guidance | Is each new abstraction justified by a boundary, or recorded as an exception? |
| litespec/core/principles#prefer-local-code-until-reuse-is-real | guidance | Does each new shared unit serve two real consumers under one accurate name? |

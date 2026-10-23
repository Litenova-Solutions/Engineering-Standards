# Principles

## Intent

These principles settle a design choice when no narrower provision prefers one design: each layer is written from the layer above, commitments flow down while facts flow up, and every edge between records is declared. This page states those principles with the engineering rules that still hold: one source for each fact, mechanical proof of boundaries, restraint about new machinery, and names that state boundary intent. Apply it when two designs both satisfy the narrower pages, and read the [layers page](layers.md) for the boundaries these principles govern.

## Concepts

### Top-Down Writing

Each layer is written from the layer above it: Intent states the promises, Behavior states how the system keeps them, Implementation builds what Behavior states, and Proof shows that it holds. Code and tests point up to the record they serve, through their folder or one anchor tag. Nothing above Implementation is computed from code.

### Commitments Flow Down and Facts Flow Up

A commitment made in Intent travels down: Behavior fulfills it, Implementation builds it, and Proof checks it. A fact learned from the world, such as a provider behavior, a regulation, or an incident, enters Intent as research or a constraint, cited and dated. What a lower layer needs, and the upper layer does not say, travels up as a draft question with a decider and a date. Nothing travels up from code.

### The Spec Wins Where Intent Has Spoken

Where Intent states a promise, the record wins over the code: code that disagrees is the defect. Where Intent is silent, working code is evidence for a question, and the question carries the code behavior to a decider. Silence is a gap to ask about, not a defect to delete and not a source to transcribe quietly.

### Derivation Between Records Only

One record derives from another: generic refusals derive from access and input, and views derive from the records they list. Derivation runs between records, in one direction, from the authored source to what cites it. Code is not a source for a record.

### Intent Is Enough to Approve

A founder or product person approves Intent without opening Behavior: the ballot and each book chapter carry what the decision needs. Each ballot and chapter carries a consequences summary rendered from Behavior, marked as context and outside what the approval covers. The summary shows refusals in product words, data kept and for how long, and money effects.

### Declared Edges, Not Mechanism Bans

Every edge between use cases, reactions, jobs, notifications, integration events, and external systems is declared on the record that holds it, and an undeclared edge is the defect. The effect graph holds no cycles except through domain events with a stated end condition. An inline edge states whether it shares the caller's transaction, and atomic consistency spans no async edge. A workflow engine carries a process only through the workflow-engine extension, where each engine step maps to exactly one use case with its compensation. A project that wants stricter rules keeps them as a cited convention.

### Honest Opinion

LiteSpec favors modules, aggregates, domain events, use cases, reactions, and jobs, and it does not claim to be neutral about that choice. Other mechanisms live in extensions, which state how they compose with the core fields. A project that needs another mechanism selects the extension that holds it.

### One Source for Each Fact

Each fact lives in exactly one home: a requirement on its requirement page, a rule on its home page, a use case on its page, a term in the glossary, stack versions in the manifest. Coverage, history, and status derive from the model; nobody types them by hand. Each record carries its status in its frontmatter, where tools and reviewers read it, and each draft names its decider and decideBy date. Entries inherit their page's `owner` and `status` unless they set their own. The [model page](model.md) defines the common fields and the computed links.

### Mechanical Proof of Boundaries

A boundary stated only in prose holds until the first change that ignores it. Structural boundaries carry mechanical proof: a project or package reference, compiler visibility, an architecture test, a behavior test, a permission guard, a store constraint, or a lint rule. Specifications explain the decisions that need judgment; tools prove the constraints that do not.

### Restraint About New Machinery

Each package, project, wrapper, background process, cache, queue, or distributed pattern adds maintenance, failure modes, and concepts every later reader learns. New machinery arrives only for a current documented requirement. Preference and possible future need justify nothing.

### Naming Boundary Intent

Boundaries are where components meet and where future readers orient themselves. Boundary names state the business action they guard, so a newcomer places the interaction without opening either side. Generic names collect unrelated responsibility behind them with every change.

## Standards

### Write Each Layer from the Layer Above

**Statement:** A consumer MUST write each layer from the layer above it, from Intent down to Proof.

**Rationale:** A layer written from the layer above inherits decided promises instead of inventing its own: Behavior fulfills Intent, Implementation builds Behavior, and Proof checks Implementation. A layer written from below restates guesses as rules, and the next upper-layer change leaves two versions of one promise.

**Example:** A use case names the requirement it fulfills before its handler exists.

### Compute Nothing Above Implementation from Code

**Statement:** A consumer MUST NOT compute a record above Implementation from code.

**Rationale:** A record computed from code turns what exists into what is promised, so drift becomes the plan and review approves its own output. Records above Implementation state decided promises, and code points up to the record it serves through its folder or one anchor tag.

### Derive Records Only from Records

**Statement:** A record MUST take each derived value from another record.

**Rationale:** Derivation between records keeps one authored source behind every value: the source changes once and each derived view follows. Generic refusals derive from access and input, and each view derives from the records it lists, so readers trace every derived value to the record that states it.

### Enter Facts from the World as Research or Constraints

**Statement:** A consumer MUST enter each fact learned from the world as research or a constraint, cited and dated.

**Rationale:** A provider behavior, a regulation, or an incident is evidence from outside the project, and entering it as research or a constraint keeps the citation and the date beside the fact. A fact typed straight into Behavior or code loses its source, and later readers treat an observation as a decision.

**Example:** An agent records a shortened refund window as research, then drafts the constraint that cites it.

### Raise What a Lower Layer Needs as a Question

**Statement:** A consumer MUST raise what a lower layer needs, and the upper layer does not state, as a draft question with a decider and a date.

**Rationale:** A need that travels up as a draft question reaches the person who decides it, with a date that keeps it visible. A need filled in quietly at the lower layer becomes an undecided promise that later readers trust. A draft past its date that no rule auto-approves is reported as a known gap with its owner.

**Example:** A use case that needs a price its requirements do not state raises a draft question with the founder as decider and a decideBy date.

### Follow Intent Where It Has Spoken

**Statement:** Behavior and Implementation MUST follow Intent where Intent states the promise.

**Rationale:** Intent holds the decided promises, so Behavior that fulfills them and code that builds them keep one chain from promise to product. Where Intent states the promise, code that disagrees is the defect, and the fix changes the code.

### Treat Code Beyond Silent Intent as Evidence for a Question

**Statement:** A consumer MUST treat working code that Intent does not cover as evidence for a question, not as a defect to delete and not as a source to transcribe quietly.

**Rationale:** Silent Intent plus working code means a decision nobody recorded: deleting the code destroys behavior users rely on, and transcribing it quietly turns code into a promise nobody approved. A question carries the behavior to a decider with the code as evidence, and the decision lands in Intent first.

**Example:** A positivity guard in code that no rule states becomes a draft question citing the guard, and the code stays until the decision lands.

### Render Consequences as Context Outside Approval

**Statement:** Each ballot and each book chapter MUST carry a consequences summary rendered from Behavior, marked as context and outside the approval hash.

**Rationale:** Intent is enough to approve when the ballot shows what the decision costs: new refusals in product words, data kept and for how long, and money effects. Marking the summary as context outside the approval hash keeps Behavior detail from becoming part of what Intent approves, so Behavior can change without reopening the Intent approval.

### Declare Every Edge

**Statement:** A consumer MUST declare every edge between use cases, reactions, jobs, notifications, integration events, and external systems on the record that holds it.

**Rationale:** An edge declared on its record is checked: the builder verifies its target, its timing, and its failure handling. An undeclared edge is the defect, because it runs behavior no record names and no review saw.

**Example:** A use case that notifies a buyer declares a sends edge to the notification with its timing and failure handling.

### End Every Effect Cycle in a Domain Event

**Statement:** An effect graph MUST NOT hold a cycle except through a domain event with a stated end condition.

**Rationale:** A cycle without an end condition runs until something outside the records stops it, so no reader can state when the work finishes. Routing each cycle through a domain event with a stated end condition names the loop and its exit in the records the graph checks.

### State Transaction Sharing on Every Inline Edge

**Statement:** An inline edge MUST state whether it shares the caller's transaction.

**Rationale:** Two inline edges that look alike run in one transaction or two, and the difference decides what a failure leaves behind. Stating the sharing on the edge keeps transaction honesty where the edge is declared.

**Example:** An inline issues edge states `sharesTransaction: true`, so a failure in the issued use case rolls back the caller.

### Confine Atomic Consistency to Synchronous Edges

**Statement:** Atomic consistency MUST NOT span an async edge.

**Rationale:** An async edge crosses a commit boundary, so work past it can fail after the caller succeeded. Atomic consistency promises one shared outcome, which holds only while every edge stays synchronous.

### Map Each Engine Step to One Use Case

**Statement:** A process carried by a workflow engine MUST map each engine step to exactly one use case with its compensation.

**Rationale:** The engine carries the process while the records state it: one use case per step keeps the promise, the refusal codes, and the undo in the records the checks read. An engine step without its use case runs behavior no record names, and a step without its compensation leaves a failure with no stated undo.

**Example:** An engine step that charges a card maps to the charge use case, whose compensation voids the charge.

### Record Stricter Edge Rules as Conventions

**Statement:** A project that keeps a stricter edge rule MUST record it as a cited convention.

**Rationale:** LiteSpec checks declared edges and leaves stricter taste to each project. A stricter rule recorded as a cited convention stays visible and checkable beside the records it constrains, instead of living as habit in a few heads.

### Cover Other Mechanisms with Extensions

**Statement:** A mechanism outside modules, aggregates, domain events, use cases, reactions, and jobs MUST live in an extension.

**Rationale:** LiteSpec favors one set of mechanisms and states that choice openly instead of claiming neutrality. An extension states how its mechanism composes with the core fields, so a project that needs it selects one place that holds the whole contract.

### Keep One Authored Source

**Statement:** A consumer MUST author each record once in its home file and derive every other appearance from the model.

**Rationale:** Two homes for one fact become two facts with the next edit: each copy changes on its own schedule while readers guess which one rules. Deriving every other appearance from the model keeps the authored record as the single place a change lands. Coverage, history, and status computed from the model stay true without anyone typing them by hand.

### Locate Package Versions in the Manifest

**Statement:** A consumer MUST resolve the standards-selected stack versions from `litespec.manifest.json`.

**Rationale:** The manifest is the version authority for the stack the standards select, so every consumer resolves the same tested combination. A version pinned in prose or remembered by an agent drifts from that authority with the next manifest change. Consumer dependencies still live in package manifests and lockfiles; only the standards-selected stack versions resolve from `litespec.manifest.json`.

### Locate Record Status in Frontmatter

**Statement:** A consumer MUST carry each record's `status`, `owner`, `decider`, and `decideBy` date in its frontmatter.

**Rationale:** Status in frontmatter exposes it to tools and reviewers in one predictable place. Entries inherit their page's `owner` and `status` unless they set their own, so one header governs the whole page. Status kept in prose hides from every check and goes stale with the next edit. The [model page](model.md) defines the common fields.

### Prove Scenarios with Tests

**Statement:** A test MUST prove a scenario only by calling its use case and asserting its result.

**Rationale:** A passing test that skips the use case proves nothing about the behavior it claims. Calling the use case and asserting its result ties the proof to the shipped path. A scenario without such a test is a known gap with an owner and an end date, not silent coverage. The [model page](model.md) defines the `proves` link.

### Classify Record Authority

**Statement:** A record MUST carry exactly one status of its layer: draft, approved, or retired for Intent and governance records, and draft, reviewed, or retired for Behavior records.

**Rationale:** Exactly one status tells every reader what a record is: under review, authoritative, or past. Intent records turn approved while Behavior records turn reviewed, so each layer names its own authority without borrowing the other. A draft without a decider and decideBy date waits on nobody and decides nothing.

### Refuse Approval Behind a Draft Decision

**Statement:** A record MUST NOT be approved or reviewed while a decision behind it is a draft.

**Rationale:** Approval or review on a draft turns an undecided choice into an authoritative record that later readers trust. The records then rest on a choice nobody made. Approving the decision first keeps the chain sound: decided choice, then the records behind it.

### Separate Authority from Implementation

**Statement:** A record MUST NOT write its own implemented, verified, stale, reachable, or effective status, because the builder computes each from code and test runs.

**Rationale:** An approved or reviewed record states a planned target, not a claim that behavior runs. Writing a computed status by hand turns the plan into a completion report that the next commit falsifies. The [model page](model.md) defines how the model computes each status from code and test runs.

### Retire Public Behavior Deliberately

**Statement:** A retired use case MUST name no entry point in `reachedThrough`.

**Rationale:** A retired record stays readable as the past and owns no still-supported public behavior. A use case that still names an entry point in `reachedThrough` claims a route the team no longer supports. Removing the route before retiring the record keeps the retirement honest.

### Prove Enforceable Boundaries Mechanically

**Statement:** A consumer MUST prove each enforceable boundary mechanically: a reference, visibility, an architecture test, a behavior test, or a lint rule.

**Rationale:** A boundary stated only in prose holds until the first commit that ignores it. Mechanical proof, such as a reference, a visibility rule, an architecture test, a behavior test, or a lint rule, fails the build or the check the day the boundary breaks. Specifications then explain the decisions that need judgment, while tools guard the constraints that do not. Enforceable boundaries include project and package references, compiler visibility, permission guards, store constraints, and lint rules.

**Example:** A project-reference test proves Domain has no Infrastructure reference.

### Require Current Complexity Activation

**Statement:** A consumer MUST add packages, projects, wrappers, background processes, caches, queues, or distributed patterns only for a current documented requirement.

**Rationale:** Each package, project, wrapper, background process, cache, queue, or distributed pattern adds maintenance, failure modes, and concepts every later reader must learn. A current use case, decision, or requirement names the activation criterion that justifies that cost. Preference and possible future need justify nothing, so speculative machinery stays out.

### Name Boundary Intent

**Statement:** A consumer MUST use business operation names, specific command and query mediators, and business-action external ports at boundaries.

**Rationale:** Boundaries are where components meet and where future readers orient themselves. Business operation names, specific command and query mediators, and business-action external ports state the purpose and owner at that meeting point. A precise name lets a newcomer place the interaction without opening either side.

### Avoid Generic Boundary Names

**Statement:** A consumer MUST NOT use generic `bus`, `manager`, `helper`, `processor`, or `service` names when a narrower name exists.

**Rationale:** Names such as `bus`, `manager`, `helper`, `processor`, and `service` say nothing about the business action, so unrelated responsibility collects behind them with every change. The narrower name keeps each boundary to the action it names.

**Example:** A notifier named for post publication names its action; one named only `service` does not.

## Conventions

### Prefer Direct Owned Dependencies

**Default:** Use a selected framework type directly inside the layer that owns it until an architectural boundary exists.

**Replacement:** A consumer records a wrapping convention naming the layers that use project-owned abstractions.

**Rationale:** Using a selected framework type directly keeps one concept where two would add nothing: the abstraction and what it hides. A project-owned abstraction earns its place for provider replacement, a test boundary, a stable domain concept, or an architecture boundary. Wrapping the framework everywhere else doubles the API the team maintains without isolating any real change.

### Prefer Local Code Until Reuse Is Real

**Default:** Keep operation-specific code in its operation folder until two real consumers need the same precise behavior.

**Replacement:** A consumer records a sharing convention naming when operation code moves to shared units.

**Rationale:** Operation-specific code kept beside its operation stays easy to change with the operation. Shared code needs a name and responsibility that stay accurate for both consumers, and the first consumer rarely knows what the second needs. Waiting for two real consumers means the shared unit covers behavior both actually need.

## Reference Example

This informative example demonstrates `litespec/core/principles#prefer-direct-owned-dependencies` and `litespec/core/principles#prefer-local-code-until-reuse-is-real`.

- A query handler uses the selected stack data-access type directly, because no architectural boundary separates the handler from the stack, so no wrapper isolates a change.
- Repository interfaces stay project-owned where the architecture keeps persistence out of the domain layer: the boundary justifies the abstraction.
- A two-line mapping used once stays beside its endpoint until a second consumer needs the same behavior.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/principles#write-each-layer-from-the-layer-above | checkable | `litespec model check` reports no `record-orphaned` finding on the changed records. |
| litespec/core/principles#compute-nothing-above-implementation-from-code | guidance | Which records above Implementation restate code instead of a decided promise? Compare each new record with the code beside it. |
| litespec/core/principles#derive-records-only-from-records | guidance | Which derived values lack an authored source record? Trace each derived value to the record it cites. |
| litespec/core/principles#enter-facts-from-the-world-as-research-or-constraints | guidance | Which outside facts lack a cited and dated source? Look at the research and constraint records beside the change. |
| litespec/core/principles#raise-what-a-lower-layer-needs-as-a-question | guidance | Which lower-layer needs lack a draft question with a decider and a date? Look at the open questions beside the records that need them. |
| litespec/core/principles#follow-intent-where-it-has-spoken | guidance | Which code disagrees with a stated promise? Compare the changed code with the Intent records it serves. |
| litespec/core/principles#treat-code-beyond-silent-intent-as-evidence-for-a-question | guidance | Which working code outside Intent lacks a question carrying it? Look at the open questions beside the uncovered code. |
| litespec/core/principles#render-consequences-as-context-outside-approval | guidance | Which ballots or book chapters lack a consequences summary marked as context? Look at the rendered book beside the changed Intent records. |
| litespec/core/principles#declare-every-edge | guidance | Which edges lack a declaration on their record? Look at the effects, issues, sends, publishes, and calls fields beside the changed records. |
| litespec/core/principles#end-every-effect-cycle-in-a-domain-event | checkable | `litespec model check` reports no `effect-loop` finding on the changed records. |
| litespec/core/principles#state-transaction-sharing-on-every-inline-edge | checkable | `litespec model check` reports no `record-shape` finding on the changed inline edges. |
| litespec/core/principles#confine-atomic-consistency-to-synchronous-edges | guidance | Which atomic use cases span an async edge? Look at the consistency and effects fields beside the changed use cases. |
| litespec/core/principles#map-each-engine-step-to-one-use-case | checkable | `litespec model check` reports no `behavior-unrecorded` finding on engine steps without a use case. |
| litespec/core/principles#record-stricter-edge-rules-as-conventions | guidance | Which stricter edge rules lack a cited convention? Look at the project conventions beside the changed records. |
| litespec/core/principles#cover-other-mechanisms-with-extensions | guidance | Which mechanisms outside the favored set lack an extension? Look at the selected extensions beside the changed records. |
| litespec/core/principles#keep-one-authored-source | guidance | Each fact on the changed pages traces to one authored record, with every other appearance derived from the model. |
| litespec/core/principles#locate-package-versions-in-the-manifest | checkable | `litespec consumer` fails a project whose stack versions do not resolve from the manifest. |
| litespec/core/principles#locate-record-status-in-frontmatter | checkable | `litespec consumer` fails a record whose frontmatter is missing a required common field. |
| litespec/core/principles#prove-scenarios-with-tests | guidance | Each scenario in the model links a passing test that calls its use case and asserts its result. |
| litespec/core/principles#classify-record-authority | checkable | `litespec consumer` fails a record with a missing or unknown status, or a draft without `decider` and `decideBy` date. |
| litespec/core/principles#refuse-approval-behind-a-draft-decision | guidance | Each decision behind an approved or reviewed record shows approved status in its own record. |
| litespec/core/principles#separate-authority-from-implementation | checkable | `litespec consumer` fails a record that writes its own implemented, verified, stale, reachable, or effective status. |
| litespec/core/principles#retire-public-behavior-deliberately | checkable | `litespec consumer` fails a retired use case that still names an entry point. |
| litespec/core/principles#prove-enforceable-boundaries-mechanically | guidance | Each changed enforceable boundary names a reference, test, or lint rule that proves it. |
| litespec/core/principles#require-current-complexity-activation | guidance | Each added package, project, wrapper, process, cache, queue, or pattern cites a current use case, decision, or requirement. |
| litespec/core/principles#name-boundary-intent | guidance | Each changed boundary name states its business action and owner. |
| litespec/core/principles#avoid-generic-boundary-names | guidance | Each changed boundary name carries the narrowest accurate business name, with no bare `bus`, `manager`, `helper`, `processor`, or `service`. |
| litespec/core/principles#prefer-direct-owned-dependencies | guidance | Each new abstraction names the boundary that justifies it, or the wrapping convention that permits it. |
| litespec/core/principles#prefer-local-code-until-reuse-is-real | guidance | Each new shared unit serves two real consumers under one accurate name, or the sharing convention permits it. |

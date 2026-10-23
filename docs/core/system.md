# LiteSpec

## Intent

LiteSpec is a system for building software from approved written records: the records state the required behavior, and people and agents build, verify, and operate against them. This page states what that system is and which parts it combines, while the intent, behavior, access, layers, and model pages state the records and the rules between them. A team starting a project reads it first, so every later choice lands in one shared model joining intent to code.

## Concepts

### Company Context

Litenova Solutions authors LiteSpec and uses it as the engineering system for its own software. Another technical team can adopt the same system: the pages state the rules, and this context explains the defaults behind them.

One technical founder currently operates Litenova Solutions, so LiteSpec assumes technical contributors rather than separate departments. One person can hold product, domain, architecture, implementation, testing, release, and operations responsibilities at the same time. The system names each responsibility instead: a decision owner, an implementation owner, and an operations owner identify who answers for what, and one person can hold all three.

Agents perform a substantial part of the engineering work. An agent can inspect repositories, propose designs, edit authorized artifacts, run tools, and collect evidence. An agent never owns unresolved product policy, legal judgment, financial decisions, or risk acceptance; those stay with accountable people.

Because agents do so much execution, the system defines its technical concepts exactly. An agent tells a module from an aggregate, a journey from a reaction, and an approved record from a claim the implementation makes about itself.

### Why the System Exists

Two capable contributors can answer one request with different boundaries, names, transaction behavior, and verification. Each result can compile while the workspace loses a coherent model. The same happens with two agents, or with one agent on two different days.

The system addresses five recurring problems:

- Product intent is lost between a request and its implementation.
- An agent invents a missing rule when a record leaves a decision implicit.
- Standard technical concepts are renamed until developers no longer recognize the established pattern.
- A use case ships in one layer while persistence, public entry points, tests, or operating impact stay incomplete.
- Documentation claims behavior that code and automated evidence do not support.

The system makes the record durable and the agent replaceable: a different person, model, or tool continues from the same approved records and reaches the same required boundaries.

### Connected Layers

The name has two parts. `Lite` means a consumer adopts one bounded context, one size, and its selected stacks, and nothing more. `Spec` means approved written records and provisions define the work, and agents and people build and verify against them.

The system holds one delivery approach and one operating model:

| Layer | Meaning | Concrete Example |
|:---|:---|:---|
| LiteSpec | The complete system of standards, records, implementation, verification, operations, and release control. | The repository structure, provision IDs, templates, tests, runbooks, and release records. |
| Record-Driven Delivery | Approved records select work and define completion. | `use-case/orders.cancel-order` defines behavior before its handler, endpoint, and tests are accepted. |
| Agent-Driven Engineering | Agents perform substantial engineering execution within approved scope and report decisions that need an accountable person. | An agent loads the cancellation record, implements it, runs its checks, and reports an unknown refund policy. |

`Driven` means engineering work starts from an approved record, and completion is judged against that record. A record outlives one agent session in the workspace, which is what makes it more than a prompt.

`Agent-driven` describes who performs the execution. It never transfers business decision authority to the agent.

### What the System Combines

The system combines product intent, domain behavior, access control, operations, and project upkeep into one specification that joins intent to code. The [intent page](intent.md) states goals, problems, features, constraints, research, decisions, requirements, and journeys. The [behavior page](behavior.md) states the bounded context, the glossary, modules, aggregates, rules, events, use cases, results, scenarios, reactions, jobs, notifications, and settings. The [access page](access.md) states actors, roles, permissions, entry points, and external systems. The [layers page](layers.md) states how each layer is written from the one above it, and the [model page](model.md) states records, identifiers, links, authority, authoring order, verification, and the builder that computes how intent connects to code.

Each page owns its tables and rules, and this page cites them without copying. A reader who needs a record type, a link field, or the authority order opens the owning page.

## Standards

### Keep Decision Authority with Accountable People

**Statement:** An agent MUST stop affected work and record the question in a draft decision when an unknown fact changes behavior, money, data, access, or recovery.

**Rationale:** Agents meet open questions in the middle of a task: an unknown refund policy, an unclear access rule, a missing recovery target. When the answer changes behavior, money, data, access, or recovery, only an accountable person can give it. Stopping and recording the question in a draft decision, with a decider and a decide-by date, keeps the choice visible and owned, instead of buried in code nobody approved. Decision owners approve outcomes, terms, policies, criteria, commitments, and risk, and an agent contribution stays a proposal until one of them accepts it.

### Drive Work from Approved Records

**Statement:** An agent MUST start behavior work from the approved Intent records and the reviewed Behavior records that own the behavior.

**Rationale:** A prompt, ticket, chat message, or code comment can start work, but none of them holds the approved behavior. Starting from the owning records keeps the agent building what reviewers approved, and keeps the records as the lasting statement of what the code should do. Without this rule, each task reinterprets intent from its starting message, and the records drift from the code until nobody trusts either.

### Point Code and Tests up to Records

**Statement:** Code and tests MUST point up to the record they serve through their folder or one anchor tag.

**Rationale:** The folder or the anchor tag is the one link from Implementation to Behavior: the handler folder anchors the use case, and a reaction class carries an implements tag naming the reaction record. That link lets the checks read which record each file serves without guessing. Nothing above Implementation is computed from code, so the link points up and the records stay the authority.

**Example:** The folder holding the complete-ticket-resale handler anchors `use-case/sales.complete-ticket-resale`, and the void-code reaction class carries an implements tag naming `reaction/admission.void-code-on-resale`.

### Declare Every Edge Between Records

**Statement:** Every edge between use cases, reactions, jobs, notifications, integration events, and external systems MUST be declared in a record and checked.

**Rationale:** The declared edges form the effect graph the checks verify: an undeclared edge is the defect, not the mechanism that carries it. The graph holds no cycles except through domain events with a stated end condition. An inline edge states whether it shares the caller's transaction, and atomic consistency spans no async edge. The [behavior page](behavior.md) states the edge fields, and the [layers page](layers.md) states how Implementation is checked against them.

### Deliver One Complete Use Case

**Statement:** A use case MUST complete with behavior, persistence, entry points, evidence, and operating impact.

**Rationale:** A use case is done only when a caller can run it and operations can support it: behavior, storage, entry points, automated evidence, and operating impact together. Accepting a thinner slice leaves the missing layers for later, and later rarely itemizes what shipped half-built. Placeholder work leaves the use case unimplemented. Multi-step product outcomes belong to a journey rather than stretching one use case across several goals.

**Example:** A use case without its tests and operating records is not complete.

### Update Records with Behavior

**Statement:** An observable behavior change MUST update its use case page, implementation, tests, product records, decision, journey, and operating records together.

**Rationale:** Approved records map to current names and paths only when each behavior change carries them along. A change that moves code but leaves the use case page, the tests, or the journey behind splits the project into approved fiction and unreviewed fact. Updating the records in the same change keeps the review of behavior and the review of its description in one place.

### Keep Computed Facts in Proof

**Statement:** A fact computed from code MUST live in Proof and not in an Intent or Behavior record.

**Rationale:** Implemented, verified, stale, reachable, and the effective status are computed from code and tests, so they appear in the book and the model output only. Writing one into an Intent or Behavior record freezes a figure from commit day that the next unrelated change silently falsifies. The [model page](model.md) states what the builder computes.

**Example:** The book marks a chapter verified when every scenario passes, and stale when a scenario's semantic hash changes after its test last passed.

## Conventions

### Use This Consumer Documentation Layout

**Default:** Use the consumer documentation layout in this section, creating a directory only when its first real artifact exists.

**Replacement:** A consumer names its own documentation layout in its project documentation.

**Example:**

```text
docs/
  product/
    README.md
    brief.md
    business/
      pricing.md
    markets/
      expansion.md
    roadmap/
      milestones.md
    decisions/
      0047-guest-checkout.md
    problems/
      abandoned-carts-lose-sales.md
    features/
      guest-checkout.md
    goals/
      repeat-purchase-rate.md
    journeys/
      check-out-as-a-guest.md
    constraints/
      payment-card-rules.md
  behavior/
    README.md
    actors/
      buyer.md
    roles/
      shop-manager.md
    permissions.md
    entry-points.md
    systems/
      payment-provider.md
    rules/
      pricing-rules.md
    modules/
      README.md
      orders/
        README.md
        orders/
          README.md
          cancel-order.md
  research/
    address-lookup-providers.md
  operations/
    limits.md
    secrets.json
    log/
  runbooks/
    restore-a-backup.md
  deviations/
    temporary-direct-database-read.md
  known-gaps/
    checkout-scenarios-unproved.md
  ui/
    README.md
  glossary.json
```

`product/` holds the brief, the journeys, and the business intent: one topic page per area with its requirements, and the product decisions, goals, problems, features, and constraints behind them. `behavior/` holds the actors, roles, permissions, entry points, external systems, rules, and modules.

`operations/` holds the limits, the secret inventory, and the operations log. `runbooks/`, `deviations/`, and `known-gaps/` hold their records. `ui/` holds the first UI decision or guide. `glossary.json` holds the term records.

Create an optional directory only when its first real artifact exists. Never create empty directories or placeholder records during inception.

### Group Module Use Case Files by Aggregate

**Default:** Group module use case files under a plural kebab-case aggregate subdirectory, each holding that aggregate's page, including a module with one aggregate.

**Replacement:** A consumer names its own module file grouping in its documentation.

**Rationale:** Each aggregate needs its own directory for its page and use cases, so grouping use case files under a plural kebab-case aggregate subdirectory gives every aggregate one home, including a module with one aggregate. The subdirectory costs one repeated path segment where the names coincide, as in `modules/products/products/`. The use case identifier stays `use-case/<module>.<name>`; only the directory changes.

### Keep Operational and Security References Under Operations

**Default:** Keep operating and security reference prose under `docs/behavior/operations/`.

**Replacement:** A consumer names its own home for operating and security reference prose in its documentation.

**Rationale:** One home for operating and security reference prose means an on-call reader looks in `docs/behavior/operations/` first and finds the runbooks, limits, and inventories there. Scattering that prose across product and domain pages buries it where an incident never looks. Enforceable security and privacy rules still belong to their owning use case sections and rules, since those are what the code and tests prove.

### Use Established Technical Terms

**Default:** Use aggregate, command, query, reaction, repository, projection, outbox, idempotency, and transaction with their accepted technical meanings.

**Replacement:** A consumer names its own technical vocabulary in its documentation.

**Rationale:** Names such as aggregate, command, query, reaction, repository, projection, outbox, idempotency, and transaction carry established meanings that developers and agents already share. Replacing one with a softer synonym hides the pattern and forces every reader to guess what the new word covers. When a term is unfamiliar, explain it and give an example instead of renaming it.

### Use Ordinary Capitalization in Prose

**Default:** Write module, aggregate, use case, journey, rule, event, and decision as ordinary nouns in prose.

**Replacement:** A consumer names its own capitalization rule in its documentation.

**Rationale:** Lowercase module, aggregate, use case, journey, rule, event, and decision read as ordinary nouns, while exact record types and code types keep their declared capitalization. The contrast tells a reader whether a word names the concept or the artifact. Capitalizing both blurs that distinction on every page.

## Reference Example

This informative example demonstrates `litespec/core/system#deliver-one-complete-use-case`, `litespec/core/system#update-records-with-behavior`, `litespec/core/system#point-code-and-tests-up-to-records`, `litespec/core/system#declare-every-edge-between-records`, and `litespec/core/system#keep-computed-facts-in-proof`.

The `use-case/spending.submit-expense` use case is complete only with its behavior, persistence, entry points, tests, and operating records. A change to the receipt threshold updates the use case page, the tests, the requirement, the decision, the journey, and the operating records in the same change. The handler folder points up to the use case record, every edge the change adds is declared on its record, and the book marks the chapter verified only after the tests pass.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/system#keep-decision-authority-with-accountable-people | guidance | The draft decision pages under `docs/intent/decisions/` naming the open question, the decider, and the decide-by date. |
| litespec/core/system#drive-work-from-approved-records | guidance | The change report listing the approved Intent and reviewed Behavior records the work started from. |
| litespec/core/system#point-code-and-tests-up-to-records | checkable | `litespec model check` emits no `behavior-unrecorded` finding for code and tests that name no parent record. |
| litespec/core/system#declare-every-edge-between-records | checkable | `litespec model check` emits no `effect-undeclared` or `effect-loop` finding across use cases, reactions, jobs, notifications, and integration events. |
| litespec/core/system#deliver-one-complete-use-case | guidance | The use case page with its behavior, persistence, entry points, tests, and operating records present. |
| litespec/core/system#update-records-with-behavior | guidance | The behavior change with its use case page, tests, product records, decision, journey, and operating records changed together. |
| litespec/core/system#keep-computed-facts-in-proof | guidance | Which Intent or Behavior records restate a fact computed from code? Look at the statuses and counts the change adds, beside the book and model output. |
| litespec/core/system#use-this-consumer-documentation-layout | guidance | The `docs/` tree matching the layout, or the project documentation naming the replacement layout. |
| litespec/core/system#group-module-use-case-files-by-aggregate | guidance | Each use case file under its module directory or its aggregate subdirectory. |
| litespec/core/system#keep-operational-and-security-references-under-operations | guidance | Operating and security reference prose under `docs/behavior/operations/`, or the project documentation naming the replacement home. |
| litespec/core/system#use-established-technical-terms | guidance | Prose using aggregate, command, query, reaction, repository, projection, outbox, idempotency, and transaction with their accepted meanings. |
| litespec/core/system#use-ordinary-capitalization-in-prose | guidance | Prose writing module, aggregate, use case, journey, rule, event, and decision in lowercase outside names and identifiers. |

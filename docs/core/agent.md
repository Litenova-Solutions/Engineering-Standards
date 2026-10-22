# Agent Operating Protocol

## Intent

An agent is software that reads task context, edits files, and runs checks. This page states the operating rules for an agent working in a LiteSpec project: which records of approved intent to read before editing, which guidance wins when pages overlap, and which changes need approval before it acts. Following them keeps each run inside its authorized scope, preserves unrelated work, and ends it with a report a reviewer can check.

## Concepts

### The Project Model and the Agent Context

A consumer project describes itself with records of fixed types, and the model builder joins those records to code, screens, tests, and test runs. The [model page](model.md) states the record types and their links. An agent queries that model for the records a task touches: `litespec model query <id>` prints one record with its links in both directions, such as a use case with its rules, results, and scenarios.

The generated agent context is the rendered summary of that selection: the smallest record set that covers the request, with the links the builder computed. Reading it before editing starts the run from approved intent instead of repository guesswork.

### Extensions and Their Boundaries

An extension is a conditional standards bundle a project selects when its criterion holds. A selected project extension applies to the whole project, while a selected local extension applies only inside its own boundary, such as one frontend or one module. The [scope page](scope.md) states how a project selects extensions. Editing inside an extension's boundary without loading the extension follows baseline guidance the extension replaced.

### Guidance Precedence

Guidance overlaps by design: a project deviation narrows a shared provision, an extension replaces a baseline default, and a stack page refines its area page. The precedence order decides which one wins: the project deviation first, then the extension, then the deeper page, then the shallower page. A deeper page is one that sits further down the documentation tree, such as a stack page under its area page. The most local approved decision wins, and the broader baseline fills only the gaps it leaves.

### Side Effects That Need Approval

Some changes reach beyond an ordinary implementation edit: they alter project boundaries, move money or data, or change state outside the repository. Each such change needs the task authorizer's approval before the agent acts, because the task text alone never justifies it. The side-effect provision below lists the changes it covers.

## Standards

### Select Task Context

**Statement:** An agent MUST query the project model for the records that cover the request, and read the generated agent context, before editing.

**Rationale:** Without the query, an agent reads either too little and invents the missing rules, or half the repository and buries the task in unrelated guidance. The query returns the smallest record set that covers the request, with the links the model computed from code, screens, and test runs, so the agent starts from approved intent.

**Example:** `litespec model query use-case/orders.cancel-order` returns the use case with its rules, results, and scenarios.

### Follow the Local Pattern Before the Model Query

**Statement:** A change adding no module, aggregate, frontend, dependency, or public boundary MAY skip the model query, reading the agent context and neighboring code instead.

**Rationale:** A small edit that adds no new surface does not need the full record set: the agent context plus the neighboring file already show the approved shape. Requiring a model query for every small change would slow ordinary work without adding information. Boundary-adding changes keep the full query, because a new module, record, frontend, dependency, or public boundary needs the wider context the model selects.

**Example:** A handler change that follows the module pattern reads `AGENTS.md` and the sibling handler, then edits without querying the model.

### Load Applicable Extensions

**Statement:** An agent MUST load selected project extensions and selected applicable local extensions before editing code or prose inside the extension's boundary.

**Rationale:** An extension replaces baseline guidance inside its boundary. An agent that edits there without loading the extension follows the baseline the extension replaced, and the change contradicts the project's own selection.

**Example:** A change to the cached catalog reads the selected caching extension before touching the code its boundary covers.

### Apply Guidance Precedence

**Statement:** An agent MUST apply the project deviation, the extension, the deeper page, and the shallower page in that order.

**Rationale:** Overlapping guidance is normal: a project deviation narrows a shared provision, an extension replaces a baseline default, and a stack page refines its area page. Without a fixed order, two agents resolve the same overlap differently and the workspace drifts. The order puts the most local approved decision first, so the broader baseline fills only the gaps it leaves.

### Replace Only Declared Conventions

**Statement:** An agent MAY apply a replacement for a convention only when the project documentation records that replacement.

**Rationale:** Conventions exist to be replaced, but only through a recorded decision. An undocumented local preference that silently replaces a baseline default looks identical to a mistake, so the next agent fixes it back. The recorded convention keeps the replacement visible and reviewable.

### Stop on Unresolved Conflict

**Statement:** An agent MUST stop when applicable provisions disagree without declared precedence and quote both provision IDs and paths.

**Rationale:** When two provisions disagree and no precedence decides, any continuation invents a compromise neither provision approved. Stopping with both provision identifiers and paths hands the decision to a person with exactly the evidence the decision needs.

### Inspect Existing Work Before Editing

**Statement:** An agent MUST read `git status` before editing and preserve user changes, untracked files, and unrelated generated output.

**Rationale:** A working tree can hold the user's own uncommitted edits, untracked files, and generated output from an unrelated task. An agent that edits without looking overwrites or deletes work outside its scope. Reading `git status` first marks that work as untouchable.

### Restrict Unapproved Side Effects

**Statement:** An agent MUST NOT act without approval on packages, migrations, authentication, a public API, production data, releases, spending, or outside calls that change state.

**Rationale:** The listed changes alter project boundaries beyond an ordinary implementation edit: they move money or data, open security boundaries, or change state outside the repository. None of them can be judged from the task text alone, so the task authorizer approves each one before the agent acts.

### Make Coherent Scoped Changes

**Statement:** An agent MUST make the smallest coherent change that satisfies the authorized request.

**Rationale:** A change that stops at code and skips its records, tests, or operating evidence leaves the workspace claiming behavior nothing proves. A change that sprawls past the request drags unrelated files into review. The smallest coherent change keeps the records, code, tests, and evidence that belong together in one reviewable unit.

### Take Expected Values From the Scenario

**Statement:** An agent MUST take a test's expected values only from the scenario's Then, never from running the code.

**Rationale:** Expected values read from a passing run restate what the code already does, so the test stays green while behavior drifts. The scenario's Then states the reviewed intent, which makes the test check the behavior rather than copy it.

**Example:** A scenario whose Then names a total of `42.50` keeps `42.50` as the asserted value even when the code returns `42.51`: the mismatch fails the test instead of updating the expectation.

### Verify Refusals and Calculations Against Held-Back Examples

**Statement:** An agent MUST verify a refusal or calculation implementation against example rows held back from the agent that wrote it.

**Rationale:** An agent that sees the examples while implementing fits the code to the rows instead of the rule. Held-back rows turn the examples into an independent check: the implementing agent works from the rule and the scenario, and a later check runs the withheld rows against the result.

**Example:** The implementing agent writes a discount calculation from its rule and scenario; a later check runs the withheld example rows against the result.

## Conventions

### Read the Full Record Before Changing a Boundary

**Default:** Read the full record before generating a file, changing a public boundary, or choosing between patterns.

**Replacement:** A consumer records a boundary-reading convention naming which changes need the full record.

**Rationale:** Generating a file or changing a public boundary from a summary risks baking a paraphrase into a contract. The full record carries the exact fields, links, and wording the new surface matches. A small edit that follows an existing local pattern can rely on the generated agent context instead.

### Inspect Local Examples After Standards

**Default:** Inspect neighboring consumer files after loading applicable standards.

**Replacement:** A consumer records an inspection convention naming which neighboring files an agent reads.

**Rationale:** Standards state the required shape, while neighboring files show the names, folders, and idioms this project chose for it. An agent that skips them writes compliant but foreign-looking code that the next edit rewrites.

### Keep Agent Working Files Under Agents

**Default:** Keep agent working files under `.agents/`, with tracked `skills/` and `records/` folders and ignored `scratch/` and `delegate/` folders.

**Replacement:** A consumer records a working-files convention naming where agents keep working files.

**Rationale:** Agent work with no agreed home lands beside authored records, where it pollutes review, or vanishes with the session, where nobody can audit it. The split keeps durable work in `skills/` and `records/` and machine-local work in the ignored `scratch/` and `delegate/` folders.

**Example:**

```text
.agents/
  skills/
  records/
  delegate/
  scratch/
```

## Reference example

This informative example demonstrates `litespec/core/agent#select-task-context`, `litespec/core/agent#load-applicable-extensions`, and `litespec/core/agent#inspect-local-examples-after-standards`.

A command-handler change for `use-case/orders.cancel-order` queries the model for its use case, reads the generated agent context, and loads the selected extensions whose boundary the change touches. It then reads the neighboring handler for local names and shapes. It leaves unrelated frontend and container guidance unread.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/agent#select-task-context | guidance | The completion report names the model query that selected the cited records. |
| litespec/core/agent#follow-the-local-pattern-before-the-model-query | guidance | The change names the local pattern it followed and adds no module, aggregate, frontend, dependency, or public boundary. |
| litespec/core/agent#load-applicable-extensions | guidance | The change names each extension loaded before editing inside its boundary. |
| litespec/core/agent#apply-guidance-precedence | guidance | The design applies the project deviation, the extension, the deeper page, and the shallower page in that order. |
| litespec/core/agent#replace-only-declared-conventions | guidance | Each convention replacement resolves to a recorded local convention in the project documentation. |
| litespec/core/agent#stop-on-unresolved-conflict | guidance | The stopped work quotes the conflict with both provision IDs and paths. |
| litespec/core/agent#inspect-existing-work-before-editing | guidance | `git status` output precedes the edits, with user changes, untracked files, and unrelated generated output untouched. |
| litespec/core/agent#restrict-unapproved-side-effects | guidance | An approval covers each package, migration, authentication, public API, production data, release, spending, or state-changing outside call the change makes. |
| litespec/core/agent#make-coherent-scoped-changes | guidance | Every changed artifact traces to the authorized request. |
| litespec/core/agent#take-expected-values-from-the-scenario | guidance | Each test's expected values match the scenario's Then, with none taken from a code run. |
| litespec/core/agent#verify-refusals-and-calculations-against-held-back-examples | guidance | The check log shows refusal and calculation example rows withheld during implementation and run after. |
| litespec/core/agent#read-the-full-record-before-changing-a-boundary | guidance | Each file generation or boundary change cites the full record it matched. |
| litespec/core/agent#inspect-local-examples-after-standards | guidance | The change names the neighboring files that shaped it after the standards. |
| litespec/core/agent#keep-agent-working-files-under-agents | guidance | Every agent working file sits under `.agents/` or the path the working-files convention names. |

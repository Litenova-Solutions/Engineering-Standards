# Agent Operating Protocol

## Intent

An agent is software that reads task context, edits files, and runs checks. This page states the operating rules for an agent working in a LiteSpec project: which records of approved intent to read before editing, which guidance wins when pages overlap, and which changes need approval before it acts. Following them keeps each run inside its authorized scope, preserves unrelated work, and ends it with a report a reviewer can check.

## Concepts

### The project model and the agent context

A consumer project describes itself with records of fixed types, and the model builder joins those records to code, screens, tests, and test runs. The [model page](model.md) states the record types and their links. An agent queries that model for the records a task touches: `litespec model query <id>` prints one record with its links in both directions, such as a use case with its rules, results, and cases.

The generated agent context is the rendered summary of that selection: the smallest record set that covers the request, with the links the builder computed. An agent reads it before editing, so it starts from approved intent instead of searching the repository by guesswork.

### Extensions and their boundaries

An extension is a conditional standards bundle a project selects when its criterion holds. A selected project extension applies to the whole project, while a selected local extension applies only inside its own boundary, such as one frontend or one module. The [scope page](scope.md) states how a project selects extensions. An agent edits inside an extension's boundary only after loading that extension, because the extension replaces baseline guidance there.

### Guidance precedence

Guidance overlaps by design: a project exception narrows a shared rule, an extension replaces a baseline default, and a stack page refines its area page. The precedence order decides which one wins: the project exception first, then the extension, then the deeper page, then the shallower page. A deeper page is one that sits further down the documentation tree, such as a stack page under its area page. The most local approved decision wins, and the broader baseline fills only the gaps it leaves.

### Side effects that need approval

Some changes reach beyond an ordinary implementation edit: they alter project boundaries, move money or data, or change state outside the repository. The task authorizer approves each such change before the agent acts, because the task text alone cannot justify it. The side-effect provision below lists the changes this rule covers.

## Standards

### Select task context

**Statement:** An agent MUST query the project model for the records that cover the request, and read the generated agent context, before editing.

**Rationale:** Without the query, an agent reads either too little and invents the missing rules, or half the repository and buries the task in unrelated guidance. The query returns the smallest record set that covers the request, with the links the model computed from code, screens, and test runs, so the agent starts from approved intent.

**Example:** `litespec model query use-case/orders.cancel-order` returns the use case with its rules, results, and cases.

### Follow the local pattern before the model query

**Statement:** A change adding no module, business record, frontend, dependency, or public boundary MAY skip the model query, reading the agent context and neighboring code instead.

**Rationale:** A small edit that adds no new surface does not need the full record set: the agent context plus the neighboring file already show the approved shape. Requiring a model query for every small change would slow ordinary work without adding information. Boundary-adding changes keep the full query, because a new module, record, frontend, dependency, or public boundary needs the wider context the model selects.

**Example:** A handler change that follows the module pattern reads `AGENTS.md` and the sibling handler, then edits without querying the model.

### Load applicable extensions

**Statement:** An agent MUST load selected project extensions and selected applicable local extensions before editing code or prose inside the extension's boundary.

**Rationale:** An extension replaces baseline guidance inside its boundary. An agent that edits there without loading the extension follows the baseline the extension replaced, and the change contradicts the project's own selection.

**Example:** A change to the cached catalog reads the selected caching extension before touching the code its boundary covers.

### Apply guidance precedence

**Statement:** An agent MUST apply the project exception, the extension, the deeper page, and the shallower page in that order.

**Rationale:** Overlapping guidance is normal: a project exception narrows a shared rule, an extension replaces a baseline default, and a stack page refines its area page. Without a fixed order, two agents resolve the same overlap differently and the workspace drifts. The order puts the most local approved decision first, so the broader baseline fills only the gaps it leaves.

### Replace only declared conventions

**Statement:** An agent MAY apply a replacement for a convention only when an approved exception record declares that replacement.

**Rationale:** Conventions exist to be replaced, but only through a recorded decision. An undocumented local preference that silently replaces a baseline default looks identical to a mistake, so the next agent fixes it back. The exception record keeps the replacement visible, dated, and reviewable.

### Stop on unresolved conflict

**Statement:** An agent MUST stop when applicable requirements disagree without declared precedence and quote both provision IDs and paths.

**Rationale:** When two requirements disagree and no precedence decides, any continuation invents a compromise neither provision approved. Stopping with both provision identifiers and paths hands the decision to a person with exactly the evidence the decision needs.

### Inspect existing work before editing

**Statement:** An agent MUST read `git status` before editing and preserve user changes, untracked files, and unrelated generated output.

**Rationale:** A working tree can hold the user's own uncommitted edits, untracked files, and generated output from an unrelated task. An agent that edits without looking overwrites or deletes work outside its scope. Reading `git status` first marks that work as untouchable.

### Restrict unapproved side effects

**Statement:** An agent MUST NOT act without approval on packages, migrations, authentication, a public API, production data, releases, spending, or outside calls that change state.

**Rationale:** The listed changes alter project boundaries beyond an ordinary implementation edit: they move money or data, open security boundaries, or change state outside the repository. None of them can be judged from the task text alone, so the task authorizer approves each one before the agent acts.

### Make coherent scoped changes

**Statement:** An agent MUST make the smallest coherent change that satisfies the authorized request.

**Rationale:** A change that stops at code and skips its records, tests, or operating evidence leaves the workspace claiming behavior nothing proves. A change that sprawls past the request drags unrelated files into review. The smallest coherent change keeps the records, code, tests, and evidence that belong together in one reviewable unit.

## Conventions

### Read the full record before changing a boundary

**Default:** Read the full record before generating a file, changing a public boundary, or choosing between patterns.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Generating a file or changing a public boundary from a summary risks baking a paraphrase into a contract. The full record carries the exact fields, links, and wording the new surface matches. A small edit that follows an existing local pattern can rely on the generated agent context instead.

### Inspect local examples after standards

**Default:** Inspect neighboring consumer files after loading applicable standards.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Standards state the required shape, while neighboring files show the names, folders, and idioms this project chose for it. An agent that skips them writes compliant but foreign-looking code that the next edit rewrites.

### Keep agent working files under agents

**Default:** Keep agent working files under `.agents/`, with tracked `skills/` and `records/` folders and ignored `scratch/` and `delegate/` folders.

**Replacement:** A consumer can replace this default with an approved exception record.

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
| litespec/core/agent#select-task-context | guidance | Which model query selected the records the change cites? |
| litespec/core/agent#follow-the-local-pattern-before-the-model-query | guidance | Which local pattern did the change follow, and which surface did it avoid adding? |
| litespec/core/agent#load-applicable-extensions | guidance | Which extensions did the agent load before editing inside their boundaries? |
| litespec/core/agent#apply-guidance-precedence | guidance | In which order did the design apply the project exception, the extension, the deeper page, and the shallower page? |
| litespec/core/agent#replace-only-declared-conventions | guidance | Which approved exception record declares each convention replacement? |
| litespec/core/agent#stop-on-unresolved-conflict | guidance | Which quoted conflict stopped the work, with both provision identifiers? |
| litespec/core/agent#inspect-existing-work-before-editing | guidance | What did `git status` show, and which unrelated work stayed untouched? |
| litespec/core/agent#restrict-unapproved-side-effects | guidance | Which approval covers each listed side effect the change makes? |
| litespec/core/agent#make-coherent-scoped-changes | guidance | Which changed artifact does the authorized request fail to explain? |
| litespec/core/agent#read-the-full-record-before-changing-a-boundary | guidance | Which full record did the file generation or boundary change cite? |
| litespec/core/agent#inspect-local-examples-after-standards | guidance | Which neighboring files shaped the change after the standards? |
| litespec/core/agent#keep-agent-working-files-under-agents | guidance | Which working files sit outside `.agents/` or the declared replacement? |

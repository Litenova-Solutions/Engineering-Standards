# Agent Operating Protocol

## Intent

This protocol controls how agents select context, resolve standards, preserve user work, and report completion. Agents query the project model for the records a task needs and read the generated agent context first.

## Standards

### Select task context

**Requirement:** An agent MUST query the project model for the records that cover the request, and read the generated agent context, before editing.

**Rationale:** The query returns the smallest record set that covers the request, with the links the model computed from code, screens, and test runs.

**Example:** `litespec model query use-case/orders.cancel-order` returns the use case with its rules, results, and cases.

### Follow the local pattern before the model query

**Requirement:** A change adding no module, business record, frontend, dependency, or public boundary MAY skip the model query, reading the agent context and neighboring code instead.

**Rationale:** Boundary-adding changes keep the full query, because a new surface needs the context the model selects.

**Example:** A handler change that follows the module pattern reads `AGENTS.md` and the sibling handler, then edits without querying the model.

### Load applicable extensions

**Requirement:** An agent MUST load selected project extensions and selected applicable local extensions before editing code or prose inside the extension's boundary.

**Rationale:** A selected extension applies to the whole project; a local extension applies to its own boundary.

### Apply guidance precedence

**Requirement:** An agent MUST apply the project exception, the extension, the deeper page, and the shallower page in that order.

**Rationale:** The order resolves a more local approved replacement before a broader baseline.

### Replace only declared conventions

**Requirement:** An agent MAY apply a replacement for a convention only when an approved exception record declares that replacement.

**Rationale:** An undocumented local preference does not replace a baseline default.

### Stop on unresolved conflict

**Requirement:** An agent MUST stop when applicable requirements disagree without declared precedence and quote both provision IDs and paths.

**Rationale:** A named conflict needs a decision rather than an invented compromise.

### Inspect existing work before editing

**Requirement:** An agent MUST read `git status` before editing and preserve user changes, untracked files, and unrelated generated output.

**Rationale:** The task can share a working tree with work outside its requested scope.

### Restrict unapproved side effects

**Requirement:** An agent MUST NOT act without approval on packages, migrations, authentication, a public API, production data, releases, spending, or outside calls that change state.

**Rationale:** These changes alter project boundaries beyond an ordinary implementation edit. The task authorizer approves them.

### Make coherent scoped changes

**Requirement:** An agent MUST make the smallest coherent change that satisfies the authorized request.

**Rationale:** A coherent change includes its required records, code, tests, and operating evidence.

## Conventions

### Read the full record before changing a boundary

**Default:** Read the full record before generating a file, changing a public boundary, or choosing between patterns.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** A small edit matching an existing local pattern can use the generated agent context.

### Inspect local examples after standards

**Default:** Inspect neighboring consumer files after loading applicable standards.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Compliant local names and shapes provide the best implementation starting point.

### Keep agent working files under agents

**Default:** Keep agent working files under `.agents/`, with tracked `skills/` and `records/` folders and ignored `scratch/` and `delegate/` folders.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Generated work with no home lands beside authored records or vanishes with the session. The split keeps what survives apart from what never leaves the machine.

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

A command-handler change queries the model for its use case, reads the generated agent context, and loads the selected extensions whose boundary the change touches. It excludes unrelated frontend and container guidance.

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

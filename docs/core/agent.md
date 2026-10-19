# Agent Operating Protocol

## Intent

This protocol controls how agents select context, resolve standards, preserve user work, and report completion. Agents query the project model for the records a task needs, and read the generated agent context first.

## Agent Summary {#agent-summary}

- Query the model for the records the task needs, skipping only a change that adds no surface. (standards/rule/core-agent.select-task-context, standards/rule/core-agent.follow-the-local-pattern-before-the-model-query)
- Load selected extensions before editing inside their boundary. (standards/rule/core-agent.load-applicable-extensions)
- Apply guidance in precedence order. (standards/rule/core-agent.apply-guidance-precedence)
- Replace a convention only through a declared exception. (standards/rule/core-agent.replace-only-declared-conventions)
- Stop and quote conflicts nothing resolves. (standards/rule/core-agent.stop-on-unresolved-conflict)
- Preserve unrelated work and side-effect boundaries. (standards/rule/core-agent.inspect-existing-work-before-editing, standards/rule/core-agent.restrict-unapproved-side-effects)
- Make the smallest coherent change the request allows. (standards/rule/core-agent.make-coherent-scoped-changes)
- Read the full record before generating files or changing public boundaries. (standards/rule/core-agent.escalate-from-summary-to-full-document)
- Inspect neighboring files after loading standards. (standards/rule/core-agent.inspect-local-examples-after-standards)
- Keep agent working files under the split the project declares. (standards/rule/core-agent.keep-agent-working-files-under-agents)

## Standards

### Select task context (standards/rule/core-agent.select-task-context)

**Requirement:** An agent MUST query the project model for the records that cover the request, and read the generated agent context, before editing.

**Rationale:** The query returns the smallest record set that covers the request, with the links the model computed from code, screens, and test runs.

**Example:** `dotnet run --project tools/model/Litenova.Model -- query use-case/orders.cancel-order` returns the use case with its rules, results, and cases.

### Follow the local pattern before the model query (standards/rule/core-agent.follow-the-local-pattern-before-the-model-query)

**Requirement:** A change adding no module, business record, frontend, dependency, or public boundary MAY skip the model query, reading the agent context and neighboring code instead.

**Rationale:** Boundary-adding changes keep the full query, because a new surface needs the context the model selects.

**Example:** A handler change that follows the module pattern reads `AGENTS.md` and the sibling handler, then edits without querying the model.

### Load applicable extensions (standards/rule/core-agent.load-applicable-extensions)

**Requirement:** An agent MUST load selected project extensions and selected applicable local extensions before editing code or prose inside the extension's boundary.

**Rationale:** A selected extension applies to the whole project; a local extension applies to its own boundary.

### Apply guidance precedence (standards/rule/core-agent.apply-guidance-precedence)

**Requirement:** An agent MUST apply approved exceptions, applicable extensions, selected profile standards and conventions, and core standards in that order.

**Rationale:** The order resolves a more local approved replacement before a broader baseline.

### Replace only declared conventions (standards/rule/core-agent.replace-only-declared-conventions)

**Requirement:** An agent MAY apply a replacement for a convention only when an approved exception record declares that replacement.

**Rationale:** An undocumented local preference does not replace a baseline default.

### Stop on unresolved conflict (standards/rule/core-agent.stop-on-unresolved-conflict)

**Requirement:** An agent MUST stop when applicable requirements disagree without declared precedence and quote both provision IDs and paths.

**Rationale:** A named conflict needs a decision rather than an invented compromise.

### Inspect existing work before editing (standards/rule/core-agent.inspect-existing-work-before-editing)

**Requirement:** An agent MUST read `git status` before editing and preserve user changes, untracked files, and unrelated generated output.

**Rationale:** The task can share a working tree with work outside its requested scope.

### Restrict unapproved side effects (standards/rule/core-agent.restrict-unapproved-side-effects)

**Requirement:** An agent MUST NOT act without approval on packages, migrations, authentication, a public API, production data, releases, spending, or outside calls that change state.

**Rationale:** These changes alter project boundaries beyond an ordinary implementation edit. The task authorizer gives the approval.

### Make coherent scoped changes (standards/rule/core-agent.make-coherent-scoped-changes)

**Requirement:** An agent MUST make the smallest coherent change that satisfies the authorized request.

**Rationale:** A coherent change includes its required records, code, tests, and operating evidence.

## Conventions

### Escalate from summary to full document (standards/rule/core-agent.escalate-from-summary-to-full-document)

**Default:** Read the full record before generating a file, changing a public boundary, or choosing between patterns.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** A small edit matching an existing local pattern can remain at the generated agent context.

### Inspect local examples after standards (standards/rule/core-agent.inspect-local-examples-after-standards)

**Default:** Inspect neighboring consumer files after loading applicable standards.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Compliant local names and shapes provide the best implementation starting point.

### Keep agent working files under agents (standards/rule/core-agent.keep-agent-working-files-under-agents)

**Default:** Keep agent working files under `.agents/`, with tracked `skills/` and `records/` folders and ignored scratch and delegate folders.

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

This informative example demonstrates `standards/rule/core-agent.select-task-context`, `standards/rule/core-agent.load-applicable-extensions`, and `standards/rule/core-agent.inspect-local-examples-after-standards`.

A command-handler change queries the model for its use case, reads the generated agent context, and loads the selected extensions whose boundary the change touches. It excludes unrelated frontend and container guidance.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/core-agent.select-task-context | guidance | Which model query selected the records the change cites? |
| standards/rule/core-agent.follow-the-local-pattern-before-the-model-query | guidance | Which local pattern did the change follow, and which surface did it avoid adding? |
| standards/rule/core-agent.load-applicable-extensions | guidance | Which extensions did the agent load before editing inside their boundary? |
| standards/rule/core-agent.apply-guidance-precedence | guidance | In which order did the design apply exceptions, extensions, profile, and core standards? |
| standards/rule/core-agent.replace-only-declared-conventions | guidance | Which approved exception record declares each convention replacement? |
| standards/rule/core-agent.stop-on-unresolved-conflict | guidance | Which quoted conflict stopped the work, with both provision identifiers? |
| standards/rule/core-agent.inspect-existing-work-before-editing | guidance | What did `git status` show, and which unrelated work stayed untouched? |
| standards/rule/core-agent.restrict-unapproved-side-effects | guidance | Which approval covers each listed side effect the change makes? |
| standards/rule/core-agent.make-coherent-scoped-changes | guidance | Which changed artifact does the authorized request fail to explain? |
| standards/rule/core-agent.escalate-from-summary-to-full-document | guidance | Which full record did the file generation or boundary change cite? |
| standards/rule/core-agent.inspect-local-examples-after-standards | guidance | Which neighboring files shaped the change after the standards? |
| standards/rule/core-agent.keep-agent-working-files-under-agents | guidance | Which working files sit outside `.agents/` or the declared replacement? |

# Agent Operating Protocol

## Intent

This protocol controls how agents select context, resolve standards, preserve user work, and report completion. It keeps detailed conventions available without loading every document.

## Agent Summary {#agent-summary}

- Select the narrowest applicable task context. (standards/rule/core-agent.select-task-context, standards/rule/core-agent.load-context-by-tier)
- Read active use cases before behavior changes. (standards/rule/core-agent.load-applicable-extensions)
- Apply declared guidance precedence. (standards/rule/core-agent.apply-guidance-precedence)
- Stop and quote unresolved conflicts. (standards/rule/core-agent.stop-on-unresolved-conflict)
- Preserve unrelated work and side-effect boundaries. (standards/rule/core-agent.inspect-existing-work-before-editing, standards/rule/core-agent.restrict-unapproved-side-effects)
- Update behavior records with implementation. (standards/rule/core-agent.update-behavior-records-with-code)
- Report exact verification evidence. (standards/rule/core-agent.run-and-report-verification)

## Standards

### Select task context (standards/rule/core-agent.select-task-context)

**Requirement:** An agent MUST select the active task from `loadPlans` in `standards.manifest.json` before editing.

**Rationale:** The selected task identifies the smallest standards context that covers the request.

### Load context by tier (standards/rule/core-agent.load-context-by-tier)

**Requirement:** An agent MUST load Tier 0, then Tier 1, and Tier 2 when the selected task requires full guidance.

**Rationale:** Tier 0 carries repository instructions, Tier 1 carries summaries, and Tier 2 carries full topic documents.

### Load applicable extensions (standards/rule/core-agent.load-applicable-extensions)

**Requirement:** An agent MUST load selected project extensions and selected applicable local extensions before their boundaries affect work.

**Rationale:** The implementation projects extensions apply when selected; local extensions also require the active specification kind.

### Read active behavior specifications (standards/rule/core-agent.read-active-behavior-specifications)

**Requirement:** An agent MUST read the active use-case specification before changing observable application behavior.

**Rationale:** The specification defines accepted behavior, risks, rules, and verification context.

### Apply guidance precedence (standards/rule/core-agent.apply-guidance-precedence)

**Requirement:** An agent MUST apply consumer overrides, applicable extensions, selected profile conventions, and core standards in that order.

**Rationale:** The order resolves a more local approved replacement before a broader baseline.

### Replace only declared conventions (standards/rule/core-agent.replace-only-declared-conventions)

**Requirement:** An agent MAY apply a local convention replacement only when consumer documentation states that replacement directly.

**Rationale:** An undocumented local preference does not replace a baseline default.

### Stop on unresolved conflict (standards/rule/core-agent.stop-on-unresolved-conflict)

**Requirement:** An agent MUST stop when applicable requirements disagree without declared precedence and quote both provision IDs and paths.

**Rationale:** A named conflict needs a decision rather than an invented compromise.

### Inspect existing work before editing (standards/rule/core-agent.inspect-existing-work-before-editing)

**Requirement:** An agent MUST read `git status` before editing and preserve user changes, untracked files, and unrelated generated output.

**Rationale:** The task can share a working tree with work outside its requested scope.

### Restrict unapproved side effects (standards/rule/core-agent.restrict-unapproved-side-effects)

**Requirement:** An agent MUST NOT add packages, migrations, authentication changes, public API breaks, or external side effects without authorization.

**Rationale:** These changes alter project boundaries beyond an ordinary implementation edit.

### Make coherent scoped changes (standards/rule/core-agent.make-coherent-scoped-changes)

**Requirement:** An agent MUST make the smallest coherent change that satisfies the authorized request.

**Rationale:** A coherent change includes its required specification, code, test, and operating evidence.

### Update behavior records with code (standards/rule/core-agent.update-behavior-records-with-code)

**Requirement:** An agent MUST update affected product, domain, page, decision, API, test, and generated artifacts with observable behavior changes.

**Rationale:** One behavior change needs current records at every affected boundary.

### Run and report verification (standards/rule/core-agent.run-and-report-verification)

**Requirement:** An agent MUST run applicable checks, inspect generated differences, compare results with the active use case, and report exact evidence.

**Rationale:** A narrow passing test does not establish repository-wide completion.

## Conventions

### Select one task label (standards/rule/core-agent.select-one-task-label)

**Default:** Select the narrowest manifest task that covers the edit.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A second task loads only when the edit crosses its boundary.

### Escalate from summary to full document (standards/rule/core-agent.escalate-from-summary-to-full-document)

**Default:** Read Tier 2 before generating a file, changing a public boundary, or choosing between patterns.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A small edit matching an existing local pattern can remain at Tier 1.

### Inspect local examples after standards (standards/rule/core-agent.inspect-local-examples-after-standards)

**Default:** Inspect neighboring consumer files after loading applicable standards.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Compliant local names and shapes provide the best implementation starting point.

## Reference example

This informative example demonstrates `standards/rule/core-agent.select-task-context`, `standards/rule/core-agent.read-active-behavior-specifications`, and `standards/rule/core-agent.load-applicable-extensions`.

A Command-handler change selects `backend.application`, reads its active use case, and loads selected applicable extensions. It excludes unrelated frontend and container guidance.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/core-agent.select-task-context | inspection | Change review identifies the selected manifest task before editing. |
| standards/rule/core-agent.load-context-by-tier | inspection | Agent report lists required Tier 0, Tier 1, and Tier 2 documents. |
| standards/rule/core-agent.load-applicable-extensions | inspection | Agent report lists selected project and applicable local extensions. |
| standards/rule/core-agent.read-active-behavior-specifications | inspection | Behavior-change report cites the active use-case specification. |
| standards/rule/core-agent.apply-guidance-precedence | inspection | Design review applies sources in declared precedence order. |
| standards/rule/core-agent.replace-only-declared-conventions | inspection | Consumer documentation records each local convention replacement. |
| standards/rule/core-agent.stop-on-unresolved-conflict | inspection | Unresolved conflict report quotes both provision IDs and paths. |
| standards/rule/core-agent.inspect-existing-work-before-editing | inspection | Change report records initial status and preserved unrelated work. |
| standards/rule/core-agent.restrict-unapproved-side-effects | inspection | Review identifies authorization for each listed boundary-changing side effect. |
| standards/rule/core-agent.make-coherent-scoped-changes | inspection | Diff review connects each changed artifact to the authorized request. |
| standards/rule/core-agent.update-behavior-records-with-code | inspection | Behavior review links changed implementation to affected current records. |
| standards/rule/core-agent.run-and-report-verification | inspection | Completion report lists commands, outcomes, evidence scope, and skipped checks. |
| standards/rule/core-agent.select-one-task-label | inspection | Agent report selects one narrowest task or names an additional crossed boundary. |
| standards/rule/core-agent.escalate-from-summary-to-full-document | inspection | File-generation and public-boundary reports cite loaded Tier 2 guidance. |
| standards/rule/core-agent.inspect-local-examples-after-standards | inspection | Change review identifies neighboring compliant consumer patterns. |

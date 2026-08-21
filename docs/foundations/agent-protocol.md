# Agent Operating Protocol

## Intent

This protocol controls how agents select context, resolve standards, preserve user work, and report completion. It keeps detailed conventions available without loading every document.

## Agent Summary {#agent-summary}

- Select the narrowest applicable task context. (CORE.AGENT.LOAD.001, CORE.AGENT.LOAD.002)
- Read active use cases before behavior changes. (CORE.AGENT.LOAD.003)
- Apply declared guidance precedence. (CORE.AGENT.PRECEDENCE.001)
- Stop and quote unresolved conflicts. (CORE.AGENT.CONFLICT.001)
- Preserve unrelated work and side-effect boundaries. (CORE.AGENT.EDIT.001, CORE.AGENT.EDIT.002)
- Update behavior records with implementation. (CORE.AGENT.SYNC.001)
- Report exact verification evidence. (CORE.AGENT.COMPLETE.001)

## Standards

### Select task context (CORE.AGENT.LOAD.001)

**Requirement:** An agent MUST select the active task from `loadPlans` in `standards.manifest.json` before editing.

**Rationale:** The selected task identifies the smallest standards context that covers the request.

### Load context by tier (CORE.AGENT.LOAD.002)

**Requirement:** An agent MUST load Tier 0, then Tier 1, and Tier 2 when the selected task requires full guidance.

**Rationale:** Tier 0 carries repository instructions, Tier 1 carries summaries, and Tier 2 carries full topic documents.

### Load applicable extensions (CORE.AGENT.LOAD.003)

**Requirement:** An agent MUST load selected project extensions and selected applicable local extensions before their boundaries affect work.

**Rationale:** The implementation projects extensions apply when selected; local extensions also require the active specification kind.

### Read active behavior specifications (CORE.AGENT.LOAD.004)

**Requirement:** An agent MUST read the active use-case specification before changing observable application behavior.

**Rationale:** The specification defines accepted behavior, risks, rules, and verification context.

### Apply guidance precedence (CORE.AGENT.PRECEDENCE.001)

**Requirement:** An agent MUST apply consumer overrides, applicable extensions, selected profile conventions, and foundation standards in that order.

**Rationale:** The order resolves a more local approved replacement before a broader baseline.

### Replace only declared conventions (CORE.AGENT.PRECEDENCE.002)

**Requirement:** An agent MAY apply a local convention replacement only when consumer documentation states that replacement directly.

**Rationale:** An undocumented local preference does not replace a baseline default.

### Stop on unresolved conflict (CORE.AGENT.CONFLICT.001)

**Requirement:** An agent MUST stop when applicable requirements disagree without declared precedence and quote both rule IDs and paths.

**Rationale:** A named conflict needs a decision rather than an invented compromise.

### Inspect existing work before editing (CORE.AGENT.EDIT.001)

**Requirement:** An agent MUST read `git status` before editing and preserve user changes, untracked files, and unrelated generated output.

**Rationale:** The task can share a working tree with work outside its requested scope.

### Restrict unapproved side effects (CORE.AGENT.EDIT.002)

**Requirement:** An agent MUST NOT add packages, migrations, authentication changes, public API breaks, or external side effects without authorization.

**Rationale:** These changes alter project boundaries beyond an ordinary implementation edit.

### Make coherent scoped changes (CORE.AGENT.EDIT.003)

**Requirement:** An agent MUST make the smallest coherent change that satisfies the authorized request.

**Rationale:** A coherent change includes its required specification, code, test, and operating evidence.

### Update behavior records with code (CORE.AGENT.SYNC.001)

**Requirement:** An agent MUST update affected product, domain, page, decision, API, test, and generated artifacts with observable behavior changes.

**Rationale:** One behavior change needs current records at every affected boundary.

### Run and report verification (CORE.AGENT.COMPLETE.001)

**Requirement:** An agent MUST run applicable checks, inspect generated differences, compare results with the active use case, and report exact evidence.

**Rationale:** A narrow passing test does not establish repository-wide completion.

## Conventions

### Select one task label (CORE.AGENT.CONVENTION.001)

**Default:** Select the narrowest manifest task that covers the edit.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A second task loads only when the edit crosses its boundary.

### Escalate from summary to full document (CORE.AGENT.CONVENTION.002)

**Default:** Read Tier 2 before generating a file, changing a public boundary, or choosing between patterns.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A small edit matching an existing local pattern can remain at Tier 1.

### Inspect local examples after standards (CORE.AGENT.CONVENTION.003)

**Default:** Inspect neighboring consumer files after loading applicable standards.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Compliant local names and shapes provide the best implementation starting point.

## Reference example

This informative example demonstrates `CORE.AGENT.LOAD.001`, `CORE.AGENT.LOAD.004`, and `CORE.AGENT.LOAD.003`.

A Command-handler change selects `backend.application`, reads its active use case, and loads selected applicable extensions. It excludes unrelated frontend and container guidance.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| CORE.AGENT.LOAD.001 | inspection | Change review identifies the selected manifest task before editing. |
| CORE.AGENT.LOAD.002 | inspection | Agent report lists required Tier 0, Tier 1, and Tier 2 documents. |
| CORE.AGENT.LOAD.003 | inspection | Agent report lists selected project and applicable local extensions. |
| CORE.AGENT.LOAD.004 | inspection | Behavior-change report cites the active use-case specification. |
| CORE.AGENT.PRECEDENCE.001 | inspection | Design review applies sources in declared precedence order. |
| CORE.AGENT.PRECEDENCE.002 | inspection | Consumer documentation records each local convention replacement. |
| CORE.AGENT.CONFLICT.001 | inspection | Unresolved conflict report quotes both rule IDs and paths. |
| CORE.AGENT.EDIT.001 | inspection | Change report records initial status and preserved unrelated work. |
| CORE.AGENT.EDIT.002 | inspection | Review identifies authorization for each listed boundary-changing side effect. |
| CORE.AGENT.EDIT.003 | inspection | Diff review connects each changed artifact to the authorized request. |
| CORE.AGENT.SYNC.001 | inspection | Behavior review links changed implementation to affected current records. |
| CORE.AGENT.COMPLETE.001 | inspection | Completion report lists commands, outcomes, evidence scope, and skipped checks. |
| CORE.AGENT.CONVENTION.001 | inspection | Agent report selects one narrowest task or names an additional crossed boundary. |
| CORE.AGENT.CONVENTION.002 | inspection | File-generation and public-boundary reports cite loaded Tier 2 guidance. |
| CORE.AGENT.CONVENTION.003 | inspection | Change review identifies neighboring compliant consumer patterns. |

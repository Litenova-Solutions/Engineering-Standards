# Agent Delegation

## Intent

Agent delegation lets one software agent start another on the same working tree by giving it a written brief with its own paths. This page states what the brief carries, how a worker stays inside its paths, and how the delegating agent verifies the result before accepting it. A project selects it when one agent starts another on the same tree, so each worker owns its part instead of rewriting another's.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `delegation` when one agent starts another agent on the same tree.

## Baseline relationship

This extension replaces no baseline provision. The [agent protocol](../core/agent.md) governs one agent working alone, and this extension governs the handoff between two.

This extension switches on no optional record type.

## Standards

### Write a brief before delegating

**Requirement:** An agent that starts another agent MUST give it a written brief stating goal, context, sources, and output.

**Rationale:** Two agents sharing one tree collide without a written split of goal, context, sources, and output. The brief states what the worker owns and what it builds on. When workers collide, the defect lies in the brief rather than in either worker.

**Example:** A brief carries four sections, each answering one question for the worker.

```text
Goal: the change the worker owns.
Context: the repository facts the change builds on.
Sources: the records and pages to read first.
Output: the files to change and the report to write.
```

### Restrict a worker to its paths

**Requirement:** A delegated worker MUST stay inside the paths its brief names and commit nothing.

**Rationale:** The brief names the paths the worker may change. A worker that stays inside them cannot rewrite what another worker owns. One that roams the whole tree overwrites parallel work and commits what nobody asked for.

### Ask only unanswered questions

**Requirement:** A delegated worker MUST ask no question its brief answers.

**Rationale:** The brief answers the questions the delegating agent already settled. A worker that re-asks them spends a round trip on a reading failure. Questions stay for what the brief leaves genuinely unanswered.

### Verify before accepting worker output

**Requirement:** A delegating agent MUST re-run the verification its brief names before accepting worker output.

**Rationale:** The delegating agent owns the result, so it re-runs the verification the brief named and watches it pass. A done claim without that run is a claim, not evidence. Accepting on trust moves the worker's defect into the delegating agent's change.

## Conventions

None.

## Dependencies

This extension adds no required package.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/delegation#write-a-brief-before-delegating | guidance | Does each brief state goal, context, sources, and output? |
| litespec/ext/delegation#restrict-a-worker-to-its-paths | checkable | `git diff --name-only` lists only the brief's named paths. The worker commits nothing. |
| litespec/ext/delegation#ask-only-unanswered-questions | guidance | Does the worker ask only questions its brief leaves unanswered? |
| litespec/ext/delegation#verify-before-accepting-worker-output | guidance | Which verification run does the delegating agent watch pass before accepting the output? |

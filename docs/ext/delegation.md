# Agent Delegation

## Intent

One agent can hold a whole change in view. A fleet cannot, so delegation needs written boundaries where one agent needs none. This extension states the brief, the containment, and the acceptance check.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `delegation` when one agent starts another on the same tree.

## Baseline relationship

This extension replaces no baseline provision. The agent protocol governs one agent, and this extension governs the handoff between two.

This extension switches on no optional record type.

## Standards

### Write a brief before delegating

**Requirement:** An agent that starts another agent MUST give it a written brief stating goal, context, sources, and output.

**Rationale:** Two agents sharing one tree collide without a written split. The brief states what each one owns, so a collision is a defect in the brief rather than in either worker.

**Example:** A brief carries four sections, each answering one question for the worker.

```text
Goal: the change the worker owns.
Context: the repository facts the change builds on.
Sources: the records and pages to read first.
Output: the files to change and the report to write.
```

### Restrict a worker to its paths

**Requirement:** A delegated worker MUST stay inside the paths its brief names and commit nothing.

**Rationale:** A worker with the whole tree rewrites what another worker owns.

### Ask only unanswered questions

**Requirement:** A delegated worker MUST ask no question its brief answers.

**Rationale:** A question the brief answers is a reading failure, not a gap in the brief.

### Verify before accepting worker output

**Requirement:** A delegating agent MUST re-run the verification its brief names before accepting worker output.

**Rationale:** A done claim without verification is a claim. The delegating agent owns the result, so it watches the checks pass rather than reading that they passed.

## Conventions

None.

## Dependencies

This extension adds no required package.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/delegation#write-a-brief-before-delegating | guidance | Does each brief state goal, context, sources and output? |
| litespec/ext/delegation#restrict-a-worker-to-its-paths | checkable | `git diff --name-only` lists only the brief's named paths, and the worker commits nothing. |
| litespec/ext/delegation#ask-only-unanswered-questions | guidance | Did the worker ask only questions its brief leaves unanswered? |
| litespec/ext/delegation#verify-before-accepting-worker-output | guidance | Which verification run did the delegating agent watch pass before accepting the output? |

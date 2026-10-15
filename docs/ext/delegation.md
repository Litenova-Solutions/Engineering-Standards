# Agent Delegation

## Intent

One agent can hold a whole change in view. A fleet cannot, so delegation needs written boundaries where one agent needs none. This extension states the brief, the containment, and the acceptance check.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `delegation` when one agent starts another on the same tree.

## Baseline relationship

This extension replaces no baseline provision. The agent protocol governs one agent, and this extension governs the handoff between two.

## Agent Summary {#agent-summary}

- Brief each worker with goal, context, sources, and output. (standards/rule/ext-delegation.write-a-brief-before-delegating)
- Hold each worker inside its named paths. (standards/rule/ext-delegation.restrict-a-worker-to-its-paths)
- Re-run verification before accepting worker output. (standards/rule/ext-delegation.verify-before-accepting-worker-output)

## Standards

### Write a brief before delegating (standards/rule/ext-delegation.write-a-brief-before-delegating)

**Requirement:** An agent that starts another agent MUST give it a written brief stating goal, context, sources, and output.

**Rationale:** Two agents sharing one tree collide without a written split. The brief states what each one owns, so a collision is a defect in the brief rather than in either worker.

**Example:** A brief carries four sections, each answering one question for the worker.

```text
Goal: the change the worker owns.
Context: the repository facts the change builds on.
Sources: the records and pages to read first.
Output: the files to change and the report to write.
```

### Restrict a worker to its paths (standards/rule/ext-delegation.restrict-a-worker-to-its-paths)

**Requirement:** A delegated worker MUST stay inside the paths its brief names, commit nothing, and ask no question its brief answers.

**Rationale:** A worker with the whole tree rewrites what another worker owns. A question the brief answers is a reading failure, not a gap in the brief.

### Verify before accepting worker output (standards/rule/ext-delegation.verify-before-accepting-worker-output)

**Requirement:** A delegating agent MUST re-run the verification its brief names before accepting worker output.

**Rationale:** A done claim without verification is a claim. The delegating agent owns the result, so it watches the checks pass rather than reading that they passed.

## Conventions

None.

## Dependencies

This extension adds no required package.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-delegation.write-a-brief-before-delegating | inspection | Delegation review reads goal, context, sources, and output in each brief. |
| standards/rule/ext-delegation.restrict-a-worker-to-its-paths | inspection | Diff review confirms each worker change stays inside its brief paths with no commit. |
| standards/rule/ext-delegation.verify-before-accepting-worker-output | inspection | Acceptance review names the verification run the delegating agent watched pass. |

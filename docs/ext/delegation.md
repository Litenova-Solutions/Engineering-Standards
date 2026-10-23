# Agent Delegation

## Intent

Agent delegation lets one software agent start another on the same working tree by giving it a written brief with its own paths. This page states what the brief carries, how a worker stays inside its paths, and how the delegating agent verifies the result before accepting it. A project selects it when one agent starts another on the same tree, so each worker owns its part instead of rewriting another's.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `delegation` when one agent starts another agent on the same tree.

## Baseline Relationship

This extension replaces no baseline provision. The [agent protocol](../core/agent.md) governs one agent working alone, and this extension governs the handoff between two.

This extension switches on no optional record type.

## Standards

### Write a Brief Before Delegating

**Statement:** An agent that starts another agent MUST give it a written brief stating goal, context, sources, and output.

**Rationale:** Two agents sharing one tree collide without a written split of goal, context, sources, and output. The brief states what the worker owns and what it builds on. When workers collide, the defect lies in the brief rather than in either worker.

**Example:** A brief carries four sections, each answering one question for the worker.

```text
Goal: the change the worker owns.
Context: the repository facts the change builds on.
Sources: the records and pages to read first.
Output: the files to change and the report to write.
```

### Restrict a Worker to Its Paths

**Statement:** A delegated worker MUST stay inside the paths its brief names and commit nothing.

**Rationale:** The brief names the paths the worker may change. A worker that stays inside them cannot rewrite what another worker owns. One that roams the whole tree overwrites parallel work and commits what nobody asked for.

### Ask Only Unanswered Questions

**Statement:** A delegated worker MUST ask no question its brief answers.

**Rationale:** The brief answers the questions the delegating agent already settled. A worker that re-asks them spends a round trip on a reading failure. Questions stay for what the brief leaves genuinely unanswered.

### Verify Before Accepting Worker Output

**Statement:** A delegating agent MUST re-run the verification its brief names before accepting worker output.

**Rationale:** The delegating agent owns the result, so it re-runs the verification the brief named and watches it pass. A done claim without that run is a claim, not evidence. Accepting on trust moves the worker's defect into the delegating agent's change.

### Hold Back Example Rows from the Implementing Worker

**Statement:** A delegating agent MUST check a delegated refusal or calculation implementation against example rows held back from the worker that wrote it.

**Rationale:** Example rows given to the implementing worker become the values the implementation is tuned to pass, so the check proves nothing. Rows held back stay an independent verdict: the delegating agent runs them after the worker finishes, and the implementation passes or fails on unseen cases.

## Conventions

None.

## Dependencies

Packages: None.

Related extensions: None.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/delegation#write-a-brief-before-delegating | guidance | Which briefs lack goal, context, sources, or output? Look at the briefs the delegating agent wrote. |
| litespec/ext/delegation#restrict-a-worker-to-its-paths | checkable | `git diff --name-only` lists only the brief's named paths. The worker commits nothing. |
| litespec/ext/delegation#ask-only-unanswered-questions | guidance | Which worker questions repeat answers the brief gives? Look at the worker questions beside the brief. |
| litespec/ext/delegation#verify-before-accepting-worker-output | guidance | Which accepted outputs lack a watched verification run? Look at the verification runs the delegating agent reports. |
| litespec/ext/delegation#hold-back-example-rows-from-the-implementing-worker | guidance | Which delegated refusal or calculation implementations were checked only against rows the worker saw? Look at the held-back rows and the check runs. |

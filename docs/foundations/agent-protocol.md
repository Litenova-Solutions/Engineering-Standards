# Agent Operating Protocol

## Intent

This protocol controls how AI agents select context, resolve standards, preserve user work, and report completion. It keeps detailed conventions available without loading the entire repository for every task.

## Agent Summary {#agent-summary}

- Load the consumer configuration, active use case, and task-specific summaries.
- Read full topic documents when editing that area or when a summary is insufficient.
- Apply consumer overrides before extensions, profile conventions, and foundations.
- Stop on unresolved conflicts.
- Preserve unrelated work and verify behavior before reporting completion.

## Standards

### Load context by task (AGENT.LOAD.001)

Start with Tier 0, then select the active task from `loadPlans` in `standards.manifest.json`.

- Tier 0 contains repository agent instructions.
- Tier 1 contains short `Agent Summary` sections.
- Tier 2 contains complete topic documents.
- Extensions load only when the consumer enables them or the task evaluates their activation criteria.

Read the active use-case specification before changing observable application behavior.

### Apply explicit precedence (AGENT.PRECEDENCE.001)

Apply applicable guidance in this order:

1. Consumer override backed by a decision and named rule ID.
2. Enabled extension that declares a baseline replacement.
3. Selected platform profile and its conventions.
4. Foundation standards.

A local convention may replace a baseline convention when the consumer documentation states the replacement directly.

### Stop on unresolved conflicts (AGENT.CONFLICT.001)

When two applicable requirements disagree without declared precedence, quote both rule IDs and paths. Do not invent a compromise.

### Protect work outside the task (AGENT.EDIT.001)

Read `git status` before editing. Preserve user changes, untracked files, and unrelated generated output. Make the smallest coherent change that satisfies the request.

Do not add packages, migrations, authentication model changes, public API breaks, or external side effects unless the request or an accepted decision authorizes them.

### Keep specifications and code synchronized (AGENT.SYNC.001)

Update affected product, domain, page, decision, API, test, and generated artifacts in the same change as observable behavior.

### Prove completion (AGENT.COMPLETE.001)

Run every applicable check, inspect generated differences, compare the result with the active use case, and report exact commands and results. A narrow passing test does not prove repository-wide completion.

## Conventions

### Use one task label

Select the narrowest manifest task that covers the edit. Load a second task only when the change crosses that boundary.

### Escalate from summary to full document

Read Tier 2 before generating a new file, changing a public boundary, or choosing between two patterns. A small edit that matches an existing local pattern may remain at Tier 1.

### Prefer local examples after standards

After loading the applicable standard, inspect neighboring consumer files. Match local names and shapes when they comply with the selected standard.

## Examples

A command-handler change loads `backend.application`, the active use case, and enabled extensions. It does not load frontend rendering or container deployment guidance unless the requested behavior crosses those areas.

## Verification

- Confirm the selected task exists in the manifest.
- Confirm the active use case and enabled extensions were read.
- Confirm precedence was applied to every local override.
- Confirm unrelated working-tree changes remain intact.
- Confirm the completion report names skipped checks and reasons.

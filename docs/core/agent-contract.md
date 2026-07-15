---
{
  "id": "core.agent-contract",
  "kind": "core",
  "normative": true,
  "appliesTo": ["agent"],
  "recipes": []
}
---
# Agent Contract

## Agent Quick Rules {#agent-quick-rules}

- Load only the task plan, active use case, and enabled recipes.
- Apply consumer overrides before recipes, profile, and core.
- Stop on undeclared conflicts.
- Preserve unrelated work and derived-file ownership.
- Verify behavior before reporting completion.

## AGENT.LOAD.001 - Load context by task

Agents start with Tier 0 and read the manifest load plan for the active task. Tier 1 supplies short rules. Tier 2 supplies full detail. Recipes stay unloaded unless enabled.

For a command-handler edit, load `backend.application` and the use-case ID. Do not load deployment or realtime recipes.

## AGENT.PRECEDENCE.001 - Apply explicit precedence

Consumer overrides backed by decision records take precedence over enabled recipes. Recipes may replace named profile rules. Profile rules take precedence over core defaults where the profile states a narrower behavior.

An override that says only "use a different database" is invalid. It must name the replaced rule ID and a decision record.

## AGENT.CONFLICT.001 - Stop on unresolved conflict

When two applicable rules disagree without declared precedence, quote both rule IDs and paths. Do not invent a compromise.

## AGENT.EDIT.001 - Protect work outside the task

Read `git status` before editing. Preserve user changes, untracked files, and unrelated derived output. Use minimal commits grouped by one reason for change.

## AGENT.COMPLETE.001 - Prove completion

Run every applicable check, inspect derived application differences, and compare the result with the requested behavior. A passing unit test does not prove an untested deployment or documentation requirement.

# __PROJECT__ Agent Context

Read `standards/AGENTS.md`, then `standards.project.json`, before changing the project. (standards/rule/core-agent.select-task-context)

Select the matching `loadPlans` entry, active Use case, and applicable extensions. (standards/rule/core-agent.select-task-context, standards/rule/core-system.select-extensions-before-applying-them)

Start with Tier 1 Agent Summaries. Read Tier 2 before generating files or changing public boundaries. (standards/rule/core-agent.select-task-context)

Project decisions override a Standard only when `standards.project.json` names its provision ID and decision path. (standards/rule/core-agent.apply-guidance-precedence)

An explicit project convention can replace a baseline Convention when local documentation cites its ID. (standards/rule/core-agent.apply-guidance-precedence, standards/rule/core-authoring.identify-actionable-conventions)

## Project Commands

Run the backend gates for every changed API boundary. (standards/rule/core-release.run-boundary-selected-checks)

```bash
dotnet build __API_SOLUTION__ --configuration Release
dotnet test __API_SOLUTION__ --configuration Release --no-build
```

Run the root pnpm gates for every changed frontend in `standards.project.json`. (standards/rule/core-release.run-boundary-selected-checks)

Run metadata and code-document checks for each changed specification, source, test, or generated contract. (standards/rule/core-agent.update-behavior-records-with-code, standards/rule/core-authoring.declare-structured-specification-metadata)

Report every skipped check with its reason. (standards/rule/core-agent.run-and-report-verification)

Load controlled UI governance before changing a React control or route composition. (standards/rule/frontend-ui.follow-the-agent-ui-protocol)

Follow Use, Compose, Constrain, and Prove. Search approved vocabulary and installed primitives before adding source. (standards/rule/frontend-ui.follow-the-agent-ui-protocol)

Run `node standards/tools/validate-ui.mjs` after changing UI configuration, vocabulary, page sidecars, source locks, CSS, or primitives. (standards/rule/frontend-ui.prove-ui-behavior-and-appearance)

Record an override decision before selecting another visual system or component base. (standards/rule/frontend-ui.select-one-visual-authority)

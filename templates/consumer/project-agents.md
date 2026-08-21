# __PROJECT__ Agent Context

Read `standards/AGENTS.md`, then `standards.project.json`, before changing the project. (CORE.AGENT.LOAD.001)

Select the matching `loadPlans` entry, active Use case, and applicable extensions. (CORE.AGENT.LOAD.001, CORE.SYSTEM.EXTENSIONS.001)

Start with Tier 1 Agent Summaries. Read Tier 2 before generating files or changing public boundaries. (CORE.AGENT.LOAD.001)

Project decisions override a Standard only when `standards.project.json` names its provision ID and decision path. (CORE.AGENT.PRECEDENCE.001)

An explicit project convention can replace a baseline Convention when local documentation cites its ID. (CORE.AGENT.PRECEDENCE.001, CORE.AUTHORING.DEFAULTS.001)

## Project Commands

Run the backend gates for every changed API boundary. (CORE.RELEASE.GATES.001)

```bash
dotnet build __API_SOLUTION__ --configuration Release
dotnet test __API_SOLUTION__ --configuration Release --no-build
```

Run the root pnpm gates for every changed frontend in `standards.project.json`. (CORE.RELEASE.GATES.001)

Run metadata and code-document checks for each changed specification, source, test, or generated contract. (CORE.AGENT.SYNC.001, CORE.AUTHORING.METADATA.002)

Report every skipped check with its reason. (CORE.AGENT.COMPLETE.001)

Load controlled UI governance before changing a React control or route composition. (FRONTEND.UI.PROTOCOL.001)

Follow Use, Compose, Constrain, and Prove. Search approved vocabulary and installed primitives before adding source. (FRONTEND.UI.PROTOCOL.001)

Run `node standards/tools/validate-ui.mjs` after changing UI configuration, vocabulary, page sidecars, source locks, CSS, or primitives. (FRONTEND.UI.EVIDENCE.001)

Record an override decision before selecting another visual system or component base. (FRONTEND.UI.GOVERNANCE.001)

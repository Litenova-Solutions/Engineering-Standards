# __PROJECT__ Agent Context

Read `standards/AGENTS.md`, then `standards.project.json`, before changing the project.

Read the matching `loadPlans` entry in `standards/standards.manifest.json`, then load the active Use case and applicable extensions. Start with each Tier 1 `Agent Summary`; read the Tier 2 document before generating files or changing a public boundary.

Project decisions under `docs/decisions/` override a standard only when `standards.project.json` names the rule ID and decision path. Explicit project conventions may replace baseline conventions when the project documents the replacement.

## Project commands

```bash
dotnet build __API_SOLUTION__ --configuration Release
dotnet test __API_SOLUTION__ --configuration Release --no-build
```

Run the root pnpm gates for every changed frontend listed in `standards.project.json`.

Run documentation metadata and code-document consistency checks for every changed product, domain, implementation, test, or generated-contract file. Report skipped checks with reasons.

For each React web frontend, load `docs/conventions/frontend/ui-governance.md` before changing a
control or route composition. Follow Use, Compose, Constrain, and Prove. Search the frontend UI
vocabulary and installed primitives before adding source. Run `node standards/tools/validate-ui.mjs`
when the frontend UI configuration, vocabulary, page sidecar, source lock, CSS entry, or primitive
source changes. Record an override decision before selecting another visual system or component base.

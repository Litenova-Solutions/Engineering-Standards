# __PROJECT__ Agent Context

Read `standards/AGENTS.md`, then `standards.project.json`, before changing the project.

Run the standards context command with the active task and use-case ID. Project decisions under `docs/decisions/` override a standard only when `standards.project.json` names the rule ID and decision path.

## Project commands

```bash
dotnet build apps/api/__PROJECT__.slnx --configuration Release
dotnet test apps/api/__PROJECT__.slnx --configuration Release --no-build
```

Run the root pnpm gates for every changed frontend listed in `standards.project.json`.


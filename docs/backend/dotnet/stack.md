# .NET Stack

## Intent

This stack binds the backend to .NET. The specification states each backend and workspace principle. The pages in this stack's folder state how a .NET backend realizes it. The model builder reads C# code, C# scenarios, and test results for the backend.

## Standards

### Declare dotnet as the backend stack

**Requirement:** A project whose backend runs on .NET MUST name `dotnet` in the `stacks` of `litespec.project.json`.

**Rationale:** The declaration applies the pages in this stack's folder. It also selects the readers the model builder uses for C# handlers, events, failure codes, and scenarios.

### Write test results the model builder reads

**Requirement:** A .NET test run MUST write its results as TRX or JUnit XML under `paths.testResults`.

**Rationale:** The model builder computes verified status from those two formats only, so a run in another format verifies no case.


## Conventions

This stack adds no conventions.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/stack#declare-dotnet-as-the-backend-stack | guidance | Does `litespec.project.json` name `dotnet` when the backend runs on .NET? |
| litespec/backend/dotnet/stack#write-test-results-the-model-builder-reads | checkable | `litespec model check` reports no case as verified when no result file exists. |

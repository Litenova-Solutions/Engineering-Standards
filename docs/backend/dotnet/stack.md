# .NET Stack

## Intent

A backend built on .NET declares the `dotnet` stack in `litespec.project.json`. The declaration applies every page in this folder, and it tells the model builder to read C# code and test results in TRX or JUnit XML. This page states the declaration and the result formats the builder reads.

## Standards

### Declare `dotnet` as the Backend Stack

**Statement:** A project whose backend runs on .NET MUST name `dotnet` in the `stacks` of `litespec.project.json`.

**Rationale:** The `stacks` entry applies every page in this folder with its checks and analyzers, so an undeclared backend follows no .NET rule. It also selects the readers the model builder uses for C# handlers, events, refusal codes, and scenarios.

### Write Test Results the Model Builder Reads

**Statement:** A .NET test run MUST write its results as TRX or JUnit XML under `paths.testResults`.

**Rationale:** The model builder computes verified status from TRX and JUnit XML only. A run written in another format, or outside `paths.testResults`, verifies no scenario even when every test passes.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/stack#declare-dotnet-as-the-backend-stack | guidance | The `stacks` array in `litespec.project.json`: `dotnet` listed when the backend runs on .NET. |
| litespec/backend/dotnet/stack#write-test-results-the-model-builder-reads | checkable | `litespec model check` reports no scenario verified when no result file exists. |

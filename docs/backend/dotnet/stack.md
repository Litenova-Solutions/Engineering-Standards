# .NET Stack

## Intent

A backend built on .NET declares the `dotnet` stack in `litespec.project.json`. The declaration applies every page in this folder, and it tells the model builder, the tool that links a project's written records to its code and test results, to read C# code and test results in TRX or JUnit XML. This page states the declaration and the result formats the builder reads. Declaring the stack when the backend is created applies the right pages and checks from the first commit.

## Standards

### Declare dotnet as the backend stack

**Requirement:** A project whose backend runs on .NET MUST name `dotnet` in the `stacks` of `litespec.project.json`.

**Rationale:** The `stacks` entry applies every page in this folder with its checks and analyzers, so an undeclared backend follows no .NET rule. It also selects the readers the model builder uses for C# handlers, events, failure codes, and scenarios.

### Write test results the model builder reads

**Requirement:** A .NET test run MUST write its results as TRX or JUnit XML under `paths.testResults`.

**Rationale:** The model builder computes verified status from TRX and JUnit XML only. A run written in another format, or outside `paths.testResults`, verifies no Case even when every test passes.


## Conventions

This stack adds no conventions.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/stack#declare-dotnet-as-the-backend-stack | guidance | Does `litespec.project.json` name `dotnet` when the backend runs on .NET? |
| litespec/backend/dotnet/stack#write-test-results-the-model-builder-reads | checkable | `litespec model check` reports no case as verified when no result file exists. |

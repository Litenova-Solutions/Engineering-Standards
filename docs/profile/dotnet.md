# .NET Stack

## Intent

This stack binds the backend to .NET. The specification states each backend and workspace principle. The pages this stack lists state how a .NET backend realizes it. The model builder reads C# code, C# scenarios, and test results for it.

## Agent Summary {#agent-summary}

The shared stack rules on the [Stacks](stacks.md) page apply to every stack.

- A .NET backend declares the dotnet stack. (litespec/rule/profile-dotnet.declare-dotnet-as-the-backend-stack)
- Test runs write results the model builder reads. (litespec/rule/profile-dotnet.write-test-results-the-model-builder-reads)

## Standards

### Declare dotnet as the backend stack (litespec/rule/profile-dotnet.declare-dotnet-as-the-backend-stack)

**Requirement:** A project whose backend runs on .NET MUST name `dotnet` in the `stacks` of `litespec.project.json`.

**Rationale:** The declaration applies the pages this stack lists. It also selects the readers the model builder uses for C# handlers, events, failure codes, and scenarios.

### Write test results the model builder reads (litespec/rule/profile-dotnet.write-test-results-the-model-builder-reads)

**Requirement:** A .NET test run MUST write its results as TRX or JUnit XML under `paths.testResults`.

**Rationale:** The model builder computes verified status from those two formats only, so a run in another format proves no case.

## Composition

### Stack

- [.NET Stack](dotnet.md)

### .NET

- [.NET Architecture](../dotnet/architecture.md)
- [.NET Domain](../dotnet/domain.md)
- [.NET Application Layer](../dotnet/application.md)
- [.NET Persistence](../dotnet/persistence.md)
- [.NET HTTP API](../dotnet/api.md)
- [.NET Testing](../dotnet/testing.md)
- [.NET Workspace](../dotnet/workspace.md)
- [.NET Naming and Code Style](../dotnet/naming.md)
- [.NET Packages](../dotnet/packages.md)
- [.NET Configuration](../dotnet/config.md)

## Conventions

This stack adds no conventions.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/profile-dotnet.declare-dotnet-as-the-backend-stack | guidance | Does `litespec.project.json` name `dotnet` when the backend runs on .NET? |
| litespec/rule/profile-dotnet.write-test-results-the-model-builder-reads | checkable | `litespec model check` reports no case as verified when no result file exists. |

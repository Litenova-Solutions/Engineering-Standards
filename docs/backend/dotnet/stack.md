# .NET Stack

## Intent

A backend built on .NET declares the `dotnet` stack in `litespec.project.json`. The declaration applies every page in this folder, and it tells the model builder to read C# code and test results in TRX or JUnit XML. This page states the declaration, what the stack reader reads from C# code, and the result formats the builder reads.

## Standards

### Declare `dotnet` as the Backend Stack

**Statement:** A project whose backend runs on .NET MUST name `dotnet` in the `stacks` of `litespec.project.json`.

**Rationale:** The `stacks` entry applies every page in this folder with its checks and analyzers, so an undeclared backend follows no .NET rule. It also selects the readers the model builder uses for C# handlers, events, refusal codes, and scenarios.

### Read .NET Code Through the Stack Reader

**Statement:** The .NET stack reader MUST read use-case folders, reaction anchor tags, injected repositories, returned codes, dispatch calls, proves tags, and test results.

**Rationale:** Each S check reads one of those shapes. The folder anchors a command or query to its use-case record, and the reaction class anchor tag names its reaction record. Injected repositories prove `changes`, returned codes prove declared results and refusals, and dispatch calls prove declared effects, so the reader reports `behavior-unrecorded`, `use-case-unimplemented`, `write-undeclared`, `result-undeclared`, `effect-undeclared`, `use-case-access`, and `refusal-not-thrown` from code. Proves tags with the latest test run prove each scenario, so the reader reports `proves-unconfirmed` and `use-case-without-scenario` from tests. S checks block where this reader is qualified and report elsewhere.

**Example:** The `CompleteTicketResale` folder anchors the handler to `use-case/sales.complete-ticket-resale`; the reaction class carries `/// <implements>reaction/admission.void-code-on-resale</implements>`.

### Write Test Results the Model Builder Reads

**Statement:** A .NET test run MUST write its results as TRX or JUnit XML under `paths.testResults`.

**Rationale:** The model builder computes verified status from TRX and JUnit XML only. A run written in another format, or outside `paths.testResults`, verifies no scenario even when every test passes.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/stack#declare-dotnet-as-the-backend-stack | guidance | The `stacks` array in `litespec.project.json`: `dotnet` listed when the backend runs on .NET. |
| litespec/backend/dotnet/stack#read-net-code-through-the-stack-reader | checkable | `litespec model check` reports its tier beside each S finding read from C# code and test results. |
| litespec/backend/dotnet/stack#write-test-results-the-model-builder-reads | checkable | `litespec model check` reports no scenario verified when no result file exists. |

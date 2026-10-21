# .NET Naming and Code Style

## Intent

Names in a .NET backend follow C# file, asynchronous method, and implementation style rules. The shared provisions live on the stack-neutral page ([Naming and code style](../../workspace/naming.md)); this page holds what the .NET stack alone requires.

## Standards

### Match C# files and primary types

**Requirement:** A C# file MUST contain one primary top-level type and take that type's exact name.

**Rationale:** Only a small private or file-scoped nested type stays with its owner. Two public or internal top-level types belong in two files.

### Name asynchronous methods completely

**Requirement:** A method returning `Task` or `ValueTask` MUST end in `Async` and take `CancellationToken cancellationToken` last when cancelable.

**Rationale:** A caller then sees both the asynchrony and the cancellation contract from the signature. A method is cancelable when it performs I/O or awaits. This provision realizes `litespec/workspace/naming#name-asynchronous-operations-completely`.

### Keep implementation style consistent

**Requirement:** Production C# MUST use file-scoped namespaces, braces on every body, explicit access modifiers, and sealed concrete classes.

**Rationale:** These are the style decisions that change diff readability rather than behavior, so one setting removes the debate.

## Conventions

None.

## Reference example

This informative example demonstrates `litespec/backend/dotnet/naming#match-c-files-and-primary-types`, `litespec/workspace/naming#use-architectural-suffixes`, and `litespec/workspace/naming#keep-namespaces-aligned-with-folders`.

```csharp
namespace Example.Application.Posts.CreateDraft;

internal sealed class CreateDraftCommandHandler(
    IPostRepository postRepository,
    IClock clock)
{
    public async Task<CreateDraftCommandResult> HandleAsync(
        CreateDraftCommand command,
        CancellationToken cancellationToken)
    {
        // Operation code.
    }
}
```

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/naming#match-c-files-and-primary-types | checkable | `dotnet build` reports no LiteSpec.Analyzers LS3003 diagnostic. |
| litespec/backend/dotnet/naming#name-asynchronous-methods-completely | checkable | `dotnet build` reports no LiteSpec.Analyzers LS3001 or LS3002 diagnostic. |
| litespec/backend/dotnet/naming#keep-implementation-style-consistent | guidance | Does production C# use file-scoped namespaces, braces, explicit modifiers, and sealed classes? |

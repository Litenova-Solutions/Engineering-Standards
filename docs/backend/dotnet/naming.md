# .NET Naming and Code Style

## Intent

C# code in a .NET backend names its files, asynchronous methods, and implementation shapes one way across every project. This page states those .NET rules: one primary type per file, complete async signatures, and a shared implementation style. A complete signature ends in `Async` and takes its cancellation token last, so callers see both asynchrony and cancellation without opening the method. The shared naming rules live on [Naming and Code Style](../../workspace/naming.md); this page holds only their .NET form.

## Concepts

### Files, signatures, and style

A C# file takes its primary type's exact name, so a reader finds any type by its file. An asynchronous method ends in `Async` and takes its cancellation token last, so callers see both asynchrony and cancellation in the signature. File-scoped namespaces, braces on every body, explicit access modifiers, and sealed concrete classes keep diffs readable across every project.

## Standards

### Match C# files and primary types

**Requirement:** A C# file MUST contain one primary top-level type and take that type's exact name.

**Rationale:** A file named for its type lets a reader and a tool find the type by the path. Two top-level types in one file break that lookup and merge their histories in review. Only a small private or file-scoped nested type stays with its owner.

### Name asynchronous methods completely

**Requirement:** A method returning `Task` or `ValueTask` MUST end in `Async` and take `CancellationToken cancellationToken` last when cancelable.

**Rationale:** The `Async` suffix tells the caller the method is asynchronous, and the trailing `CancellationToken` tells the caller it can cancel. A cancelable method that hides either invites blocking calls and uncancellable waits. A method is cancelable when it performs I/O or awaits. This provision states the .NET form of `litespec/workspace/naming#name-asynchronous-operations-completely`.

### Keep implementation style consistent

**Requirement:** Production C# MUST use file-scoped namespaces, braces on every body, explicit access modifiers, and sealed concrete classes.

**Rationale:** File-scoped namespaces, braces on every body, explicit access modifiers, and sealed concrete classes change diff readability rather than behavior. One shared setting removes the debate from every review and keeps generated and hand-written code alike.

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

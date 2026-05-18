# Naming Conventions

This document is a concise reference for naming conventions that apply across all layers of a Litenova Solutions backend project. When a layer-specific convention file defines a more specific rule, that rule takes precedence.

---

## C# Type and Member Naming

| Concept | Convention | Example |
|---|---|---|
| Class | `PascalCase` | `PostRepository`, `CreatePostCommandHandler` |
| Interface | `IPascalCase` | `IPostRepository`, `IPostReadStore` |
| Record | `PascalCase` | `PostResult`, `CreatePostCommand` |
| Abstract class | `PascalCase` | `DomainException`, `AggregateNotFoundException` |
| Enum | `PascalCase` (type and values) | `OrderStatus.Pending`, `OrderStatus.Placed` |
| Method | `PascalCase` | `GetByIdAsync`, `HandleAsync`, `Publish` |
| Property | `PascalCase` | `Title`, `PublishedAt`, `AuthorId` |
| Private backing field | `_camelCase` | `_lines`, `_postRepository` |
| Constructor parameter (DI) | `camelCase` | `postRepository`, `liteBus` |
| Local variable | `camelCase` | `post`, `result`, `command` |
| Constant | `PascalCase` | `MaxTitleLength`, `DefaultPageSize` |
| Static readonly field | `PascalCase` | `Empty` (e.g., `PostId.Empty`) |

---

## File Naming

One class per file. File name matches the primary type name exactly, including capitalization.

| Rule | Example |
|---|---|
| One public type per file | `Post.cs` contains `sealed class Post` |
| File name matches type name | `PostNotFoundException.cs` contains `sealed class PostNotFoundException` |
| No type suffixes in file names beyond what the type name already has | `IPostRepository.cs` not `IPostRepositoryInterface.cs` |

---

## Layer-Specific Suffixes

| Suffix | Layer | Meaning |
|---|---|---|
| `Command` | Application | Input record for a command operation |
| `CommandHandler` | Application | Handler class for a command |
| `CommandValidator` | Application | Validator for a command |
| `Query` | Application | Input record for a query operation |
| `QueryHandler` | Application | Handler class for a query |
| `QueryValidator` | Application | Validator for a query |
| `Result` | Application | Output record returned by a query handler |
| `Summary` | Application | Abbreviated projection record for list queries |
| `IReadStore` | Application (interface) | Read-side store interface for an aggregate |
| `ReadStore` | Infrastructure | Implementation of an `IReadStore` interface |
| `Repository` | Infrastructure | Implementation of an `IXxxRepository` interface |
| `Configuration` | Infrastructure | EF Core `IEntityTypeConfiguration<T>` class |
| `Endpoint` | WebApi | `IEndpoint` implementation class |
| `Request` | WebApi | HTTP request body model |
| `Response` | WebApi | HTTP response body model |
| `ApiMappings` | WebApi | Static class with mapping extension methods |
| `ServiceRegistration` | Infrastructure, WebApi | DI extension method class |
| `Exception` | Domain, Application | Custom exception class suffix |

---

## Boolean Properties and Methods

Properties and methods that return a boolean value MUST use the `Is`, `Has`, or `Can` prefix where the semantics fit.

| Pattern | Example |
|---|---|
| State description | `IsPublished`, `IsActive`, `IsDraft` |
| Possession | `HasTags`, `HasExpired`, `HasBeenSent` |
| Permission / capability | `CanBePublished`, `CanBeDeleted` |

```csharp
// GOOD:
public bool IsPublished => State is PublishedPostState;
public bool HasTags => _tags.Count > 0;

// BAD:
public bool Published => State is PublishedPostState;
public bool Tags => _tags.Count > 0;
```

---

## Async Method Naming

Every method that returns `Task` or `Task<T>` (or `ValueTask` / `ValueTask<T>`) MUST have the `Async` suffix. Every such method MUST accept a `CancellationToken` parameter as the last parameter.

```csharp
// GOOD:
Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken);
Task AddAsync(Post post, CancellationToken cancellationToken);

// BAD:
Task<Post> GetById(PostId id);
Task Add(Post post);
```

The `CancellationToken` parameter MUST be named `cancellationToken` (not `ct`, `token`, or `cancel`).

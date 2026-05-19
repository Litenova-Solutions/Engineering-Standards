# Naming Conventions

This document is a concise reference for naming conventions that apply across all layers of a backend project following these standards. When a layer-specific convention file defines a more specific rule, that rule takes precedence.

---

## C# Type and Member Naming

| Concept | Convention | Example |
|:---|:---|:---|
| Class | `PascalCase` | `PostRepository`, `CreatePostCommandHandler` |
| Interface | `IPascalCase` | `IPostRepository`, `IPostReadStore` |
| Record | `PascalCase` | `PostResult`, `CreatePostCommand` |
| Abstract class | `PascalCase` | `DomainException`, `AggregateNotFoundException` |
| Enum | `PascalCase` (type and values) | `OrderStatus.Pending`, `OrderStatus.Placed` |
| Method | `PascalCase` | `GetByIdAsync`, `HandleAsync`, `Publish` |
| Property | `PascalCase` | `Title`, `PublishedAt`, `AuthorId` |
| Private backing field | `_camelCase` | `_lines`, `_postRepository` |
| Constructor parameter (DI) | `camelCase` | `postRepository`, `messageBus` |
| Local variable | `camelCase` | `post`, `result`, `command` |
| Constant | `PascalCase` | `MaxTitleLength`, `DefaultPageSize` |
| Static readonly field | `PascalCase` | `Empty` (e.g., `PostId.Empty`) |

---

## File Naming

One class per file. File name matches the primary type name exactly, including capitalization.

| Rule | Example |
|:---|:---|
| One public type per file | `Post.cs` contains `sealed class Post` |
| File name matches type name | `PostNotFoundException.cs` contains `sealed class PostNotFoundException` |
| No type suffixes in file names beyond what the type name already contains | `IPostRepository.cs` not `IPostRepositoryInterface.cs` |

---

## Layer-Specific Suffixes

| Suffix | Project | Meaning |
|:---|:---|:---|
| `Command` | `Application.Write.Contracts` | Input record for a write operation |
| `CommandResult` | `Application.Write.Contracts` | Output record from a write operation |
| `CommandHandler` | `Application.Write` | Handler implementation for a command |
| `CommandValidator` | `Application.Write` | Validator for a command |
| `Query` | `Application.Read.Contracts` | Input record for a read operation |
| `Result` | `Application.Read.Contracts` | Full output record returned by a query handler |
| `Summary` | `Application.Read.Contracts` | Abbreviated projection for list queries |
| `IReadStore` | `Application.Read.Contracts` | Read-side store interface (not a repository) |
| `QueryHandler` | `Application.Read` | Handler implementation for a query |
| `QueryValidator` | `Application.Read` | Validator for a query |
| `EventHandler` | `Application.Reactions` | Handler that reacts to a domain event |
| `ReadStore` | `Infrastructure` | Implementation of an `IXxxReadStore` interface |
| `Repository` | `Infrastructure` | Implementation of an `IXxxRepository` interface |
| `Configuration` | `Infrastructure` | EF Core `IEntityTypeConfiguration<T>` class |
| `Endpoint` | `WebApi` | `IEndpoint` implementation class |
| `Request` | `WebApi` | HTTP request body model |
| `Response` | `WebApi` | HTTP response body model |
| `ApiMappings` | `WebApi` | `internal static` class with mapping extension methods |
| `ServiceRegistration` | `Infrastructure`, `WebApi` | DI extension method class |

---

## Boolean Properties and Methods

Properties and methods that return a boolean MUST use the `Is`, `Has`, or `Can` prefix where the semantics fit.

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

Every method that returns `Task` or `Task<T>` (or `ValueTask` / `ValueTask<T>`) MUST have the `Async` suffix. Every such method MUST accept a `CancellationToken` parameter as the last parameter named exactly `cancellationToken`.

```csharp
// GOOD:
Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken);
Task AddAsync(Post post, CancellationToken cancellationToken);

// BAD:
Task<Post> GetById(PostId id);
Task<Post> GetByIdAsync(PostId id, CancellationToken ct); // BAD: parameter named 'ct', not 'cancellationToken'
Task Add(Post post);
```

---

## Event Handler Naming

Event handler class names follow the pattern `{Action}On{EventName}EventHandler`. The action describes what the handler does. The event name is the domain event class name without the word "Event".

```csharp
// GOOD: name describes the action and the triggering event
UpdateReadModelOnPostPublishedEventHandler
SendConfirmationOnOrderPlacedEventHandler
LogOnCustomerRegisteredEventHandler

// BAD: name only describes the event, not the action
PostPublishedEventHandler   // BAD: what does it do when the post is published?
OnPostPublished             // BAD: missing "EventHandler" suffix
```

---

## Narrow Interface Naming

Narrow interfaces defined in `Application.Reactions` are named after their single purpose. They follow the pattern `I{Verb}{Context}` where the verb describes the action and the context names the subject.

```csharp
// GOOD: name describes the single capability the interface provides
internal interface IPostPublishedNotifier
{
    Task NotifySubscribersAsync(PostId postId, string postTitle, CancellationToken cancellationToken);
}

internal interface IOrderConfirmationSender
{
    Task SendAsync(OrderId orderId, string recipientEmail, CancellationToken cancellationToken);
}

// BAD: broad service interface that exposes more than the handler needs
internal interface IEmailService   // BAD: exposes 20 methods; the handler needs one
{
    Task SendAsync(...);
    Task SendBulkAsync(...);
    Task GetDeliveryStatusAsync(...);
    // ...
}
```

# Exception Hierarchy

This document defines the exception hierarchy used across all projects following these standards. It is a critical contract document. Deviating from it produces incorrect HTTP responses and breaks the agreement between the API layer and its clients.

---

## Why This Matters

When a server returns a 500 response to a client, the client has no idea whether the operation failed because the input was invalid, the resource was not found, or an unexpected error occurred. Each situation requires a different client action: show a validation message, navigate to a not-found page, or show a generic error and retry.

Without a defined hierarchy, teams drift into patterns like throwing `InvalidOperationException` from domain logic and `ArgumentException` from validators. Both produce 500 responses in a default ASP.NET Core setup. The hierarchy defines exactly three failure categories for expected failures. Every exception class in this codebase maps to exactly one category. The `GlobalExceptionHandler` maps categories to HTTP status codes automatically. This is the contract.

---

## The Three Categories

| Category | Base Class | Location | HTTP Status | When to Throw |
|:---|:---|:---|:---|:---|
| Input Validation Failure | `ApplicationValidationException` | `Application.Write.Contracts/Shared/` or `Application.Read.Contracts/Shared/` | 400 | Thrown by `ICommandValidator` and `IQueryValidator` implementations when input is structurally invalid. |
| Resource Not Found | `AggregateNotFoundException` | `Domain/Shared/Exceptions/` | 404 | Thrown by repository implementations when an aggregate cannot be located by its ID. |
| Domain Invariant Violation | `DomainException` | `Domain/Shared/Exceptions/` | 409 | Thrown by aggregate methods when the requested operation is not permitted in the current state. |
| Unhandled | _(any `Exception`)_ | Anywhere | 500 | Any exception that does not match the above. These indicate a bug or unexpected external failure. |

---

## Base Class Definitions

```csharp
// Domain/Shared/Exceptions/AggregateNotFoundException.cs
abstract class AggregateNotFoundException : Exception
{
    protected AggregateNotFoundException(string message)
        : base(message) { }
}

// Domain/Shared/Exceptions/DomainException.cs
abstract class DomainException : Exception
{
    protected DomainException(string message)
        : base(message) { }
}

// Application.Write.Contracts/Shared/Exceptions/ApplicationValidationException.cs
abstract class ApplicationValidationException : Exception
{
    protected ApplicationValidationException(string message)
        : base(message) { }
}
```

All three base classes are `abstract`. You never throw a base class directly. Always throw a concrete subclass that names the specific failure.

---

## Concrete Exception Examples

### Resource Not Found

```csharp
sealed class PostNotFoundException : AggregateNotFoundException
{
    public PostNotFoundException(PostId id)
        : base($"Post '{id.Value}' was not found.") { }
}
```

### Domain Invariant Violation

```csharp
sealed class PostAlreadyPublishedException : DomainException
{
    public PostAlreadyPublishedException(PostId id)
        : base($"Post '{id.Value}' is already published and cannot be published again.") { }
}
```

### Input Validation Failure

```csharp
sealed class PostTitleRequiredException : ApplicationValidationException
{
    public PostTitleRequiredException()
        : base("A post title is required and cannot be empty.") { }
}
```

---

## The GlobalExceptionHandler

The `GlobalExceptionHandler` is an `IExceptionHandler` implementation registered in `Program.cs`. It maps exception types to problem details responses. Endpoints MUST NOT contain `try-catch` blocks.

```csharp
internal sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            ApplicationValidationException => (StatusCodes.Status400BadRequest, "Validation failure"),
            AggregateNotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            DomainException => (StatusCodes.Status409Conflict, "Domain rule violated"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception ({StatusCode}): {Message}", statusCode, exception.Message);
        }

        httpContext.Response.StatusCode = statusCode;

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message
        };

        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);

        return true;
    }
}
```

Register in `Program.cs`:

```csharp
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ...

app.UseExceptionHandler();
```

---

## Throw Site Contract

| Exception Category | Thrown By | Never Thrown By |
|:---|:---|:---|
| `ApplicationValidationException` | `ICommandValidator`, `IQueryValidator` implementations | Handlers, aggregates, repositories |
| `AggregateNotFoundException` | Repository implementations (`GetByIdAsync`) | Handlers, validators, aggregates, endpoints |
| `DomainException` | Aggregate root methods | Handlers, validators, repositories, endpoints |

---

## Using Guard.Against

Use `Guard.Against` from Ardalis.GuardClauses for common structural checks in validators.

```csharp
// GOOD: use Guard.Against for common structural checks
Guard.Against.NullOrWhiteSpace(command.Title, nameof(command.Title));
Guard.Against.Default(command.AuthorId, nameof(command.AuthorId));

// GOOD: throw custom exception directly when Guard.Against is not expressive enough
if (command.Title.StartsWith(' '))
{
    throw new PostTitleCannotStartWithSpaceException();
}

// BAD: throwing wrong exception type from a validator
if (string.IsNullOrWhiteSpace(command.Title))
{
    throw new ArgumentNullException(nameof(command.Title)); // BAD: wrong category, produces 500
}
```

---

## What NOT to Do

```csharp
// BAD: throwing a generic exception from a handler
internal sealed class PublishPostCommandHandler : ICommandHandler<PublishPostCommand>
{
    public async Task HandleAsync(PublishPostCommand command, CancellationToken cancellationToken)
    {
        var post = await _repository.GetByIdAsync(command.PostId, cancellationToken);

        if (post is null)
        {
            throw new InvalidOperationException("Post not found."); // BAD: wrong type, produces 500
        }

        post.Publish();
        await _repository.UpdateAsync(post, cancellationToken);
    }
}

// GOOD: repository throws the correct type; handler does not check for null
internal sealed class PublishPostCommandHandler : ICommandHandler<PublishPostCommand>
{
    private readonly IPostRepository _postRepository;

    public PublishPostCommandHandler(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task HandleAsync(PublishPostCommand command, CancellationToken cancellationToken)
    {
        var post = await _postRepository.GetByIdAsync(command.PostId, cancellationToken);
        // GetByIdAsync throws PostNotFoundException (404) if not found

        post.Publish();
        // Publish() throws PostAlreadyPublishedException (409) if already published

        await _postRepository.UpdateAsync(post, cancellationToken);
    }
}
```

---

## Project-Specific Exception Types

> **Note:** This section is filled in per project.

| Exception Class | Category | Location | HTTP Status |
|:---|:---|:---|:---|
| _(example) `PostNotFoundException`_ | Resource Not Found | `Domain/Posts/Exceptions/` | 404 |
| _(example) `PostAlreadyPublishedException`_ | Domain Invariant | `Domain/Posts/Exceptions/` | 409 |
| _(example) `PostTitleRequiredException`_ | Validation | `Application.Write.Contracts/Posts/Exceptions/` | 400 |

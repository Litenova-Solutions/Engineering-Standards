# Exception Hierarchy

This document defines the exception hierarchy used across all Litenova Solutions projects. It is a critical contract document. Deviating from it produces incorrect HTTP responses and breaks the agreement between the API layer and its clients.

---

## Why This Matters

When a server returns a 500 response to a client, the client has no idea whether the operation failed because the input was invalid, the resource was not found, or an unexpected error occurred. Each of these situations requires a different client action: show a validation message, navigate to a not-found page, or show a generic error and retry. A single status code for all failures gives clients no actionable information.

Without a defined hierarchy, teams inevitably drift into patterns like throwing `InvalidOperationException` from domain logic and `ArgumentException` from validators. Both produce 500 responses in a default ASP.NET Core setup. Clients cannot differentiate them, and the codebase has no consistent contract for what "an error" means.

The exception hierarchy defines exactly three failure categories for expected failures. Every exception class in this codebase maps to exactly one category. The `GlobalExceptionHandler` maps categories to HTTP status codes automatically. This is the contract.

---

## The Three Categories

| Category | Base Class | Location | HTTP Status | When to Throw |
|---|---|---|---|---|
| Input Validation Failure | `ApplicationValidationException` | `Application/Shared/Exceptions/` | 400 | Thrown by `ICommandValidator` and `IQueryValidator` implementations when input data is structurally invalid (missing required field, value out of range, malformed format). |
| Resource Not Found | `AggregateNotFoundException` | `Domain/Shared/Exceptions/` | 404 | Thrown by repository implementations when an aggregate cannot be located by its ID. |
| Domain Invariant Violation | `DomainException` | `Domain/Shared/Exceptions/` | 409 | Thrown by aggregate methods when the requested operation is not permitted in the current state (e.g., publishing an already-published post). |
| Unhandled | _(none — any `Exception`)_ | Anywhere | 500 | Any exception that does not match the above categories. These indicate a bug or an unexpected external failure. |

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

// Application/Shared/Exceptions/ApplicationValidationException.cs
abstract class ApplicationValidationException : Exception
{
    protected ApplicationValidationException(string message)
        : base(message) { }
}
```

All three base classes are `abstract`. You never throw a base class directly. You always throw a concrete subclass that names the specific failure.

---

## Concrete Exception Examples

### Resource Not Found

```csharp
// Domain/Posts/Exceptions/PostNotFoundException.cs
sealed class PostNotFoundException : AggregateNotFoundException
{
    public PostNotFoundException(PostId id)
        : base($"Post '{id.Value}' was not found.") { }
}
```

### Domain Invariant Violation

```csharp
// Domain/Posts/Exceptions/PostAlreadyPublishedException.cs
sealed class PostAlreadyPublishedException : DomainException
{
    public PostAlreadyPublishedException(PostId id)
        : base($"Post '{id.Value}' is already published and cannot be published again.") { }
}
```

### Input Validation Failure

```csharp
// Application/Posts/Create/Exceptions/PostTitleRequiredException.cs
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
sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
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
            logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            logger.LogWarning(exception, "Handled exception ({StatusCode}): {Message}", statusCode, exception.Message);
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

## The ApplicationGuard Helper

For common validation patterns, use the `ApplicationGuard` helper to throw the correct exception type without needing to write an `if` block every time.

```csharp
static class ApplicationGuard
{
    public static void AgainstDefault<T>(T value, Func<ApplicationValidationException> exceptionFactory)
        where T : struct
    {
        if (value.Equals(default(T)))
        {
            throw exceptionFactory();
        }
    }

    public static void AgainstNullOrWhiteSpace(
        string? value,
        Func<ApplicationValidationException> exceptionFactory)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw exceptionFactory();
        }
    }
}
```

Usage:

```csharp
ApplicationGuard.AgainstNullOrWhiteSpace(command.Title, () => new PostTitleRequiredException());
```

---

## Throw Site Contract

This table defines exactly where each exception category is thrown. Do not throw an exception from the wrong site.

| Exception Category | Thrown By | Never Thrown By |
|---|---|---|
| `ApplicationValidationException` | `ICommandValidator`, `IQueryValidator` implementations | Handlers, aggregates, repositories |
| `AggregateNotFoundException` | Repository implementations (`GetByIdAsync`) | Handlers, validators, aggregates, endpoints |
| `DomainException` | Aggregate root methods | Handlers, validators, repositories, endpoints |

---

## What NOT to Do

```csharp
// BAD: throwing a generic exception from a handler
sealed class PublishPostCommandHandler : ICommandHandler<PublishPostCommand>
{
    public async Task HandleAsync(PublishPostCommand command, CancellationToken cancellationToken)
    {
        var post = await _repository.GetByIdAsync(command.PostId, cancellationToken);

        if (post is null)
        {
            throw new InvalidOperationException("Post not found."); // ← wrong type, wrong throw site, produces 500
        }

        post.Publish();
        await _repository.UpdateAsync(post, cancellationToken);
    }
}

// GOOD: repository throws the correct type; handler does not check for null
sealed class PublishPostCommandHandler(IPostRepository postRepository) : ICommandHandler<PublishPostCommand>
{
    public async Task HandleAsync(PublishPostCommand command, CancellationToken cancellationToken)
    {
        var post = await postRepository.GetByIdAsync(command.PostId, cancellationToken);
        // ← GetByIdAsync throws PostNotFoundException (a 404) if not found

        post.Publish();
        // ← Publish() throws PostAlreadyPublishedException (a 409) if already published

        await postRepository.UpdateAsync(post, cancellationToken);
    }
}
```

---

## Project-Specific Exception Types

> **Note:** This section is filled in per-project. It lists all concrete exception types defined in the project so that engineers and agents can find them quickly.

When filling in this section, list every custom exception class with its category, file path, and the HTTP status code it produces.

| Exception Class | Category | Location | HTTP Status |
|---|---|---|---|
| _(example) `PostNotFoundException`_ | Resource Not Found | `Domain/Posts/Exceptions/` | 404 |
| _(example) `PostAlreadyPublishedException`_ | Domain Invariant | `Domain/Posts/Exceptions/` | 409 |
| _(example) `PostTitleRequiredException`_ | Validation | `Application/Posts/Create/Exceptions/` | 400 |

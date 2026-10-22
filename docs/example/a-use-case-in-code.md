# A Use Case in Code

## Intent

A use case is one command, query, or reaction with its permissions, results, and scenarios. Implementing one means turning its written record into code in the layer that owns each part. Expenses is the example product the docs follow, in which employees submit work expenses with receipts; this page follows its Submit expense use case from the written record into .NET code, naming where each file lives across the backend projects, then showing the Expense aggregate, the command and its handler, the endpoint, and the acceptance scenario that proves the code matches the record.

## Where This Page Sits

```text
USE CASE  Submit expense (command)
  +-- result    Submitted, Receipt missing
        +-- scenario  Submitting with a receipt succeeds  <- the review line
              |
              +-- below the line: aggregate, command, endpoint, test  <- this page
```

## Where Each File Lives

A .NET backend holds 5 projects: Domain, Application.Abstractions, Application, Infrastructure, and WebApi (`litespec/backend/dotnet/architecture#use-five-application-projects`). The [.NET Architecture](../backend/dotnet/architecture.md) page states the 5 projects. The use-case record itself, with its results and scenarios, is shown on [Modules and Records](modules-and-records.md).

Every layer organizes its folders by module, then aggregate, then use case (`litespec/backend/architecture#organize-every-layer-by-module-and-use-case`). The [Backend Architecture](../backend/architecture.md) page states the folder rule. The example groups Spending into Expenses, Policies, and Receipts folders, so Submit expense nests under Spending, then Expenses, then SubmitExpense. The project's `litespec.project.json` points the model builder at these roots through its `application`, `domain`, and `webapi` stack paths with `testRoots` beside them. The folders below sit under `examples/expenses/apps/api/`.

| Project | Submit expense files |
|:---|:---|
| `Expenses.Domain` | `Spending/Expenses/` with the aggregate, its states, events, exceptions, and repository interface, plus `Spending/Policies/IPolicyRepository.cs` for the active policy |
| `Expenses.Application.Abstractions` | `IClock.cs`, the shared clock contract; it holds only contracts more than one module names |
| `Expenses.Application` | `Spending/Expenses/SubmitExpense/` with the command, the handler, and the result |
| `Expenses.Infrastructure` | The example holds no Infrastructure project; in a project, the repository implementation sits under one persistence folder |
| `Expenses.WebApi` | `Endpoints/Spending/Expenses/SubmitExpense/SubmitExpenseEndpoint.cs`, with `SubmitExpenseRequestModel.cs` and `SubmitExpenseResponseModel.cs` beside it |

Each C# file takes its primary type's name (`litespec/backend/dotnet/naming#match-c-files-and-primary-types`). The [.NET Naming and Code Style](../backend/dotnet/naming.md) page states the file rule. The repository implementation sits with the other persistence types under one persistence folder (`litespec/backend/dotnet/persistence#use-this-infrastructure-layout`). The [.NET Persistence](../backend/dotnet/persistence.md) page states that layout.

The code on this page shows the shape the stack pages require and is not a compiled solution: the example holds no project or solution files, and its samples exist to give the model builder its anchors. The example holds the Domain and Application declarations with the endpoint and the acceptance and integration tests; it holds no Infrastructure project.

## The Expense Aggregate

The aggregate `aggregate/spending.expense` gives Expense 4 states: Submitted, Approved, Rejected, and Reimbursed. Each aggregate takes a folder named with its plural root name, holding its own states, events, exceptions, and concepts (`litespec/backend/domain#organize-a-module-by-aggregate-and-concept`). The [Domain Layer](../backend/domain.md) page states the module layout.

Every public member carries XML documentation stating the business fact it represents (`litespec/backend/dotnet/domain#document-every-public-domain-contract`). The [.NET Domain Layer](../backend/dotnet/domain.md) page states the documentation rule.

The aggregate exposes its lifecycle only through one `State` property, backed by an abstract `ExpenseState` record with one sealed record per state (`litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records`). The submitted state carries no data; the approved and rejected states carry who decided and when, the rejected state also carries the reason, and the reimbursed state carries the reimbursement time.

```csharp
namespace Expenses.Domain.Spending.Expenses;

/// <summary>One lifecycle state of an expense.</summary>
public abstract record ExpenseState;

/// <summary>The expense awaits a decision.</summary>
public sealed record ExpenseSubmittedState : ExpenseState;

/// <summary>The expense was approved.</summary>
public sealed record ExpenseApprovedState(Guid ApprovedBy, DateTimeOffset DecidedAt) : ExpenseState;

/// <summary>The expense was rejected.</summary>
public sealed record ExpenseRejectedState(Guid RejectedBy, DateTimeOffset DecidedAt, string Reason) : ExpenseState;

/// <summary>The expense was reimbursed.</summary>
public sealed record ExpenseReimbursedState(DateTimeOffset ReimbursedAt) : ExpenseState;
```

The named factory `Submit` is the only way to create an expense. It creates one submitted expense for one employee, names the employee by ID only (`litespec/backend/domain#reference-other-aggregates-by-id`), and starts the expense in the submitted state. It refuses an expense above the receipt threshold that carries no receipt, and the threshold it checks against is the active policy's `ReceiptThreshold`, the 25 EUR that `decision/0001-receipt-threshold` sets.

```csharp
    /// <summary>Submits one expense, refusing one above the receipt threshold that carries no receipt.</summary>
    public static Expense Submit(Guid id, Guid employeeId, Money total, Guid? receiptId, Money receiptThreshold)
    {
        if (receiptId is null && total.Amount > receiptThreshold.Amount)
        {
            throw new ExpenseReceiptMissingException();
        }

        return new Expense(id, employeeId, total, receiptId);
    }
```

A rejected business rule throws its own `DomainException` type, named for the aggregate and the failed rule and carrying a stable code (`litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions`, `litespec/workspace/naming#name-exceptions-by-failed-rule`). The [Naming and Code Style](../workspace/naming.md) page states the exception name. The code below is the refusal result's code from the use-case record.

```csharp
namespace Expenses.Domain.Spending.Expenses.Exceptions;

/// <summary>An expense above the receipt threshold carries no receipt.</summary>
public sealed class ExpenseReceiptMissingException()
    : DomainException("An expense above the receipt threshold carries no receipt.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "spending.receipt-missing";
}
```

The submitted fact is an immutable record named for its aggregate and fact, carrying business data only: the expense and employee identities with the amount and currency (`litespec/backend/dotnet/domain#raise-immutable-domain-facts`).

```csharp
namespace Expenses.Domain.Spending.Expenses.Events;

/// <summary>An expense was submitted.</summary>
public sealed record ExpenseSubmittedEvent(Guid ExpenseId, decimal Amount, string Currency, Guid EmployeeId) : IDomainEvent;
```

Domain owns one repository interface per aggregate serving that aggregate only, with Domain types and no query surface (`litespec/backend/dotnet/domain#keep-repository-interfaces-in-domain`). `IExpenseRepository` loads, stages, and deletes expenses, and `IPolicyRepository` loads the active policy that carries the receipt threshold.

```csharp
namespace Expenses.Domain.Spending.Expenses;

/// <summary>Loads and stages expenses; queries read through the read session instead.</summary>
public interface IExpenseRepository
{
    /// <summary>Loads one expense by its identity.</summary>
    Task<Expense> GetAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>Stages a new or changed expense for the pipeline's one commit.</summary>
    void Store(Expense expense);

    /// <summary>Deletes one expense with the personal data it holds.</summary>
    void Delete(Guid id);
}
```

```csharp
namespace Expenses.Domain.Spending.Policies;

/// <summary>Loads and stages the company spending policy.</summary>
public interface IPolicyRepository
{
    /// <summary>Loads the active policy.</summary>
    Task<Policy> GetActiveAsync(CancellationToken cancellationToken);

    /// <summary>Stages a changed policy for the pipeline's one commit.</summary>
    void Store(Policy policy);
}
```

## The Command and Its Handler

Submit expense owns one use-case folder with its command, handler, and result (`litespec/backend/application#use-this-use-case-layout`, `litespec/backend/dotnet/application#use-the-operation-folder-layout`). The [Application Layer](../backend/application.md) and the [.NET Application Layer](../backend/dotnet/application.md) pages state the folder layout. The command is an immutable record carrying the expense and employee identities with the amount, currency, and receipt (`litespec/backend/application#keep-messages-immutable`).

```csharp
namespace Expenses.Application.Spending.Expenses.SubmitExpense;

public sealed record SubmitExpenseCommand(Guid ExpenseId, Guid EmployeeId, decimal Amount, string Currency, Guid? ReceiptId);
```

The receipt precondition is enforced where the aggregate is created: the `Expense.Submit` factory throws, so the handler carries no rule logic of its own. The record needs `permission/submit-expense`, and the authorization guard checks that permission from the message, so the handler holds no authorization logic either (`litespec/backend/application#enforce-target-authorization-in-the-pipeline`).

The handler is internal and sealed (`litespec/backend/dotnet/architecture#keep-implementation-types-internal`). Its method ends in `Async` and takes its cancellation token last (`litespec/backend/dotnet/naming#name-asynchronous-methods-completely`). The handler loads the active policy through its repository (`litespec/backend/dotnet/persistence#stage-aggregate-writes-through-repositories`), calls `Expense.Submit`, stages the new expense, and returns a `SubmitExpenseCommandResult`, leaving commit, error mapping, and authorization to their owners (`litespec/backend/application#keep-command-handlers-narrow`). Exactly one post-handler commits after it (`litespec/backend/dotnet/persistence#commit-once-in-the-command-pipeline`).

```csharp
using Expenses.Domain;
using Expenses.Domain.Spending.Expenses;
using Expenses.Domain.Spending.Policies;
using LiteBus.Commands.Abstractions;

namespace Expenses.Application.Spending.Expenses.SubmitExpense;

internal sealed class SubmitExpenseCommandHandler(
    IExpenseRepository expenses,
    IPolicyRepository policies) : ICommandHandler<SubmitExpenseCommand, SubmitExpenseCommandResult>
{
    public async Task<SubmitExpenseCommandResult> HandleAsync(
        SubmitExpenseCommand command,
        CancellationToken cancellationToken)
    {
        var policy = await policies.GetActiveAsync(cancellationToken);
        var expense = Expense.Submit(
            command.ExpenseId,
            command.EmployeeId,
            Money.Create(command.Amount, command.Currency),
            command.ReceiptId,
            policy.ReceiptThreshold);
        expenses.Store(expense);
        return new SubmitExpenseCommandResult(expense.Id);
    }
}
```

The result carries only the new expense identity, the one value the caller needs (`litespec/backend/application#return-use-case-results`). The result below is the example's `SubmitExpenseCommandResult.cs` file, and the integration test reads `submitted.ExpenseId` from it.

```csharp
namespace Expenses.Application.Spending.Expenses.SubmitExpense;

public sealed record SubmitExpenseCommandResult(Guid ExpenseId);
```

## The Endpoint

The endpoint lives at `Expenses.WebApi/Endpoints/Spending/Expenses/SubmitExpense/SubmitExpenseEndpoint.cs`, with its request and response models beside it (`litespec/backend/api#use-this-endpoint-layout`). The [HTTP API](../backend/api.md) page states the endpoint layout.

One class owns one route: it converts HTTP input to the command, dispatches through the command mediator, and maps the result back to HTTP (`litespec/backend/dotnet/api#use-one-endpoint-per-operation`). The [.NET HTTP API](../backend/dotnet/api.md) page states the endpoint contract. The submitter is the signed-in employee, read from verified claims rather than from the request body (`litespec/backend/application#enforce-target-authorization-in-the-pipeline`), and the server creates the new expense's identity. The command travels through `ICommandMediator.SendAsync` (`litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points`). Submitting creates an expense resource, so the route names that resource (`litespec/backend/api#keep-routes-resource-oriented`).

```csharp
using System.Security.Claims;
using Expenses.Application.Spending.Expenses.SubmitExpense;
using LiteBus.Commands.Abstractions;

namespace Expenses.WebApi.Endpoints.Spending.Expenses.SubmitExpense;

internal sealed class SubmitExpenseEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/expenses", HandleAsync)
            .WithName("SubmitExpense")
            .WithSummary("Submit a work expense.")
            .Produces<SubmitExpenseResponseModel>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);
    }

    private static async Task<Results<Created<SubmitExpenseResponseModel>, ProblemHttpResult>> HandleAsync(
        SubmitExpenseRequestModel request,
        ClaimsPrincipal user,
        ICommandMediator mediator,
        CancellationToken cancellationToken)
    {
        // The submitter is the signed-in employee, read from verified claims, never from the request body.
        var employeeId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await mediator.SendAsync(
            new SubmitExpenseCommand(Guid.CreateVersion7(), employeeId, request.Amount, request.Currency, request.ReceiptId),
            cancellationToken);

        return TypedResults.Created(
            $"/api/expenses/{result.ExpenseId}",
            new SubmitExpenseResponseModel(result.ExpenseId));
    }
}
```

The operation declares a stable operation ID, a summary, and its success and failure metadata (`litespec/backend/dotnet/api#declare-operation-metadata-in-the-contract`). The record carries no HTTP status: the stack derives it from the outcome table, so creating a readable resource answers 201 with the resource location (`litespec/backend/api#use-consistent-status-codes`). The refusal carries no mapping here: the global handler turns the refusal code into a stable Problem Details answer (`litespec/backend/dotnet/api#derive-http-statuses-from-refusal-codes`, `litespec/backend/api#defer-error-mapping-to-the-global-handler`, `litespec/backend/api#return-stable-problem-details`). The request and response models belong to WebApi, since each layer owns its contract types (`litespec/backend/architecture#own-each-layers-contract-types`).

## The Acceptance Scenario

A large backend proves its behavior with an Acceptance suite (`litespec/backend/testing#keep-the-test-suites-the-size-requires`). The [Backend Testing](../backend/testing.md) page states the suites, and the [.NET Testing](../backend/dotnet/testing.md) page states their .NET form. The scenario path mirrors the production folders (`litespec/backend/testing#mirror-production-module-names`): `examples/expenses/apps/api/tests/Expenses.Acceptance.Tests/Spending/Expenses/SubmitExpense/SubmitExpenseScenarios.cs`.

The scenario below is the example's file. Its `proves` tag names the scenario, and its When step belongs to the `SubmitExpenseSteps` use case steps class (`litespec/backend/testing#tag-the-test-that-proves-each-scenario`, `litespec/backend/dotnet/testing#prove-each-scenario-with-a-test-that-calls-its-use-case`). The tag is the test's only record citation.

```csharp
namespace Expenses.Acceptance.Tests.Spending.Expenses.SubmitExpense;

public sealed class SubmitExpenseScenarios
{
    /// <proves>scenario/submit-expense.submitting-with-a-receipt-succeeds</proves>
    public Task Submitting_with_a_receipt_succeedsAsync() => Runner.RunScenarioAsync(
        when => new SubmitExpenseSteps().SubmitAnExpenseAsync("employee-1"),
        then => new SubmitExpenseSteps().TheExpenseIsSubmittedAsync());
}
```

Both steps match the scenario: the When step performs the action, the employee submitting the expense with the receipt; the Then step checks the expectation, the expense being submitted. Both steps live in `SubmitExpenseSteps`.

The steps class calls the public API through `ExpensesWorld`, the shared helper in `examples/expenses/apps/api/tests/Expenses.Acceptance.Tests/Support/ExpensesWorld.cs`. The When step signs in as the employee and posts the Submit expense request to `POST /api/expenses`, then names the returned identity `expense-1`; the Then step asserts that the last answer carries status 201 Created. [Executable BDD Acceptance Tests](../backend/dotnet/ext/bdd.md) states how a steps class reaches the public boundary.

```csharp
using System.Net;
using System.Net.Http.Json;
using Expenses.Acceptance.Tests.Support;

namespace Expenses.Acceptance.Tests.Spending.Expenses.SubmitExpense;

public sealed class SubmitExpenseSteps
{
    public async Task SubmitAnExpenseAsync(string employee)
    {
        ExpensesWorld.SignInAs(employee);
        await ExpensesWorld.PostAsync("/api/expenses", new
        {
            amount = 48.90m,
            currency = "EUR",
            receiptId = ExpensesWorld.IdOf("receipt-1"),
        });

        var created = await ExpensesWorld.LastResponse!.Content.ReadFromJsonAsync<SubmittedExpense>();
        ExpensesWorld.Name("expense-1", created!.ExpenseId);
    }

    public Task TheExpenseIsSubmittedAsync()
    {
        Assert.Equal(HttpStatusCode.Created, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }

    private sealed record SubmittedExpense(Guid ExpenseId);
}
```

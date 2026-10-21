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

namespace Expenses.WebApi.Endpoints.Spending.Expenses.SubmitExpense;

/// <summary>The body of a submit request: the amount, its currency and the receipt, if one is attached.</summary>
public sealed record SubmitExpenseRequestModel(decimal Amount, string Currency, Guid? ReceiptId);

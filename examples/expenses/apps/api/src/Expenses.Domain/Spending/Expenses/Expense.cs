using Expenses.Domain.Spending.Expenses.Exceptions;
using Expenses.Domain.Spending.Receipts.Exceptions;

namespace Expenses.Domain.Spending.Expenses;

/// <summary>One work expense an employee submitted for approval and reimbursement.</summary>
public sealed class Expense
{
    private Expense(Guid id, Guid employeeId, Money total, Guid? receiptId)
    {
        Id = id;
        EmployeeId = employeeId;
        Total = total;
        ReceiptId = receiptId;
        State = new ExpenseSubmittedState();
    }

    /// <summary>The expense identity.</summary>
    public Guid Id { get; }

    /// <summary>The employee who submitted the expense.</summary>
    public Guid EmployeeId { get; }

    /// <summary>The exact amount with its currency.</summary>
    public Money Total { get; }

    /// <summary>The attached receipt, when one is attached.</summary>
    public Guid? ReceiptId { get; private set; }

    /// <summary>The current lifecycle state.</summary>
    public ExpenseState State { get; private set; }

    /// <summary>Submits one expense, refusing one above the receipt threshold that carries no receipt.</summary>
    public static Expense Submit(Guid id, Guid employeeId, Money total, Guid? receiptId, Money receiptThreshold)
    {
        if (receiptId is null && total.Amount > receiptThreshold.Amount)
        {
            throw new ExpenseReceiptMissingException();
        }

        return new Expense(id, employeeId, total, receiptId);
    }

    /// <summary>Attaches one receipt to a submitted expense.</summary>
    public void AttachReceipt(Guid receiptId)
    {
        if (State is not ExpenseSubmittedState)
        {
            throw new ReceiptExpenseDecidedException();
        }

        ReceiptId = receiptId;
    }

    /// <summary>Approves a submitted expense from another employee.</summary>
    public void Approve(Guid approverId, DateTimeOffset decidedAt)
    {
        if (approverId == EmployeeId)
        {
            throw new ExpenseApproverIsSubmitterException();
        }

        if (State is not ExpenseSubmittedState)
        {
            throw new ExpenseNotSubmittedException();
        }

        State = new ExpenseApprovedState(approverId, decidedAt);
    }

    /// <summary>Rejects a submitted expense with a reason.</summary>
    public void Reject(Guid approverId, string reason, DateTimeOffset decidedAt)
    {
        if (State is not ExpenseSubmittedState)
        {
            throw new ExpenseNotSubmittedException();
        }

        State = new ExpenseRejectedState(approverId, decidedAt, reason);
    }

    /// <summary>Reimburses an approved expense once.</summary>
    public void Reimburse(DateTimeOffset reimbursedAt)
    {
        if (State is ExpenseReimbursedState)
        {
            throw new ExpenseAlreadyReimbursedException();
        }

        if (State is not ExpenseApprovedState)
        {
            throw new ExpenseNotApprovedException();
        }

        State = new ExpenseReimbursedState(reimbursedAt);
    }

    /// <summary>Refuses an export with no approved expense.</summary>
    public static void RequireApprovedForExport(int approvedCount)
    {
        if (approvedCount == 0)
        {
            throw new ExpenseNothingApprovedException();
        }
    }
}

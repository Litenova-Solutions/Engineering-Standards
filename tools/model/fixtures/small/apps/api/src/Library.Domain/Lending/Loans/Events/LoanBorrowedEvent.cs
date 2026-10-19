namespace Library.Domain.Lending.Loans.Events;

public sealed record LoanBorrowedEvent(Guid LoanId, Guid CopyId, Guid ReaderId, DateOnly DueDate);

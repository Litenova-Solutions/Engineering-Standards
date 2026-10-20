namespace Library.Domain.Lending.Loans.Events;

public sealed record LoanExtendedEvent(Guid LoanId, DateOnly NewDueDate);

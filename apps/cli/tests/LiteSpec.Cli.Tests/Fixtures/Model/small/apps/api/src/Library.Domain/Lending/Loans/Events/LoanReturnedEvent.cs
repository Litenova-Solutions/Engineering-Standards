namespace Library.Domain.Lending.Loans.Events;

public sealed record LoanReturnedEvent(Guid LoanId, DateTimeOffset ReturnedAt);

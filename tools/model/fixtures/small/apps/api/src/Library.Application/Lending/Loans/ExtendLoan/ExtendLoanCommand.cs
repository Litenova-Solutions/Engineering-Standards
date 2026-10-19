namespace Library.Application.Lending.Loans.ExtendLoan;

public sealed record ExtendLoanCommand(Guid LoanId, int Days);

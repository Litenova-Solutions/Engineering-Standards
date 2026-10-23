namespace Library.Domain.Lending.Loans.Exceptions;

/// <summary>The loan is not active.</summary>
public sealed class LoanNotActiveException()
    : DomainException("The loan is not active.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.loan-not-active";
}

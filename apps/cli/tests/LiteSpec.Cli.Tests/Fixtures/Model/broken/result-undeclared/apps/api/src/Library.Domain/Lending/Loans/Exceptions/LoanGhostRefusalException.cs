namespace Library.Domain.Lending.Loans.Exceptions;

/// <summary>The ghost refusal no result declares.</summary>
public sealed class LoanGhostRefusalException()
    : DomainException("The loan ghost refused.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.ghost-refusal";
}

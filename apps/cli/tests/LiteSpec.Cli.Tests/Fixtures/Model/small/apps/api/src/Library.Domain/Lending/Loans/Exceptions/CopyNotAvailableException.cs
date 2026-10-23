namespace Library.Domain.Lending.Loans.Exceptions;

/// <summary>The copy is not available.</summary>
public sealed class CopyNotAvailableException()
    : DomainException("The copy is not available.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.copy-not-available";
}

namespace Library.Domain.Lending.Loans.Exceptions;

/// <summary>The loan extension is refused.</summary>
public sealed class LoanExtensionRefusedException()
    : DomainException("The loan extension is refused.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.extension-refused";
}

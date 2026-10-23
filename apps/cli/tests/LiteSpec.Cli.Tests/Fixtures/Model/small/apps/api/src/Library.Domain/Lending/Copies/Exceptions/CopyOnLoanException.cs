namespace Library.Domain.Lending.Copies.Exceptions;

/// <summary>The copy is on loan.</summary>
public sealed class CopyOnLoanException()
    : DomainException("The copy is on loan.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.copy-on-loan";
}

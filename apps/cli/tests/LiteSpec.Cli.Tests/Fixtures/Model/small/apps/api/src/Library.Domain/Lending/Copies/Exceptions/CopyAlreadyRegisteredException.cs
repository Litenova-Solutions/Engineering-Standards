namespace Library.Domain.Lending.Copies.Exceptions;

/// <summary>The copy is already registered.</summary>
public sealed class CopyAlreadyRegisteredException()
    : DomainException("The copy is already registered.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.copy-already-registered";
}

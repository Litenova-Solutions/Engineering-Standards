namespace Library.Domain.Lending.Holds.Exceptions;

/// <summary>The hold is already waiting.</summary>
public sealed class HoldAlreadyWaitingException()
    : DomainException("The hold is already waiting.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.hold-already-waiting";
}

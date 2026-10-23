namespace Library.Domain.Lending.Holds.Exceptions;

/// <summary>The hold is not waiting.</summary>
public sealed class HoldNotWaitingException()
    : DomainException("The hold is not waiting.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "lending.hold-not-waiting";
}

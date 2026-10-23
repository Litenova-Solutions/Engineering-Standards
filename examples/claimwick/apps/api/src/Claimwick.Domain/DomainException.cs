namespace Claimwick.Domain;

/// <summary>The base of every business rejection in Claimwick.</summary>
public abstract class DomainException(string message) : Exception(message)
{
    /// <summary>The stable failure code.</summary>
    public abstract string Code { get; }
}

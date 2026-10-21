namespace Expenses.Application.Abstractions;

/// <summary>The current time, passed into Domain so a test can fix it.</summary>
public interface IClock
{
    /// <summary>The current UTC time.</summary>
    DateTimeOffset UtcNow { get; }
}

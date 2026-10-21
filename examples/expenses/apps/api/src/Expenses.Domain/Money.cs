namespace Expenses.Domain;

/// <summary>One exact amount with its ISO 4217 currency code.</summary>
public sealed record Money
{
    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    /// <summary>The exact decimal amount.</summary>
    public decimal Amount { get; }

    /// <summary>The ISO 4217 currency code.</summary>
    public string Currency { get; }

    /// <summary>Creates one amount with its currency.</summary>
    public static Money Create(decimal amount, string currency) => new(amount, currency);

    /// <inheritdoc />
    public override string ToString() => $"{Amount} {Currency}";
}

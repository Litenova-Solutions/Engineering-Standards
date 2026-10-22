namespace Library.Domain.Lending.Copies;

public sealed class Copy
{
    public Guid Id { get; init; }

    public void Retire(bool onLoan)
    {
        if (onLoan)
            throw new InvalidOperationException("lending.copy-on-loan");
    }
}

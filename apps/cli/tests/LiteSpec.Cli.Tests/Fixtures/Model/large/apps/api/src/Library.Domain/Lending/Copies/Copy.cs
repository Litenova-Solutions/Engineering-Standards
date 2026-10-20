namespace Library.Domain.Lending.Copies;

public sealed class Copy
{
    public Guid Id { get; init; }

    public void Retire(bool onLoan)
    {
        if (onLoan)
            throw new InvalidOperationException("failure/lending.copy_on_loan");
    }
}

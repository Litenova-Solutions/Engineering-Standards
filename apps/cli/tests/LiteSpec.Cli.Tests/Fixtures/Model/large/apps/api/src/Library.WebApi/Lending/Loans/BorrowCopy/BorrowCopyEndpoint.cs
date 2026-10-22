namespace Library.WebApi.Lending.Loans.BorrowCopy;

public static class BorrowCopyEndpoint
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/api/lending/borrow-copy", Handle).WithName("BorrowCopy");
    }

    private static void Handle()
    {
    }
}

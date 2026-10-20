using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Book;

/// <summary>Proves <c>litespec book</c> writes the project book from a fixture model, the port of <c>tools/book/book.mjs</c>.</summary>
public sealed class BookCommandTests
{
    /// <summary>The book writes <c>index.html</c>, the two assets, and one page per record.</summary>
    [Fact]
    public void Book_Writes_The_Project_Book()
    {
        using var temp = Cli.Temp("book");
        var result = Cli.Run(
            "book",
            "--model", Cli.Fixture("Book/model.json"),
            "--findings", Cli.Fixture("Book/findings.json"),
            "--out", temp.Path);
        Assert.Equal(0, result.Status);
        Assert.True(File.Exists(Path.Combine(temp.Path, "index.html")), "index.html was not written.");
        Assert.True(File.Exists(Path.Combine(temp.Path, "assets", "book.css")), "assets/book.css was not written.");
        Assert.True(File.Exists(Path.Combine(temp.Path, "assets", "book.js")), "assets/book.js was not written.");
        // business-record/lending.loan in the fixture model maps to business-record/lending/loan.html.
        Assert.True(
            File.Exists(Path.Combine(temp.Path, "business-record", "lending", "loan.html")),
            "No record page was written.");
    }

    /// <summary>A missing --model exits 2, the usage error code book.mjs returns for bad arguments.</summary>
    [Fact]
    public void Book_Without_Model_Exits_2()
    {
        using var temp = Cli.Temp("book");
        var result = Cli.Run("book", "--out", temp.Path);
        Assert.Equal(2, result.Status);
        Assert.Contains("--model", result.Output);
    }
}

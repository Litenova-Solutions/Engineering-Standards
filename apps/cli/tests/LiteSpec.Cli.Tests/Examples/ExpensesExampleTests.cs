using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Examples;

/// <summary>
///     The Expenses example in <c>examples/expenses/</c> is the product the Example
///     docs follow and quote, so it must keep passing every consumer check the docs
///     show: the project and page checks, the controlled UI, and the model.
/// </summary>
public sealed class ExpensesExampleTests
{
    static readonly string Root = Path.Combine(Cli.Repository, "examples", "expenses");

    [Fact(DisplayName = "the Expenses example passes the consumer check")]
    public void PassesConsumer() => AssertPasses(Cli.Run("consumer", "--root", Root));

    [Fact(DisplayName = "the Expenses example passes the UI check")]
    public void PassesUi() => AssertPasses(Cli.Run("ui", "--root", Root));

    [Fact(DisplayName = "the Expenses example passes the model check with its one known gap")]
    public void PassesModelCheck()
    {
        var result = Cli.Run("model", "check", "--root", Root);
        AssertPasses(result);
        Assert.Contains("0 findings, 1 known.", result.Output);
    }

    static void AssertPasses(CliResult result) => Assert.True(result.Status == 0, result.Output);
}

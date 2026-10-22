using Record = LiteSpec.Model.Record;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the reaction-without-trigger check against hand-built models.</summary>
public sealed class ReactionTriggerCheckTests
{
    [Fact]
    public void Reaction_Without_A_Trigger_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"kind": "reaction"}"""));

        Assert.Contains("reaction-without-trigger", TestModel.Codes(model));
    }

    [Theory]
    [InlineData("\"event/loan.loan-borrowed\"")]
    [InlineData("[\"event/loan.loan-borrowed\"]")]
    [InlineData("{\"events\": [\"event/loan.loan-borrowed\"]}")]
    [InlineData("{\"schedule\": \"nightly\"}")]
    [InlineData("{\"deadline\": \"seven days after the loan starts\"}")]
    [InlineData("\"nightly\"")]
    public void Reaction_With_A_Trigger_Passes(string trigger)
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), "{\"kind\": \"reaction\", \"trigger\": " + trigger + "}"));

        Assert.DoesNotContain("reaction-without-trigger", TestModel.Codes(model));
    }

    [Theory]
    [InlineData("\"\"")]
    [InlineData("[]")]
    [InlineData("{}")]
    [InlineData("{\"events\": []}")]
    public void Reaction_With_An_Empty_Trigger_Reports(string trigger)
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), "{\"kind\": \"reaction\", \"trigger\": " + trigger + "}"));

        Assert.Contains("reaction-without-trigger", TestModel.Codes(model));
    }

    [Fact]
    public void Command_Without_A_Trigger_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"kind": "command"}"""));

        Assert.DoesNotContain("reaction-without-trigger", TestModel.Codes(model));
    }
}

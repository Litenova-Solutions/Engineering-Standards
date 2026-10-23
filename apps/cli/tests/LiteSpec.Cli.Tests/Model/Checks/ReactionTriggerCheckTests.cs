using Record = LiteSpec.Model.Record;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the reaction-trigger-unresolved check against hand-built models.</summary>
public sealed class ReactionTriggerCheckTests
{
    [Fact]
    public void Reaction_Without_A_Trigger_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"status": "reviewed", "issues": ["use-case/lending.notify-overdue"]}"""));

        Assert.Contains("reaction-trigger-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_With_An_Unresolved_Trigger_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"status": "reviewed", "on": ["event/loan.no-such-event"], "issues": ["use-case/lending.notify-overdue"]}"""));

        Assert.Contains("reaction-trigger-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_With_A_Non_Event_Trigger_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"status": "reviewed", "on": ["use-case/lending.borrow-copy"], "issues": ["use-case/lending.notify-overdue"]}"""),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));

        Assert.Contains("reaction-trigger-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_With_An_Event_Trigger_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"status": "reviewed", "on": ["event/loan.loan-borrowed"], "issues": ["use-case/lending.notify-overdue"]}"""),
            TestModel.Record("event", "event/loan.loan-borrowed", Path.Combine(temp.Path, "loan.md"), """{"status": "reviewed", "meaning": "A copy was lent.", "carries": []}"""));

        Assert.DoesNotContain("reaction-trigger-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_With_An_Integration_Event_Trigger_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"status": "reviewed", "on": ["integration-event/loan-exported"], "issues": ["use-case/lending.notify-overdue"]}"""),
            TestModel.Record("integration-event", "integration-event/loan-exported", Path.Combine(temp.Path, "exported.md"), """{"status": "reviewed"}"""));

        Assert.DoesNotContain("reaction-trigger-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Command_Without_A_Trigger_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));

        Assert.DoesNotContain("reaction-trigger-unresolved", TestModel.Codes(model));
    }
}

using Record = LiteSpec.Model.Record;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the state-unreachable and transition-unresolved checks against hand-built models.</summary>
public sealed class LifecycleCheckTests
{
    [Fact]
    public void State_No_Transition_Reaches_Reports_State_Unreachable()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Loan(temp.Path, """{"from": "Active", "to": "Returned"}"""));

        var messages = Checker.Check(model).Findings
            .Where(finding => finding.Code == "state-unreachable")
            .Select(finding => finding.Message)
            .ToList();

        Assert.Single(messages);
        Assert.Contains("Overdue", messages[0]);
    }

    [Fact]
    public void Aggregate_Without_Transitions_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Loan(temp.Path));

        Assert.DoesNotContain("state-unreachable", TestModel.Codes(model));
        Assert.DoesNotContain("transition-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Full_Chain_Of_Transitions_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, """{"from": "Active", "to": "Returned"}""", """{"from": "Returned", "to": "Overdue"}"""));

        Assert.DoesNotContain("state-unreachable", TestModel.Codes(model));
        Assert.DoesNotContain("transition-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Transition_To_A_Missing_State_Reports_Transition_Unresolved()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Loan(temp.Path, """{"from": "Active", "to": "Vanished"}"""));

        Assert.Contains("transition-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Transition_From_A_Missing_State_Reports_Transition_Unresolved()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Loan(temp.Path, """{"from": "Vanished", "to": "Returned"}"""));

        Assert.Contains("transition-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Transition_By_A_Missing_Use_Case_Reports_Transition_Unresolved()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, """{"from": "Active", "to": "Returned", "by": "use-case/lending.nope"}"""));

        Assert.Contains("transition-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Transition_By_A_Record_That_Is_No_Use_Case_Reports_Transition_Unresolved()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, """{"from": "Active", "to": "Returned", "by": "aggregate/lending.loan"}"""));

        Assert.Contains("transition-unresolved", TestModel.Codes(model));
    }

    [Fact]
    public void Transition_By_A_Use_Case_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, """{"from": "Active", "to": "Returned", "by": "use-case/lending.return-copy"}""", """{"from": "Returned", "to": "Overdue"}"""),
            TestModel.Record("use-case", "use-case/lending.return-copy", Path.Combine(temp.Path, "return.md"), """{"kind": "command"}"""));

        Assert.DoesNotContain("transition-unresolved", TestModel.Codes(model));
        Assert.DoesNotContain("state-unreachable", TestModel.Codes(model));
    }

    static Record Loan(string root, params string[] transitions)
    {
        var states = """
            {"name": "Active", "meaning": "The loan is open."},
            {"name": "Returned", "meaning": "The copy came back."},
            {"name": "Overdue", "meaning": "The loan passed its due date."}
            """;
        var json = transitions.Length == 0
            ? $$"""{"states": [{{states}}]}"""
            : $$"""{"states": [{{states}}], "transitions": [{{string.Join(", ", transitions)}}]}""";

        return TestModel.Record("aggregate", "aggregate/lending.loan", Path.Combine(root, "loan.md"), json);
    }
}

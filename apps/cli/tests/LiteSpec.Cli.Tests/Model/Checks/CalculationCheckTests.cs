using Record = LiteSpec.Model.Record;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the calculation-without-table check against hand-built models.</summary>
public sealed class CalculationCheckTests
{
    [Fact]
    public void Calculation_Without_An_Examples_Table_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Rule(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"kind": "command"}"""),
            TestModel.Record(
                "scenario",
                "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
                Path.Combine(temp.Path, "borrow.md"),
                """{"given": "A copy sits available.", "when": "The reader borrows it.", "then": "The loan is active.", "result": "result/borrow-copy.borrowed"}"""));

        Assert.Contains("calculation-without-table", TestModel.Codes(model));
    }

    [Fact]
    public void Calculation_With_An_Examples_Table_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Rule(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"kind": "command"}"""),
            TestModel.Record(
                "scenario",
                "scenario/borrow-copy.late-fee-examples-hold",
                Path.Combine(temp.Path, "borrow.md"),
                """{"given": "A loan stands overdue.", "when": "The fee is totaled.", "then": "The fee matches the table.", "result": "result/borrow-copy.borrowed", "examples": [{"days": 3, "fee": 1.5}]}"""));

        Assert.DoesNotContain("calculation-without-table", TestModel.Codes(model));
    }

    [Fact]
    public void Calculation_Governing_An_Aggregate_Reads_The_Scenarios_Beside_It()
    {
        using var temp = Cli.Temp("checks");
        var folder = Path.Combine(temp.Path, "loan");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record(
                "rule",
                "rule/loan.late-fee-totals",
                Path.Combine(folder, "README.md"),
                """{"kind": "calculation", "statement": "A late fee totals the days overdue times the daily rate.", "governs": ["aggregate/lending.loan"]}"""),
            TestModel.Record(
                "aggregate",
                "aggregate/lending.loan",
                Path.Combine(folder, "README.md"),
                """{"states": [{"name": "Active", "meaning": "The loan is open."}]}"""),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(folder, "borrow.md"), """{"kind": "command"}"""),
            TestModel.Record(
                "scenario",
                "scenario/borrow-copy.late-fee-examples-hold",
                Path.Combine(folder, "borrow.md"),
                """{"given": "A loan stands overdue.", "when": "The fee is totaled.", "then": "The fee matches the table.", "result": "result/borrow-copy.borrowed", "examples": [{"days": 3, "fee": 1.5}]}"""));

        Assert.DoesNotContain("calculation-without-table", TestModel.Codes(model));
    }

    [Fact]
    public void Invariant_Without_An_Examples_Table_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record(
                "rule",
                "rule/loan.has-one-borrower",
                Path.Combine(temp.Path, "loan.md"),
                """{"kind": "invariant", "statement": "A loan has one borrower.", "governs": ["use-case/lending.borrow-copy"]}"""),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"kind": "command"}"""));

        Assert.DoesNotContain("calculation-without-table", TestModel.Codes(model));
    }

    [Fact]
    public void Retired_Scenario_With_Examples_Does_Not_Cover()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Rule(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"kind": "command"}"""),
            TestModel.Record(
                "scenario",
                "scenario/borrow-copy.late-fee-examples-hold",
                Path.Combine(temp.Path, "borrow.md"),
                """{"status": "retired", "given": "A loan stands overdue.", "when": "The fee is totaled.", "then": "The fee matches the table.", "result": "result/borrow-copy.borrowed", "examples": [{"days": 3, "fee": 1.5}]}"""));

        Assert.Contains("calculation-without-table", TestModel.Codes(model));
    }

    static Record Rule(string root) =>
        TestModel.Record(
            "rule",
            "rule/loan.late-fee-totals",
            Path.Combine(root, "loan.md"),
            """{"kind": "calculation", "statement": "A late fee totals the days overdue times the daily rate.", "governs": ["use-case/lending.borrow-copy"]}""");
}

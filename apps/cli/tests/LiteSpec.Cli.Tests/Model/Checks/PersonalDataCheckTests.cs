using Record = LiteSpec.Model.Record;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the personal-data-uncovered check against hand-built models.</summary>
public sealed class PersonalDataCheckTests
{
    [Fact]
    public void Personal_Field_Without_Cover_Reports_Erasure_And_Export()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, "personal"),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"kind": "command"}"""));

        var messages = Checker.Check(model).Findings
            .Where(finding => finding.Code == "personal-data-uncovered")
            .Select(finding => finding.Message)
            .ToList();

        Assert.Equal(2, messages.Count);
        Assert.Contains(messages, message => message.Contains("erasure", StringComparison.Ordinal));
        Assert.Contains(messages, message => message.Contains("export", StringComparison.Ordinal));
    }

    [Fact]
    public void Sensitive_Field_Reports_As_Personal()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Loan(temp.Path, "sensitive"));

        Assert.Contains("personal-data-uncovered", TestModel.Codes(model));
    }

    [Fact]
    public void Public_And_Internal_Fields_Pass()
    {
        using var temp = Cli.Temp("checks");
        var json = """
            {"states": [{"name": "Active", "meaning": "The loan is open."}], "data": [
              {"name": "shelf", "meaning": "The home shelf.", "classification": "public"},
              {"name": "branch", "meaning": "The owning branch.", "classification": "internal"}
            ]}
            """;
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("aggregate", "aggregate/lending.loan", Path.Combine(temp.Path, "loan.md"), json));

        Assert.DoesNotContain("personal-data-uncovered", TestModel.Codes(model));
    }

    [Fact]
    public void Erasure_And_Export_Use_Cases_Cover_The_Data()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, "personal"),
            TestModel.Record("use-case", "use-case/lending.erase-reader-data", Path.Combine(temp.Path, "erase.md"), """{"kind": "command"}"""),
            TestModel.Record("use-case", "use-case/lending.export-reader-data", Path.Combine(temp.Path, "export.md"), """{"kind": "query"}"""));

        Assert.DoesNotContain("personal-data-uncovered", TestModel.Codes(model));
    }

    [Fact]
    public void Cover_In_Another_Module_Does_Not_Count()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, "personal"),
            TestModel.Record("use-case", "use-case/archive.erase-reader-data", Path.Combine(temp.Path, "erase.md"), """{"kind": "command"}"""),
            TestModel.Record("use-case", "use-case/archive.export-reader-data", Path.Combine(temp.Path, "export.md"), """{"kind": "query"}"""));

        Assert.Contains("personal-data-uncovered", TestModel.Codes(model));
    }

    [Fact]
    public void Retired_Cover_Does_Not_Count()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            Loan(temp.Path, "personal"),
            TestModel.Record("use-case", "use-case/lending.erase-reader-data", Path.Combine(temp.Path, "erase.md"), """{"kind": "command", "status": "retired"}"""),
            TestModel.Record("use-case", "use-case/lending.export-reader-data", Path.Combine(temp.Path, "export.md"), """{"kind": "query"}"""));

        var messages = Checker.Check(model).Findings
            .Where(finding => finding.Code == "personal-data-uncovered")
            .Select(finding => finding.Message)
            .ToList();

        Assert.Single(messages);
        Assert.Contains("erasure", messages[0], StringComparison.Ordinal);
    }

    static Record Loan(string root, string classification) =>
        TestModel.Record(
            "aggregate",
            "aggregate/lending.loan",
            Path.Combine(root, "loan.md"),
            $$"""
            {"states": [{"name": "Active", "meaning": "The loan is open."}], "data": [
              {"name": "borrower-email", "meaning": "The address notices go to.", "classification": "{{classification}}"}
            ]}
            """);
}

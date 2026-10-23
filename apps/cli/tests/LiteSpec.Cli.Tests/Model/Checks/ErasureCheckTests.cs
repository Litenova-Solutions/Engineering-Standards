using Record = LiteSpec.Model.Record;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the erasure, retention, acceptance and exemption checks against hand-built models.</summary>
public sealed class ErasureCheckTests
{
    [Fact]
    public void Personal_Class_Without_Erasure_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("aggregate", "aggregate/lending.loan", Path.Combine(temp.Path, "loan.md"), """
                {"status": "reviewed", "states": [{"name": "Active", "meaning": "The loan is open."}],
                 "dataClasses": [{"name": "Borrower identity", "classification": "personal"}]}
                """));

        Assert.Contains("erasure-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Personal_Field_Without_Cover_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Loan(temp.Path, "personal"));

        Assert.Contains("erasure-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Sensitive_Field_Reports_As_Personal()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Loan(temp.Path, "sensitive"));

        Assert.Contains("erasure-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Public_And_Internal_Fields_Pass()
    {
        using var temp = Cli.Temp("checks");
        var json = """
            {"status": "reviewed", "states": [{"name": "Active", "meaning": "The loan is open."}], "data": [
              {"name": "shelf", "meaning": "The home shelf.", "classification": "public"},
              {"name": "branch", "meaning": "The owning branch.", "classification": "internal"}
            ]}
            """;
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("aggregate", "aggregate/lending.loan", Path.Combine(temp.Path, "loan.md"), json));

        Assert.DoesNotContain("erasure-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Erasure_Position_With_Enforcement_Covers_The_Data()
    {
        using var temp = Cli.Temp("checks");
        var json = """
            {"status": "reviewed", "states": [{"name": "Active", "meaning": "The loan is open."}],
             "data": [{"name": "borrower-email", "meaning": "The address notices go to.", "classification": "personal"}],
             "dataClasses": [{"name": "Borrower identity", "classification": "personal", "fields": ["borrower-email"],
               "onErasure": "erase", "basis": "business", "enforcedBy": "record-expiry"}]}
            """;
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("aggregate", "aggregate/lending.loan", Path.Combine(temp.Path, "loan.md"), json));

        Assert.DoesNotContain("erasure-undeclared", TestModel.Codes(model));
        Assert.DoesNotContain("retention-without-enforcement", TestModel.Codes(model));
    }

    [Fact]
    public void Per_Field_Exception_Covers_The_Field()
    {
        using var temp = Cli.Temp("checks");
        var json = """
            {"status": "reviewed", "states": [{"name": "Active", "meaning": "The loan is open."}],
             "data": [{"name": "borrower-email", "meaning": "The address notices go to.", "classification": "personal"}],
             "dataClasses": [{"name": "Borrower identity", "classification": "personal", "fields": ["shelf"],
               "onErasure": "erase", "basis": "business", "enforcedBy": "record-expiry",
               "exceptions": [{"field": "borrower-email", "onErasure": "pseudonymise"}]}]}
            """;
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("aggregate", "aggregate/lending.loan", Path.Combine(temp.Path, "loan.md"), json));

        Assert.Empty(Checker.Check(model).Findings.Where(finding => finding.Code == "erasure-undeclared"));
    }

    [Fact]
    public void Retention_Without_Enforcement_Reports()
    {
        using var temp = Cli.Temp("checks");
        var json = """
            {"status": "reviewed", "states": [{"name": "Active", "meaning": "The loan is open."}],
             "dataClasses": [{"name": "Borrower identity", "classification": "personal",
               "onErasure": "erase", "basis": "business"}]}
            """;
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("aggregate", "aggregate/lending.loan", Path.Combine(temp.Path, "loan.md"), json));

        Assert.Contains("retention-without-enforcement", TestModel.Codes(model));
    }

    [Fact]
    public void Retain_Without_Acceptance_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Kept(temp.Path, null));

        Assert.Contains("risk-without-acceptance", TestModel.Codes(model));
    }

    [Fact]
    public void Retain_With_An_Intent_Decision_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Kept(temp.Path, "decision/0001-loan-period"));

        Assert.DoesNotContain("risk-without-acceptance", TestModel.Codes(model));
    }

    [Fact]
    public void Exempt_Without_Review_Date_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Exempt(temp.Path, null));

        Assert.Contains("exemption-expired", TestModel.Codes(model));
    }

    [Fact]
    public void Exempt_Past_Review_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Exempt(temp.Path, "2020-01-01"));

        Assert.Contains("exemption-expired", TestModel.Codes(model));
    }

    [Fact]
    public void Exempt_Before_Review_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Exempt(temp.Path, "2035-01-01"));

        Assert.DoesNotContain("exemption-expired", TestModel.Codes(model));
    }

    static Record Loan(string root, string classification) =>
        TestModel.Record(
            "aggregate",
            "aggregate/lending.loan",
            Path.Combine(root, "loan.md"),
            $$"""
            {"status": "reviewed", "states": [{"name": "Active", "meaning": "The loan is open."}], "data": [
              {"name": "borrower-email", "meaning": "The address notices go to.", "classification": "{{classification}}"}
            ]}
            """);

    static Record Kept(string root, string? acceptedBy) =>
        TestModel.Record(
            "aggregate",
            "aggregate/lending.loan",
            Path.Combine(root, "loan.md"),
            "{\"status\": \"reviewed\", \"states\": [{\"name\": \"Active\", \"meaning\": \"The loan is open.\"}],"
            + "\"dataClasses\": [{\"name\": \"Borrower identity\", \"classification\": \"personal\","
            + "\"onErasure\": \"retain\", \"basis\": \"statute\", \"enforcedBy\": \"record-expiry\""
            + (acceptedBy is null ? "" : ", \"acceptedBy\": [\"" + acceptedBy + "\"]")
            + "}]}");

    static Record Exempt(string root, string? reviewBy) =>
        TestModel.Record(
            "aggregate",
            "aggregate/lending.loan",
            Path.Combine(root, "loan.md"),
            "{\"status\": \"reviewed\", \"states\": [{\"name\": \"Active\", \"meaning\": \"The loan is open.\"}],"
            + "\"dataClasses\": [{\"name\": \"Borrower identity\", \"classification\": \"personal\","
            + "\"onErasure\": \"exempt\", \"basis\": \"statute\", \"enforcedBy\": \"record-expiry\","
            + "\"acceptedBy\": [\"decision/0001-loan-period\"]"
            + (reviewBy is null ? "" : ", \"reviewBy\": \"" + reviewBy + "\"")
            + "}]}");
}

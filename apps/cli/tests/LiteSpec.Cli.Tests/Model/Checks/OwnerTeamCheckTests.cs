using Record = LiteSpec.Model.Record;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the owner-team check: each record's owner belongs to the team owning its path.</summary>
public sealed class OwnerTeamCheckTests
{
    [Fact]
    public void Owner_On_The_Path_Team_Passes()
    {
        using var temp = Cli.Temp("checks");
        WriteProject(temp.Path, "lending-team", "catalog-team");
        WriteCodeowners(temp.Path, "docs/behavior/** @acme/lending-team\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person"}"""));

        Assert.DoesNotContain("owner-unknown", TestModel.Codes(model));
    }

    [Fact]
    public void Owner_Outside_The_Path_Team_Reports_Owner_Unknown()
    {
        using var temp = Cli.Temp("checks");
        WriteProject(temp.Path, "lending-team", "catalog-team");
        WriteCodeowners(temp.Path, "docs/behavior/** @acme/lending-team\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "catalog-team"}"""));

        var message = Checker.Check(model).Findings.Single(finding => finding.Code == "owner-unknown").Message;
        Assert.Contains("no team", message, StringComparison.Ordinal);
    }

    [Fact]
    public void Missing_Codeowners_File_Skips_The_Team_Check()
    {
        using var temp = Cli.Temp("checks");
        WriteProject(temp.Path, "lending-team", "catalog-team");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "catalog-team"}"""));

        Assert.DoesNotContain("owner-unknown", TestModel.Codes(model));
    }

    [Fact]
    public void Unmatched_Path_Skips_The_Team_Check()
    {
        using var temp = Cli.Temp("checks");
        WriteProject(temp.Path, "lending-team", "catalog-team");
        WriteCodeowners(temp.Path, "docs/product/** @acme/product-team\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "catalog-team"}"""));

        Assert.DoesNotContain("owner-unknown", TestModel.Codes(model));
    }

    [Fact]
    public void Last_Matching_Pattern_Wins()
    {
        using var temp = Cli.Temp("checks");
        WriteProject(temp.Path, "team-a", "team-b");
        WriteCodeowners(temp.Path, "docs/** @acme/team-a\ndocs/behavior/** @acme/team-b\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "team-a"}"""));

        Assert.Contains("owner-unknown", TestModel.Codes(model));
    }

    [Fact]
    public void Owner_Outside_The_Owner_List_Still_Reports_The_List_Message()
    {
        using var temp = Cli.Temp("checks");
        WriteProject(temp.Path, "lending-team");
        WriteCodeowners(temp.Path, "docs/behavior/** @acme/lending-team\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "stranger"}"""));

        var message = Checker.Check(model).Findings.Single(finding => finding.Code == "owner-unknown").Message;
        Assert.Contains("owner list", message, StringComparison.Ordinal);
    }

    [Fact]
    public void Owner_Object_Mapping_A_Handle_Passes()
    {
        using var temp = Cli.Temp("checks");
        WriteProjectJson(temp.Path, """{"owners": [{"name": "NightHall engineering", "codeowners": ["@acme/lending-team"]}]}""");
        WriteCodeowners(temp.Path, "docs/behavior/** @acme/lending-team\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "NightHall engineering"}"""));

        Assert.DoesNotContain("owner-unknown", TestModel.Codes(model));
    }

    [Fact]
    public void Plain_Owner_Matching_No_Handle_Reports_Owner_Unknown()
    {
        using var temp = Cli.Temp("checks");
        WriteProject(temp.Path, "NightHall engineering");
        WriteCodeowners(temp.Path, "* @a-shafie\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "NightHall engineering"}"""));

        var message = Checker.Check(model).Findings.Single(finding => finding.Code == "owner-unknown").Message;
        Assert.Contains("no team", message, StringComparison.Ordinal);
    }

    [Fact]
    public void Owner_Object_Mapping_Another_Team_Reports_Owner_Unknown()
    {
        using var temp = Cli.Temp("checks");
        WriteProjectJson(temp.Path, """{"owners": [{"name": "NightHall engineering", "codeowners": ["@acme/catalog-team"]}]}""");
        WriteCodeowners(temp.Path, "docs/behavior/** @acme/lending-team\n");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "docs", "behavior", "actors", "reader.md"), """{"kind": "person", "owner": "NightHall engineering"}"""));

        Assert.Contains("owner-unknown", TestModel.Codes(model));
    }

    static void WriteProject(string root, params string[] owners) =>
        File.WriteAllText(
            Path.Combine(root, "litespec.project.json"),
            "{\"owners\": [" + string.Join(", ", owners.Select(owner => "\"" + owner + "\"")) + "]}");

    static void WriteProjectJson(string root, string json) =>
        File.WriteAllText(Path.Combine(root, "litespec.project.json"), json);

    static void WriteCodeowners(string root, string text)
    {
        Directory.CreateDirectory(Path.Combine(root, ".github"));
        File.WriteAllText(Path.Combine(root, ".github", "CODEOWNERS"), text);
    }
}

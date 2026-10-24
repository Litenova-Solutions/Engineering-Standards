using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves <c>litespec model approve --dry-run</c> lists approvals without writing.</summary>
public sealed class ModelApproveDryRunTests
{
    static string BorrowCopy(string root) => Path.Combine(
        root, "docs", "behavior", "modules", "lending", "loans", "borrow-copy.md");

    /// <summary>A dry run lists the record missing its hash and writes nothing.</summary>
    [Fact]
    public void Approve_Dry_Run_Lists_Missing_Hash_And_Writes_Nothing()
    {
        using var fixture = ModelFixture.Prepare("large");

        var path = BorrowCopy(fixture.Path);
        var broken = File.ReadAllText(path)
            .Replace(",\r\n  \"approvedHash\": \"0cd75a65\"", "", StringComparison.Ordinal)
            .Replace(",\n  \"approvedHash\": \"0cd75a65\"", "", StringComparison.Ordinal);

        Assert.DoesNotContain("0cd75a65", broken);
        File.WriteAllText(path, broken);

        var result = Cli.Run("model", "approve", "--root", fixture.Path, "--all", "--dry-run");

        Assert.Equal(0, result.Status);
        Assert.Contains("use-case/lending.borrow-copy", result.Output);
        Assert.Contains("no approvedHash", result.Output);
        Assert.Contains("1 record would be stamped, 0 would be reopened", result.Output);
        Assert.Equal(broken, File.ReadAllText(path));
    }

    /// <summary>A dry run lists the record whose fields no longer match its hash.</summary>
    [Fact]
    public void Approve_Dry_Run_Lists_Differing_Hash()
    {
        using var fixture = ModelFixture.Prepare("large", "approval-reopened");
        var before = File.ReadAllText(BorrowCopy(fixture.Path));
        var result = Cli.Run(
            "model", "approve", "--root", fixture.Path,
            "result/borrow-copy.borrowed", "--dry-run");

        Assert.Equal(0, result.Status);
        Assert.Contains("result/borrow-copy.borrowed", result.Output);
        Assert.Contains("approvedHash differs", result.Output);
        Assert.Contains("reopened", result.Output);
        Assert.Equal(before, File.ReadAllText(BorrowCopy(fixture.Path)));
    }

    /// <summary>A dry run on a clean fixture lists nothing.</summary>
    [Fact]
    public void Approve_Dry_Run_Omits_Clean_Records()
    {
        using var fixture = ModelFixture.Prepare("large");
        var result = Cli.Run("model", "approve", "--root", fixture.Path, "--all", "--dry-run");

        Assert.Equal(0, result.Status);
        Assert.Contains("0 records would be stamped, 0 would be reopened", result.Output);
    }

    /// <summary>A dry run still reports unknown ids.</summary>
    [Fact]
    public void Approve_Dry_Run_Reports_Unknown_Ids()
    {
        using var fixture = ModelFixture.Prepare("large");
        var result = Cli.Run(
            "model", "approve", "--root", fixture.Path, "use-case/lending.no-such-thing", "--dry-run");

        Assert.Equal(1, result.Status);
        Assert.Contains("use-case/lending.no-such-thing", result.Output);
    }
}

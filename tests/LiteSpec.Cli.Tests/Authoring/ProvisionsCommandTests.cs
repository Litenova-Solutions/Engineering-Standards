using LiteSpec.Authoring;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>Tests for <c>litespec provisions</c>.</summary>
public sealed class ProvisionsCommandTests
{
    [Fact(DisplayName = "provisions --check on the repository is current")]
    public void CheckOnRepositoryIsCurrent()
    {
        var result = Cli.Run("provisions", "--check", "--root", Cli.Repository);
        Assert.Equal(0, result.Status);
    }

    [Fact(DisplayName = "provisions --check on a stale index fails")]
    public void CheckOnStaleIndexFails()
    {
        using var temp = Cli.Temp("provisions");
        StandardsFixture.Base(temp.Path);
        StandardsFixture.Write(temp.Path, Provisions.IndexPath, "# Provision Index\n\n## Intent\n\nThis page is out of date.\n");
        var result = Cli.Run("provisions", "--check", "--root", temp.Path);
        Assert.Equal(1, result.Status);
    }

    [Fact(DisplayName = "provisions with an unknown option is a usage error")]
    public void UnknownOptionIsUsageError()
    {
        var result = Cli.Run("provisions", "--bogus");
        Assert.Equal(2, result.Status);
    }

    [Fact(DisplayName = "provisions writes one section per area")]
    public void WritesSectionPerArea()
    {
        using var temp = Cli.Temp("provisions");
        StandardsFixture.Base(temp.Path);
        var index = Provisions.BuildIndex(temp.Path);

        Assert.Contains("| ID | Provision | Kind | Mark | Evidence |", index);
        Assert.Contains("litespec/core/topic#keep-the-topic-bounded", index);
        Assert.Contains("litespec/core/topic#use-the-default-location", index);
        Assert.Contains("[Keep the topic bounded](../core/topic.md#keep-the-topic-bounded)", index);
        Assert.Contains("| litespec/backend/sample/stack#apply-the-complete-stack | [Apply the complete stack](../backend/sample/stack.md#apply-the-complete-stack) | rule |", index);
        Assert.Contains("| litespec/ext/sample#record-extension-activation | [Record extension activation](../ext/sample.md#record-extension-activation) | rule |", index);

        var backend = index.IndexOf("## backend", StringComparison.Ordinal);
        var core = index.IndexOf("## core", StringComparison.Ordinal);
        var ext = index.IndexOf("## ext", StringComparison.Ordinal);
        Assert.True(backend >= 0 && core > backend && ext > core);
    }
}

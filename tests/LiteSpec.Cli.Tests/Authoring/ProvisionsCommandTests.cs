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
}

using System.Text.Json;
using System.Text.RegularExpressions;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>
///     Proves every place that names the release names the same one: a tag publishes the
///     packages and the site from these files, so a mismatch ships two versions at once.
/// </summary>
public sealed class ReleaseVersionTests
{
    static string Read(params string[] parts) => File.ReadAllText(Path.Combine([Cli.Repository, .. parts]));

    static string Manifest() =>
        JsonDocument.Parse(Read("litespec.manifest.json")).RootElement.GetProperty("version").GetString()!;

    static string PackageVersion(params string[] project) =>
        Regex.Match(Read(project), "<Version>(?<v>[^<]+)</Version>").Groups["v"].Value;

    [Fact]
    public void The_Tool_Package_Names_The_Manifest_Release() =>
        Assert.Equal(Manifest(), PackageVersion("apps", "cli", "src", "LiteSpec.Cli", "LiteSpec.Cli.csproj"));

    [Fact]
    public void The_Analyzer_Package_Names_The_Manifest_Release() =>
        Assert.Equal(Manifest(), PackageVersion("apps", "analyzers", "src", "LiteSpec.Analyzers", "LiteSpec.Analyzers.csproj"));

    [Fact]
    public void The_Changelog_Opens_With_The_Manifest_Release() =>
        Assert.Equal($"## v{Manifest()}", Read("CHANGELOG.md").Split('\n').Select(line => line.TrimEnd('\r')).First(line => line.StartsWith("## ", StringComparison.Ordinal)));

    [Fact]
    public void The_Consumer_Template_Reviews_The_Manifest_Release() =>
        Assert.Equal(
            Manifest(),
            JsonDocument.Parse(Read("templates", "consumer", "litespec.project.json")).RootElement.GetProperty("reviewedLiteSpecVersion").GetString());
}

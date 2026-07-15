using Litenova.Standards.Services;

namespace Litenova.Standards.Tests;

public sealed class FrontMatterReaderTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), $"standards-{Guid.NewGuid():N}");

    [Fact]
    public void Read_parses_json_metadata_rules_and_word_count()
    {
        Directory.CreateDirectory(Path.Combine(_root, "docs", "core"));
        var path = Path.Combine(_root, "docs", "core", "principles.md");
        File.WriteAllText(path, """
            ---
            {
              "id": "core.principles",
              "kind": "core",
              "normative": true,
              "appliesTo": ["all"],
              "recipes": []
            }
            ---
            # Principles

            ## CORE.SCOPE.001 - Stay inside the supported profile

            Use the selected profile.
            """);

        var document = FrontMatterReader.Read(_root, path);

        Assert.Equal("core.principles", document.Metadata.Id);
        Assert.Equal("docs/core/principles.md", document.RelativePath);
        Assert.Single(document.Rules);
        Assert.Equal("CORE.SCOPE.001", document.Rules[0].Id);
        Assert.True(document.WordCount > 5);
    }

    [Fact]
    public void Read_rejects_missing_frontmatter()
    {
        Directory.CreateDirectory(_root);
        var path = Path.Combine(_root, "invalid.md");
        File.WriteAllText(path, "# Missing metadata");

        var exception = Assert.Throws<InvalidDataException>(() => FrontMatterReader.Read(_root, path));

        Assert.Contains("line 1", exception.Message, StringComparison.Ordinal);
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}


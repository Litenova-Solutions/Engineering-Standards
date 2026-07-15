using System.Text.Json;
using System.Text.RegularExpressions;
using Litenova.Standards.Models;

namespace Litenova.Standards.Services;

internal static partial class FrontMatterReader
{
    public static RepositoryDocument Read(string root, string path)
    {
        var content = File.ReadAllText(path).Replace("\r\n", "\n");
        var lines = content.Split('\n');

        if (lines.Length < 3 || lines[0] != "---")
        {
            throw new InvalidDataException("JSON frontmatter must start on line 1.");
        }

        var closingLine = Array.FindIndex(lines, 1, line => line == "---");
        if (closingLine < 2)
        {
            throw new InvalidDataException("JSON frontmatter is missing its closing delimiter.");
        }

        var frontMatter = string.Join('\n', lines[1..closingLine]);
        var metadata = JsonSerializer.Deserialize<DocumentMetadata>(frontMatter, JsonSupport.ReadOptions)
            ?? throw new InvalidDataException("JSON frontmatter did not produce document metadata.");

        ValidateMetadata(metadata);

        var relativePath = Path.GetRelativePath(root, path).Replace('\\', '/');
        var rules = ReadRules(lines, relativePath);
        var wordCount = WordRegex().Matches(string.Join('\n', lines[(closingLine + 1)..])).Count;

        return new RepositoryDocument(relativePath, metadata, content, wordCount, rules);
    }

    private static void ValidateMetadata(DocumentMetadata metadata)
    {
        if (string.IsNullOrWhiteSpace(metadata.Id))
        {
            throw new InvalidDataException("Document metadata requires id.");
        }

        if (string.IsNullOrWhiteSpace(metadata.Kind))
        {
            throw new InvalidDataException($"Document {metadata.Id} requires kind.");
        }

        if (metadata.AppliesTo is null || metadata.Recipes is null)
        {
            throw new InvalidDataException($"Document {metadata.Id} requires appliesTo and recipes arrays.");
        }
    }

    private static IReadOnlyList<DocumentRule> ReadRules(string[] lines, string relativePath)
    {
        var rules = new List<DocumentRule>();
        for (var index = 0; index < lines.Length; index++)
        {
            var match = RuleHeadingRegex().Match(lines[index]);
            if (!match.Success)
            {
                continue;
            }

            rules.Add(new DocumentRule(
                match.Groups[1].Value,
                match.Groups[2].Value.Trim(),
                relativePath,
                index + 1));
        }

        return rules;
    }

    [GeneratedRegex(@"^#{2,6}\s+([A-Z][A-Z0-9]*(?:\.[A-Z0-9]+){2,})\s+-\s+(.+?)\s*$")]
    private static partial Regex RuleHeadingRegex();

    [GeneratedRegex(@"[\p{L}\p{N}_'-]+")]
    private static partial Regex WordRegex();
}


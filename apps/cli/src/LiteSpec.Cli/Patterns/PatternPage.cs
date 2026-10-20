using System.Text.RegularExpressions;
using LiteSpec.Authoring;

namespace LiteSpec.Patterns;

/// <summary>One wireframe block as written: its text and the page line its first row is on.</summary>
/// <param name="Text">The block body.</param>
/// <param name="Line">The 1-based page line of the opening fence.</param>
sealed record WireframeBlock(string Text, int Line)
{
    /// <summary>The parsed block.</summary>
    public Wireframe Parsed { get; } = WireframeParser.Parse(Text);
}

/// <summary>One option of a pattern.</summary>
sealed record PatternOption(string Id, string Name, int Line)
{
    public WireframeBlock? Wireframe { get; set; }
    public WireframeBlock? Compact { get; set; }
    public int WireframeCount { get; set; }
    public int CompactCount { get; set; }
    public Dictionary<string, string> Fields { get; } = new(StringComparer.Ordinal);
}

/// <summary>One pattern: a <c>###</c> heading in the page's Patterns section.</summary>
sealed record Pattern(string Name, string Slug, int Line)
{
    public Dictionary<string, string> Fields { get; } = new(StringComparer.Ordinal);
    public List<PatternOption> Options { get; } = [];

    /// <summary>The option id named by <c>**Default:**</c>, without backticks.</summary>
    public string? Default => Fields.TryGetValue("Default", out var value) ? value.Trim().Trim('`') : null;
}

/// <summary>A pattern page: <c>docs/frontend/patterns/&lt;group&gt;.md</c>.</summary>
sealed partial class PatternPage
{
    /// <summary>The folder under the LiteSpec root that holds the pattern pages.</summary>
    public const string Folder = "docs/frontend/patterns";

    /// <summary>The fields a pattern carries before its options.</summary>
    public static readonly string[] PatternFields = ["Question", "Default", "Compact", "Rationale"];

    /// <summary>The fields an option carries after its wireframe.</summary>
    public static readonly string[] OptionFields = ["Rationale", "Cost", "Reference"];

    public required string Group { get; init; }
    public required string Title { get; init; }
    public string Intent { get; init; } = "";
    public List<Pattern> Patterns { get; } = [];

    /// <summary>Problems in the page's shape, each with its 1-based line.</summary>
    public List<(int Line, string Message)> Errors { get; } = [];

    /// <summary>Whether the repository-relative path is a pattern page.</summary>
    public static bool IsPatternPage(string relative) =>
        relative.StartsWith(Folder + "/", StringComparison.Ordinal) && relative.EndsWith(".md", StringComparison.Ordinal)
        && !relative.EndsWith("/README.md", StringComparison.Ordinal);

    /// <summary>Reads a pattern page from its text.</summary>
    public static PatternPage Parse(string group, string text)
    {
        var lines = text.Replace("\r\n", "\n", StringComparison.Ordinal).Split('\n');
        var title = lines.FirstOrDefault(line => line.StartsWith("# ", StringComparison.Ordinal))?[2..].Trim() ?? group;
        var page = new PatternPage { Group = group, Title = title, Intent = Section(lines, "Intent") };
        var section = "";
        Pattern? pattern = null;
        PatternOption? option = null;
        string? field = null;

        for (var index = 0; index < lines.Length; index++)
        {
            var line = lines[index];
            var number = index + 1;

            if (line.StartsWith("```", StringComparison.Ordinal))
            {
                var info = line[3..].Trim();
                var body = new List<string>();
                var start = number;

                while (++index < lines.Length && !lines[index].StartsWith("```", StringComparison.Ordinal))
                {
                    body.Add(lines[index]);
                }

                if (section != "Patterns" || !info.StartsWith("wireframe", StringComparison.Ordinal))
                {
                    continue;
                }

                if (option is null)
                {
                    page.Errors.Add((start, "a wireframe block belongs under an option's #### heading"));
                    continue;
                }

                var block = new WireframeBlock(string.Join('\n', body), start);

                if (info == "wireframe")
                {
                    option.Wireframe ??= block;
                    option.WireframeCount++;
                }
                else if (info == "wireframe compact")
                {
                    option.Compact ??= block;
                    option.CompactCount++;
                }
                else
                {
                    page.Errors.Add((start, $"'{info}' is not a wireframe block; use 'wireframe' or 'wireframe compact'"));
                }

                field = null;
                continue;
            }

            var h2 = H2().Match(line);

            if (h2.Success)
            {
                section = h2.Groups[1].Value.Trim();
                pattern = null;
                option = null;
                field = null;
                continue;
            }

            if (section != "Patterns")
            {
                continue;
            }

            if (line.StartsWith("### ", StringComparison.Ordinal))
            {
                var name = line[4..].Trim();
                pattern = new Pattern(name, Provisions.HeadingSlug(name), number);
                page.Patterns.Add(pattern);
                option = null;
                field = null;
                continue;
            }

            if (line.StartsWith("#### ", StringComparison.Ordinal))
            {
                var heading = OptionHeading().Match(line);

                if (pattern is null)
                {
                    page.Errors.Add((number, "an option heading belongs under a pattern's ### heading"));
                    continue;
                }

                if (!heading.Success)
                {
                    page.Errors.Add((number, "an option heading is '#### `option-id`: Option name'"));
                    option = null;
                    continue;
                }

                option = new PatternOption(heading.Groups[1].Value, heading.Groups[2].Value.Trim(), number);
                pattern.Options.Add(option);
                field = null;
                continue;
            }

            var labeled = FieldLine().Match(line);

            if (labeled.Success && pattern is not null)
            {
                field = labeled.Groups[1].Value;
                var target = option?.Fields ?? pattern.Fields;
                var allowed = option is null ? PatternFields : OptionFields;

                if (!allowed.Contains(field))
                {
                    page.Errors.Add((number, $"'**{field}:**' is not a {(option is null ? "pattern" : "option")} field; use {string.Join(", ", allowed)}"));
                }

                target[field] = labeled.Groups[2].Value.Trim();
                continue;
            }

            // A plain paragraph below a field continues it, so a long rationale may run to several paragraphs.
            if (field is not null && line.Trim().Length > 0 && pattern is not null)
            {
                var target = option?.Fields ?? pattern.Fields;
                target[field] = (target[field] + " " + line.Trim()).Trim();
            }
        }

        return page;
    }

    /// <summary>Every problem in the page: its shape and each wireframe, with page lines.</summary>
    public List<(int Line, string Message)> Check()
    {
        var problems = new List<(int Line, string Message)>(Errors);
        var slugs = new HashSet<string>(StringComparer.Ordinal);

        foreach (var pattern in Patterns)
        {
            if (!slugs.Add(pattern.Slug))
            {
                problems.Add((pattern.Line, $"pattern '{pattern.Name}' repeats the slug '{pattern.Slug}'"));
            }

            foreach (var required in new[] { "Question", "Default", "Rationale" }.Where(name => !pattern.Fields.ContainsKey(name)))
            {
                problems.Add((pattern.Line, $"pattern '{pattern.Name}' has no **{required}:**"));
            }

            if (pattern.Options.Count < 2)
            {
                problems.Add((pattern.Line, $"pattern '{pattern.Name}' has {pattern.Options.Count} options; a pattern offers at least two"));
            }

            if (pattern.Default is { } chosen && pattern.Options.All(option => option.Id != chosen))
            {
                problems.Add((pattern.Line, $"pattern '{pattern.Name}' defaults to '{chosen}', which is not one of its options"));
            }

            var ids = new HashSet<string>(StringComparer.Ordinal);

            foreach (var option in pattern.Options)
            {
                if (!ids.Add(option.Id))
                {
                    problems.Add((option.Line, $"option '{option.Id}' appears twice in '{pattern.Name}'"));
                }

                if (option.WireframeCount != 1)
                {
                    problems.Add((option.Line, $"option '{option.Id}' has {option.WireframeCount} wireframe blocks; it has exactly one"));
                }

                if (option.CompactCount > 1)
                {
                    problems.Add((option.Line, $"option '{option.Id}' has {option.CompactCount} compact blocks; it has at most one"));
                }

                foreach (var required in new[] { "Rationale", "Cost" }.Where(name => !option.Fields.ContainsKey(name)))
                {
                    problems.Add((option.Line, $"option '{option.Id}' has no **{required}:**"));
                }

                foreach (var block in new[] { option.Wireframe, option.Compact }.OfType<WireframeBlock>())
                {
                    problems.AddRange(block.Parsed.Errors.Select(error => (block.Line + error.Line, $"option '{option.Id}': {error.Message}")));
                }
            }
        }

        problems.Sort((left, right) => left.Line.CompareTo(right.Line));
        return problems;
    }

    static string Section(string[] lines, string name)
    {
        var start = Array.FindIndex(lines, line => line.Trim() == $"## {name}");

        if (start < 0)
        {
            return "";
        }

        return string.Join(' ', lines.Skip(start + 1).TakeWhile(line => !line.StartsWith("## ", StringComparison.Ordinal))).Trim();
    }

    [GeneratedRegex(@"^##\s+(.+?)\s*(?:\{#.*\})?\s*$")]
    private static partial Regex H2();

    [GeneratedRegex(@"^####\s+`([a-z0-9]+(?:-[a-z0-9]+)*)`:\s+(.+)$")]
    private static partial Regex OptionHeading();

    [GeneratedRegex(@"^\*\*([A-Z][a-z]+):\*\*\s*(.*)$")]
    private static partial Regex FieldLine();
}

using System.Globalization;
using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     The shared builder for <c>docs/reference/provisions.md</c>. The validator and the
///     generator both call <see cref="BuildIndex"/>, so the checked-in page and its
///     freshness gate cannot disagree.
/// </summary>
static class Provisions
{
    /// <summary>The generated provision index, relative to the repository root.</summary>
    public const string IndexPath = "docs/reference/provisions.md";

    /// <summary>Every provision identifier kind (PROVISION_KINDS).</summary>
    public static readonly IReadOnlyList<string> Kinds = ["convention", "rule"];

    /// <summary>The provision identifier pattern as a .NET regex source (PROVISION_ID_SOURCE).</summary>
    public static readonly string IdSource = $"litespec\\/(?:{string.Join("|", Kinds)})\\/[a-z][a-z0-9-]*\\.[a-z0-9][a-z0-9-]*";

    // Every provision identifier is litespec/<kind>/<page>.<heading-slug>. The kind
    // names the assertion class, the page names the owning page, and the heading slug
    // names the assertion. No segment carries a sequence number.
    static readonly Regex ProvisionIdPattern = new($"^{IdSource}$");
    static readonly Regex RuleHeading = new($"^###\\s+(.+?)\\s+\\(({IdSource})\\)\\s*$");
    static readonly Regex ParseIdPattern = new(@"^litespec\/([a-z-]+)\/([a-z][a-z0-9-]*)\.([a-z0-9][a-z0-9-]*)$");
    static readonly Regex SectionHeading = new(@"^##\s+(.+?)\s*(?:\{#.*\})?\s*$");
    static readonly Regex Fence = new(@"^\s*```");
    static readonly Regex SeparatorCell = new(@"^:?-+:?$");
    static readonly Regex AnchorSuffix = new(@"\s+\{#[^}]+\}\s*$");
    static readonly Regex SlugStrip = new(@"[^a-z0-9\s-]");
    static readonly Regex WhitespaceRun = new(@"\s+");
    static readonly Regex DashRun = new(@"-+");
    static readonly Regex LineSplit = new(@"\r?\n");
    static readonly CultureInfo English = CultureInfo.GetCultureInfo("en");

    /// <summary>Turns a heading into the anchor slug the index links to.</summary>
    public static string HeadingSlug(string value)
    {
        var slug = AnchorSuffix.Replace(value, string.Empty).ToLowerInvariant().Replace("`", string.Empty, StringComparison.Ordinal);
        slug = SlugStrip.Replace(slug, string.Empty).Trim();
        slug = WhitespaceRun.Replace(slug, "-");
        return DashRun.Replace(slug, "-");
    }

    /// <summary>
    ///     Splits a provision identifier into its kind, page and slug. The page segment
    ///     is <c>&lt;area&gt;-&lt;stem&gt;</c>, so two pages named <c>structure.md</c> in two
    ///     areas stay distinct. Returns null when the identifier is malformed.
    /// </summary>
    public static ProvisionId? Parse(string id)
    {
        var match = ParseIdPattern.Match(id);

        if (!match.Success)
        {
            return null;
        }

        return new ProvisionId(match.Groups[1].Value, match.Groups[2].Value, match.Groups[3].Value);
    }

    /// <summary>Whether the identifier names a provision of a known kind.</summary>
    public static bool IsProvisionId(string id) => ProvisionIdPattern.IsMatch(id);

    /// <summary>Collects every provision row from the standards pages, sorted by identifier.</summary>
    public static List<ProvisionRow> Collect(string root)
    {
        var rows = new List<ProvisionRow>();

        foreach (var file in Walk(Path.Combine(root, "docs")))
        {
            var relative = Slash(Path.GetRelativePath(root, file));

            if (relative == IndexPath)
            {
                continue;
            }

            var lines = StripFences(LineSplit.Split(File.ReadAllText(file)));
            var marks = CollectVerificationMarks(lines);
            var section = "";

            foreach (var line in lines)
            {
                var heading = SectionHeading.Match(line);

                if (heading.Success)
                {
                    section = heading.Groups[1].Value.Trim();
                }

                if (section != "Standards" && section != "Conventions")
                {
                    continue;
                }

                var rule = RuleHeading.Match(line);

                if (!rule.Success)
                {
                    continue;
                }

                var id = rule.Groups[2].Value;
                var parsed = Parse(id);
                var verification = marks.TryGetValue(id, out var found) ? found : (Mark: "", Evidence: "");
                rows.Add(new ProvisionRow(
                    id,
                    rule.Groups[1].Value,
                    relative,
                    HeadingSlug($"{rule.Groups[1].Value} ({id})"),
                    parsed?.Kind ?? "",
                    verification.Mark,
                    verification.Evidence));
            }
        }

        rows.Sort((left, right) => string.Compare(left.Id, right.Id, English, CompareOptions.None));
        return rows;
    }

    /// <summary>Builds the provision index text with <c>\n</c> line ends, without a trailing newline.</summary>
    public static string BuildIndex(string root)
    {
        var rows = Collect(root);
        var kinds = new Dictionary<string, List<ProvisionRow>>(StringComparer.Ordinal);

        foreach (var row in rows)
        {
            if (!kinds.TryGetValue(row.Kind, out var group))
            {
                kinds[row.Kind] = group = [];
            }

            group.Add(row);
        }

        var lines = new List<string>
        {
            "# Provisions",
            "",
            "## Intent",
            "",
            "Use this generated page to resolve a provision ID to its heading, owning page, and verification mark.",
            "",
            "Run `litespec provisions` after any provision change. The repository validator fails when this page and the active standards disagree.",
            "",
            $"The active release states {rows.Count} {(rows.Count == 1 ? "provision" : "provisions")} across {kinds.Count} {(kinds.Count == 1 ? "kind" : "kinds")}.",
            "",
        };

        foreach (var kind in kinds.Keys.OrderBy(name => name, StringComparer.Ordinal))
        {
            lines.Add($"## {kind}");
            lines.Add("");
            lines.Add("| ID | Provision | Page | Mark | Evidence |");
            lines.Add("|:---|:---|:---|:---|:---|");

            foreach (var row in kinds[kind])
            {
                var href = Slash(Path.GetRelativePath(Path.GetDirectoryName(IndexPath)!, row.Page));
                var page = row.Page.StartsWith("docs/", StringComparison.Ordinal) ? row.Page["docs/".Length..] : row.Page;
                var mark = row.Mark.Length > 0 ? row.Mark : "-";
                var evidence = EscapeCell(row.Evidence);
                lines.Add($"| {row.Id} | [{EscapeCell(row.Heading)}]({href}#{row.Anchor}) | `{page}` | {mark} | {(evidence.Length > 0 ? evidence : "-")} |");
            }

            lines.Add("");
        }

        return string.Join("\n", lines);
    }

    static string Slash(string value) => value.Replace('\\', '/');

    static string[] StripFences(string[] lines)
    {
        var output = new string[lines.Length];
        var inside = false;

        for (var index = 0; index < lines.Length; index++)
        {
            if (Fence.IsMatch(lines[index]))
            {
                inside = !inside;
                output[index] = "";
                continue;
            }

            output[index] = inside ? "" : lines[index];
        }

        return output;
    }

    static List<string> Walk(string directory)
    {
        var result = new List<string>();

        if (!Directory.Exists(directory))
        {
            return result;
        }

        foreach (var entry in Directory.GetFileSystemEntries(directory).OrderBy(name => name, StringComparer.Ordinal))
        {
            if (Directory.Exists(entry))
            {
                result.AddRange(Walk(entry));
            }
            else if (entry.EndsWith(".md", StringComparison.Ordinal))
            {
                result.Add(entry);
            }
        }

        return result;
    }

    static List<string>? TableCells(string line)
    {
        var trimmed = line.Trim();

        if (!trimmed.StartsWith('|') || !trimmed.EndsWith('|'))
        {
            return null;
        }

        return trimmed[1..^1].Split('|').Select(cell => cell.Trim()).ToList();
    }

    // A Verification row carries the provision's mark: checkable with the command
    // that checks it, or guidance with the question a reviewer answers. The columns
    // are found by header name, so a column the page does not have reads as absent
    // rather than shifting the others.
    static Dictionary<string, (string Mark, string Evidence)> CollectVerificationMarks(string[] lines)
    {
        var marks = new Dictionary<string, (string Mark, string Evidence)>(StringComparer.Ordinal);
        var section = "";
        (int Id, int Mark, int Evidence)? columns = null;

        foreach (var line in lines)
        {
            var heading = SectionHeading.Match(line);

            if (heading.Success)
            {
                section = heading.Groups[1].Value.Trim();
                columns = null;
                continue;
            }

            if (section != "Verification")
            {
                continue;
            }

            var cells = TableCells(line);

            if (cells is null)
            {
                continue;
            }

            if (SeparatorCell.IsMatch(cells[0]))
            {
                continue;
            }

            if (columns is null)
            {
                var lowered = cells.Select(cell => cell.ToLowerInvariant()).ToList();

                if (lowered.Contains("id") && lowered.Contains("evidence"))
                {
                    columns = (lowered.IndexOf("id"), lowered.IndexOf("mark"), lowered.IndexOf("evidence"));
                }

                continue;
            }

            var (idColumn, markColumn, evidenceColumn) = columns.Value;
            var id = idColumn < cells.Count ? cells[idColumn] : "";

            if (id.Length == 0 || marks.ContainsKey(id))
            {
                continue;
            }

            marks[id] = (
                markColumn >= 0 && markColumn < cells.Count ? cells[markColumn] : "",
                evidenceColumn < cells.Count ? cells[evidenceColumn] : "");
        }

        return marks;
    }

    static string EscapeCell(string value) => value.Replace("|", "\\|", StringComparison.Ordinal);
}

/// <summary>
///     A parsed provision identifier.
/// </summary>
/// <param name="Kind">The assertion class, such as <c>rule</c>.</param>
/// <param name="Page">The owning page as <c>&lt;area&gt;-&lt;stem&gt;</c>.</param>
/// <param name="Slug">The assertion slug.</param>
sealed record ProvisionId(string Kind, string Page, string Slug);

/// <summary>
///     One provision with its heading, owning page and Verification mark.
/// </summary>
/// <param name="Id">The provision identifier.</param>
/// <param name="Heading">The Standards heading without its identifier.</param>
/// <param name="Page">The owning page, relative to the repository root.</param>
/// <param name="Anchor">The heading slug the index links to.</param>
/// <param name="Kind">The assertion class.</param>
/// <param name="Mark">The Verification mark, or empty when the page carries none.</param>
/// <param name="Evidence">The Verification evidence, or empty when the page carries none.</param>
sealed record ProvisionRow(string Id, string Heading, string Page, string Anchor, string Kind, string Mark, string Evidence);

using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     The repository-wide checks: identity, citations, templates, links, indexes, and removed forms.
/// </summary>
static partial class StandardsValidator
{
    // A standards template seeds one page class, so it is parsed as the page it
    // produces and held to that page's contract.
    // An authoring template is parsed as the page class it produces, so its
    // placeholder identifiers are normalized into valid ones and its virtual path
    // stands in for a real page path. Both live in the same namespace as real pages,
    // which is what makes the parse meaningful and also what makes the stem
    // reserved. A real page at one of these paths would share a scope with a
    // template and report as a duplicate of a file nobody wrote.
    static readonly Dictionary<string, string> TemplateVirtualPath = new(StringComparer.Ordinal)
    {
        ["extension.md"] = "docs/ext/template.md",
        ["how-to.md"] = "docs/guide/template.md",
        ["tutorial.md"] = "docs/tutorial/template.md",
        ["command.md"] = "docs/tools/template.md",
        ["reference.md"] = "docs/reference/template.md",
    };

    static readonly HashSet<string> ReservedTemplateStems = new(
        [.. TemplateVirtualPath.Values, "docs/core/template.md"],
        StringComparer.Ordinal);

    const string RoutingHeading = "Which Page Do You Want";

    static void CheckPageIdentity(List<ParsedPage> parsedPages, Action<string, int, string, string> add)
    {
        // Provision identity comes from the path and the heading: the identifier names
        // the page path, so every folder and file stem on that path is lowercase kebab
        // case and the navigation pages keep their README.md name.
        foreach (var page in parsedPages)
        {
            if (!page.Relative.StartsWith("docs/", StringComparison.Ordinal))
            {
                continue;
            }

            var segments = page.Relative["docs/".Length..].Split('/');
            for (var index = 0; index < segments.Length; index++)
            {
                var last = index == segments.Length - 1;
                if (last && segments[index] == "README.md")
                {
                    continue;
                }

                var name = last && segments[index].EndsWith(".md", StringComparison.OrdinalIgnoreCase)
                    ? segments[index][..^".md".Length]
                    : segments[index];
                if (!KebabSegmentPattern().IsMatch(name))
                {
                    add(page.Relative, 1, "ID_PAGE_FILENAME", $"path segment '{name}' is not lowercase kebab case");
                }
            }
        }
    }

    static void CheckCitations(List<ParsedPage> parsedPages, HashSet<string> activeIds, Action<string, int, string, string> add)
    {
        foreach (var page in parsedPages)
        {
            var prose = string.Join('\n', StripFences(SplitLines(page.Raw)).Select(item => item.Line));
            foreach (Match match in CitationPattern.Matches(prose))
            {
                if (!activeIds.Contains(match.Value))
                {
                    add(page.Relative, LineNumber(prose, match.Index), "ID_UNKNOWN_REFERENCE", $"active content references unknown provision '{match.Value}'");
                }
            }
        }
    }

    static string NormalizeTemplate(string relative, string raw) => raw
        .Replace("{litespec/page#state-one-action}", "litespec/core/template#state-one-action", StringComparison.Ordinal)
        .Replace("{litespec/page#use-one-default}", "litespec/core/template#use-one-default", StringComparison.Ordinal)
        .Replace("{litespec/page#state-one-extension-action}", "litespec/ext/template#state-one-extension-action", StringComparison.Ordinal)
        .Replace("{litespec/page#use-one-extension-default}", "litespec/ext/template#use-one-extension-default", StringComparison.Ordinal)
        .Replace("{Topic Title}", "Topic Title", StringComparison.Ordinal)
        .Replace("{Extension Title}", "Extension Title", StringComparison.Ordinal)
        .Replace("{How-To Title}", "How-To Title", StringComparison.Ordinal)
        .Replace("{Tutorial Title}", "Tutorial Title", StringComparison.Ordinal)
        .Replace("{Command Title}", "Command Title", StringComparison.Ordinal)
        .Replace("{Reference Title}", "Reference Title", StringComparison.Ordinal);

    static void CheckAuthoringTemplates(string root, Dictionary<string, string> globalIds, Action<string, int, string, string> add)
    {
        var templateRoot = Path.Combine(root, "templates", "standard");
        foreach (var file in Walk(templateRoot, candidate => candidate.EndsWith(".md", StringComparison.Ordinal)))
        {
            var relative = Slash(Path.GetRelativePath(root, file));
            var virtualRelative = TemplateVirtualPath.GetValueOrDefault(Path.GetFileName(file), "docs/core/template.md");
            var normalized = NormalizeTemplate(relative, ReadText(file));
            var stripped = string.Join('\n', StripFences(SplitLines(normalized)).Select(item => item.Line));
            var nonAscii = NonAsciiOffset(stripped);
            if (nonAscii >= 0)
            {
                add(relative, 1, "PROSE_NON_ASCII", NonAsciiMessage(stripped[nonAscii], "authoring template contains non-ASCII character "));
            }

            ParsePage(virtualRelative, normalized, add, globalIds, root, @virtual: true);
        }
    }

    static void CheckLinks(string root, List<string> files, Action<string, int, string, string> add)
    {
        var anchors = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
        foreach (var file in files)
        {
            anchors[file] = AnchorsFor(ReadText(file));
        }

        foreach (var file in files)
        {
            var raw = ReadText(file);
            var relative = Slash(Path.GetRelativePath(root, file));
            foreach (Match match in MarkdownLinkPattern().Matches(raw))
            {
                var href = match.Groups[1].Value.Trim();
                if (AbsoluteUriPattern().IsMatch(href))
                {
                    continue;
                }

                var parts = href.Split('#');
                var targetPart = parts[0];
                var anchor = parts.Length > 1 ? parts[1] : "";
                if (!TryDecodeURIComponent(targetPart, out var decoded))
                {
                    add(relative, LineNumber(raw, match.Index), "LINK_BROKEN", $"link target '{href}' holds a malformed percent escape");
                    continue;
                }

                var target = targetPart.Length > 0
                    ? Path.GetFullPath(Path.Combine(Path.GetDirectoryName(file)!, decoded))
                    : file;
                if (targetPart.Length > 0 && !File.Exists(target) && !Directory.Exists(target))
                {
                    add(relative, LineNumber(raw, match.Index), "LINK_BROKEN", $"link target '{href}' does not exist");
                    continue;
                }

                if (anchor.Length > 0 && (File.Exists(target) || Directory.Exists(target)) && target.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
                {
                    if (!anchors.TryGetValue(target, out var targetAnchors))
                    {
                        targetAnchors = AnchorsFor(ReadText(target));
                    }

                    if (!targetAnchors.Contains(anchor))
                    {
                        add(relative, LineNumber(raw, match.Index), "ANCHOR_BROKEN", $"anchor '#{anchor}' does not exist in '{Slash(Path.GetRelativePath(root, target))}'");
                    }
                }
            }
        }
    }

    static bool TryDecodeURIComponent(string value, out string decoded)
    {
        try
        {
            decoded = DecodeURIComponent(value);
            return true;
        }
        catch (InvalidOperationException)
        {
            decoded = value;
            return false;
        }
    }

    static string DecodeURIComponent(string value)
    {
        for (var index = 0; index < value.Length; index++)
        {
            if (value[index] == '%' && (index + 2 > value.Length - 1 || !Uri.IsHexDigit(value[index + 1]) || !Uri.IsHexDigit(value[index + 2])))
            {
                throw new InvalidOperationException($"Malformed escape in link target '{value}'.");
            }
        }

        return Uri.UnescapeDataString(value);
    }

    static void CheckTemplateIndex(string root, Action<string, int, string, string> add)
    {
        const string relative = "templates/consumer/README.md";
        var indexFile = JoinRoot(root, relative);
        if (!File.Exists(indexFile))
        {
            return;
        }

        var lines = SplitLines(ReadText(indexFile));
        for (var index = 0; index < lines.Length; index++)
        {
            var row = TemplateRowPattern().Match(lines[index]);
            if (!row.Success)
            {
                continue;
            }

            var template = row.Groups[1].Value;
            var target = Path.Combine(root, "templates", "consumer", template);
            if (!File.Exists(target) && !Directory.Exists(target))
            {
                add(relative, index + 1, "TEMPLATE_INDEX_PATH", $"template '{template}' named in the index does not exist");
            }
        }

        // Every tracked template appears in the index. A shipped template that no row
        // names is a template a consumer cannot find.
        var named = new HashSet<string>(StringComparer.Ordinal);
        foreach (var line in lines)
        {
            var row = TemplateRowPattern().Match(line);
            if (row.Success)
            {
                named.Add(row.Groups[1].Value);
            }
        }

        var directory = Path.Combine(root, "templates", "consumer");
        if (!Directory.Exists(directory))
        {
            return;
        }

        foreach (var entry in Directory.GetFileSystemEntries(directory).Select(Path.GetFileName).OrderBy(name => name, StringComparer.Ordinal))
        {
            if (entry == "README.md" || named.Contains(entry!))
            {
                continue;
            }

            add(relative, 1, "TEMPLATE_INDEX_PATH", $"template '{entry}' is tracked but no index row names it");
        }
    }

    static void CheckRootIndexRouting(string root, Action<string, int, string, string> add)
    {
        const string relative = "docs/README.md";
        var file = JoinRoot(root, relative);
        if (!File.Exists(file))
        {
            return;
        }

        var lines = SplitLines(ReadText(file));
        var routingLine = -1;
        var firstGroupLine = -1;
        var currentHeading = "";
        for (var index = 0; index < lines.Length; index++)
        {
            var heading = RoutingHeadingPattern().Match(lines[index]);
            if (heading.Success)
            {
                currentHeading = heading.Groups[1].Value;
                if (currentHeading == RoutingHeading && routingLine < 0)
                {
                    routingLine = index + 1;
                }

                continue;
            }

            // A navigation group is a section whose body lists links. Intent introduces
            // the page and names no destination, so a link inside it starts no group.
            if (firstGroupLine < 0 && currentHeading.Length > 0 && currentHeading != "Intent" && currentHeading != RoutingHeading && NavBulletPattern().IsMatch(lines[index]))
            {
                firstGroupLine = index + 1;
            }
        }

        if (routingLine < 0)
        {
            add(relative, 1, "INDEX_MISSING_ROUTING", $"documentation root index has no '{RoutingHeading}' section, so a reader cannot tell which page class answers their question");
            return;
        }

        if (firstGroupLine >= 0 && routingLine > firstGroupLine)
        {
            add(relative, routingLine, "INDEX_MISSING_ROUTING", $"'{RoutingHeading}' appears after the first navigation group at line {firstGroupLine}");
        }
    }

    [GeneratedRegex(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")] private static partial Regex KebabSegmentPattern();

    [GeneratedRegex(@"\[[^\]]*\]\(([^)]+)\)")] private static partial Regex MarkdownLinkPattern();

    [GeneratedRegex(@"^(?:https?:|mailto:)")] private static partial Regex AbsoluteUriPattern();

    [GeneratedRegex(@"^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|")] private static partial Regex TemplateRowPattern();

    [GeneratedRegex(@"^##\s+(.+?)\s*$")] private static partial Regex RoutingHeadingPattern();

    [GeneratedRegex(@"^-\s+\[")] private static partial Regex NavBulletPattern();
}

using System.Globalization;
using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     The page contract: page classes, section order, and the per-page parse.
/// </summary>
static partial class StandardsValidator
{
    /// <summary>A page contract: its required and optional H2 sections.</summary>
    private sealed record PageContract(List<string> Required, List<string> Optional);

    // A directory names the class of every page inside it. Four of these hold pages a
    // reader follows or looks up rather than pages that own provisions, and each one
    // answers a question at a single layer. (litespec/rule/core-authoring.state-one-layer-per-page)
    static readonly Dictionary<string, string> PageClassAreas = new(StringComparer.Ordinal)
    {
        ["ext"] = "extension",
        ["profile"] = "profile",
        ["guide"] = "how-to",
        ["tutorial"] = "tutorial",
        ["reference"] = "reference",
        ["tools"] = "command",
    };

    static readonly HashSet<string> TitleSmallWords = new(
        ["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"],
        StringComparer.Ordinal);

    static string? PageClass(string relative)
    {
        if (relative == Provisions.IndexPath)
        {
            return "index";
        }

        if (relative == "docs/reference/glossary.md")
        {
            return "glossary";
        }

        if (relative.EndsWith("/README.md", StringComparison.Ordinal) || relative == "README.md")
        {
            return "index";
        }

        // A page owning no provision derives no identifier from its stem, so it carries
        // a descriptive hyphenated name. A stem pattern refusing the hyphen returned no
        // class for every such page, and a page with no class is held to no contract.
        var area = PageAreaPattern().Match(relative);
        if (!area.Success)
        {
            return null;
        }

        return PageClassAreas.GetValueOrDefault(area.Groups[1].Value, "topic");
    }

    static PageContract? ExpectedSections(string? kind, string relative = "")
    {
        if (kind == "topic")
        {
            // Each frontend page is stack-neutral with short per-stack sections for
            // what differs between React and Svelte. No other topic page carries
            // stack sections. (litespec/rule/core-authoring.use-the-declared-page-contract)
            var optional = relative.StartsWith("docs/frontend/", StringComparison.Ordinal)
                ? new List<string> { "Concepts", "React", "Svelte", "Reference example" }
                : new List<string> { "Concepts", "Reference example" };
            return new PageContract(["Intent", "Agent Summary", "Standards", "Conventions", "Verification"], optional);
        }

        if (kind == "profile")
        {
            return new PageContract(["Intent", "Agent Summary", "Standards", "Composition", "Conventions", "Verification"], []);
        }

        if (kind == "extension")
        {
            return new PageContract(["Intent", "Activation", "Baseline relationship", "Agent Summary", "Standards", "Conventions", "Dependencies", "Verification"], []);
        }

        if (kind == "how-to")
        {
            return new PageContract(["Purpose", "Procedure", "Verification"], ["Prerequisites"]);
        }

        // A tutorial closes on what the reader now has. Verification asks whether a
        // procedure worked, which is a different question asked by a different reader.
        if (kind == "tutorial")
        {
            return new PageContract(["Purpose", "Prerequisites", "Lesson", "What you built"], []);
        }

        if (kind == "reference")
        {
            return new PageContract(["Intent", "Reference"], ["Notes"]);
        }

        // Underneath is required rather than optional, so a command page that hides its
        // mechanism fails rather than passing in silence. A command with nothing
        // separately runnable writes 'None.' (litespec/rule/core-authoring.name-the-escape-from-every-abstraction)
        if (kind == "command")
        {
            return new PageContract(["Name", "Synopsis", "Description", "Arguments", "Options", "Exit codes", "Examples", "Underneath"], []);
        }

        return null;
    }

    static void CheckSectionOrder(string relative, string? kind, List<PageSection> sections, Action<string, int, string, string> add)
    {
        var contract = ExpectedSections(kind, relative);
        if (contract is null)
        {
            return;
        }

        var names = sections.Select(section => section.Name).ToList();
        foreach (var required in contract.Required)
        {
            if (!names.Contains(required))
            {
                add(relative, 1, "PAGE_MISSING_SECTION", $"missing required H2 '{required}'");
            }
        }

        var allowed = new HashSet<string>(contract.Required.Concat(contract.Optional), StringComparer.Ordinal);
        foreach (var section in sections)
        {
            if (!allowed.Contains(section.Name))
            {
                add(relative, section.Line, "PAGE_UNKNOWN_SECTION", $"H2 '{section.Name}' is not valid for {kind} pages");
            }
        }

        List<string> canonical;
        if (kind == "topic")
        {
            canonical = ["Intent", "Agent Summary", "Concepts"];
            if (relative.StartsWith("docs/frontend/", StringComparison.Ordinal))
            {
                canonical.AddRange(["React", "Svelte"]);
            }

            canonical.AddRange(["Standards", "Conventions", "Reference example", "Verification"]);
        }
        else if (kind == "how-to")
        {
            canonical = ["Purpose", "Prerequisites", "Procedure", "Verification"];
        }
        else if (kind == "reference")
        {
            canonical = ["Intent", "Reference", "Notes"];
        }
        else
        {
            canonical = contract.Required;
        }

        var previous = -1;
        foreach (var section in sections)
        {
            var position = canonical.IndexOf(section.Name);
            if (position < previous)
            {
                add(relative, section.Line, "PAGE_SECTION_ORDER", $"H2 '{section.Name}' is out of order");
                break;
            }

            previous = position;
        }
    }

    static string SectionBody(string[] lines, string sectionName)
    {
        var start = Array.FindIndex(lines, line => PageAnchorSuffixPattern().Replace(line, "").Trim() == $"## {sectionName}");
        if (start < 0)
        {
            return "";
        }

        var end = start + 1;
        while (end < lines.Length && !H2StartPattern().IsMatch(lines[end]))
        {
            end++;
        }

        return string.Join('\n', lines[(start + 1)..end]).Trim();
    }

    static bool TitleCase(string value)
    {
        var tokens = TitleTokenPattern().Matches(value).Cast<Match>().Select(match => match.Value).ToList();
        return tokens.Select((token, index) => (token, index)).All(item =>
        {
            if (TitleAtypicalPattern().IsMatch(item.token) || TitleCamelPattern().IsMatch(item.token) || item.token.Contains('.'))
            {
                return true;
            }

            if (item.index > 0 && item.index < tokens.Count - 1 && TitleSmallWords.Contains(item.token.ToLowerInvariant()))
            {
                return item.token == item.token.ToLowerInvariant();
            }

            return TitleCapitalPattern().IsMatch(item.token);
        });
    }

    static HashSet<string> AnchorsFor(string raw)
    {
        var anchors = new HashSet<string>(StringComparer.Ordinal);
        foreach (Match match in HeadingLinePattern().Matches(raw))
        {
            var explicitAnchor = ExplicitAnchorPattern().Match(match.Groups[1].Value);
            anchors.Add(explicitAnchor.Success ? explicitAnchor.Groups[1].Value : Provisions.HeadingSlug(match.Groups[1].Value));
        }

        return anchors;
    }

    static void CheckIndexAndGlossary(string relative, string? kind, string raw, List<PageSection> sections, Action<string, int, string, string> add)
    {
        if (kind == "index" && (sections.Count == 0 || sections[0].Name != "Intent"))
        {
            add(relative, sections.Count > 0 ? sections[0].Line : 1, "INDEX_INTENT", "an index must start with an Intent H2");
        }

        if (kind != "glossary")
        {
            return;
        }

        var terms = sections.Select(section => section.Name).ToList();
        var sorted = terms
            .OrderBy(term => term, StringComparer.Create(CultureInfo.GetCultureInfo("en"), CompareOptions.IgnoreCase | CompareOptions.IgnoreNonSpace))
            .ToList();
        if (terms.Where((term, index) => term != sorted[index]).Any())
        {
            add(relative, 1, "GLOSSARY_ORDER", "glossary terms are not alphabetical");
        }

        var lines = SplitLines(raw);
        for (var index = 0; index < sections.Count; index++)
        {
            var start = sections[index].Line;
            var end = index + 1 < sections.Count ? sections[index + 1].Line - 1 : lines.Length;
            var firstParagraph = new List<string>();
            for (var cursor = start; cursor < end; cursor++)
            {
                var line = lines[cursor];
                if (line.Trim().Length == 0)
                {
                    if (firstParagraph.Count > 0)
                    {
                        break;
                    }

                    continue;
                }

                if (H16Pattern().IsMatch(line))
                {
                    break;
                }

                firstParagraph.Add(line);
            }

            if (Prose.Sentences(string.Join(' ', firstParagraph)).Count != 1)
            {
                add(relative, sections[index].Line, "GLOSSARY_DEFINITION", $"term '{sections[index].Name}' must start with one definition sentence");
            }
        }
    }

    static void CheckAgentProjection(string relative, string raw, Action<string, int, string, string> add)
    {
        var lines = StripFences(SplitLines(raw));
        var paragraph = new List<LineItem>();
        void Flush()
        {
            if (paragraph.Count == 0)
            {
                return;
            }

            var text = string.Join(' ', paragraph.Select(item => item.Line));
            if (!CitationPattern.IsMatch(text))
            {
                add(relative, paragraph[0].Number, "AGENT_PROJECTION_ID", "agent projection contains no canonical provision citation");
            }

            paragraph.Clear();
        }

        foreach (var item in lines)
        {
            if (item.Line.Trim().Length == 0 || H16Pattern().IsMatch(item.Line))
            {
                Flush();
                continue;
            }

            if (ListMarkerPattern().IsMatch(item.Line))
            {
                Flush();
            }

            paragraph.Add(item);
            if (ListMarkerPattern().IsMatch(item.Line))
            {
                Flush();
            }
        }

        Flush();
    }

    static void CheckProse(string relative, string raw, string? kind, Action<string, int, string, string> add)
    {
        // A recorded decision quotes external material verbatim, so the measures
        // would report the quotation rather than the authoring.
        if (ReferenceDecisionsPattern().IsMatch(relative))
        {
            return;
        }

        Prose.CheckProseMeasures(relative, raw, add);
    }

    static ParsedBlocks ParsePage(string relative, string raw, Action<string, int, string, string> add, Dictionary<string, string> globalIds, string root, bool @virtual = false)
    {
        var kind = PageClass(relative);
        var lines = SplitLines(raw);
        var clean = StripFences(lines);
        var sections = new List<PageSection>();
        var currentH2 = "";
        var h1Count = 0;
        var h1Title = "";
        var h1Line = 1;
        var summaryStart = -1;
        var summaryLine = 1;
        var summaryEnd = lines.Length;
        var provisions = new List<Provision>();
        var verificationRows = new List<VerificationRow>();
        var summaryReferences = new List<SummaryReference>();

        for (var index = 0; index < clean.Count; index++)
        {
            var line = clean[index].Line;
            var h1 = H1Pattern().Match(line);
            if (h1.Success)
            {
                h1Count++;
                h1Title = h1.Groups[1].Value;
                h1Line = index + 1;
            }

            var h2 = H2Pattern().Match(line);
            if (h2.Success)
            {
                if (currentH2 == "Agent Summary")
                {
                    summaryEnd = index;
                }

                var name = PageAnchorSuffixPattern().Replace(h2.Groups[1].Value, "");
                currentH2 = name;
                sections.Add(new PageSection(name, index + 1));
                if (name == "Agent Summary")
                {
                    summaryStart = index + 1;
                    summaryLine = index + 1;
                }

                continue;
            }

            var heading = H3Pattern().Match(line);
            if (heading.Success)
            {
                var rule = ProvisionHeadingPattern.Match(line);
                if ((currentH2 == "Standards" || currentH2 == "Conventions") && !rule.Success)
                {
                    add(relative, index + 1, "ID_MISSING", $"provision heading '{heading.Groups[1].Value}' has no valid ID");
                    continue;
                }

                if (!rule.Success)
                {
                    continue;
                }

                var id = rule.Groups[2].Value;
                var firstWord = FirstWordPattern().Match(rule.Groups[1].Value);
                if (!firstWord.Success || !ActionVerbs.Contains(firstWord.Value))
                {
                    add(relative, index + 1, "HEADING_ACTION", $"provision heading '{rule.Groups[1].Value}' must start with an action verb");
                }

                if (globalIds.TryGetValue(id, out var first))
                {
                    add(relative, index + 1, "ID_DUPLICATE", $"provision ID '{id}' also appears in {first}");
                }
                else
                {
                    globalIds[id] = $"{relative}:{index + 1}";
                }

                if (currentH2 != "Standards" && currentH2 != "Conventions")
                {
                    add(relative, index + 1, "ID_LOCATION", $"provision ID '{id}' is outside Standards or Conventions");
                    continue;
                }

                var cursor = index + 1;
                var body = new List<LineItem>();
                while (cursor < clean.Count && !H23Pattern().IsMatch(clean[cursor].Line))
                {
                    body.Add(clean[cursor++]);
                }

                provisions.Add(new Provision(id, rule.Groups[1].Value, currentH2, index + 1, body));
            }
        }

        // A heading with no body and no lower-level heading beneath it groups
        // nothing. It becomes a dead entry in any generated table of contents.
        for (var index = 0; index < clean.Count; index++)
        {
            var heading = H24Pattern().Match(clean[index].Line);
            if (!heading.Success)
            {
                continue;
            }

            var level = heading.Groups[1].Value.Length;
            var hasBody = false;
            for (var cursor = index + 1; cursor < clean.Count; cursor++)
            {
                var next = H16Pattern().Match(clean[cursor].Line);
                if (next.Success)
                {
                    if (next.Groups[1].Value.Length <= level)
                    {
                        break;
                    }

                    hasBody = true;
                    break;
                }

                if (clean[cursor].Line.Trim().Length > 0 || clean[cursor].Fenced)
                {
                    hasBody = true;
                    break;
                }
            }

            if (!hasBody)
            {
                add(relative, index + 1, "HEADING_EMPTY_BODY", $"heading '{heading.Groups[2].Value}' has no body and no nested heading");
            }
        }

        // An index navigates. A numbered procedure inside one duplicates a canonical
        // provision without citing it. (litespec/rule/core-authoring.use-the-declared-page-contract)
        if (kind == "index")
        {
            var step = clean.FirstOrDefault(item => NumberedStepPattern().IsMatch(item.Line));
            if (step is not null)
            {
                add(relative, step.Number, "INDEX_CONTAINS_PROCEDURE", "an index must not contain a numbered procedure");
            }
        }

        if (kind is not null && kind != "index" && h1Count != 1)
        {
            add(relative, 1, "PAGE_TITLE_COUNT", $"expected one H1, found {h1Count}");
        }

        if (kind is not null && kind != "index" && h1Count == 1 && !TitleCase(h1Title))
        {
            add(relative, h1Line, "PAGE_TITLE_CASE", $"H1 '{h1Title}' must use Title Case");
        }

        CheckSectionOrder(relative, kind, sections, add);
        CheckIndexAndGlossary(relative, kind, raw, sections, add);
        var contract = ExpectedSections(kind, relative);
        if (contract is not null)
        {
            var allowed = new HashSet<string>(contract.Required.Concat(contract.Optional), StringComparer.Ordinal);
            foreach (var section in sections)
            {
                if (allowed.Contains(section.Name) && SectionBody(lines, section.Name).Length == 0)
                {
                    add(relative, section.Line, "PAGE_EMPTY_SECTION", $"H2 '{section.Name}' must contain content or 'None.'");
                }
            }
        }

        if (kind == "topic" && sections.Any(section => section.Name == "Reference example"))
        {
            var example = SectionBody(lines, "Reference example");
            var firstLine = StripFences(SplitLines(example)).FirstOrDefault(item => item.Line.Trim().Length > 0)?.Line.Trim() ?? "";
            var ids = CitationPattern.Matches(example);
            if (!firstLine.StartsWith("This informative example demonstrates ", StringComparison.Ordinal) || ids.Count == 0)
            {
                var section = sections.FirstOrDefault(item => item.Name == "Reference example");
                add(relative, section?.Line ?? 1, "REFERENCE_EXAMPLE_DECLARATION", "Reference example must begin with an informative declaration and provision IDs");
            }
        }

        CheckProvisionBodies(relative, provisions, add);
        CheckSummary(relative, clean, summaryStart, summaryEnd, summaryLine, summaryReferences, add);
        CheckProvisionClaims(relative, provisions, add);
        CheckSummaryRestatement(relative, provisions, summaryReferences, add);
        CheckNormativeLocation(relative, clean, provisions, summaryStart, summaryEnd, add);
        CheckVerificationTable(relative, kind, sections, clean, provisions, verificationRows, root, add);

        if (!@virtual)
        {
            CheckProse(relative, raw, kind, add);
        }

        return new ParsedBlocks(kind, provisions, summaryReferences, verificationRows);
    }

    [GeneratedRegex(@"^#\s+(.+?)\s*$")]
    private static partial Regex H1Pattern();

    [GeneratedRegex(@"^##\s+(.+?)\s*$")]
    private static partial Regex H2Pattern();

    [GeneratedRegex(@"^###\s+(.+)$")]
    private static partial Regex H3Pattern();

    [GeneratedRegex(@"^##\s+")]
    private static partial Regex H2StartPattern();

    [GeneratedRegex(@"^#{2,3}\s+")]
    private static partial Regex H23Pattern();

    [GeneratedRegex(@"^(#{1,6})\s+")]
    private static partial Regex H16Pattern();

    [GeneratedRegex(@"^(#{2,4})\s+(.+?)\s*$")]
    private static partial Regex H24Pattern();

    [GeneratedRegex(@"\s+\{#[^}]+\}\s*$")]
    private static partial Regex PageAnchorSuffixPattern();

    [GeneratedRegex(@"^\s*\d+\.\s+\S")]
    private static partial Regex NumberedStepPattern();

    [GeneratedRegex(@"^\s*-\s+")]
    private static partial Regex BulletPattern();

    [GeneratedRegex(@"^\s*(?:[-*+] |\d+\.\s+)")]
    private static partial Regex ListMarkerPattern();

    [GeneratedRegex(@"^docs/([a-z][a-z0-9]*)/[a-z][a-z0-9-]*\.md$")]
    private static partial Regex PageAreaPattern();

    [GeneratedRegex(@"[A-Za-z0-9][A-Za-z0-9./+-]*")]
    private static partial Regex TitleTokenPattern();

    [GeneratedRegex(@"^(?:v?\d|[A-Z0-9.]+$)")]
    private static partial Regex TitleAtypicalPattern();

    [GeneratedRegex(@"[a-z][A-Z]|[A-Z][a-z]+[A-Z]")]
    private static partial Regex TitleCamelPattern();

    [GeneratedRegex(@"^[A-Z]")]
    private static partial Regex TitleCapitalPattern();

    [GeneratedRegex(@"^#{1,6}\s+(.+)$", RegexOptions.Multiline)]
    private static partial Regex HeadingLinePattern();

    [GeneratedRegex(@"\{#([^}]+)\}\s*$")]
    private static partial Regex ExplicitAnchorPattern();

    [GeneratedRegex(@"(^|/)reference/decisions/")]
    private static partial Regex ReferenceDecisionsPattern();

    [GeneratedRegex(@"^[A-Za-z]+(?:-[A-Za-z]+)?")]
    private static partial Regex FirstWordPattern();
}

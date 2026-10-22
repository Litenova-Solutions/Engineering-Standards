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

    // A page's location names its class. Four areas hold pages a reader follows or
    // looks up rather than pages that own provisions, and each one answers a
    // question at a single layer. (litespec/core/authoring#state-one-layer-per-page)

    // The words that stay lowercase inside a Title Case heading, unless first or
    // last: articles, coordinating conjunctions, and prepositions of four letters
    // or fewer. Every other word starts with a capital.
    static readonly HashSet<string> TitleSmallWords = new(
        ["a", "an", "the", "and", "but", "for", "nor", "or", "so", "yet",
         "as", "at", "by", "from", "in", "into", "of", "off", "on", "onto",
         "over", "per", "to", "up", "upon", "via", "with"],
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

        if (!relative.StartsWith("docs/", StringComparison.Ordinal) || !relative.EndsWith(".md", StringComparison.Ordinal))
        {
            return null;
        }

        // Any page inside an ext/ folder is an extension page, whether it extends one
        // stack or every stack.
        if (relative.Contains("/ext/", StringComparison.Ordinal))
        {
            return "extension";
        }

        var segments = relative["docs/".Length..^".md".Length].Split('/');
        if (segments[0] == "tools")
        {
            return "command";
        }

        if (segments[0] == "reference")
        {
            return "reference";
        }

        if (segments[0] == "tutorial")
        {
            return "tutorial";
        }

        if (segments[0] == "guide")
        {
            return "how-to";
        }

        // The analyzers area mirrors the command area: one reference page per rule
        // under rules/, and the procedures for using the package beside them.
        if (segments[0] == "analyzers")
        {
            return segments.Length > 2 && segments[1] == "rules" ? "reference" : "how-to";
        }

        // An explanation page builds understanding. Its sections are free, it owns no
        // provisions, and no selection applies it. The example area follows one
        // product through LiteSpec the same way.
        if (segments[0] == "learn" || segments[0] == "example")
        {
            return "explanation";
        }

        if (Patterns.PatternPage.IsPatternPage(relative))
        {
            return "pattern";
        }

        if ((segments[0] == "backend" || segments[0] == "frontend") && segments[^1] == "stack")
        {
            return "stack";
        }

        return "topic";
    }

    static PageContract? ExpectedSections(string? kind)
    {
        if (kind == "topic")
        {
            // A topic page carries no per-stack sections. Shared pages stay neutral
            // across stacks, and each stack page carries its own bindings.
            // (litespec/core/authoring#place-each-stack-binding-on-its-stack-page)
            return new PageContract(["Intent", "Standards", "Conventions", "Verification"], ["Concepts", "Reference Example"]);
        }

        // A pattern page offers drawn options for recurring interface questions; its
        // Standards hold the rules every option keeps.
        if (kind == "pattern")
        {
            return new PageContract(["Intent", "Patterns", "Verification"], ["Concepts", "Standards", "Conventions"]);
        }

        if (kind == "stack")
        {
            return new PageContract(["Intent", "Standards", "Conventions", "Verification"], ["Concepts"]);
        }

        if (kind == "extension")
        {
            return new PageContract(["Intent", "Activation", "Baseline Relationship", "Standards", "Conventions", "Dependencies", "Verification"], []);
        }

        if (kind == "how-to")
        {
            return new PageContract(["Purpose", "Procedure", "Check"], ["Prerequisites"]);
        }

        // A tutorial closes on what the reader now has. Check asks whether a
        // procedure worked, which is a different question asked by a different reader.
        if (kind == "tutorial")
        {
            return new PageContract(["Purpose", "Prerequisites", "Lesson", "What You Built"], []);
        }

        if (kind == "reference")
        {
            return new PageContract(["Intent", "Reference"], ["Notes"]);
        }

        // Underneath is required rather than optional, so a command page that hides its
        // mechanism fails rather than passing in silence. A command with nothing
        // separately runnable writes 'None.' (litespec/core/authoring#name-the-escape-from-every-abstraction)
        if (kind == "command")
        {
            return new PageContract(["Name", "Synopsis", "Description", "Arguments", "Options", "Exit Codes", "Examples", "Underneath"], []);
        }

        return null;
    }

    static void CheckSectionOrder(string relative, string? kind, List<PageSection> sections, Action<string, int, string, string> add)
    {
        var contract = ExpectedSections(kind);
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
            canonical = ["Intent", "Concepts", "Standards", "Conventions", "Reference Example", "Verification"];
        }
        else if (kind == "pattern")
        {
            canonical = ["Intent", "Concepts", "Standards", "Conventions", "Patterns", "Verification"];
        }
        else if (kind == "stack")
        {
            canonical = ["Intent", "Concepts", "Standards", "Conventions", "Verification"];
        }
        else if (kind == "how-to")
        {
            canonical = ["Purpose", "Prerequisites", "Procedure", "Check"];
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
        // Code spans and explicit anchors keep their own case; the rule judges
        // the words around them.
        value = PageAnchorSuffixPattern().Replace(value, "");
        value = InlineCodePattern().Replace(value, " ");
        var matches = TitleTokenPattern().Matches(value).Cast<Match>().ToList();
        return matches.Select((match, index) => (token: match.Value, index, start: match.Index)).All(item =>
        {
            if (TitleAtypicalPattern().IsMatch(item.token) || TitleCamelPattern().IsMatch(item.token) || item.token.Contains('.'))
            {
                return true;
            }

            // The word after a colon starts a new phrase and is capitalized like a first word.
            var afterColon = value[..item.start].TrimEnd().EndsWith(':');

            if (item.index > 0 && item.index < matches.Count - 1 && !afterColon && TitleSmallWords.Contains(item.token.ToLowerInvariant()))
            {
                return item.token == item.token.ToLowerInvariant();
            }

            return TitleCapitalPattern().IsMatch(item.token);
        });
    }

    // Every heading below the title uses Title Case. The page contract owns
    // its H2 literals, and the root routing heading is a fixed literal too,
    // so those stay untouched here and change with the contract instead. The
    // generated provision index is tool output rather than authored headings.
    static void CheckHeadingCase(string relative, string? kind, List<LineItem> clean, Action<string, int, string, string> add)
    {
        if (relative == Provisions.IndexPath)
        {
            return;
        }

        var contract = ExpectedSections(kind);
        var contractNames = contract is null
            ? new HashSet<string>(StringComparer.Ordinal)
            : new HashSet<string>(contract.Required.Concat(contract.Optional), StringComparer.Ordinal);
        foreach (var item in clean)
        {
            var heading = HeadingCasePattern().Match(item.Line);
            if (!heading.Success)
            {
                continue;
            }

            var level = heading.Groups[1].Value.Length;
            var title = PageAnchorSuffixPattern().Replace(heading.Groups[2].Value, "").Trim();
            if (level == 2 && (title == RoutingHeading || contractNames.Contains(title)))
            {
                continue;
            }

            if (title.Length > 0 && !TitleCase(title))
            {
                add(relative, item.Number, "PAGE_HEADING_CASE", $"H{level} '{title}' must use Title Case");
            }
        }
    }

    // A required section with nothing to say holds exactly `None.`. These are
    // the placeholder phrasings that mean the same thing in other words.
    static bool EmptySectionVariant(string body)
    {
        var text = body.Trim();
        if (text is "None" or "N/A" or "n/a")
        {
            return true;
        }

        if (text.StartsWith("None.", StringComparison.Ordinal) && text != "None.")
        {
            return true;
        }

        return AddsNoContentPattern().IsMatch(text);
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

        if (kind == "explanation" && (sections.Count == 0 || sections[0].Name != "Intent"))
        {
            add(relative, sections.Count > 0 ? sections[0].Line : 1, "PAGE_MISSING_SECTION", "an explanation page starts with an Intent H2");
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
        var provisions = new List<Provision>();
        var verificationRows = new List<VerificationRow>();

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
                var name = PageAnchorSuffixPattern().Replace(h2.Groups[1].Value, "");
                currentH2 = name;
                sections.Add(new PageSection(name, index + 1));

                continue;
            }

            var heading = H3Pattern().Match(line);
            if (!heading.Success)
            {
                continue;
            }

            var pattern = currentH2 == "Patterns" && kind == "pattern";
            if (currentH2 != "Standards" && currentH2 != "Conventions" && !pattern)
            {
                continue;
            }

            if (!Provisions.IsProvisionPage(relative))
            {
                continue;
            }

            // The identifier is computed from the page path and the heading, so the
            // heading carries no ID text of its own.
            var title = heading.Groups[1].Value.Trim();
            if (title.Contains("litespec/", StringComparison.Ordinal))
            {
                add(relative, index + 1, "ID_IN_HEADING", $"provision heading '{title}' carries identifier text; the ID is computed from the page and the heading");
            }

            var id = $"litespec/{Provisions.PagePath(relative)}#{Provisions.HeadingSlug(title)}";
            var firstWord = FirstWordPattern().Match(title);
            // A pattern heading is the pattern's name, so its ID survives a change of default.
            if (!pattern && (!firstWord.Success || !ActionVerbs.Contains(firstWord.Value)))
            {
                add(relative, index + 1, "HEADING_ACTION", $"provision heading '{title}' must start with an action verb");
            }

            if (globalIds.TryGetValue(id, out var first))
            {
                add(relative, index + 1, "ID_DUPLICATE", $"provision ID '{id}' also appears in {first}");
            }
            else
            {
                globalIds[id] = $"{relative}:{index + 1}";
            }

            var cursor = index + 1;
            var body = new List<LineItem>();
            while (cursor < clean.Count && !H23Pattern().IsMatch(clean[cursor].Line))
            {
                body.Add(clean[cursor++]);
            }

            provisions.Add(new Provision(id, title, currentH2, index + 1, body));
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
        // provision without citing it. (litespec/core/authoring#use-the-declared-page-contract)
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
        CheckHeadingCase(relative, kind, clean, add);
        var contract = ExpectedSections(kind);
        if (contract is not null)
        {
            var allowed = new HashSet<string>(contract.Required.Concat(contract.Optional), StringComparer.Ordinal);
            foreach (var section in sections)
            {
                if (!allowed.Contains(section.Name))
                {
                    continue;
                }

                var body = SectionBody(lines, section.Name);
                if (body.Length == 0)
                {
                    add(relative, section.Line, "PAGE_EMPTY_SECTION", $"H2 '{section.Name}' must contain content or 'None.'");
                }
                else if (EmptySectionVariant(body))
                {
                    add(relative, section.Line, "PAGE_EMPTY_SECTION_TEXT", $"H2 '{section.Name}' must contain exactly 'None.' when it has nothing to say");
                }
            }
        }

        if (kind == "topic" && sections.Any(section => section.Name == "Reference Example"))
        {
            var example = SectionBody(lines, "Reference Example");
            var firstLine = StripFences(SplitLines(example)).FirstOrDefault(item => item.Line.Trim().Length > 0)?.Line.Trim() ?? "";
            var ids = CitationPattern.Matches(example);
            if (!firstLine.StartsWith("This informative example demonstrates ", StringComparison.Ordinal) || ids.Count == 0)
            {
                var section = sections.FirstOrDefault(item => item.Name == "Reference Example");
                add(relative, section?.Line ?? 1, "REFERENCE_EXAMPLE_DECLARATION", "Reference Example must begin with an informative declaration and provision IDs");
            }
        }

        var rules = provisions.Where(provision => provision.Section != "Patterns").ToList();
        CheckProvisionBodies(relative, rules, add);
        CheckProvisionClaims(relative, rules, add);
        CheckNormativeLocation(relative, clean, provisions, add);
        CheckVerificationTable(relative, kind, sections, clean, provisions, verificationRows, root, add);

        if (kind == "pattern")
        {
            var group = Path.GetFileNameWithoutExtension(relative);
            foreach (var (line, message) in Patterns.PatternPage.Parse(group, raw).Check())
            {
                add(relative, line, "PATTERN_INVALID", message);
            }
        }

        return new ParsedBlocks(kind, provisions, verificationRows);
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

    [GeneratedRegex(@"^(#{2,6})\s+(.+?)\s*$")]
    private static partial Regex HeadingCasePattern();

    [GeneratedRegex(@"^This [A-Za-z]+ adds no [A-Za-z]+\.$")]
    private static partial Regex AddsNoContentPattern();

    [GeneratedRegex(@"\s+\{#[^}]+\}\s*$")]
    private static partial Regex PageAnchorSuffixPattern();

    [GeneratedRegex(@"^\s*\d+\.\s+\S")]
    private static partial Regex NumberedStepPattern();

    [GeneratedRegex(@"^\s*-\s+")]
    private static partial Regex BulletPattern();

    [GeneratedRegex(@"^\s*(?:[-*+] |\d+\.\s+)")]
    private static partial Regex ListMarkerPattern();

    [GeneratedRegex(@"[A-Za-z0-9][A-Za-z0-9'./+-]*")]
    private static partial Regex TitleTokenPattern();

    // A token holding a digit is a proper name such as arc42 or C4 and keeps its own case.
    [GeneratedRegex(@"^(?:v?\d|[A-Z0-9.]+$|[A-Za-z]+\d)")]
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

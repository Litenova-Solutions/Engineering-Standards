using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Authoring;
using LiteSpec.Schemas;

namespace LiteSpec.Consumer;

/// <summary>
///     The page scan of the consumer validator: collects the Markdown pages, validates each
///     page's frontmatter against the record schema, and checks the required sections,
///     the Title Case headings, and the Example word bound.
/// </summary>
static partial class ConsumerValidator
{
    // Each template in the 2.0 template table names the sections its reader expects
    // to find. An absent section is a question the page never answered, which reads
    // exactly like a question with no answer. Types with no entry carry their
    // content in frontmatter or hold optional sections only, and keep free body prose.
    static readonly Dictionary<string, string[]> RequiredSections = new(StringComparer.Ordinal)
    {
        ["product"] = ["Summary"],
        ["goal"] = ["Why It Matters"],
        ["problem"] = ["Situation", "Evidence"],
        ["feature"] = ["Offering"],
        ["constraint"] = ["Summary", "What It Requires"],
        ["research"] = ["Answer"],
        ["decision"] = ["Context", "Decision", "Consequences"],
        ["requirement-page"] = ["Summary", "The Situation", "What We Do", "Why It Is Better", "Example", "Costs and Risks", "How Sure We Are", "Position", "Refusals"],
        ["journey"] = ["Example", "Between the Steps"],
        ["aggregate"] = ["Transitions", "Data"],
        ["use-case"] = ["Goal"],
        ["rule-set"] = ["Summary"],
        ["actor"] = ["Summary"],
        ["role"] = ["Summary"],
        ["external-system"] = ["Summary"],
        ["runbook"] = ["Impact", "Prerequisites", "Procedure", "Verification", "Rollback or Recovery", "Escalation"],
        ["deviation"] = ["Consequences"],
        ["known-gap"] = ["Exit"],
        ["example-cast"] = ["The Organization", "The People", "The Occasion", "The Amounts", "Recurring Situations"],
        ["tutorial"] = ["Purpose", "Prerequisites", "Lesson", "What You Built"],
        ["how-to"] = ["Purpose", "Procedure", "Check"],
        ["reference"] = ["Intent", "Reference"],
        ["command"] = ["Name", "Synopsis", "Description", "Arguments", "Options", "Exit Codes", "Examples", "Underneath"],
        ["configuration"] = ["Intent", "Settings", "Precedence"],
    };

    // The words that stay lowercase inside a Title Case heading, unless first or
    // last: articles, coordinating conjunctions, and prepositions of four letters
    // or fewer. Every other word starts with a capital.
    static readonly HashSet<string> TitleSmallWords = new(
        ["a", "an", "the", "and", "but", "for", "nor", "or", "so", "yet",
         "as", "at", "by", "from", "in", "into", "of", "off", "on", "onto",
         "over", "per", "to", "up", "upon", "via", "with"],
        StringComparer.Ordinal);

    static readonly Regex TitleToken = new("[A-Za-z0-9][A-Za-z0-9'./+-]*");

    static readonly Regex TitleAtypical = new("^(?:v?\\d|[A-Z0-9.]+$)");

    static readonly Regex TitleCamel = new("[a-z][A-Z]|[A-Z][a-z]+[A-Z]");

    static readonly Regex TitleCapital = new("^[A-Z]");

    static readonly Regex FencedBlock = new("```[a-z]*\\s*\\n\\s*\\{[\\s\\S]{0,400}?\"type\"\\s*:");

    static readonly Regex HeadingTwo = new("^##\\s");

    /// <summary>
    ///     Collects the Markdown pages under the documentation root in ordinal name order.
    /// </summary>
    static void CollectFiles(RunState run)
    {
        Walk(run.DocsRoot);

        void Walk(string directory)
        {
            if (!Directory.Exists(directory))
            {
                return;
            }

            foreach (var entry in Directory.GetFileSystemEntries(directory).OrderBy(name => name, StringComparer.Ordinal))
            {
                var name = Path.GetFileName(entry) ?? "";

                if (name == "node_modules" || name.StartsWith('.'))
                {
                    continue;
                }

                if (Directory.Exists(entry))
                {
                    Walk(entry);
                }
                else if (name.EndsWith(".md", StringComparison.Ordinal) && File.Exists(entry))
                {
                    run.Files.Add(entry);
                }
            }
        }
    }

    /// <summary>
    ///     Validates each page's frontmatter, headings, and required sections.
    /// </summary>
    static void CheckPages(RunState run)
    {
        var exampleLimit = ExampleWordLimit(run);

        foreach (var file in run.Files)
        {
            var relative = run.Relative(file);
            var raw = run.ReadText(file);
            var meta = ParseBlock(raw, relative, run);

            if (IsFalsy(meta))
            {
                continue;
            }

            run.Pages += 1;

            // Frontmatter is validated through the shared schema module against the
            // record schema, so the schema is the one statement of every record shape.
            foreach (var problem in JsonSchema.Problems(run.RecordSchemaFile, meta, relative, run.ReadSchema))
            {
                run.Err(problem);
            }

            CheckHeadings(run, relative, raw);

            if (PropString(meta as JsonObject, "type") is string type && RequiredSections.TryGetValue(type, out var required))
            {
                foreach (var name in required)
                {
                    if (SectionBody(raw, name) is null)
                    {
                        run.Err($"{relative}: type '{type}' requires an H2 '{name}'");
                    }
                }

                // A query reads what a command or reaction wrote, so it states its
                // goal and no behavior. A command or reaction states what happens.
                if (type == "use-case"
                    && PropString(meta as JsonObject, "kind") is "command" or "reaction"
                    && SectionBody(raw, "What Happens") is null)
                {
                    run.Err($"{relative}: type 'use-case' requires an H2 'What Happens'");
                }
            }

            // The Example section stays a narrative, not a second specification: it
            // illustrates the page within the word bound and carries no authority.
            if (SectionBody(raw, "Example") is string example)
            {
                var words = Prose.Words(example).Count;

                if (words > exampleLimit)
                {
                    run.Err($"{relative}: Example section has {words} words, over the {exampleLimit} word bound");
                }
            }
        }
    }

    /// <summary>
    ///     Reads the Example word bound from the project record. Omitted, the recorded
    ///     default of 120 applies, and a bound below 40 is refused.
    /// </summary>
    static int ExampleWordLimit(RunState run)
    {
        var value = (run.Project as JsonObject)?["exampleWordLimit"];

        if (value is JsonValue number && number.TryGetValue<long>(out var limit))
        {
            if (limit < 40)
            {
                run.Err($"litespec.project.json: exampleWordLimit '{limit}' is below 40; the Example bound cannot be that short");
                return 120;
            }

            return limit > int.MaxValue ? int.MaxValue : (int)limit;
        }

        return 120;
    }

    /// <summary>
    ///     Whether a heading uses Title Case: every word starts with a capital except
    ///     a small word in the middle, with version numbers, all-capitals tokens,
    ///     camel-case names and dotted names passing through.
    /// </summary>
    static bool TitleCase(string value)
    {
        var tokens = TitleToken.Matches(value).Select(match => match.Value).ToList();

        return tokens.Select((token, index) => (token, index)).All(item =>
        {
            if (TitleAtypical.IsMatch(item.token) || TitleCamel.IsMatch(item.token) || item.token.Contains('.'))
            {
                return true;
            }

            if (item.index > 0 && item.index < tokens.Count - 1 && TitleSmallWords.Contains(item.token.ToLowerInvariant()))
            {
                return item.token == item.token.ToLowerInvariant();
            }

            return TitleCapital.IsMatch(item.token);
        });
    }

    /// <summary>
    ///     Checks that the page title and every section heading use Title Case.
    ///     Headings inside fenced blocks and generated regions are tool output or
    ///     quoted examples rather than authored headings, so they are skipped.
    /// </summary>
    static void CheckHeadings(RunState run, string relative, string raw)
    {
        var inFence = false;
        var inGenerated = false;

        foreach (var line in Regex.Split(raw, "\r?\n"))
        {
            var trimmed = line.Trim();

            if (trimmed.StartsWith("```", StringComparison.Ordinal))
            {
                inFence = !inFence;
                continue;
            }

            if (inFence)
            {
                continue;
            }

            if (trimmed.StartsWith("<!-- generated:", StringComparison.Ordinal))
            {
                inGenerated = true;
                continue;
            }

            if (trimmed.StartsWith("<!-- /generated:", StringComparison.Ordinal))
            {
                inGenerated = false;
                continue;
            }

            if (inGenerated)
            {
                continue;
            }

            if (trimmed.StartsWith("# ", StringComparison.Ordinal))
            {
                var title = trimmed[2..].Trim();

                if (title.Length > 0 && !TitleCase(title))
                {
                    run.Err($"{relative}: H1 '{title}' must use Title Case");
                }
            }
            else if (trimmed.StartsWith("## ", StringComparison.Ordinal))
            {
                var name = trimmed[3..].Trim();

                if (name.Length > 0 && !TitleCase(name))
                {
                    run.Err($"{relative}: H2 '{name}' must use Title Case");
                }
            }
        }
    }

    /// <summary>
    ///     Reads the <c>---</c> delimited JSON frontmatter block. A file that carries a record in
    ///     any other wrapper, or carries none at all, is reported rather than skipped,
    ///     because a silently skipped page is an unvalidated page: the run passes while
    ///     that page sits unchecked beside every page that was checked.
    /// </summary>
    static JsonNode? ParseBlock(string raw, string relative, RunState run)
    {
        if (!raw.StartsWith("---", StringComparison.Ordinal))
        {
            var head = raw.Length > 2000 ? raw.Substring(0, 2000) : raw;

            if (FencedBlock.IsMatch(head))
            {
                run.Err($"{relative}: frontmatter block is not delimited by '---'");
            }
            else
            {
                run.Err($"{relative}: no frontmatter block; every page opens with a '---' JSON block carrying its record type or page style");
            }

            return null;
        }

        var end = raw.IndexOf("\n---", 3, StringComparison.Ordinal);

        if (end < 0)
        {
            run.Err($"{relative}: unterminated frontmatter block");
            return null;
        }

        try
        {
            return JsonNode.Parse(raw.Substring(3, end - 3).Trim());
        }
        catch (Exception cause)
        {
            run.Err($"{relative}: JSON parse error: {cause.Message}");
            return null;
        }
    }

    /// <summary>
    ///     The text between the named H2 and the next one, or null when the page has no such section.
    /// </summary>
    static string? SectionBody(string raw, string name)
    {
        var lines = Regex.Split(raw, "\r?\n");
        var start = Array.FindIndex(lines, line => line.Trim() == $"## {name}");

        if (start < 0)
        {
            return null;
        }

        var body = new List<string>();

        for (var index = start + 1; index < lines.Length; index++)
        {
            if (HeadingTwo.IsMatch(lines[index]))
            {
                break;
            }

            body.Add(lines[index]);
        }

        return string.Join("\n", body);
    }
}

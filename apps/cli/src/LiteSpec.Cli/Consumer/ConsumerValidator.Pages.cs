using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Schemas;

namespace LiteSpec.Consumer;

/// <summary>
///     The page scan of the consumer validator: collects the Markdown pages, validates each
///     page's frontmatter against the record schema, and checks the required sections.
/// </summary>
static partial class ConsumerValidator
{
    // A page record or a page style declares the sections its reader expects to
    // find. An absent section is a question the page never answered, which reads
    // exactly like a question with no answer. Types with no entry carry their
    // content in frontmatter and keep free body prose.
    static readonly Dictionary<string, string[]> RequiredSections = new(StringComparer.Ordinal)
    {
        ["decision"] = ["Context", "Options", "Decision", "Consequences", "Evidence"],
        ["tutorial"] = ["Purpose", "Prerequisites", "Lesson", "What you built"],
        ["how-to"] = ["Purpose", "Procedure", "Verification"],
        ["reference"] = ["Intent", "Reference"],
        ["command"] = ["Name", "Synopsis", "Description", "Arguments", "Options", "Exit codes", "Examples", "Underneath"],
        ["configuration"] = ["Intent", "Settings", "Precedence"],
    };

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
    ///     Validates each page's frontmatter and required sections.
    /// </summary>
    static void CheckPages(RunState run)
    {
        foreach (var file in run.Files)
        {
            var relative = run.Relative(file);
            var meta = ParseBlock(run.ReadText(file), relative, run);

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

            if (PropString(meta as JsonObject, "type") is string type && RequiredSections.TryGetValue(type, out var required))
            {
                foreach (var name in required)
                {
                    if (SectionBody(run.ReadText(file), name) is null)
                    {
                        run.Err($"{relative}: type '{type}' requires an H2 '{name}'");
                    }
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

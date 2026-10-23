using LiteSpec.Model;

namespace LiteSpec.Authoring;

/// <summary>
///     Where a record page lives: the home folder of each page-owning record
///     type, the entry types that live inside another page, and the shared
///     identifier checks of <c>litespec new</c> and <c>litespec rename</c>.
/// </summary>
static class RecordPages
{
    /// <summary>Record types that own a page <c>litespec new</c> can scaffold.</summary>
    public static readonly HashSet<string> PageTypes = new(StringComparer.Ordinal)
    {
        "product", "goal", "problem", "feature", "constraint", "research",
        "decision", "journey", "actor", "module", "aggregate", "use-case",
        "reaction", "job", "notification", "role", "external-system",
        "runbook", "deviation", "known-gap",
    };

    /// <summary>Where an entry type lives, for the refusal message.</summary>
    public static readonly Dictionary<string, string> EntryHomes = new(StringComparer.Ordinal)
    {
        ["requirement"] = "a requirement page under docs/intent/",
        ["rule"] = "its aggregate page, or a rule page under docs/behavior/rules/ for a cross-aggregate rule",
        ["result"] = "its use-case page",
        ["scenario"] = "its use-case or reaction page",
        ["event"] = "its aggregate page",
        ["integration-event"] = "one page per event under docs/behavior/integration-events/",
        ["setting"] = "its module page, or a setting-set page",
        ["permission"] = "docs/behavior/access/permissions.md",
        ["entry-point"] = "docs/behavior/access/entry-points.md",
        ["term"] = "the glossary",
    };

    private static readonly HashSet<string> SkippedFolders = new(StringComparer.OrdinalIgnoreCase)
    {
        "bin", "obj", "TestResults", "node_modules", ".git", ".model",
        ".svelte-kit", "build", "dist", "coverage",
    };

    /// <summary>The documentation root new pages are written under.</summary>
    public static string DocsRoot(ConsumerConfig config) =>
        config.RecordRoots.FirstOrDefault() ?? Path.Combine(config.Root, "docs");

    /// <summary>
    ///     The absolute path of the page a record owns. A use-case page starts
    ///     under <c>reads/</c> beside its module; the author moves the file beside
    ///     its aggregate once the use case names one.
    /// </summary>
    public static string PagePath(ConsumerConfig config, string type, string? home, string name)
    {
        var docs = DocsRoot(config);
        var behavior = config.BehaviorDocs;

        return type switch
        {
            "product" => Path.Combine(docs, "intent", "brief.md"),
            "goal" => Path.Combine(docs, "intent", "goals", $"{name}.md"),
            "problem" => Path.Combine(docs, "intent", "problems", $"{name}.md"),
            "feature" => Path.Combine(docs, "intent", "features", $"{name}.md"),
            "constraint" => Path.Combine(docs, "intent", "constraints", $"{name}.md"),
            "research" => Path.Combine(docs, "intent", "research", $"{name}.md"),
            "decision" => Path.Combine(docs, "intent", "decisions", $"{name}.md"),
            "journey" => Path.Combine(docs, "intent", "journeys", $"{name}.md"),
            "actor" => Path.Combine(docs, "intent", "actors", $"{name}.md"),
            "module" => Path.Combine(behavior, "modules", name, "README.md"),
            "aggregate" => Path.Combine(behavior, "modules", home!, name, "README.md"),
            "use-case" => Path.Combine(behavior, "modules", home!, "reads", $"{name}.md"),
            "reaction" => Path.Combine(behavior, "modules", home!, "reactions", $"{name}.md"),
            "job" => Path.Combine(behavior, "modules", home!, "jobs", $"{name}.md"),
            "notification" => Path.Combine(behavior, "modules", home!, "notifications", $"{name}.md"),
            "role" => Path.Combine(behavior, "access", "roles", $"{name}.md"),
            "external-system" => Path.Combine(behavior, "external-systems", $"{name}.md"),
            "runbook" => Path.Combine(behavior, "runbooks", $"{name}.md"),
            "deviation" => Path.Combine(docs, "governance", "deviations", $"{name}.md"),
            "known-gap" => Path.Combine(docs, "governance", "known-gaps", $"{name}.md"),
            _ => throw new ArgumentOutOfRangeException(nameof(type), $"Type '{type}' owns no page."),
        };
    }

    /// <summary>
    ///     The file a renamed page moves to, or null when the page stays where it
    ///     is. A page that already sits inside its home's module area keeps its
    ///     folder and takes the new file name, so a use case beside its aggregate
    ///     is not dragged back under <c>reads/</c> by its own rename.
    /// </summary>
    public static string? RenameTarget(
        ConsumerConfig config, string type, string? oldHome, string? newHome, string newName, string oldFile)
    {
        var placed = PagePath(config, type, newHome, newName);

        if (string.Equals(placed, oldFile, StringComparison.Ordinal))
        {
            return null;
        }

        var oldFolder = Path.GetDirectoryName(oldFile);
        var placedFolder = Path.GetDirectoryName(placed);

        if (oldFolder is null
            || string.Equals(oldFolder, placedFolder, StringComparison.Ordinal)
            || !StaysInFolder(config, type, oldHome, newHome, oldFolder))
        {
            return placed;
        }

        var stayed = Path.Combine(oldFolder, Path.GetFileName(placed));

        return string.Equals(stayed, oldFile, StringComparison.Ordinal) ? null : stayed;
    }

    /// <summary>
    ///     The folder a renamed module or aggregate page moves to. The folder moves
    ///     whole, so the use cases beside a renamed aggregate move with it.
    /// </summary>
    public static string RenameFolderTarget(ConsumerConfig config, string type, string? newHome, string newName) =>
        Path.GetDirectoryName(PagePath(config, type, newHome, newName))!;

    /// <summary>
    ///     Whether the renamed page keeps its folder: the home is unchanged and the
    ///     folder sits inside that home's module area.
    /// </summary>
    static bool StaysInFolder(ConsumerConfig config, string type, string? oldHome, string? newHome, string folder)
    {
        if (type is "module" or "aggregate"
            || oldHome is null || newHome is null
            || !string.Equals(oldHome, newHome, StringComparison.Ordinal))
        {
            return false;
        }

        var area = Path.Combine(config.BehaviorDocs, "modules", newHome) + Path.DirectorySeparatorChar;

        return (folder + Path.DirectorySeparatorChar).StartsWith(area, StringComparison.Ordinal);
    }

    /// <summary>
    ///     The grammar error in an identifier's home and name, or null when both
    ///     follow the record identifier grammar.
    /// </summary>
    public static string? GrammarError(string type, string? home, string name, string full)
    {
        if (RecordTypes.WithHome.Contains(type) && home is null)
        {
            return $"Identifier '{full}' needs a home: use {type}/<home>.<name>.";
        }

        if (!RecordTypes.WithHome.Contains(type) && home is not null)
        {
            return $"Identifier '{full}' carries no home: use {type}/<name>.";
        }

        if (home is not null && (!Identifiers.ValidName(home, false) || Identifiers.AllDigitsName(home)))
        {
            return $"Identifier '{full}' is not a valid {type} identifier.";
        }

        if (!Identifiers.ValidName(name, type == "decision") || Identifiers.AllDigitsName(name))
        {
            return type == "decision"
                ? $"Identifier '{full}' is not a valid decision identifier: use decision/<number>-<name>."
                : $"Identifier '{full}' is not a valid {type} identifier.";
        }

        return null;
    }

    /// <summary>
    ///     Rewrites every citation of <paramref name="oldId"/> as
    ///     <paramref name="newId"/>. A match inside a longer identifier is left
    ///     alone; a journey step keeps its fragment.
    /// </summary>
    public static string ReplaceCitations(string text, string oldId, string newId, out int count)
    {
        count = 0;

        if (text.IndexOf(oldId, StringComparison.Ordinal) < 0)
        {
            return text;
        }

        var built = new System.Text.StringBuilder(text.Length);
        var index = 0;

        while (true)
        {
            var found = text.IndexOf(oldId, index, StringComparison.Ordinal);

            if (found < 0)
            {
                built.Append(text, index, text.Length - index);
                break;
            }

            var before = found > 0 ? text[found - 1] : '\0';
            var afterIndex = found + oldId.Length;
            var after = afterIndex < text.Length ? text[afterIndex] : '\0';

            if (IsIdChar(before) || before == '/' || IsIdChar(after) || after == '/')
            {
                built.Append(text, index, afterIndex - index);
                index = afterIndex;
                continue;
            }

            built.Append(text, index, found - index);
            built.Append(newId);
            count += 1;
            index = afterIndex;
        }

        return built.ToString();
    }

    /// <summary>Whether the character continues an identifier.</summary>
    static bool IsIdChar(char value) =>
        char.IsAsciiLetterOrDigit(value) || value is '_' or '-' or '.';

    /// <summary>
    ///     Every Markdown and JSON file under the root, in a stable order, with
    ///     build output, installed packages, and hidden folders left out.
    /// </summary>
    public static IReadOnlyList<string> ProjectFiles(string root)
    {
        var found = new List<string>();

        if (Directory.Exists(root))
        {
            Walk(root, found);
        }

        found.Sort(StringComparer.Ordinal);

        return found;
    }

    static void Walk(string directory, List<string> found)
    {
        foreach (var file in Directory.EnumerateFiles(directory))
        {
            if (file.EndsWith(".md", StringComparison.OrdinalIgnoreCase)
                || file.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
            {
                found.Add(file);
            }
        }

        foreach (var child in Directory.EnumerateDirectories(directory))
        {
            var name = Path.GetFileName(child) ?? "";

            if (name.StartsWith('.') || SkippedFolders.Contains(name))
            {
                continue;
            }

            Walk(child, found);
        }
    }
}

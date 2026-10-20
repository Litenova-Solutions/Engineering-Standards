using System.Text.Json.Nodes;

namespace LiteSpec.Authoring;

/// <summary>
///     The folder-based stack layout: the stacks a manifest ships and the pages a
///     selection applies. Pure computation over the manifest and the docs tree, so the
///     consumer validator and the model builder can call it without console output.
/// </summary>
static class Layout
{
    /// <summary>One shipped stack: its id, folder, kind, and pairing rules.</summary>
    /// <param name="Id">The stack id a project names.</param>
    /// <param name="Folder">The stack folder, such as <c>docs/backend/dotnet</c>.</param>
    /// <param name="Kind"><c>backend</c> or <c>frontend</c>, from the folder's area.</param>
    /// <param name="Requires">Stacks a project must also select with this one.</param>
    /// <param name="PairsWith">The only backend stacks a frontend stack works beside.</param>
    public sealed record Stack(string Id, string Folder, string Kind, IReadOnlyList<string> Requires, IReadOnlyList<string> PairsWith);

    /// <summary>Reads the stacks a manifest ships, in manifest order.</summary>
    public static IReadOnlyList<Stack> Stacks(JsonObject manifest)
    {
        var result = new List<Stack>();
        if ((manifest["stacks"] as JsonObject) is not { } stacks)
        {
            return result;
        }

        foreach (var (id, node) in stacks)
        {
            var stack = node as JsonObject;
            var folder = Text(stack?["folder"]) ?? "";
            result.Add(new Stack(id, folder, KindFor(folder), Strings(stack?["requires"]), Strings(stack?["pairsWith"])));
        }

        return result;
    }

    /// <summary>
    ///     Computes the pages a selection applies: the always-applied areas, each selected
    ///     stack's folder chain, the named shape's backend pages, and each selected
    ///     extension's page. Returns <c>docs/...</c> relative paths sorted ordinally.
    /// </summary>
    public static IReadOnlyList<string> AppliedPages(string root, JsonObject manifest, string shape, IReadOnlyList<string> stacks, IReadOnlyList<string> extensions)
    {
        var applied = new HashSet<string>(StringComparer.Ordinal);

        foreach (var area in new[] { "docs/core", "docs/workspace", "docs/quality" })
        {
            foreach (var page in PagesDirectlyIn(root, area))
            {
                applied.Add(page);
            }
        }

        var shipped = Stacks(manifest).ToDictionary(stack => stack.Id, StringComparer.Ordinal);
        foreach (var id in stacks)
        {
            if (!shipped.TryGetValue(id, out var stack) || stack.Kind.Length == 0)
            {
                continue;
            }

            var area = stack.Kind == "backend" ? "docs/backend" : "docs/frontend";
            foreach (var folder in ChainFolders(stack.Folder, area).SelectMany(folder => CompanionFolders(root, folder).Prepend(folder)))
            {
                foreach (var page in PagesDirectlyIn(root, folder))
                {
                    applied.Add(page);
                }
            }
        }

        if ((manifest["shapes"] as JsonObject)?[shape] as JsonObject is { } named)
        {
            foreach (var page in Strings(named["backendPages"]))
            {
                applied.Add(page);
            }
        }

        var shippedExtensions = manifest["extensions"] as JsonObject;
        foreach (var id in extensions)
        {
            if (Text((shippedExtensions?[id] as JsonObject)?["path"]) is { Length: > 0 } path)
            {
                applied.Add(path);
            }
        }

        return applied.OrderBy(page => page, StringComparer.Ordinal).ToList();
    }

    /// <summary>Derives a stack's kind from its folder's area, or empty when outside both areas.</summary>
    public static string KindFor(string folder) =>
        folder == "docs/backend" || folder.StartsWith("docs/backend/", StringComparison.Ordinal) ? "backend"
        : folder == "docs/frontend" || folder.StartsWith("docs/frontend/", StringComparison.Ordinal) ? "frontend"
        : "";

    // A stack applies its folder and every folder up to its area root, so a page
    // directly in any of those folders is reached and anything deeper is not.
    static IEnumerable<string> ChainFolders(string folder, string area)
    {
        var current = folder.Replace('\\', '/').TrimEnd('/');
        while (current.Length >= area.Length
            && current.StartsWith(area, StringComparison.Ordinal)
            && (current.Length == area.Length || current[area.Length] == '/'))
        {
            yield return current;
            if (current.Length == area.Length)
            {
                yield break;
            }

            current = current[..current.LastIndexOf('/')];
        }
    }

    /// <summary>
    ///     The folders that apply with <paramref name="folder"/>: each subfolder, at any
    ///     depth, that is not an <c>ext/</c> folder and holds no stack. A stack folder is
    ///     one with a <c>stack.md</c> page, so <c>docs/frontend/patterns</c> applies with
    ///     <c>docs/frontend</c> while <c>docs/frontend/web</c>, which holds stacks, does not.
    /// </summary>
    public static IEnumerable<string> CompanionFolders(string root, string folder)
    {
        var directory = Path.Combine(root, folder.Replace('/', Path.DirectorySeparatorChar));
        if (!Directory.Exists(directory))
        {
            yield break;
        }

        foreach (var sub in Directory.GetDirectories(directory).OrderBy(name => name, StringComparer.Ordinal))
        {
            var name = Path.GetFileName(sub);
            if (name == "ext" || HoldsStack(sub))
            {
                continue;
            }

            var relative = $"{folder.TrimEnd('/')}/{name}";
            yield return relative;

            foreach (var deeper in CompanionFolders(root, relative))
            {
                yield return deeper;
            }
        }
    }

    static bool HoldsStack(string directory) =>
        File.Exists(Path.Combine(directory, "stack.md"))
        || Directory.GetDirectories(directory).Any(sub => Path.GetFileName(sub) != "ext" && HoldsStack(sub));

    static IEnumerable<string> PagesDirectlyIn(string root, string folder)
    {
        var directory = Path.Combine(root, folder.Replace('/', Path.DirectorySeparatorChar));
        if (!Directory.Exists(directory))
        {
            yield break;
        }

        string[] files;
        try
        {
            files = Directory.GetFiles(directory);
        }
        catch (IOException)
        {
            yield break;
        }
        catch (UnauthorizedAccessException)
        {
            yield break;
        }

        foreach (var file in files)
        {
            if (!file.EndsWith(".md", StringComparison.OrdinalIgnoreCase) || Path.GetFileName(file) == "README.md")
            {
                continue;
            }

            yield return Slash(Path.GetRelativePath(root, file));
        }
    }

    static string? Text(JsonNode? node) => node is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    static IReadOnlyList<string> Strings(JsonNode? node) => node is JsonArray array
        ? array.Select(Text).Where(text => text is not null).Select(text => text!).ToList()
        : [];

    static string Slash(string value) => value.Replace('\\', '/');
}

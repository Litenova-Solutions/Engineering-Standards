using System.Text.RegularExpressions;

namespace Litenova.Model;

/// <summary>One read route: its address, file, operations and use cases.</summary>
sealed record ScreenInfo(
    string Frontend,
    string Route,
    string File,
    IReadOnlyList<GeneratedOperation> Operations,
    IReadOnlyList<string> UseCases);

/// <summary>
///     Which operations and use cases each frontend route calls, read from the route's code.
/// </summary>
static partial class ScreenReader
{
    private const string RouteFolder = "routes";

    private static readonly string[] Extensions = [".ts", ".tsx", ".js", ".jsx", ".svelte", ".svelte.ts"];

    /// <summary>What the screen read found: route screens and file comments.</summary>
    public sealed record ScreenRead(
        IReadOnlyList<ScreenInfo> Screens,
        IReadOnlyList<CodeComment> Comments);

    /// <summary>Reads every route of every Svelte frontend.</summary>
    public static ScreenRead Read(ConsumerConfig config, CodeModel code)
    {
        var byRoute = new Dictionary<string, string>(StringComparer.Ordinal);
        var byOperation = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var endpoint in code.Endpoints)
        {
            if (endpoint.Operation.Length > 0)
            {
                byOperation.TryAdd(endpoint.Operation, endpoint.UseCaseId);
            }

            if (endpoint.Method.Length > 0 && endpoint.Route.Length > 0)
            {
                byRoute.TryAdd($"{endpoint.Method} {Template(endpoint.Route)}", endpoint.UseCaseId);
            }
        }

        var client = GeneratedClient.Read(config.ApiClientSrc);
        var cache = new FileCache(config);
        var starts = new List<(FrontendConfig Frontend, string File, string Address)>();

        foreach (var frontend in config.Frontends)
        {
            if (frontend.Platform != "svelte")
            {
                continue;
            }

            var routes = Path.Combine(frontend.Path, "src", RouteFolder);

            foreach (var file in SourceTree.Files(routes, Extensions))
            {
                if (Address(file, routes) is { } address && !EndpointBesidePage(file))
                {
                    starts.Add((frontend, file, address));
                }
            }
        }

        var screens = new ScreenInfo[starts.Count];

        System.Threading.Tasks.Parallel.For(
            0,
            starts.Count,
            index =>
            {
                var start = starts[index];

                screens[index] = Follow(
                    config, cache, start.Frontend, start.File, start.Address,
                    client, byRoute, byOperation);
            });

        return new ScreenRead([.. screens], cache.Comments());
    }

    /// <summary>
    ///     One read of every frontend source file, shared by route following and
    ///     comment reads so neither re-reads a file another route already reached.
    /// </summary>
    private sealed class FileCache(ConsumerConfig config)
    {
        private readonly Dictionary<string, string> _texts = ReadAll(config);
        private readonly System.Collections.Concurrent.ConcurrentDictionary<string, (IReadOnlyList<string> Imports, IReadOnlyList<string> Calls)> _parsed = new(StringComparer.Ordinal);

        private static Dictionary<string, string> ReadAll(ConsumerConfig config)
        {
            var texts = new Dictionary<string, string>(StringComparer.Ordinal);

            foreach (var frontend in config.Frontends)
            {
                if (frontend.Platform != "svelte")
                {
                    continue;
                }

                foreach (var file in SourceTree.Files(Path.Combine(frontend.Path, "src"), Extensions))
                {
                    texts.TryAdd(Path.GetFullPath(file), SourceTree.Read(file));
                }
            }

            return texts;
        }

        private readonly System.Collections.Concurrent.ConcurrentDictionary<string, bool> _exists = new(StringComparer.Ordinal);

        public string Text(string file) =>
            _texts.TryGetValue(Path.GetFullPath(file), out var text) ? text : SourceTree.Read(file);

        public bool Exists(string file) => _texts.ContainsKey(file) || _exists.GetOrAdd(file, File.Exists);

        public (IReadOnlyList<string> Imports, IReadOnlyList<string> Calls) Parsed(string file) =>
            _parsed.GetOrAdd(file, key =>
            {
                var text = Text(key);
                var code = TypeScriptSource.WithoutComments(text);

                return (
                    TypeScriptSource.ValueImports(text),
                    (IReadOnlyList<string>)[.. Call().Matches(code).Select(match => match.Groups["name"].Value)]);
            });

        public IReadOnlyList<CodeComment> Comments()
        {
            var found = new List<CodeComment>();

            foreach (var entry in _texts.OrderBy(left => left.Key, StringComparer.Ordinal))
            {
                foreach (var span in TypeScriptSource.Comments(entry.Value))
                {
                    found.Add(new CodeComment(
                        entry.Value[span.Start..span.End], entry.Key, LineOf(entry.Value, span.Start)));
                }
            }

            return found;
        }

        private static int LineOf(string text, int offset)
        {
            var line = 1;

            for (var index = 0; index < offset && index < text.Length; index++)
            {
                if (text[index] == '\n')
                {
                    line++;
                }
            }

            return line;
        }
    }

    private static ScreenInfo Follow(
        ConsumerConfig config,
        FileCache cache,
        FrontendConfig frontend,
        string start,
        string address,
        GeneratedClient client,
        IReadOnlyDictionary<string, string> byRoute,
        IReadOnlyDictionary<string, string> byOperation)
    {
        var reached = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { start };
        var pending = new Queue<string>([start]);

        foreach (var sibling in RouteSiblings(start))
        {
            if (reached.Add(sibling))
            {
                pending.Enqueue(sibling);
            }
        }

        var operations = new Dictionary<string, GeneratedOperation>(StringComparer.Ordinal);

        while (pending.Count > 0)
        {
            var file = pending.Dequeue();
            var known = cache.Parsed(file);

            foreach (var specifier in known.Imports)
            {
                var resolved = Resolve(cache, frontend, file, specifier);

                if (resolved is not null && reached.Add(resolved))
                {
                    pending.Enqueue(resolved);
                }
            }

            foreach (var name in known.Calls)
            {
                foreach (var endpoint in client.Resolve(name))
                {
                    operations.TryAdd(endpoint.Name, endpoint);
                }
            }
        }

        var useCases = new SortedSet<string>(StringComparer.Ordinal);

        foreach (var operation in operations.Values)
        {
            if (byRoute.TryGetValue($"{operation.Method} {Template(operation.Path)}", out var routed))
            {
                useCases.Add(routed);
            }
            else if (byOperation.TryGetValue(Naming.Pascal(operation.Name), out var named))
            {
                useCases.Add(named);
            }
        }

        return new ScreenInfo(
            frontend.Name,
            address,
            config.Relative(start),
            [.. operations.Values.OrderBy(operation => operation.Name, StringComparer.Ordinal)],
            [.. useCases]);
    }

    /// <summary>
    ///     The route template with parameter constraints removed, so an endpoint's
    ///     <c>{id:guid}</c> matches a client's <c>{id}</c>.
    /// </summary>
    private static string Template(string route) => TemplateConstraint().Replace(route, "{$1}");

    private static string? Address(string file, string routes)
    {
        var parts = Path.GetRelativePath(routes, file)
                           .Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var name = parts[^1];

        if (!name.Equals("+page.svelte", StringComparison.OrdinalIgnoreCase)
            && !name.Equals("+server.ts", StringComparison.OrdinalIgnoreCase)
            && !name.Equals("+server.js", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        if (parts.Any(part => part.StartsWith("-", StringComparison.Ordinal)))
        {
            return null;
        }

        var segments = new List<string>();

        foreach (var part in parts[..^1])
        {
            if (part.StartsWith("(", StringComparison.Ordinal) && part.EndsWith(")", StringComparison.Ordinal))
            {
                continue;
            }

            segments.Add(Segment(part));
        }

        return "/" + string.Join('/', segments);
    }

    private static string Segment(string part)
    {
        if (part.StartsWith("[[", StringComparison.Ordinal) && part.EndsWith("]]", StringComparison.Ordinal))
        {
            return "$" + part[2..^2].Split('=')[0];
        }

        if (part.StartsWith("[", StringComparison.Ordinal) && part.EndsWith("]", StringComparison.Ordinal))
        {
            var inner = part[1..^1].Split('=')[0];

            return "$" + (inner.StartsWith("...", StringComparison.Ordinal) ? inner[3..] : inner);
        }

        return part;
    }

    private static string? Resolve(FileCache cache, FrontendConfig frontend, string importer, string specifier)
    {
        string basePath;

        if (specifier.StartsWith("@/", StringComparison.Ordinal))
        {
            basePath = Path.Combine(frontend.Path, "src", specifier[2..]);
        }
        else if (specifier.StartsWith("./", StringComparison.Ordinal) || specifier.StartsWith("../", StringComparison.Ordinal))
        {
            basePath = Path.Combine(Path.GetDirectoryName(importer)!, specifier);
        }
        else
        {
            return null;
        }

        return Existing(cache, Path.GetFullPath(basePath));
    }

    private static string? Existing(FileCache cache, string basePath)
    {
        if (cache.Exists(basePath) && Extensions.Contains(Path.GetExtension(basePath), StringComparer.OrdinalIgnoreCase))
        {
            return basePath;
        }

        foreach (var extension in Extensions)
        {
            if (cache.Exists(basePath + extension))
            {
                return basePath + extension;
            }
        }

        foreach (var extension in Extensions)
        {
            var index = Path.Combine(basePath, "index" + extension);

            if (cache.Exists(index))
            {
                return index;
            }
        }

        return null;
    }

    private static bool EndpointBesidePage(string file)
    {
        var name = Path.GetFileName(file);

        if (!name.Equals("+server.ts", StringComparison.OrdinalIgnoreCase)
            && !name.Equals("+server.js", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return File.Exists(Path.Combine(Path.GetDirectoryName(file)!, "+page.svelte"));
    }

    private static IEnumerable<string> RouteSiblings(string page)
    {
        if (!page.EndsWith("+page.svelte", StringComparison.OrdinalIgnoreCase))
        {
            yield break;
        }

        var folder = Path.GetDirectoryName(page)!;

        foreach (var name in new[] { "+page.ts", "+page.js", "+page.server.ts", "+page.server.js", "+server.ts", "+server.js" })
        {
            var candidate = Path.Combine(folder, name);

            if (File.Exists(candidate))
            {
                yield return candidate;
            }
        }
    }

    [GeneratedRegex(@"(?:(?<!\.)|(?<=\.\.\.))(?<![\w$])(?<name>\w+)\s*\(")]
    private static partial Regex Call();

    [GeneratedRegex(@"\{(?<name>[^}:]+):[^}]+\}")]
    private static partial Regex TemplateConstraint();
}

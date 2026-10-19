namespace Litenova.Model;

/// <summary>One generated operation: its name, method and path.</summary>
sealed record GeneratedOperation(string Name, string Method, string Path);

/// <summary>
///     What each generated call name stands for, read from the client every frontend imports.
/// </summary>
sealed partial class GeneratedClient
{
    private static readonly string[] Suffixes = ["Options", "QueryKey", "Mutation"];

    private readonly IReadOnlyDictionary<string, GeneratedOperation> _operations;

    private readonly IReadOnlyDictionary<string, IReadOnlyList<GeneratedOperation>> _wrappers;

    private GeneratedClient(
        IReadOnlyDictionary<string, GeneratedOperation> operations,
        IReadOnlyDictionary<string, IReadOnlyList<GeneratedOperation>> wrappers)
    {
        _operations = operations;
        _wrappers = wrappers;
    }

    /// <summary>Reads the client, resolving nothing when it is absent.</summary>
    public static GeneratedClient Read(string clientSrc)
    {
        var operations = Operations(Path.Combine(clientSrc, "generated", "sdk.gen.ts"));

        return new GeneratedClient(operations, Wrappers(clientSrc, operations));
    }

    /// <summary>The operations one call name stands for.</summary>
    public IReadOnlyList<GeneratedOperation> Resolve(string call)
    {
        if (_operations.TryGetValue(call, out var operation))
        {
            return [operation];
        }

        if (_wrappers.TryGetValue(call, out var wrapped))
        {
            return wrapped;
        }

        foreach (var suffix in Suffixes)
        {
            if (call.Length > suffix.Length
                && call.EndsWith(suffix, StringComparison.Ordinal)
                && _operations.TryGetValue(call[..^suffix.Length], out var queried))
            {
                return [queried];
            }
        }

        return [];
    }

    private static Dictionary<string, GeneratedOperation> Operations(string file)
    {
        var found = new Dictionary<string, GeneratedOperation>(StringComparer.Ordinal);

        if (!File.Exists(file))
        {
            return found;
        }

        var text = SourceTree.Read(file);
        var declarations = Declaration().Matches(text).Cast<System.Text.RegularExpressions.Match>().ToArray();

        for (var index = 0; index < declarations.Length; index++)
        {
            var start = declarations[index].Index;
            var end = index + 1 < declarations.Length ? declarations[index + 1].Index : text.Length;
            var body = text[start..end];

            var method = Method().Match(body);
            var url = Url().Match(body);

            if (method.Success && url.Success)
            {
                found[declarations[index].Groups["name"].Value] =
                    new GeneratedOperation(
                        declarations[index].Groups["name"].Value,
                        method.Groups["method"].Value.ToUpperInvariant(),
                        url.Groups["url"].Value);
            }
        }

        return found;
    }

    private static Dictionary<string, IReadOnlyList<GeneratedOperation>> Wrappers(
        string root,
        IReadOnlyDictionary<string, GeneratedOperation> operations)
    {
        var found = new Dictionary<string, IReadOnlyList<GeneratedOperation>>(StringComparer.Ordinal);

        if (!Directory.Exists(root))
        {
            return found;
        }

        foreach (var file in Directory.EnumerateFiles(root, "*.ts"))
        {
            var text = SourceTree.Read(file);
            var functions = Wrapper().Matches(text).Cast<System.Text.RegularExpressions.Match>().ToArray();

            for (var index = 0; index < functions.Length; index++)
            {
                var start = functions[index].Index;
                var end = index + 1 < functions.Length ? functions[index + 1].Index : text.Length;

                var called = new SortedSet<string>(StringComparer.Ordinal);

                foreach (var call in Call().Matches(text[start..end]).Cast<System.Text.RegularExpressions.Match>())
                {
                    if (operations.ContainsKey(call.Groups["name"].Value))
                    {
                        called.Add(call.Groups["name"].Value);
                    }
                }

                found[functions[index].Groups["name"].Value] = [.. called.Select(name => operations[name])];
            }
        }

        return found;
    }

    [System.Text.RegularExpressions.GeneratedRegex(@"(?m)^export const (?<name>\w+)")]
    private static partial System.Text.RegularExpressions.Regex Declaration();

    [System.Text.RegularExpressions.GeneratedRegex(@"client\)\.(?<method>get|post|put|patch|delete)<")]
    private static partial System.Text.RegularExpressions.Regex Method();

    [System.Text.RegularExpressions.GeneratedRegex(@"url:\s*['""](?<url>[^'""]+)['""]")]
    private static partial System.Text.RegularExpressions.Regex Url();

    [System.Text.RegularExpressions.GeneratedRegex(@"(?m)^export (?:async )?function (?<name>\w+)")]
    private static partial System.Text.RegularExpressions.Regex Wrapper();

    [System.Text.RegularExpressions.GeneratedRegex(@"(?<![\w$.])(?<name>\w+)\s*\(")]
    private static partial System.Text.RegularExpressions.Regex Call();
}

using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Schemas;

namespace LiteSpec.Ui;

/// <summary>
///     A JSON property read with its presence: whether the key exists,
///     and the value when it does. A missing key and an explicit JSON null both
///     hold a null value; only <see cref="Found"/> tells them apart.
/// </summary>
readonly record struct JsValue(bool Found, JsonNode? Node);

static partial class UiValidator
{
    static readonly JsonSerializerOptions CompactRelaxed = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    static readonly Regex Newline = new("\\r\\n?", RegexOptions.Compiled);

    static readonly Regex TrailingSpaces = new("[ \\t]+$", RegexOptions.Compiled | RegexOptions.Multiline);

    static readonly Regex SectionHeading = new("^##\\s+(.+?)\\s*$", RegexOptions.Compiled | RegexOptions.Multiline);

    static readonly HashSet<string> IgnoredDirectories = new(StringComparer.Ordinal)
    {
        "node_modules", ".next", "out", "dist", "build", ".output", ".svelte-kit", "coverage",
        "android", "ios", ".tanstack", "test-results", "playwright-report",
    };

    /// <summary>Reads one property; a non-object or missing key is not found.</summary>
    static JsValue Child(JsonNode? node, string key) =>
        node is JsonObject found && found.TryGetPropertyValue(key, out var value)
            ? new JsValue(true, value)
            : new JsValue(false, null);

    /// <summary>Reads one optional link of a <c>?.</c> chain.</summary>
    static JsValue Dot(JsValue value, string key) =>
        value.Node is JsonObject found ? Child(found, key) : new JsValue(false, null);

    /// <summary>Walks a <c>?.</c> chain from a value.</summary>
    static JsValue Chain(JsonNode? node, params string[] keys)
    {
        var current = new JsValue(true, node);
        foreach (var key in keys)
        {
            current = Dot(current, key);
        }

        return current;
    }

    /// <summary>How a template string prints a read: missing is undefined, null is null.</summary>
    static string Show(JsValue value) =>
        value.Node is null ? (value.Found ? "null" : "undefined") : ShowNode(value.Node);

    /// <summary>How a message prints a read held as a found flag and a value.</summary>
    static string Show(bool found, JsonNode? node) => Show(new JsValue(found, node));

    /// <summary>How a message prints a value: scalars raw, objects opaque.</summary>
    static string ShowNode(JsonNode? node) => node switch
    {
        null => "null",
        JsonValue value => value.GetValueKind() switch
        {
            JsonValueKind.String => value.GetValue<string>(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Number => value.TryGetValue<long>(out var integer)
                ? integer.ToString(CultureInfo.InvariantCulture)
                : value.GetValue<double>().ToString(CultureInfo.InvariantCulture),
            _ => "null",
        },
        _ => "[object Object]",
    };

    /// <summary>A read with a fallback for a missing or null value.</summary>
    static string ShowOr(JsValue value, string fallback) =>
        value.Node is null ? fallback : ShowNode(value.Node);

    /// <summary>Whether a read counts as present.</summary>
    static bool Truthy(JsValue value) => value is { Found: true, Node: not null } && TruthyNode(value.Node);

    /// <summary>Whether a value counts as present: null, empty strings, false and zero are absent, objects and arrays are present.</summary>
    static bool TruthyNode(JsonNode? node) => node switch
    {
        null => false,
        JsonValue value => value.GetValueKind() switch
        {
            JsonValueKind.String => value.GetValue<string>().Length > 0,
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Number => value.GetValue<double>() != 0,
            _ => false,
        },
        _ => true,
    };

    /// <summary>Whether two reads are strictly equal: primitives compare by type and value, objects and arrays by reference.</summary>
    static bool StrictEqual(JsValue left, JsValue right)
    {
        if (!left.Found || !right.Found)
        {
            return left.Found == right.Found;
        }

        return NodeEqual(left.Node, right.Node);
    }

    static bool NodeEqual(JsonNode? left, JsonNode? right)
    {
        if (left is null || right is null)
        {
            return left is null && right is null;
        }

        if (left is JsonValue l && right is JsonValue r)
        {
            var lk = l.GetValueKind();
            var rk = r.GetValueKind();
            if (lk is JsonValueKind.True or JsonValueKind.False && rk is JsonValueKind.True or JsonValueKind.False)
            {
                return lk == rk;
            }

            if (lk == JsonValueKind.String && rk == JsonValueKind.String)
            {
                return string.Equals(l.GetValue<string>(), r.GetValue<string>(), StringComparison.Ordinal);
            }

            if (lk == JsonValueKind.Number && rk == JsonValueKind.Number)
            {
                return l.GetValue<double>() == r.GetValue<double>();
            }

            return false;
        }

        if (left is JsonValue || right is JsonValue)
        {
            return false;
        }

        return ReferenceEquals(left, right);
    }

    /// <summary>How a message prints a baseline value: compact JSON, or undefined when missing.</summary>
    static string StringifyOrUndefined(JsValue value) =>
        !value.Found ? "undefined" : value.Node is null ? "null" : value.Node.ToJsonString(CompactRelaxed);

    /// <summary>The keys of the manifest's pinned npm packages.</summary>
    static HashSet<string> NpmKeys(JsonNode? manifest)
    {
        var npm = Chain(manifest, "packages", "npm").Node;
        return npm switch
        {
            JsonObject found => found.Select(property => property.Key).ToHashSet(StringComparer.Ordinal),
            JsonArray array => Enumerable.Range(0, array.Count).Select(index => index.ToString(CultureInfo.InvariantCulture)).ToHashSet(StringComparer.Ordinal),
            JsonValue value when value.TryGetValue<string>(out var text) => Enumerable.Range(0, text.Length).Select(index => index.ToString(CultureInfo.InvariantCulture)).ToHashSet(StringComparer.Ordinal),
            _ => new HashSet<string>(StringComparer.Ordinal),
        };
    }

    /// <summary>Whether a path exists as a file or a directory.</summary>
    static bool Exists(string path) => File.Exists(path) || Directory.Exists(path);

    /// <summary>Whether a candidate path stays inside a root, compared by text.</summary>
    static bool Within(string rootPath, string candidate)
    {
        var baseDir = Path.GetFullPath(rootPath).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar;
        return Path.GetFullPath(candidate).StartsWith(baseDir, StringComparison.Ordinal);
    }

    /// <summary>
    ///     Every file under a directory that matches, skipping build output and native
    ///     runtime folders in ordinal name order so the order is stable on every OS.
    /// </summary>
    static List<string> Walk(string directory, Func<string, bool> predicate)
    {
        var result = new List<string>();
        WalkInto(directory, predicate, result);
        return result;
    }

    static void WalkInto(string directory, Func<string, bool> predicate, List<string> result)
    {
        if (!Directory.Exists(directory))
        {
            return;
        }

        // Build output is generated, not authored. Scanning it reports the bundler's
        // own CSS as a source violation, which no consumer can fix. Native runtime
        // directories hold copied web assets rather than authored source.
        foreach (var entry in new DirectoryInfo(directory).EnumerateFileSystemInfos().OrderBy(candidate => candidate.Name, StringComparer.Ordinal))
        {
            if (IgnoredDirectories.Contains(entry.Name))
            {
                continue;
            }

            if ((entry.Attributes & FileAttributes.ReparsePoint) != 0)
            {
                if (predicate(entry.FullName))
                {
                    result.Add(entry.FullName);
                }

                continue;
            }

            if ((entry.Attributes & FileAttributes.Directory) != 0)
            {
                WalkInto(entry.FullName, predicate, result);
            }
            else if (predicate(entry.FullName))
            {
                result.Add(entry.FullName);
            }
        }
    }

    /// <summary>The H2 names a Markdown page carries, in the order they appear.</summary>
    static List<string> SectionNames(string raw) =>
        SectionHeading.Matches(raw).Cast<Match>().Select(match => match.Groups[1].Value.Trim()).ToList();

    static string NormalizeSource(string contents) =>
        TrailingSpaces.Replace(Newline.Replace(contents, "\n"), "").TrimEnd() + "\n";

    private sealed partial class Session
    {
        public JsonNode? ReadJson(string file, string label)
        {
            try
            {
                return JsonNode.Parse(File.ReadAllText(file));
            }
            catch (Exception cause)
            {
                Errors.Add($"{label}: cannot parse JSON ({cause.Message})");
                return null;
            }
        }

        public bool Required(JsonNode? node, string key, string label)
        {
            if (node is null || !TruthyNode(node))
            {
                Errors.Add($"{label}: missing '{key}'");
                return false;
            }

            var value = Child(node, key);
            if (!value.Found || value.Node is null || (value.Node is JsonValue text && text.TryGetValue<string>(out var raw) && raw.Length == 0))
            {
                Errors.Add($"{label}: missing '{key}'");
                return false;
            }

            return true;
        }

        public List<JsonNode?> ReadArray(JsonNode? node, string key, string label)
        {
            if (node is JsonObject found && found.TryGetPropertyValue(key, out var value) && value is JsonArray array)
            {
                return array.ToList();
            }

            Errors.Add($"{label}: '{key}' must be an array");
            return [];
        }

        public void Unique(IEnumerable<JsValue> values, string label)
        {
            var seen = new List<JsValue>();
            foreach (var value in values)
            {
                if (seen.Any(candidate => StrictEqual(candidate, value)))
                {
                    Errors.Add($"{label}: duplicate '{Show(value)}'");
                }

                seen.Add(value);
            }
        }

        public string FilePath(string relative) => Path.GetFullPath(Path.Combine(Root, relative));

        public string RelativeToRoot(string file) =>
            Path.GetRelativePath(Root, Path.GetFullPath(file)).Replace(Path.DirectorySeparatorChar, '/');

        // A source lock names one file in several component entries, and the walk that
        // collects source files reads each one again. Hashing is the expensive step, so
        // the digest is computed once per absolute path.
        public string? Digest(string file)
        {
            var key = Path.GetFullPath(file);
            if (Digests.TryGetValue(key, out var cached))
            {
                return cached;
            }

            string value;
            try
            {
                value = "sha256:" + Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(NormalizeSource(File.ReadAllText(key)))));
            }
            catch (Exception cause) when (cause is IOException or UnauthorizedAccessException)
            {
                return null;
            }

            Digests[key] = value;
            return value;
        }

        // A value read against one of the shipped schemas. The keyword gate runs first,
        // so a schema carrying a keyword this evaluator does not implement fails rather
        // than passing unread.
        public bool SchemaCheck(string schemaName, JsonNode? value, string label, string provisionId)
        {
            var file = LiteSpecHome.PathTo($"schemas/{schemaName}");
            if (!File.Exists(file))
            {
                Errors.Add($"{label}: schema '{schemaName}' is missing from the LiteSpec release");
                return false;
            }

            var schema = ReadJson(file, schemaName);
            if (schema is null)
            {
                return false;
            }

            var problems = new List<string>();
            JsonSchema.UnsupportedKeywords(schema, schemaName, "#", (_, _, _, message) => problems.Add(message));
            try
            {
                JsonSchema.Validate(value, schema, schema, label, problems);
            }
            catch (Exception cause)
            {
                problems.Add($"{label}: {cause.Message}");
            }

            foreach (var problem in problems)
            {
                Errors.Add($"[{provisionId}] {problem}");
            }

            return problems.Count == 0;
        }

        public JsonNode? ParseMetadata(string file)
        {
            var raw = File.ReadAllText(file);
            if (!raw.StartsWith("---", StringComparison.Ordinal))
            {
                return null;
            }

            var end = raw.IndexOf("\n---", 3, StringComparison.Ordinal);
            if (end < 0)
            {
                Errors.Add($"{RelativeToRoot(file)}: unterminated metadata block");
                return null;
            }

            try
            {
                return JsonNode.Parse(raw.Substring(3, end - 3).Trim());
            }
            catch (JsonException cause)
            {
                Errors.Add($"{RelativeToRoot(file)}: metadata is not JSON ({cause.Message})");
                return null;
            }
        }
    }
}

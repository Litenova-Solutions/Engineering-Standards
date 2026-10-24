using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using LiteSpec.Model;

namespace LiteSpec.Authoring;

/// <summary>
///     The <c>litespec new result</c> and <c>litespec new scenario</c> append paths:
///     one entry goes onto a use-case page's frontmatter records, in house order,
///     while every other byte of the page stays untouched.
/// </summary>
static partial class AppendEntry
{
    /// <summary>Where the new entry lands among the page's entries.</summary>
    internal enum Placement
    {
        Success,
        Refusal,
        Scenario,
    }

    /// <summary>Runs the append path and returns its exit code.</summary>
    public static int Run(CliArgs parsed)
    {
        var kind = parsed.Positionals[0];

        if (parsed.Positionals is not [_, var useCaseArg, var name])
        {
            Console.Error.WriteLine(kind == "result"
                ? "New result needs a use case and a name."
                : "New scenario needs a use case and a name.");
            Console.Error.WriteLine(NewCommand.Usage);
            return 2;
        }

        var outcome = parsed.Value("--outcome");
        var code = parsed.Value("--code");
        var resultRef = parsed.Value("--result");

        if (kind == "result")
        {
            if (resultRef is not null)
            {
                Console.Error.WriteLine("Option --result applies only to new scenario.");
                return 2;
            }

            if (outcome is not "success" and not "refusal")
            {
                Console.Error.WriteLine(outcome is null
                    ? "New result needs --outcome success or --outcome refusal."
                    : $"Unknown outcome '{outcome}'. Use success or refusal.");
                return 2;
            }

            if (outcome == "refusal" && code is null)
            {
                Console.Error.WriteLine("New result needs --code <module>.<reason> for a refusal.");
                return 2;
            }
        }
        else
        {
            if (code is not null)
            {
                Console.Error.WriteLine("Option --code applies only to new result.");
                return 2;
            }

            if (outcome is not null)
            {
                Console.Error.WriteLine("Option --outcome applies only to new result.");
                return 2;
            }

            if (resultRef is null)
            {
                Console.Error.WriteLine("New scenario needs --result <result-id>.");
                return 2;
            }
        }

        if (code is not null && !RefusalCodePattern().IsMatch(code))
        {
            Console.Error.WriteLine($"Code '{code}' is not a refusal code. Use <module>.<reason>.");
            return 2;
        }

        if (resultRef is not null && !ValidResultRef(resultRef))
        {
            Console.Error.WriteLine($"Result '{resultRef}' is not a result identifier.");
            return 2;
        }

        var useCaseId = useCaseArg.Contains('/') ? useCaseArg : $"use-case/{useCaseArg}";

        if (!Identifiers.TrySplit(useCaseId, out var usePrefix, out var useHome, out var useName)
            || usePrefix != "use-case")
        {
            Console.Error.WriteLine($"'{useCaseArg}' is not a use-case identifier. Use use-case/<module>.<name>.");
            return 2;
        }

        if (RecordPages.GrammarError("use-case", useHome, useName, useCaseId) is { } useGrammar)
        {
            Console.Error.WriteLine(useGrammar);
            return 2;
        }

        var entryId = $"{kind}/{useName}.{name}";

        if (RecordPages.GrammarError(kind, useName, name, entryId) is { } entryGrammar)
        {
            Console.Error.WriteLine(entryGrammar);
            return 2;
        }

        string root;

        try
        {
            root = Path.GetFullPath(parsed.Value("--root") ?? parsed.Value("--home") ?? Directory.GetCurrentDirectory());
        }
        catch (Exception exception) when (exception is ArgumentException or NotSupportedException or PathTooLongException)
        {
            Console.Error.WriteLine($"Invalid root '{parsed.Value("--root") ?? parsed.Value("--home")}': {exception.Message}");
            Console.Error.WriteLine(NewCommand.Usage);
            return 2;
        }

        ConsumerConfig config;
        IReadOnlyList<Record> records;

        try
        {
            config = ConsumerConfig.Load(root);
            records = RecordReader.Read(config).Records;
        }
        catch (JsonException exception)
        {
            Console.Error.WriteLine($"litespec.project.json is not valid JSON: {exception.Message}");
            return 2;
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or AggregateException)
        {
            Console.Error.WriteLine($"Failed to read the consumer repository: {exception.Message}");
            return 1;
        }

        var useCase = records.FirstOrDefault(record => record.Type == "use-case" && record.Id == useCaseId);

        if (useCase is null)
        {
            Console.Error.WriteLine($"No use case holds '{useCaseId}'.");
            return 2;
        }

        var clash = records.FirstOrDefault(record => record.Id == entryId);

        if (clash is not null)
        {
            Console.Error.WriteLine($"Identifier '{entryId}' is already taken by {config.Relative(clash.File)}.");
            return 2;
        }

        string page;

        try
        {
            page = File.ReadAllText(useCase.File);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            Console.Error.WriteLine($"Failed to read '{config.Relative(useCase.File)}': {exception.Message}");
            return 1;
        }

        var placement = kind == "scenario"
            ? Placement.Scenario
            : outcome == "success" ? Placement.Success : Placement.Refusal;
        var fields = kind == "scenario"
            ? ScenarioFields(entryId, TitleFrom(name), resultRef!)
            : ResultFields(entryId, TitleFrom(name), outcome!, code);
        var updated = Insert(page, placement, fields, out var error);

        if (updated is null)
        {
            Console.Error.WriteLine(error);
            return 2;
        }

        try
        {
            File.WriteAllText(useCase.File, updated);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            Console.Error.WriteLine($"Failed to write '{config.Relative(useCase.File)}': {exception.Message}");
            return 1;
        }

        Console.WriteLine($"Appended {entryId} to {config.Relative(useCase.File)}.");
        return 0;
    }

    /// <summary>
    ///     Splices one entry into the page's frontmatter records. The insertion lands
    ///     in house order and every other byte of the page comes back unchanged.
    /// </summary>
    /// <returns>The updated page, or null with the reason in <paramref name="error"/>.</returns>
    internal static string? Insert(string page, Placement placement, IReadOnlyList<string> fields, out string error)
    {
        error = "";

        if (!Fences(page, out var jsonStart, out var jsonEnd))
        {
            error = "The page holds no frontmatter to append to.";
            return null;
        }

        var json = page[jsonStart..jsonEnd];
        var newline = json.Contains("\r\n", StringComparison.Ordinal) ? "\r\n" : "\n";

        JsonDocument document;

        try
        {
            document = JsonDocument.Parse(json);
        }
        catch (JsonException exception)
        {
            error = $"The page's frontmatter is not JSON: {exception.Message}";
            return null;
        }

        using (document)
        {
            if (document.RootElement.ValueKind != JsonValueKind.Object)
            {
                error = "The page's frontmatter holds no record to append to.";
                return null;
            }

            var groups = Classify(document.RootElement, out var missing);

            if (groups is null)
            {
                error = "The page's records field is not an array.";
                return null;
            }

            if (!Scan(json, out var found) || missing != !found.HasRecords || found.Spans.Count != groups.Count)
            {
                error = "The page's records array could not be edited without rewriting it.";
                return null;
            }

            var index = InsertionIndex(groups, placement);
            var indent = ElementIndent(page, jsonStart, found, index);
            var element = Element(indent, newline, fields);

            if (!found.HasRecords)
            {
                return InsertArray(page, jsonStart, found, element, newline);
            }

            if (found.Spans.Count == 0)
            {
                var between = json[(found.ArrayOpen + 1)..found.ArrayClose];
                var closeIndent = between.Contains('\n')
                    ? LineIndent(page, jsonStart + found.ArrayClose) ?? found.RecordsIndent
                    : found.RecordsIndent;

                return page.Insert(jsonStart + found.ArrayOpen + 1, newline + element + newline + closeIndent);
            }

            if (index >= found.Spans.Count)
            {
                return page.Insert(jsonStart + found.Spans[^1].End, "," + newline + element);
            }

            var target = jsonStart + found.Spans[index].Start;

            if (LineIndent(page, target) is null)
            {
                return page.Insert(target, element[indent.Length..] + "," + newline + indent);
            }

            return page.Insert(LineStart(page, target), element + "," + newline);
        }
    }

    /// <summary>The display title derived from a kebab-case name: words joined, first word capitalized.</summary>
    internal static string TitleFrom(string name)
    {
        var words = name.Split('-', StringSplitOptions.RemoveEmptyEntries);

        if (words.Length == 0)
        {
            return name;
        }

        words[0] = char.ToUpperInvariant(words[0][0]) + words[0][1..];

        return string.Join(' ', words);
    }

    /// <summary>The field lines of the new result entry, without indentation.</summary>
    static IReadOnlyList<string> ResultFields(string id, string title, string outcome, string? code)
    {
        var fields = new List<string>
        {
            "\"type\": \"result\"",
            $"\"id\": \"{Escape(id)}\"",
            $"\"title\": \"{Escape(title)}\"",
            $"\"outcome\": \"{outcome}\"",
        };

        if (outcome == "refusal")
        {
            fields.Add($"\"code\": \"{Escape(code!)}\"");
        }
        else if (code is not null)
        {
            fields.Add($"\"codes\": [\"{Escape(code)}\"]");
        }

        fields.Add("\"meaning\": \"<The observable result in one sentence>\"");

        return fields;
    }

    /// <summary>The field lines of the new scenario entry, without indentation.</summary>
    static IReadOnlyList<string> ScenarioFields(string id, string title, string result) =>
    [
        "\"type\": \"scenario\"",
        $"\"id\": \"{Escape(id)}\"",
        $"\"title\": \"{Escape(title)}\"",
        "\"given\": \"<The starting state>\"",
        "\"when\": \"<What the actor does>\"",
        "\"then\": \"<The observable result>\"",
        $"\"result\": \"{Escape(result)}\"",
    ];

    /// <summary>Whether the reference names a written or derived result id.</summary>
    static bool ValidResultRef(string value)
    {
        if (!value.StartsWith("result/", StringComparison.Ordinal))
        {
            return false;
        }

        var rest = value["result/".Length..];

        foreach (var suffix in new[] { ".forbidden", ".invalid-input" })
        {
            if (rest.EndsWith(suffix, StringComparison.Ordinal))
            {
                var written = $"result/{rest[..^suffix.Length]}";

                return Identifiers.TrySplit(written, out var derivedPrefix, out var derivedHome, out var derivedName)
                    && derivedPrefix == "result"
                    && RecordPages.GrammarError("result", derivedHome, derivedName, written) is null;
            }
        }

        return Identifiers.TrySplit(value, out var prefix, out var home, out var name)
            && prefix == "result"
            && RecordPages.GrammarError("result", home, name, value) is null;
    }

    /// <summary>A refusal code: module and reason in kebab-case.</summary>
    [GeneratedRegex(@"^[a-z0-9][a-z0-9-]*\.[a-z0-9][a-z0-9-]*$")]
    private static partial Regex RefusalCodePattern();

    /// <summary>Escapes a value for one JSON string.</summary>
    static string Escape(string value)
    {
        var built = new StringBuilder(value.Length);

        foreach (var character in value)
        {
            switch (character)
            {
                case '"':
                    built.Append("\\\"");
                    break;
                case '\\':
                    built.Append("\\\\");
                    break;
                case '\n':
                    built.Append("\\n");
                    break;
                case '\r':
                    built.Append("\\r");
                    break;
                case '\t':
                    built.Append("\\t");
                    break;
                default:
                    if (character < ' ')
                    {
                        built.Append($"\\u{(int)character:x4}");
                    }
                    else
                    {
                        built.Append(character);
                    }

                    break;
            }
        }

        return built.ToString();
    }

    /// <summary>The frontmatter span between the fences, or false when the page carries none.</summary>
    static bool Fences(string page, out int start, out int end)
    {
        start = 0;
        end = 0;

        var firstEnd = page.IndexOf('\n');

        if (firstEnd < 0 || page[..firstEnd].TrimEnd('\r') != "---")
        {
            return false;
        }

        start = firstEnd + 1;
        var lineStart = start;

        while (lineStart <= page.Length)
        {
            var lineEnd = page.IndexOf('\n', lineStart);

            if (lineEnd < 0)
            {
                lineEnd = page.Length;
            }

            if (page[lineStart..lineEnd].TrimEnd('\r') == "---")
            {
                end = lineStart;
                return true;
            }

            lineStart = lineEnd + 1;
        }

        return false;
    }

    /// <summary>
    ///     The records array's groups in order: 0 for a success, 1 for a refusal,
    ///     2 for anything else. Null when records is not an array.
    /// </summary>
    static List<int>? Classify(JsonElement root, out bool missing)
    {
        missing = false;

        if (!root.TryGetProperty("records", out var records))
        {
            missing = true;
            return [];
        }

        if (records.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var groups = new List<int>();

        foreach (var entry in records.EnumerateArray())
        {
            var type = entry.ValueKind == JsonValueKind.Object
                && entry.TryGetProperty("type", out var kind)
                && kind.ValueKind == JsonValueKind.String
                    ? kind.GetString()
                    : null;
            var outcome = entry.ValueKind == JsonValueKind.Object
                && entry.TryGetProperty("outcome", out var result)
                && result.ValueKind == JsonValueKind.String
                    ? result.GetString()
                    : null;

            groups.Add(type == "result" && outcome == "success" ? 0 : type == "result" ? 1 : 2);
        }

        return groups;
    }

    /// <summary>Where the new entry lands: successes first, refusals next, scenarios last.</summary>
    static int InsertionIndex(IReadOnlyList<int> groups, Placement placement)
    {
        if (placement == Placement.Scenario)
        {
            return groups.Count;
        }

        var ceiling = placement == Placement.Success ? 0 : 1;

        for (var index = 0; index < groups.Count; index++)
        {
            if (groups[index] > ceiling)
            {
                return index;
            }
        }

        return groups.Count;
    }

    /// <summary>The new element's indentation: its neighbor's line indent, else the array's.</summary>
    static string ElementIndent(string page, int jsonStart, Found found, int index)
    {
        var anchor = (found.HasRecords ? found.RecordsIndent : found.FirstIndent) + "  ";

        if (!found.HasRecords || found.Spans.Count == 0)
        {
            return anchor;
        }

        var neighbor = found.Spans[Math.Min(index, found.Spans.Count - 1)];

        return LineIndent(page, jsonStart + neighbor.Start) ?? anchor;
    }

    /// <summary>The entry's lines at the page's indentation.</summary>
    static string Element(string indent, string newline, IReadOnlyList<string> fields)
    {
        var built = new StringBuilder();
        built.Append(indent).Append('{');

        foreach (var field in fields)
        {
            built.Append(newline).Append(indent).Append("  ").Append(field).Append(',');
        }

        // The last field carries no comma.
        built.Length -= 1;
        built.Append(newline).Append(indent).Append('}');

        return built.ToString();
    }

    /// <summary>Splices a records array holding one entry before the frontmatter's close.</summary>
    static string InsertArray(string page, int jsonStart, Found found, string element, string newline)
    {
        var field = found.FirstIndent;
        var block = newline + field + "\"records\": [" + newline + element + newline + field + "]";

        // After the last member the page's own newline before the closing brace stays in place.
        return found.Members == 0
            ? page.Insert(jsonStart + found.TopClose, block)
            : page.Insert(jsonStart + found.LastValueEnd, "," + block);
    }

    /// <summary>The offset's line start.</summary>
    static int LineStart(string text, int absolute) =>
        absolute <= 0 ? 0 : text.LastIndexOf('\n', absolute - 1) + 1;

    /// <summary>The all-whitespace prefix of the offset's line, or null when text precedes it.</summary>
    static string? LineIndent(string text, int absolute)
    {
        if (absolute <= 0 || absolute > text.Length)
        {
            return null;
        }

        var prefix = text[LineStart(text, absolute)..absolute];

        return prefix.All(character => character is ' ' or '\t') ? prefix : null;
    }

    /// <summary>What the textual scan found in the frontmatter JSON.</summary>
    sealed record Found(
        bool HasRecords,
        string RecordsIndent,
        string FirstIndent,
        int Members,
        int LastValueEnd,
        int TopClose,
        int ArrayOpen,
        int ArrayClose,
        IReadOnlyList<(int Start, int End)> Spans);

    /// <summary>
    ///     Walks the frontmatter text for the records array and its element spans,
    ///     so the insertion reuses the page's own offsets.
    /// </summary>
    static bool Scan(string json, out Found found)
    {
        found = null!;

        var index = SkipWs(json, 0);

        if (index >= json.Length || json[index] != '{')
        {
            return false;
        }

        index++;
        var members = 0;
        var lastValueEnd = -1;
        var topClose = -1;
        var firstIndent = "  ";
        var hasRecords = false;
        var recordsIndent = "  ";
        var arrayOpen = -1;
        var arrayClose = -1;
        var spans = new List<(int Start, int End)>();

        while (true)
        {
            index = SkipWs(json, index);

            if (index >= json.Length)
            {
                return false;
            }

            if (json[index] == '}')
            {
                topClose = index;
                break;
            }

            if (json[index] != '"')
            {
                return false;
            }

            var keyStart = index;
            var keyEnd = SkipString(json, index);

            if (keyEnd < 0)
            {
                return false;
            }

            var key = json[(keyStart + 1)..(keyEnd - 1)];
            index = SkipWs(json, keyEnd);

            if (index >= json.Length || json[index] != ':')
            {
                return false;
            }

            index = SkipWs(json, index + 1);
            var valueStart = index;
            var valueEnd = SkipValue(json, index);

            if (valueEnd < 0)
            {
                return false;
            }

            if (members == 0)
            {
                firstIndent = LineIndent(json, keyStart) ?? "  ";
            }

            members++;
            lastValueEnd = valueEnd;

            if (key == "records" && !hasRecords)
            {
                hasRecords = true;
                recordsIndent = LineIndent(json, keyStart) ?? "  ";

                if (json[valueStart] != '[' || !ArraySpans(json, valueStart, spans, out arrayClose))
                {
                    return false;
                }

                arrayOpen = valueStart;
            }

            index = SkipWs(json, valueEnd);

            if (index >= json.Length)
            {
                return false;
            }

            if (json[index] == ',')
            {
                index++;
                continue;
            }

            if (json[index] == '}')
            {
                topClose = index;
                break;
            }

            return false;
        }

        found = new Found(
            hasRecords, recordsIndent, firstIndent, members, lastValueEnd, topClose,
            arrayOpen, arrayClose, spans);

        return true;
    }

    /// <summary>The element spans of the array opening at the offset.</summary>
    static bool ArraySpans(string json, int open, List<(int Start, int End)> spans, out int close)
    {
        close = -1;
        var index = SkipWs(json, open + 1);

        if (index >= json.Length)
        {
            return false;
        }

        if (json[index] == ']')
        {
            close = index;
            return true;
        }

        while (true)
        {
            var end = SkipValue(json, index);

            if (end < 0)
            {
                return false;
            }

            spans.Add((index, end));
            index = SkipWs(json, end);

            if (index >= json.Length)
            {
                return false;
            }

            if (json[index] == ',')
            {
                index = SkipWs(json, index + 1);

                if (index >= json.Length || json[index] == ']')
                {
                    return false;
                }

                continue;
            }

            if (json[index] == ']')
            {
                close = index;
                return true;
            }

            return false;
        }
    }

    /// <summary>The offset past the JSON value starting at the offset, or -1.</summary>
    static int SkipValue(string json, int index)
    {
        index = SkipWs(json, index);

        if (index >= json.Length)
        {
            return -1;
        }

        return json[index] switch
        {
            '"' => SkipString(json, index),
            '{' or '[' => SkipBracketed(json, index),
            _ => SkipLiteral(json, index),
        };
    }

    /// <summary>The offset past the bracketed value starting at the offset, or -1.</summary>
    static int SkipBracketed(string json, int index)
    {
        var closing = json[index] == '{' ? '}' : ']';
        var depth = 0;
        var cursor = index;

        while (cursor < json.Length)
        {
            var character = json[cursor];

            if (character == '"')
            {
                cursor = SkipString(json, cursor);

                if (cursor < 0)
                {
                    return -1;
                }

                continue;
            }

            if (character == '{' || character == '[')
            {
                depth++;
            }
            else if (character == '}' || character == ']')
            {
                depth--;

                if (depth == 0)
                {
                    return character == closing ? cursor + 1 : -1;
                }
            }

            cursor++;
        }

        return -1;
    }

    /// <summary>The offset past the string starting at the offset, or -1.</summary>
    static int SkipString(string json, int index)
    {
        var cursor = index + 1;

        while (cursor < json.Length)
        {
            if (json[cursor] == '"')
            {
                return cursor + 1;
            }

            if (json[cursor] == '\\')
            {
                cursor++;
            }

            cursor++;
        }

        return -1;
    }

    /// <summary>The offset past a literal starting at the offset, or -1.</summary>
    static int SkipLiteral(string json, int index)
    {
        var cursor = index;

        while (cursor < json.Length && ",]} \t\n\r".IndexOf(json[cursor]) < 0)
        {
            cursor++;
        }

        return cursor > index ? cursor : -1;
    }

    /// <summary>The offset past the whitespace starting at the offset.</summary>
    static int SkipWs(string json, int index)
    {
        while (index < json.Length && json[index] is ' ' or '\t' or '\n' or '\r')
        {
            index++;
        }

        return index;
    }
}

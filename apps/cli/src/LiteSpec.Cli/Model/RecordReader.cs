using System.Text.Json;
using System.Text.RegularExpressions;
using LiteSpec.Authoring;

namespace LiteSpec.Model;

/// <summary>
///     One page's body, kept for citation and generated-region reads.
/// </summary>
/// <param name="File">The absolute path.</param>
/// <param name="Body">The text after the frontmatter.</param>
/// <param name="BodyStartLine">The body's first line, 1-based.</param>
/// <param name="PageId">The page record's id, when the page carries one.</param>
sealed record PageBody(string File, string Body, int BodyStartLine, string? PageId);

/// <summary>
///     What the record read found: records, bodies, provisions and problems.
/// </summary>
/// <param name="Records">Every written record.</param>
/// <param name="Bodies">Every page body under the record roots.</param>
/// <param name="Provisions">The shared provision ids, from the release the tool carries.</param>
/// <param name="Problems">Files the reader could not read.</param>
sealed record RecordRead(
    IReadOnlyList<Record> Records,
    IReadOnlyList<PageBody> Bodies,
    IReadOnlySet<string> Provisions,
    IReadOnlyList<Finding> Problems);

/// <summary>
///     Finds every written record: page records, entries and terms.
/// </summary>
static class RecordReader
{
    /// <summary>Reads every record under the configured roots.</summary>
    public static RecordRead Read(ConsumerConfig config)
    {
        var files = new List<string>();

        foreach (var root in config.RecordRoots)
        {
            files.AddRange(SourceTree.Files(root, ".md"));
        }

        var records = new List<Record>();
        var bodies = new List<PageBody>();
        var problems = new List<Finding>();
        var gate = new object();

        System.Threading.Tasks.Parallel.ForEach(
            files,
            () => (Records: new List<Record>(), Bodies: new List<PageBody>(), Problems: new List<Finding>()),
            (file, _, local) =>
            {
                ReadPage(config, file, local.Records, local.Bodies, local.Problems);

                return local;
            },
            local =>
            {
                lock (gate)
                {
                    records.AddRange(local.Records);
                    bodies.AddRange(local.Bodies);
                    problems.AddRange(local.Problems);
                }
            });

        records.Sort((left, right) =>
        {
            var file = string.Compare(left.File, right.File, StringComparison.Ordinal);

            return file != 0 ? file : left.Line.CompareTo(right.Line);
        });
        bodies.Sort((left, right) => string.Compare(left.File, right.File, StringComparison.Ordinal));
        problems.Sort((left, right) =>
        {
            var file = string.Compare(left.Path, right.Path, StringComparison.Ordinal);

            return file != 0 ? file : left.Line.CompareTo(right.Line);
        });

        ReadTerms(config, records, problems);
        DeriveResults(records);

        return new RecordRead(records, bodies, ReadProvisions(), problems);
    }

    private static void ReadPage(
        ConsumerConfig config,
        string file,
        List<Record> records,
        List<PageBody> bodies,
        List<Finding> problems)
    {
        var text = SourceTree.Read(file);

        if (!Frontmatter.TryParse(text, out var parsed, out _))
        {
            bodies.Add(new PageBody(file, text, 1, null));
            return;
        }

        string? pageId = null;
        string? pageOwner = null;
        string? pageStatus = null;
        string? pageDecider = null;
        string? pageDecideBy = null;

        if (parsed.Root.ValueKind == JsonValueKind.Object
            && parsed.Root.TryGetProperty("type", out var typeValue)
            && typeValue.ValueKind == JsonValueKind.String
            && typeValue.GetString() is { } type)
        {
            var tables = TablesOf(parsed.Body);

            if (RecordTypes.All.Contains(type))
            {
                var record = BuildRecord(
                    PatchedPage(parsed.Root, tables), file, LineOf(text, "\"type\""), false, null,
                    null, null, null, null);

                pageId = record.Id;
                pageOwner = record.Owner;
                pageStatus = record.Status;
                pageDecider = record.Decider;
                pageDecideBy = record.DecideBy;
                records.Add(record);
            }
            else if (!RecordTypes.PageStyles.Contains(type))
            {
                problems.Add(new Finding(
                    "invalid-field",
                    $"Page type '{type}' is neither a record type nor a page style.",
                    file,
                    LineOf(text, "\"type\""),
                    null));
            }
            else
            {
                pageOwner = StringField(parsed.Root, "owner");
                pageStatus = StringField(parsed.Root, "status");
                pageDecider = StringField(parsed.Root, "decider");
                pageDecideBy = StringField(parsed.Root, "decideBy");
            }

            if (parsed.Root.TryGetProperty("records", out var entries)
                && entries.ValueKind == JsonValueKind.Array)
            {
                foreach (var entry in entries.EnumerateArray())
                {
                    if (entry.ValueKind != JsonValueKind.Object)
                    {
                        continue;
                    }

                    var entryType = StringField(entry, "type");
                    var line = StringField(entry, "id") is { } entryId
                        ? LineOf(text, entryId)
                        : LineOf(text, "\"records\"");

                    if (!RecordTypes.All.Contains(entryType ?? ""))
                    {
                        problems.Add(new Finding(
                            "invalid-field",
                            $"Entry type '{entryType ?? "missing"}' is not a record type.",
                            file,
                            line,
                            pageId));
                        continue;
                    }

                    records.Add(BuildRecord(
                        PatchedEntry(entry, entries, tables), file, line, true, pageId,
                        pageOwner, pageStatus, pageDecider, pageDecideBy));
                }
            }
        }

        bodies.Add(new PageBody(file, parsed.Body, parsed.BodyStartLine, pageId));
    }

    /// <summary>One Markdown table and the heading above it.</summary>
    sealed record MarkdownTable(
        IReadOnlyList<string> Headers,
        IReadOnlyList<IReadOnlyList<string>> Rows,
        string Heading);

    static readonly Regex TableDelimiter = new(
        @"^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$",
        RegexOptions.CultureInvariant);

    /// <summary>
    ///     The page element with table fields added: transitions and data on an
    ///     aggregate, examples on a scenario. A front-matter field wins over a table.
    /// </summary>
    private static JsonElement PatchedPage(JsonElement element, IReadOnlyList<MarkdownTable> tables)
    {
        if (StringField(element, "type") == "aggregate")
        {
            var transitions = TransitionsOf(tables);

            if (transitions.Count > 0 && FieldMissing(element, "transitions"))
            {
                element = WithField(element, "transitions", writer => WriteTransitions(writer, transitions));
            }

            var data = DataOf(tables);

            if (data.Count > 0 && FieldMissing(element, "data"))
            {
                element = WithField(element, "data", writer => WriteData(writer, data));
            }
        }
        else if (StringField(element, "type") == "scenario")
        {
            var examples = FirstExamples(tables);

            if (examples.Count > 0 && FieldMissing(element, "examples"))
            {
                element = WithField(element, "examples", writer => WriteExamples(writer, examples));
            }
        }

        return element;
    }

    /// <summary>
    ///     A scenario entry with its examples table added. On a page with one
    ///     scenario the first plain table wins; with several, a table belongs to the
    ///     scenario its heading names. A front-matter field wins over a table.
    /// </summary>
    private static JsonElement PatchedEntry(
        JsonElement entry,
        JsonElement siblings,
        IReadOnlyList<MarkdownTable> tables)
    {
        if (StringField(entry, "type") != "scenario" || !FieldMissing(entry, "examples"))
        {
            return entry;
        }

        var examples = ExamplesFor(entry, siblings, tables);

        return examples.Count > 0
            ? WithField(entry, "examples", writer => WriteExamples(writer, examples))
            : entry;
    }

    private static bool FieldMissing(JsonElement element, string field) =>
        !element.TryGetProperty(field, out var value) || value.ValueKind == JsonValueKind.Null;

    private static IReadOnlyList<IReadOnlyDictionary<string, string>> ExamplesFor(
        JsonElement entry,
        JsonElement siblings,
        IReadOnlyList<MarkdownTable> tables)
    {
        var scenarios = 0;

        foreach (var sibling in siblings.EnumerateArray())
        {
            if (sibling.ValueKind == JsonValueKind.Object && StringField(sibling, "type") == "scenario")
            {
                scenarios++;
            }
        }

        if (scenarios <= 1)
        {
            return FirstExamples(tables);
        }

        var id = StringField(entry, "id") ?? "";
        var title = StringField(entry, "title") ?? "";
        var rows = new List<IReadOnlyDictionary<string, string>>();

        foreach (var table in tables)
        {
            if (!IsTransitions(table.Headers)
                && !IsData(table.Headers)
                && HeadingNames(table.Heading, id, title))
            {
                rows.AddRange(ExamplesOf(table));
            }
        }

        return rows;
    }

    private static IReadOnlyList<IReadOnlyDictionary<string, string>> FirstExamples(
        IReadOnlyList<MarkdownTable> tables)
    {
        foreach (var table in tables)
        {
            if (!IsTransitions(table.Headers) && !IsData(table.Headers))
            {
                return ExamplesOf(table);
            }
        }

        return [];
    }

    /// <summary>Every From and To row of every transitions table, in order; By aliases Triggered By.</summary>
    private static IReadOnlyList<(string From, string To, string? By)> TransitionsOf(
        IReadOnlyList<MarkdownTable> tables)
    {
        var rows = new List<(string From, string To, string? By)>();

        foreach (var table in tables)
        {
            var from = ColumnOf(table.Headers, "from");
            var to = ColumnOf(table.Headers, "to");

            if (from < 0 || to < 0)
            {
                continue;
            }

            var by = ColumnOf(table.Headers, "triggeredby");

            if (by < 0)
            {
                by = ColumnOf(table.Headers, "by");
            }

            foreach (var cells in table.Rows)
            {
                var start = CleanCell(CellOf(cells, from), false);
                var end = CleanCell(CellOf(cells, to), false);

                if (IsEmptyCell(end))
                {
                    continue;
                }

                // An empty From is a creation: the row names the state an instance starts in.
                if (IsEmptyCell(start))
                {
                    start = Creation;
                }

                string? trigger = null;

                if (by >= 0)
                {
                    var cause = CleanCell(CellOf(cells, by), true);
                    trigger = IsEmptyCell(cause) ? null : cause;
                }

                rows.Add((start, end, trigger));
            }
        }

        return rows;
    }

    /// <summary>Every named row of every data table, in order.</summary>
    private static IReadOnlyList<(string Name, string Meaning, string Classification)> DataOf(
        IReadOnlyList<MarkdownTable> tables)
    {
        var rows = new List<(string Name, string Meaning, string Classification)>();

        foreach (var table in tables)
        {
            var name = ColumnOf(table.Headers, "name");
            var meaning = ColumnOf(table.Headers, "meaning");
            var classification = ColumnOf(table.Headers, "classification");

            if (name < 0 || meaning < 0 || classification < 0)
            {
                continue;
            }

            foreach (var cells in table.Rows)
            {
                var item = CleanCell(CellOf(cells, name), false);

                if (IsEmptyCell(item))
                {
                    continue;
                }

                var sense = CleanCell(CellOf(cells, meaning), false);
                var level = CleanCell(CellOf(cells, classification), false);

                rows.Add((item, IsEmptyCell(sense) ? "" : sense, IsEmptyCell(level) ? "" : level.ToLowerInvariant()));
            }
        }

        return rows;
    }

    /// <summary>
    ///     The table rows as examples: headers become the keys verbatim, a blank
    ///     header becomes column plus its 1-based position, and a repeated header
    ///     keeps its last value.
    /// </summary>
    private static IReadOnlyList<IReadOnlyDictionary<string, string>> ExamplesOf(MarkdownTable table)
    {
        var rows = new List<IReadOnlyDictionary<string, string>>();

        foreach (var cells in table.Rows)
        {
            var row = new Dictionary<string, string>(StringComparer.Ordinal);

            for (var index = 0; index < table.Headers.Count; index++)
            {
                var header = CleanCell(table.Headers[index], false);
                var key = header.Length == 0 ? $"column{index + 1}" : header;
                var value = CleanCell(CellOf(cells, index), false);
                row[key] = IsEmptyCell(value) ? "" : value;
            }

            if (row.Count > 0)
            {
                rows.Add(row);
            }
        }

        return rows;
    }

    private static bool IsTransitions(IReadOnlyList<string> headers) =>
        ColumnOf(headers, "from") >= 0 && ColumnOf(headers, "to") >= 0;

    private static bool IsData(IReadOnlyList<string> headers) =>
        ColumnOf(headers, "name") >= 0
        && ColumnOf(headers, "meaning") >= 0
        && ColumnOf(headers, "classification") >= 0;

    private static int ColumnOf(IReadOnlyList<string> headers, string target)
    {
        for (var index = 0; index < headers.Count; index++)
        {
            if (Norm(headers[index]) == target)
            {
                return index;
            }
        }

        return -1;
    }

    private static string CellOf(IReadOnlyList<string> cells, int index) =>
        index < cells.Count ? cells[index] : "";

    /// <summary>Headers compare case-insensitively, ignoring spaces, dashes and underscores.</summary>
    private static string Norm(string value) =>
        value.Replace(" ", "").Replace("-", "").Replace("_", "").Replace("\t", "").ToLowerInvariant();

    /// <summary>Whether the heading names the scenario by id, title or kebab name.</summary>
    private static bool HeadingNames(string heading, string id, string title)
    {
        if (heading.Length == 0)
        {
            return false;
        }

        var text = heading.ToLowerInvariant();

        if (id.Length > 0 && text.Contains(id.ToLowerInvariant(), StringComparison.Ordinal))
        {
            return true;
        }

        if (title.Length > 0 && text.Contains(title.ToLowerInvariant(), StringComparison.Ordinal))
        {
            return true;
        }

        var name = id.Contains('.') ? id[(id.LastIndexOf('.') + 1)..] : id;
        name = name.Contains('/') ? name[(name.LastIndexOf('/') + 1)..] : name;
        var words = name.Replace('-', ' ').Replace('_', ' ').ToLowerInvariant();

        return words.Length > 0 && text.Contains(words, StringComparison.Ordinal);
    }

    /// <summary>Trimmed text: code ticks stripped, a lone link reduced to its label, or its target for an id.</summary>
    private static string CleanCell(string cell, bool preferTarget)
    {
        var text = cell.Trim();

        while (text.Length >= 2 && text.StartsWith('`') && text.EndsWith('`'))
        {
            text = text[1..^1].Trim();
        }

        if (LinkOf(text) is { } link)
        {
            if (preferTarget && link.Target.Contains('/'))
            {
                return link.Target.Trim();
            }

            return link.Label.Trim();
        }

        return text;
    }

    private static (string Label, string Target)? LinkOf(string text)
    {
        if (!text.StartsWith('['))
        {
            return null;
        }

        var labelEnd = text.IndexOf("](", StringComparison.Ordinal);

        if (labelEnd < 0)
        {
            return null;
        }

        var targetEnd = text.IndexOf(')', labelEnd + 2);

        if (targetEnd != text.Length - 1)
        {
            return null;
        }

        var target = text[(labelEnd + 2)..targetEnd];
        var space = target.IndexOfAny([' ', '\t', '"', '\'']);

        return (text[1..labelEnd], space < 0 ? target : target[..space]);
    }

    /// <summary>The From of a transition that creates the instance.</summary>
    public const string Creation = "-";

    private static bool IsEmptyCell(string text) =>
        text.Length == 0
        || text is "-" or "--" or "—"
        || text.Equals("n/a", StringComparison.OrdinalIgnoreCase)
        || text.Equals("none", StringComparison.OrdinalIgnoreCase)
        || text.Equals("none.", StringComparison.OrdinalIgnoreCase);

    /// <summary>Every Markdown table outside fenced code, each with the heading above it.</summary>
    private static IReadOnlyList<MarkdownTable> TablesOf(string body)
    {
        var lines = body.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n');
        var tables = new List<MarkdownTable>();
        var heading = "";
        var inFence = false;
        var index = 0;

        while (index < lines.Length)
        {
            var line = lines[index];
            var trimmed = line.Trim();

            if (trimmed.StartsWith("```", StringComparison.Ordinal)
                || trimmed.StartsWith("~~~", StringComparison.Ordinal))
            {
                inFence = !inFence;
                index++;
                continue;
            }

            if (inFence)
            {
                index++;
                continue;
            }

            if (HeadingText(trimmed) is { } text)
            {
                heading = text;
                index++;
                continue;
            }

            if (index + 1 < lines.Length
                && line.Contains('|')
                && trimmed.Length > 0
                && TableDelimiter.IsMatch(lines[index + 1]))
            {
                var headers = Cells(line);
                var rows = new List<IReadOnlyList<string>>();
                var row = index + 2;

                while (row < lines.Length
                       && lines[row].Contains('|')
                       && lines[row].Trim().Length > 0
                       && HeadingText(lines[row].Trim()) is null
                       && !lines[row].Trim().StartsWith("```", StringComparison.Ordinal)
                       && !lines[row].Trim().StartsWith("~~~", StringComparison.Ordinal))
                {
                    rows.Add(Cells(lines[row]));
                    row++;
                }

                if (headers.Count > 0)
                {
                    tables.Add(new MarkdownTable(headers, rows, heading));
                }

                index = row;
                continue;
            }

            index++;
        }

        return tables;
    }

    private static string? HeadingText(string trimmed)
    {
        if (!trimmed.StartsWith('#'))
        {
            return null;
        }

        var hashes = 0;

        while (hashes < trimmed.Length && trimmed[hashes] == '#')
        {
            hashes++;
        }

        if (hashes > 6 || (hashes < trimmed.Length && trimmed[hashes] != ' ' && trimmed[hashes] != '\t'))
        {
            return null;
        }

        return trimmed[hashes..].Trim().TrimEnd('#').Trim();
    }

    private static IReadOnlyList<string> Cells(string line)
    {
        var cells = line.Trim().Trim('|').Split('|').Select(cell => cell.Trim()).ToList();

        return cells is [{ Length: 0 }] ? [] : cells;
    }

    private static JsonElement WithField(JsonElement element, string field, Action<Utf8JsonWriter> writeValue)
    {
        using var stream = new MemoryStream();

        using (var writer = new Utf8JsonWriter(stream))
        {
            writer.WriteStartObject();

            foreach (var property in element.EnumerateObject())
            {
                property.WriteTo(writer);
            }

            writer.WritePropertyName(field);
            writeValue(writer);
            writer.WriteEndObject();
        }

        using var document = JsonDocument.Parse(stream.ToArray());

        return document.RootElement.Clone();
    }

    private static void WriteTransitions(Utf8JsonWriter writer, IReadOnlyList<(string From, string To, string? By)> rows)
    {
        writer.WriteStartArray();

        foreach (var (from, to, by) in rows)
        {
            writer.WriteStartObject();
            writer.WriteString("from", from);
            writer.WriteString("to", to);

            if (by is not null)
            {
                writer.WriteString("by", by);
            }

            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    private static void WriteData(Utf8JsonWriter writer, IReadOnlyList<(string Name, string Meaning, string Classification)> rows)
    {
        writer.WriteStartArray();

        foreach (var (name, meaning, classification) in rows)
        {
            writer.WriteStartObject();
            writer.WriteString("name", name);
            writer.WriteString("meaning", meaning);
            writer.WriteString("classification", classification);
            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    private static void WriteExamples(Utf8JsonWriter writer, IReadOnlyList<IReadOnlyDictionary<string, string>> rows)
    {
        writer.WriteStartArray();

        foreach (var row in rows)
        {
            writer.WriteStartObject();

            foreach (var (key, value) in row)
            {
                writer.WriteString(key, value);
            }

            writer.WriteEndObject();
        }

        writer.WriteEndArray();
    }

    private static Record BuildRecord(
        JsonElement element,
        string file,
        int line,
        bool isEntry,
        string? pageId,
        string? pageOwner,
        string? pageStatus,
        string? pageDecider,
        string? pageDecideBy) =>
        new()
        {
            Type = StringField(element, "type") ?? "",
            Id = StringField(element, "id") ?? "",
            Title = StringField(element, "title") ?? "",
            Owner = StringField(element, "owner") ?? pageOwner,
            Status = StringField(element, "status") ?? pageStatus,
            Decider = StringField(element, "decider") ?? pageDecider,
            DecideBy = StringField(element, "decideBy") ?? pageDecideBy,
            ApprovedBy = StringField(element, "approvedBy"),
            ApprovedOn = StringField(element, "approvedOn"),
            ApprovedHash = StringField(element, "approvedHash"),
            File = file,
            Line = line,
            IsEntry = isEntry,
            PageId = pageId,
            Raw = element.Clone(),
        };

    /// <summary>
    ///     Derives the generic refusal results: forbidden for every use case with a permission
    ///     grant, and invalid-input for every use case with a validated input. Scenarios and
    ///     tests point at them; they are never written as records.
    /// </summary>
    private static void DeriveResults(List<Record> records)
    {
        var taken = records
            .Where(record => record.Id.Length > 0)
            .Select(record => record.Id)
            .ToHashSet(StringComparer.Ordinal);
        var derived = new List<Record>();

        foreach (var useCase in records.Where(record => record.Type == "use-case"))
        {
            if (!Identifiers.TrySplit(useCase.Id, out _, out var home, out var name) || home is null)
            {
                continue;
            }

            if (ModelBuilder.GrantedPermission(useCase) is not null
                && taken.Add($"result/{home}.{name}.forbidden"))
            {
                derived.Add(DerivedResult(
                    useCase,
                    $"result/{home}.{name}.forbidden",
                    "Forbidden",
                    "The caller lacks the grant the use case requires."));
            }

            if (ModelBuilder.HasValidatedInput(useCase)
                && taken.Add($"result/{home}.{name}.invalid-input"))
            {
                derived.Add(DerivedResult(
                    useCase,
                    $"result/{home}.{name}.invalid-input",
                    "Invalid input",
                    "An input value breaks the rules the use case declares."));
            }
        }

        records.AddRange(derived);
    }

    /// <summary>One derived generic result, carried by its use case's page.</summary>
    private static Record DerivedResult(Record useCase, string id, string title, string meaning)
    {
        var json = JsonSerializer.Serialize(new Dictionary<string, string?>(StringComparer.Ordinal)
        {
            ["type"] = "result",
            ["id"] = id,
            ["title"] = title,
            ["outcome"] = "refusal",
            ["meaning"] = meaning,
        });

        using var document = JsonDocument.Parse(json);

        return new Record
        {
            Type = "result",
            Id = id,
            Title = title,
            Owner = useCase.Owner,
            Status = useCase.Status,
            Decider = useCase.Decider,
            DecideBy = useCase.DecideBy,
            File = useCase.File,
            Line = useCase.Line,
            IsEntry = true,
            PageId = useCase.Id,
            Derived = true,
            Raw = document.RootElement.Clone(),
        };
    }

    private static void ReadTerms(ConsumerConfig config, List<Record> records, List<Finding> problems)
    {
        if (!File.Exists(config.GlossaryPath))
        {
            return;
        }

        var text = SourceTree.Read(config.GlossaryPath);

        JsonDocument document;

        try
        {
            document = JsonDocument.Parse(text);
        }
        catch (JsonException exception)
        {
            problems.Add(new Finding(
                "invalid-field", $"The glossary is not JSON: {exception.Message}",
                config.GlossaryPath, 1, null));
            return;
        }

        using (document)
        {
            if (!document.RootElement.TryGetProperty("terms", out var terms)
                || terms.ValueKind != JsonValueKind.Array)
            {
                return;
            }

            foreach (var term in terms.EnumerateArray())
            {
                if (term.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                var id = StringField(term, "id") ?? "";
                var line = id.Length > 0 ? LineOf(text, id) : 1;

                records.Add(new Record
                {
                    Type = "term",
                    Id = id,
                    Title = StringField(term, "term") ?? "",
                    Owner = StringField(term, "owner"),
                    Status = StringField(term, "status"),
                    File = config.GlossaryPath,
                    Line = line,
                    IsEntry = true,
                    Raw = term.Clone(),
                });
            }
        }
    }

    private static IReadOnlySet<string> ReadProvisions()
    {
        var home = LiteSpecHome.Root;

        if (home is null || !Directory.Exists(Path.Combine(home, "docs")))
        {
            return new HashSet<string>(StringComparer.Ordinal);
        }

        return new HashSet<string>(
            Provisions.Collect(home).Select(row => row.Id),
            StringComparer.Ordinal);
    }

    private static string? StringField(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    /// <summary>The 1-based line where the needle first occurs, or 1.</summary>
    public static int LineOf(string text, string needle)
    {
        var at = text.IndexOf(needle, StringComparison.Ordinal);

        if (at < 0)
        {
            return 1;
        }

        var line = 1;

        for (var index = 0; index < at; index++)
        {
            if (text[index] == '\n')
            {
                line++;
            }
        }

        return line;
    }
}

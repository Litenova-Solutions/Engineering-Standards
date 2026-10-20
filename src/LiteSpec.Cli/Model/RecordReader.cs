using System.Text.Json;

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
/// <param name="Provisions">The shared provision ids, when the standards sit beside the consumer.</param>
/// <param name="Problems">Files the reader could not read.</param>
sealed record RecordRead(
    IReadOnlyList<Record> Records,
    IReadOnlyList<PageBody> Bodies,
    IReadOnlySet<string> Provisions,
    IReadOnlyList<Finding> Problems);

/// <summary>
///     Finds every written record: page records, entries, terms and project standards.
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
        ReadAgentStandards(config, records);

        return new RecordRead(records, bodies, ReadProvisions(config), problems);
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
            if (RecordTypes.All.Contains(type))
            {
                var record = BuildRecord(
                    parsed.Root, file, LineOf(text, "\"type\""), false, null,
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
                        entry, file, line, true, pageId,
                        pageOwner, pageStatus, pageDecider, pageDecideBy));
                }
            }
        }

        bodies.Add(new PageBody(file, parsed.Body, parsed.BodyStartLine, pageId));
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
            File = file,
            Line = line,
            IsEntry = isEntry,
            PageId = pageId,
            Raw = element.Clone(),
        };

    private static void ReadTerms(ConsumerConfig config, List<Record> records, List<Finding> problems)
    {
        if (!File.Exists(config.LanguagePath))
        {
            return;
        }

        var text = SourceTree.Read(config.LanguagePath);

        JsonDocument document;

        try
        {
            document = JsonDocument.Parse(text);
        }
        catch (JsonException exception)
        {
            problems.Add(new Finding(
                "invalid-field", $"The language record is not JSON: {exception.Message}",
                config.LanguagePath, 1, null));
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
                    File = config.LanguagePath,
                    Line = line,
                    IsEntry = true,
                    Raw = term.Clone(),
                });
            }
        }
    }

    private static void ReadAgentStandards(ConsumerConfig config, List<Record> records)
    {
        var owner = config.Owners.FirstOrDefault();

        foreach (var file in AgentFiles(config.Root))
        {
            var lines = SourceTree.Read(file).Split('\n');

            for (var index = 0; index < lines.Length; index++)
            {
                var match = Identifiers.StandardHeading().Match(lines[index].TrimEnd('\r'));

                if (!match.Success)
                {
                    continue;
                }

                var id = match.Groups["id"].Value;
                var section = Section(lines, index);
                var raw = JsonSerializer.SerializeToElement(new
                {
                    type = "standard",
                    id,
                    title = HeadingTitle(lines[index]),
                });

                records.Add(new Record
                {
                    Type = "standard",
                    Id = id,
                    Title = HeadingTitle(lines[index]),
                    Owner = owner,
                    Status = SectionStatus(section),
                    Decider = SectionMarker(section, "decider"),
                    DecideBy = SectionMarker(section, "decide-by", "decide by"),
                    File = file,
                    Line = index + 1,
                    IsEntry = false,
                    Raw = raw,
                });
            }
        }
    }

    /// <summary>The heading's section: the lines until the next heading.</summary>
    private static IReadOnlyList<string> Section(string[] lines, int heading)
    {
        var section = new List<string>();

        for (var index = heading + 1; index < lines.Length; index++)
        {
            if (lines[index].TrimStart().StartsWith('#'))
            {
                break;
            }

            section.Add(lines[index]);
        }

        return section;
    }

    /// <summary>Approved, unless the section carries a status marker.</summary>
    private static string SectionStatus(IReadOnlyList<string> section)
    {
        var marked = SectionMarker(section, "status")?.ToLowerInvariant();

        return marked is "draft" or "approved" or "retired" ? marked : "approved";
    }

    /// <summary>The value a `Name: value` marker line carries, when one names it.</summary>
    private static string? SectionMarker(IReadOnlyList<string> section, params string[] names)
    {
        foreach (var line in section)
        {
            var text = line.Trim().TrimEnd('\r').TrimStart('>', ' ').Trim();

            foreach (var name in names)
            {
                foreach (var form in new[] { $"{name}:", $"**{name}:**", $"**{name}**:" })
                {
                    if (text.StartsWith(form, StringComparison.OrdinalIgnoreCase))
                    {
                        var value = text[form.Length..].Trim().Trim('*', ' ', '\t');

                        return value.Length > 0 ? value : null;
                    }
                }
            }
        }

        return null;
    }

    private static IReadOnlyList<string> AgentFiles(string root)
    {
        var found = new List<string>();

        foreach (var file in SourceTree.Files(root))
        {
            if (!Path.GetFileName(file).Equals("AGENTS.md", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var relative = Path.GetRelativePath(root, file);

            if (relative.StartsWith("litespec" + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                || relative.StartsWith(".agents" + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            found.Add(file);
        }

        return found;
    }

    private static IReadOnlySet<string> ReadProvisions(ConsumerConfig config)
    {
        var docs = Path.Combine(config.Root, "litespec", "docs");

        if (!Directory.Exists(docs))
        {
            return new HashSet<string>(StringComparer.Ordinal);
        }

        var found = new HashSet<string>(StringComparer.Ordinal);

        foreach (var file in SourceTree.Files(docs, ".md"))
        {
            foreach (var line in File.ReadLines(file))
            {
                foreach (var match in Identifiers.ProvisionHeading().Matches(line).Cast<System.Text.RegularExpressions.Match>())
                {
                    found.Add(match.Value.Trim('(', ')'));
                }
            }
        }

        return found;
    }

    private static string? StringField(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static string HeadingTitle(string line)
    {
        var text = line.Trim().TrimStart('#').Trim();
        var open = text.LastIndexOf("(", StringComparison.Ordinal);

        return open > 0 ? text[..open].Trim() : text;
    }

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

using System.Text.RegularExpressions;

namespace LiteSpec.Model;

/// <summary>
///     Rewrites the fenced generated regions, leaving all other text untouched.
/// </summary>
static partial class Renderer
{
    /// <summary>Renders every known region, returning the changed files.</summary>
    public static IReadOnlyList<string> Render(ProjectModel model)
    {
        var changed = new List<string>();

        foreach (var root in model.Config.RecordRoots)
        {
            foreach (var file in SourceTree.Files(root, ".md"))
            {
                var text = SourceTree.Read(file);

                var rewritten = Region().Replace(text, match =>
                {
                    var name = match.Groups["name"].Value;
                    var content = ContentFor(model, file, name);

                    if (content is null)
                    {
                        return match.Value;
                    }

                    var newline = text.Contains("\r\n", StringComparison.Ordinal) ? "\r\n" : "\n";

                    return $"<!-- generated:{name} -->{newline}{content}{newline}<!-- /generated:{name} -->";
                });

                if (rewritten != text)
                {
                    File.WriteAllText(file, rewritten);
                    changed.Add(model.Config.Relative(file));
                }
            }
        }

        return changed;
    }

    /// <summary>Every region name the builder renders.</summary>
    public static readonly HashSet<string> KnownRegions = new(StringComparer.Ordinal)
    {
        "history", "use-case-coverage", "sub-processors", "runbook-index", "rule-map",
        "operations-log", "open-questions", "journeys", "glossary", "deviations", "census",
        "aggregate-map", "audit-register", "alert-inventory", "counts",
    };

    /// <summary>One region fence: its name and the offset where it opens.</summary>
    public sealed record RegionFence(string Name, int Index);

    /// <summary>Every generated-region fence the text carries.</summary>
    public static IReadOnlyList<RegionFence> Regions(string text) =>
        [.. Region().Matches(text).Select(match => new RegionFence(match.Groups["name"].Value, match.Index))];

    private static string? ContentFor(ProjectModel model, string file, string name) =>
        name switch
        {
            "history" => History(model, file),
            "use-case-coverage" => UseCaseCoverage(model),
            "sub-processors" => SubProcessors(model, file),
            "runbook-index" => RunbookIndex(model, file),
            "rule-map" => RuleMap(model),
            "operations-log" => OperationsLog(file),
            "open-questions" => OpenQuestions(model),
            "journeys" => Journeys(model, file),
            "glossary" => Glossary(model),
            "deviations" => Deviations(model, file),
            "census" => Census(model),
            "aggregate-map" => AggregateMap(model),
            "audit-register" => AuditRegister(model),
            "alert-inventory" => AlertInventory(model, file),
            "counts" => Counts(model),
            _ => null,
        };

    private static string Glossary(ProjectModel model)
    {
        var lines = new List<string>
        {
            "| Term | Meaning | NL | DE |",
            "|:---|:---|:---|:---|",
        };

        foreach (var term in model.Records
                     .Where(record => record.Type == "term")
                     .OrderBy(record => record.Title, StringComparer.Ordinal))
        {
            var labels = term.Raw.TryGetProperty("labels", out var held) ? held : (System.Text.Json.JsonElement?)null;

            string Label(string language) =>
                labels is not null
                && labels.Value.ValueKind == System.Text.Json.JsonValueKind.Object
                && labels.Value.TryGetProperty(language, out var value)
                && value.ValueKind == System.Text.Json.JsonValueKind.String
                    ? value.GetString() ?? ""
                    : "";

            lines.Add($"| {Cell(term.Title)} | {Cell(term.Field("meaning") ?? "")} | {Cell(Label("nl"))} | {Cell(Label("de"))} |");
        }

        return string.Join('\n', lines);
    }

    private static string UseCaseCoverage(ProjectModel model)
    {
        var lines = new List<string>
        {
            "| Use case | Title | Implemented | Verified |",
            "|:---|:---|:---|:---|",
        };

        foreach (var useCase in model.Records
                     .Where(record => record.Type == "use-case")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var status = model.Status.TryGetValue(useCase.Id, out var held)
                ? held
                : new UseCaseStatus(false, false);

            lines.Add($"| `{useCase.Id}` | {Cell(useCase.Title)} | {(status.Implemented ? "yes" : "no")} | {(status.Verified ? "yes" : "no")} |");
        }

        return string.Join('\n', lines);
    }

    private static string SubProcessors(ProjectModel model, string file)
    {
        var lines = new List<string>
        {
            "| Service | Holds |",
            "|:---|:---|",
        };

        foreach (var actor in model.Records
                     .Where(record => record.Type == "actor" && record.Field("kind") == "organization")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var holds = ModelBuilder.TargetsOf(Holds(actor));

            lines.Add($"| [{Cell(actor.Title)}]({RelativeLink(file, actor.File)}) | {Cell(string.Join(", ", holds))} |");
        }

        return string.Join('\n', lines);
    }

    private static string RunbookIndex(ProjectModel model, string file)
    {
        var lines = new List<string>();

        foreach (var runbook in model.Records
                     .Where(record => record.Type == "runbook")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var trigger = runbook.Field("trigger") ?? "";

            lines.Add($"- [{runbook.Title}]({RelativeLink(file, runbook.File)}): {trigger}");
        }

        return string.Join('\n', lines);
    }

    private static string RuleMap(ProjectModel model)
    {
        var lines = new List<string>();
        var rules = model.Records
            .Where(record => record.Type == "rule")
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .ToList();
        var records = model.Records
            .Where(record => record.Type == "aggregate")
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .ToList();
        var placed = new HashSet<string>(StringComparer.Ordinal);

        foreach (var record in records)
        {
            var own = rules
                .Where(rule => !placed.Contains(rule.Id) && Governs(model, rule, record))
                .ToList();

            if (own.Count == 0)
            {
                continue;
            }

            lines.Add($"### `{record.Id}`");
            lines.Add(string.Empty);
            lines.Add("| Rule | Kind | Statement |");
            lines.Add("|:---|:---|:---|");

            foreach (var rule in own)
            {
                placed.Add(rule.Id);
                lines.Add($"| `{rule.Id}` | {rule.Field("kind") ?? ""} | {Cell(rule.Field("statement") ?? "")} |");
            }

            lines.Add(string.Empty);
        }

        var rest = rules.Where(rule => !placed.Contains(rule.Id)).ToList();

        if (rest.Count > 0)
        {
            lines.Add("### Module rules");
            lines.Add(string.Empty);
            lines.Add("| Rule | Kind | Statement |");
            lines.Add("|:---|:---|:---|");

            foreach (var rule in rest)
            {
                lines.Add($"| `{rule.Id}` | {rule.Field("kind") ?? ""} | {Cell(rule.Field("statement") ?? "")} |");
            }
        }

        return string.Join('\n', lines).TrimEnd();
    }

    private static bool Governs(ProjectModel model, Record rule, Record record)
    {
        foreach (var target in rule.Ids("governs"))
        {
            if (target == record.Id)
            {
                return true;
            }

            if (model.ById.TryGetValue(target, out var governed)
                && governed.Type == "use-case"
                && ModelBuilder.AggregateOf(model, governed)?.Id == record.Id)
            {
                return true;
            }
        }

        return Identifiers.TrySplit(rule.Id, out _, out var home, out _)
            && home is not null
            && Identifiers.TrySplit(record.Id, out _, out _, out var name)
            && home == name;
    }

    private static string OperationsLog(string file)
    {
        var folder = Path.GetDirectoryName(file)!;
        var lines = new List<string>();

        foreach (var month in SourceTree.Files(folder, ".md")
                     .Where(path => !path.Equals(file, StringComparison.Ordinal))
                     .Order(StringComparer.Ordinal))
        {
            var name = Path.GetFileNameWithoutExtension(month);

            lines.Add($"- [{name}]({Path.GetFileName(month)})");
        }

        return string.Join('\n', lines);
    }

    private static string OpenQuestions(ProjectModel model)
    {
        var lines = new List<string>();

        foreach (var body in model.Bodies
                     .Where(candidate => model.ById.TryGetValue(candidate.PageId ?? "", out var page)
                         && page.Type == "aggregate"
                         && string.Equals(page.File, candidate.File, StringComparison.Ordinal))
                     .OrderBy(candidate => candidate.PageId, StringComparer.Ordinal))
        {
            if (QuestionsSection(body.Body) is not { } section)
            {
                continue;
            }

            lines.Add($"### `{body.PageId}`");
            lines.Add(string.Empty);
            lines.Add(section.TrimEnd());
            lines.Add(string.Empty);
        }

        return string.Join('\n', lines).TrimEnd();
    }

    private static string? QuestionsSection(string body)
    {
        var lines = body.Split('\n');
        var start = -1;

        for (var index = 0; index < lines.Length; index++)
        {
            if (lines[index].Trim().TrimEnd('\r')
                .Equals("## Open modeling questions", StringComparison.OrdinalIgnoreCase))
            {
                start = index + 1;

                break;
            }
        }

        if (start < 0)
        {
            return null;
        }

        var section = new List<string>();

        for (var index = start; index < lines.Length; index++)
        {
            if (lines[index].TrimStart().StartsWith('#'))
            {
                break;
            }

            section.Add(lines[index]);
        }

        var text = string.Join('\n', section).Trim().TrimEnd('\r');

        return text.Length == 0 || text.Equals("None", StringComparison.OrdinalIgnoreCase) || text.Equals("None.", StringComparison.OrdinalIgnoreCase)
            ? null
            : text;
    }

    private static string Journeys(ProjectModel model, string file)
    {
        var lines = new List<string>();

        foreach (var journey in model.Records
                     .Where(record => record.Type == "journey")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var name = Path.GetFileNameWithoutExtension(journey.File);

            lines.Add($"- [{name}]({RelativeLink(file, journey.File)}): {journey.Field("goal") ?? ""}");
        }

        return string.Join('\n', lines);
    }

    private static string Deviations(ProjectModel model, string file)
    {
        var lines = new List<string>
        {
            "| Deviation | Provision |",
            "|:---|:---|",
        };

        foreach (var deviation in model.Records
                     .Where(record => record.Type == "deviation")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var name = Path.GetFileNameWithoutExtension(deviation.File);

            lines.Add($"| [{name}]({RelativeLink(file, deviation.File)}) | `{deviation.Field("provision") ?? ""}` |");
        }

        return string.Join('\n', lines);
    }

    private static string Census(ProjectModel model)
    {
        var lines = new List<string>
        {
            $"- workspace applications: {model.Records.Count(record => record.Type == "entry-point" && record.Has("path"))}",
            $"- domain modules: {model.Records.Count(record => record.Type == "module")}",
            $"- aggregate roots: {model.Records.Count(record => record.Type == "aggregate")}",
            $"- use cases: {model.Records.Count(record => record.Type == "use-case")}",
            $"- reactions: {model.Code.Reactions.Count(reaction => reaction.Kind == "reaction")}",
            $"- recurring commands: {model.Code.Reactions.Count(reaction => reaction.Kind == "job" && !reaction.Class.EndsWith("Worker", StringComparison.Ordinal))}",
            $"- workers: {model.Code.Reactions.Count(reaction => reaction.Kind == "job" && reaction.Class.EndsWith("Worker", StringComparison.Ordinal))}",
            $"- HTTP operations: {model.Code.Endpoints.Count}",
            $"- published events: {model.Records.Count(record => record.Type == "event")}",
            $"- frontend routes: {model.Screens.Count}",
        };

        return string.Join('\n', lines);
    }

    private static string AggregateMap(ProjectModel model)
    {
        var lines = new List<string>();
        var records = model.Records.Where(record => record.Type == "aggregate").ToList();

        foreach (var module in model.Records
                     .Where(record => record.Type == "module")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var name = Identifiers.TrySplit(module.Id, out _, out _, out var moduleName) ? moduleName : module.Id;
            var own = records
                .Where(record => Identifiers.TrySplit(record.Id, out _, out var home, out _) && home == name)
                .OrderBy(record => record.Id, StringComparer.Ordinal)
                .ToList();

            if (own.Count == 0)
            {
                continue;
            }

            lines.Add($"### `{module.Id}`");
            lines.Add(string.Empty);
            lines.Add("| Aggregate | Use cases |");
            lines.Add("|:---|:---|");

            foreach (var record in own)
            {
                var uses = model.Records
                    .Where(candidate => candidate.Type == "use-case"
                        && ModelBuilder.AggregateOf(model, candidate)?.Id == record.Id)
                    .OrderBy(candidate => candidate.Id, StringComparer.Ordinal)
                    .Select(candidate => $"`{candidate.Id}`");

                lines.Add($"| `{record.Id}` | {string.Join(", ", uses)} |");
            }

            lines.Add(string.Empty);
        }

        return string.Join('\n', lines).TrimEnd();
    }

    private static string AuditRegister(ProjectModel model)
    {
        var lines = new List<string>
        {
            "| Use case | Title | Needs |",
            "|:---|:---|:---|",
        };
        var resultsByHome = model.Records
            .Where(record => record.Type == "result")
            .Select(record => (Record: record, Home: Identifiers.TrySplit(record.Id, out _, out var home, out _) ? home : null))
            .Where(entry => entry.Home is not null)
            .GroupBy(entry => entry.Home!, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.Select(entry => entry.Record).ToList(), StringComparer.Ordinal);

        foreach (var useCase in model.Records
                     .Where(record => record.Type == "use-case")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var name = Identifiers.TrySplit(useCase.Id, out _, out _, out var useCaseName) ? useCaseName : null;
            var authorization = name is not null
                && resultsByHome.TryGetValue(name, out var results)
                && results.Any(result => result.Field("code")?.StartsWith("authorization.", StringComparison.Ordinal) == true);

            if (useCase.Ids("needs").Count == 0 && !authorization)
            {
                continue;
            }

            lines.Add($"| `{useCase.Id}` | {Cell(useCase.Title)} | {Cell(string.Join(", ", useCase.Ids("needs")))} |");
        }

        return string.Join('\n', lines);
    }

    private static string AlertInventory(ProjectModel model, string file)
    {
        var lines = new List<string>
        {
            "| Limit | Bound | Value | Runbook |",
            "|:---|:---|:---|:---|",
        };

        foreach (var limit in model.Records
                     .Where(record => record.Type == "limit")
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            var runbook = limit.Ids("runbook")
                .Select(id => model.ById.TryGetValue(id, out var record) && record.Type == "runbook"
                    ? $"[{Path.GetFileNameWithoutExtension(record.File)}]({RelativeLink(file, record.File)})"
                    : $"`{id}`")
                .ToList();

            lines.Add($"| `{limit.Id}` | {Cell(limit.Field("bound") ?? "")} | {Cell(limit.Field("value") ?? "")} | {string.Join(", ", runbook)} |");
        }

        return string.Join('\n', lines);
    }

    private static System.Text.Json.JsonElement Holds(Record actor) =>
        actor.Raw.ValueKind == System.Text.Json.JsonValueKind.Object
        && actor.Raw.TryGetProperty("holds", out var holds)
            ? holds
            : default;

    private static string RelativeLink(string from, string to) =>
        Path.GetRelativePath(Path.GetDirectoryName(from)!, to).Replace(Path.DirectorySeparatorChar, '/');

    private static string Counts(ProjectModel model)
    {
        var lines = new List<string>();

        foreach (var group in model.Records
                     .GroupBy(record => record.Type, StringComparer.Ordinal)
                     .OrderBy(group => group.Key, StringComparer.Ordinal))
        {
            lines.Add($"- {group.Key}: {group.Count()}");
        }

        var implemented = model.Status.Count(entry => entry.Value.Implemented);
        var verified = model.Status.Count(entry => entry.Value.Verified);

        lines.Add($"- use cases implemented: {implemented} of {model.Status.Count}");
        lines.Add($"- use cases verified: {verified} of {model.Status.Count}");

        return string.Join('\n', lines);
    }

    private static string History(ProjectModel model, string file)
    {
        var carried = model.Records
            .Where(record => record.IsEntry && record.File == file)
            .Select(record => record.Id)
            .ToHashSet(StringComparer.Ordinal);

        var lines = new List<string>
        {
            "| Decision | Status | Decided |",
            "|:---|:---|:---|",
        };

        foreach (var decision in model.Records
                     .Where(record => record.Type == "decision"
                         && record.Ids("decides").Any(carried.Contains))
                     .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            lines.Add($"| `{decision.Id}` | {decision.Status ?? ""} | {decision.Field("decided") ?? ""} |");
        }

        return string.Join('\n', lines);
    }

    private static string Cell(string text) => text.Replace("|", "\\|", StringComparison.Ordinal).Replace("\n", " ", StringComparison.Ordinal).Replace("\r", "", StringComparison.Ordinal);

    [GeneratedRegex(@"<!-- generated:(?<name>[A-Za-z0-9-]+) -->(?<body>.*?)<!-- /generated:\k<name> -->", RegexOptions.Singleline)]
    private static partial Regex Region();
}

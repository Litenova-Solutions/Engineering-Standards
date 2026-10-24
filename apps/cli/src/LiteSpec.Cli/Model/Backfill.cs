using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace LiteSpec.Model;

/// <summary>
///     Backfills Behavior drafts from code during adoption: for each use case, reaction and
///     job a handler folder or an anchor tag places, it reads the repositories, dispatches
///     and refusal codes the code model already holds and drafts the missing frontmatter.
///     A use case gains changes or reads, effects entries and refusal results; a reaction
///     gains reads and its one issues or sends edge; a job gains reads and issues. Every
///     touched record is marked transcribed. Existing entries are never removed or
///     rewritten; only missing entries are appended.
/// </summary>
static class Backfill
{
    static readonly JsonSerializerOptions Write = new()
    {
        WriteIndented = true,
        IndentSize = 2,
        NewLine = "\n",
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    /// <summary>One record's planned writes.</summary>
    sealed record RecordPlan(
        Record Record,
        IReadOnlyList<string> Changes,
        IReadOnlyList<string> Reads,
        IReadOnlyList<(string Verb, string Target)> Effects,
        string? Issues,
        string? Sends,
        IReadOnlyList<string> JobIssues,
        IReadOnlyList<(string Code, string Id, string Title)> Results,
        bool MarkTranscribed)
    {
        /// <summary>Whether the plan writes anything at all.</summary>
        public bool HasWrites =>
            Changes.Count + Reads.Count + Effects.Count + JobIssues.Count + Results.Count > 0
            || Issues is not null
            || Sends is not null;
    }

    /// <summary>The code facts and record indexes one backfill run resolves against.</summary>
    sealed class Facts
    {
        public Dictionary<string, List<HandlerInfo>> HandlersByUseCase { get; } = new(StringComparer.Ordinal);
        public Dictionary<string, List<ReactionInfo>> ReactionsByRecord { get; } = new(StringComparer.Ordinal);
        public Dictionary<string, HashSet<string>> Declaring { get; } = new(StringComparer.Ordinal);
        public List<Record> Aggregates { get; } = [];
        public List<Record> UseCases { get; } = [];
        public List<Record> Notifications { get; } = [];
        public List<Record> IntegrationEvents { get; } = [];
        public List<Record> ExternalSystems { get; } = [];
    }

    /// <summary>
    ///     Runs backfill over the module, or every module when none is named. Prints a
    ///     per-module completeness table, then each planned write. Writes nothing on a
    ///     dry run. Returns the lines and whether the named module holds no records.
    /// </summary>
    public static (IReadOnlyList<string> Lines, bool UnknownModule) Run(
        ProjectModel model, string? module, bool dryRun)
    {
        var targets = model.Records
            .Where(record => record.Type is "use-case" or "reaction" or "job"
                && !record.Derived
                && record.Status != "retired"
                && (module is null || HomeOf(record.Id) == module))
            .OrderBy(record => record.File, StringComparer.Ordinal)
            .ThenBy(record => record.Id, StringComparer.Ordinal)
            .ToList();

        if (module is not null && targets.Count == 0)
        {
            return ([], true);
        }

        var facts = BuildFacts(model);
        var plans = new List<RecordPlan>();

        foreach (var record in targets)
        {
            if (PlanFor(model, facts, record) is { HasWrites: true } plan)
            {
                plans.Add(plan);
            }
        }

        var lines = new List<string>();

        lines.AddRange(TableLines(model, targets));

        foreach (var plan in plans)
        {
            lines.Add(Describe(model, plan, dryRun));
        }

        var files = plans.Select(plan => plan.Record.File).Distinct(StringComparer.OrdinalIgnoreCase).Count();

        lines.Add(dryRun
            ? $"(dry run) {Files(files)} would be updated, {Records(plans.Count)} backfilled."
            : $"{Files(files)} updated, {Records(plans.Count)} backfilled.");

        if (!dryRun)
        {
            Apply(plans);
        }

        return (lines, false);
    }

    static string Files(int count) => count == 1 ? "1 file" : $"{count} files";
    static string Records(int count) => count == 1 ? "1 record" : $"{count} records";

    /// <summary>The module home of an identifier, or the empty string when it carries none.</summary>
    static string HomeOf(string id) =>
        Identifiers.TrySplit(id, out _, out var home, out _) && home is not null ? home : "";

    /// <summary>Collects the handler, reaction and record indexes one run resolves against.</summary>
    static Facts BuildFacts(ProjectModel model)
    {
        var facts = new Facts();

        foreach (var handler in model.Code.Handlers)
        {
            if (!facts.HandlersByUseCase.TryGetValue(handler.UseCaseId, out var placed))
            {
                placed = [];
                facts.HandlersByUseCase[handler.UseCaseId] = placed;
            }

            placed.Add(handler);
        }

        foreach (var reaction in model.Code.Reactions)
        {
            if (reaction.RecordId is null)
            {
                continue;
            }

            if (!facts.ReactionsByRecord.TryGetValue(reaction.RecordId, out var placed))
            {
                placed = [];
                facts.ReactionsByRecord[reaction.RecordId] = placed;
            }

            placed.Add(reaction);
        }

        foreach (var literal in model.Code.Literals)
        {
            if (!literal.Declares || literal.Class is null)
            {
                continue;
            }

            if (!facts.Declaring.TryGetValue(literal.Class, out var codes))
            {
                codes = new HashSet<string>(StringComparer.Ordinal);
                facts.Declaring[literal.Class] = codes;
            }

            codes.Add(literal.Value);
        }

        foreach (var record in model.Records)
        {
            switch (record.Type)
            {
                case "aggregate": facts.Aggregates.Add(record); break;
                case "use-case": facts.UseCases.Add(record); break;
                case "notification": facts.Notifications.Add(record); break;
                case "integration-event": facts.IntegrationEvents.Add(record); break;
                case "external-system": facts.ExternalSystems.Add(record); break;
            }
        }

        return facts;
    }

    /// <summary>Plans the missing entries for one record, or an empty plan when code places none there.</summary>
    static RecordPlan PlanFor(ProjectModel model, Facts facts, Record record)
    {
        if (record.Type == "use-case")
        {
            return PlanUseCase(model, facts, record);
        }

        if (!facts.ReactionsByRecord.TryGetValue(record.Id, out var placed))
        {
            return Empty(record);
        }

        return record.Type == "reaction"
            ? PlanReaction(facts, record, placed)
            : PlanJob(facts, record, placed);
    }

    static RecordPlan Empty(Record record) =>
        new(record, [], [], [], null, null, [], [], false);

    static RecordPlan PlanUseCase(ProjectModel model, Facts facts, Record record)
    {
        if (!facts.HandlersByUseCase.TryGetValue(record.Id, out var handlers))
        {
            return Empty(record);
        }

        var module = HomeOf(record.Id);
        var declared = new HashSet<string>(record.Ids("changes"), StringComparer.Ordinal);

        declared.UnionWith(record.Ids("reads"));

        var missing = handlers
            .SelectMany(handler => handler.Repositories ?? [])
            .Select(repository => ResolveAggregate(facts, module, repository.Interface))
            .Where(id => id is not null && !declared.Contains(id))
            .Select(id => id!)
            .Distinct(StringComparer.Ordinal)
            .Order(StringComparer.Ordinal)
            .ToList();

        // A query reads without changing, so its repositories are reads; a command's are changes.
        List<string> changes = record.Field("kind") == "query" ? [] : missing;
        List<string> reads = record.Field("kind") == "query" ? missing : [];

        var edges = DeclaredEffects(record);
        var planned = new HashSet<(string Verb, string Target)>();
        var effects = new List<(string Verb, string Target)>();

        foreach (var dispatch in OrderedDispatches(handlers.SelectMany(handler => handler.Dispatches ?? [])))
        {
            var target = ResolveEffect(facts, module, dispatch);

            if (target is null
                || edges.Contains((dispatch.Verb, target))
                || !planned.Add((dispatch.Verb, target)))
            {
                continue;
            }

            effects.Add((dispatch.Verb, target));
        }

        var produced = new HashSet<string>(StringComparer.Ordinal);

        foreach (var handler in handlers)
        {
            produced.UnionWith(ProducedCodes(handler.Refusals, handler.Thrown, facts.Declaring));
        }

        var known = DeclaredCodes(model, record);
        var taken = new HashSet<string>(model.Records.Select(entry => entry.Id), StringComparer.Ordinal);
        var results = new List<(string Code, string Id, string Title)>();

        if (Identifiers.TrySplit(record.Id, out _, out _, out var operation) && operation.Length > 0)
        {
            foreach (var code in produced.Where(code => !known.Contains(code)).Order(StringComparer.Ordinal))
            {
                var slug = code.Contains('.') ? code[(code.LastIndexOf('.') + 1)..] : code;
                var id = $"result/{operation}.{slug}";
                var attempt = 2;

                while (!taken.Add(id))
                {
                    id = $"result/{operation}.{slug}-{attempt++}";
                }

                results.Add((code, id, TitleOf(slug)));
            }
        }

        return Finish(record, changes, reads, effects, null, null, [], results);
    }

    static RecordPlan PlanReaction(Facts facts, Record record, List<ReactionInfo> placed)
    {
        var reads = MissingReads(facts, record, placed);
        string? issues = null;
        string? sends = null;

        // A reaction holds exactly one of issues and sends, so an edge is drafted only
        // when neither is declared, from the first dispatch in code order that resolves.
        if (record.Ids("issues").Count == 0 && record.Ids("sends").Count == 0)
        {
            var module = HomeOf(record.Id);

            foreach (var dispatch in OrderedDispatches(placed.SelectMany(info => info.Dispatches ?? [])))
            {
                if (dispatch.Verb == "issues" && issues is null)
                {
                    issues = ResolveUseCase(facts, module, dispatch.Target);

                    if (issues is not null)
                    {
                        break;
                    }
                }
                else if (dispatch.Verb == "sends" && sends is null)
                {
                    sends = ResolveNotification(facts, dispatch);

                    if (sends is not null)
                    {
                        break;
                    }
                }
            }
        }

        return Finish(record, [], reads, [], issues, sends, [], []);
    }

    static RecordPlan PlanJob(Facts facts, Record record, List<ReactionInfo> placed)
    {
        var reads = MissingReads(facts, record, placed);
        var module = HomeOf(record.Id);
        var declared = new HashSet<string>(record.Ids("issues"), StringComparer.Ordinal);
        var issues = new List<string>();

        // A job declares issues only; any other dispatch shape stays for a person to place.
        foreach (var dispatch in OrderedDispatches(placed.SelectMany(info => info.Dispatches ?? [])))
        {
            if (dispatch.Verb != "issues")
            {
                continue;
            }

            var target = ResolveUseCase(facts, module, dispatch.Target);

            if (target is not null && declared.Add(target))
            {
                issues.Add(target);
            }
        }

        return Finish(record, [], reads, [], null, null, issues, []);
    }

    /// <summary>Aggregate ids the code takes that the reaction or job declares in neither changes nor reads.</summary>
    static List<string> MissingReads(Facts facts, Record record, List<ReactionInfo> placed)
    {
        // A reaction never writes an aggregate directly, and a job writes through the
        // use cases it issues, so every repository either takes is a read.
        var module = HomeOf(record.Id);
        var declared = new HashSet<string>(record.Ids("reads"), StringComparer.Ordinal);

        return placed
            .SelectMany(info => info.Repositories ?? [])
            .Select(repository => ResolveAggregate(facts, module, repository.Interface))
            .Where(id => id is not null && !declared.Contains(id))
            .Select(id => id!)
            .Distinct(StringComparer.Ordinal)
            .Order(StringComparer.Ordinal)
            .ToList();
    }

    static RecordPlan Finish(
        Record record,
        List<string> changes,
        List<string> reads,
        List<(string Verb, string Target)> effects,
        string? issues,
        string? sends,
        List<string> jobIssues,
        List<(string Code, string Id, string Title)> results)
    {
        var plan = new RecordPlan(record, changes, reads, effects, issues, sends, jobIssues, results, false);

        return !plan.HasWrites || record.Field("source") == "transcribed"
            ? plan
            : plan with { MarkTranscribed = true };
    }

    /// <summary>One line per planned record: its relative path, id and added entries.</summary>
    static string Describe(ProjectModel model, RecordPlan plan, bool dryRun)
    {
        var parts = new List<string>();

        if (plan.Changes.Count > 0)
        {
            parts.Add($"+changes {string.Join(",", plan.Changes)}");
        }

        if (plan.Reads.Count > 0)
        {
            parts.Add($"+reads {string.Join(",", plan.Reads)}");
        }

        if (plan.Effects.Count > 0)
        {
            parts.Add($"+effects {string.Join(",", plan.Effects.Select(edge => $"{edge.Verb}:{edge.Target}"))}");
        }

        if (plan.Issues is not null)
        {
            parts.Add($"+issues {plan.Issues}");
        }

        if (plan.Sends is not null)
        {
            parts.Add($"+sends {plan.Sends}");
        }

        if (plan.JobIssues.Count > 0)
        {
            parts.Add($"+issues {string.Join(",", plan.JobIssues)}");
        }

        if (plan.Results.Count > 0)
        {
            parts.Add($"+results {string.Join(",", plan.Results.Select(result => result.Code))}");
        }

        var source = plan.MarkTranscribed ? " (source transcribed)" : "";
        var prefix = dryRun ? "(dry run) " : "";

        return $"{prefix}{model.Config.Relative(plan.Record.File)}: {plan.Record.Id} {string.Join(" ", parts)}{source}";
    }

    /// <summary>The per-module completeness table: live records with each field's declared share.</summary>
    static List<string> TableLines(ProjectModel model, List<Record> targets)
    {
        var lines = new List<string> { "Module Records Changes Reads Effects Results" };
        var width = 6;

        var rows = targets
            .GroupBy(record => HomeOf(record.Id), StringComparer.Ordinal)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => RowFor(model, group.Key, group.ToList()))
            .ToList();

        foreach (var row in rows)
        {
            width = Math.Max(width, row.Module.Length);
        }

        foreach (var row in rows)
        {
            lines.Add($"{row.Module.PadRight(width)} {row.Records,-7} {row.Changes,-7} {row.Reads,-5} {row.Effects,-7} {row.Results}");
        }

        return lines;
    }

    sealed record ModuleRow(string Module, int Records, string Changes, string Reads, string Effects, string Results);

    static ModuleRow RowFor(ProjectModel model, string module, List<Record> records)
    {
        var useCases = records.Where(record => record.Type == "use-case").ToList();
        var changes = useCases.Count(record => record.Ids("changes").Count > 0);
        var reads = records.Count(record => record.Ids("reads").Count > 0);
        var effects = records.Count(HasEdges);
        var results = useCases.Count(record => HasResults(model, record));

        return new ModuleRow(
            module,
            records.Count,
            useCases.Count == 0 ? "n/a" : $"{changes}/{useCases.Count}",
            $"{reads}/{records.Count}",
            $"{effects}/{records.Count}",
            useCases.Count == 0 ? "n/a" : $"{results}/{useCases.Count}");
    }

    /// <summary>Whether the record declares its edges: effects, or issues and sends.</summary>
    static bool HasEdges(Record record) =>
        record.Type switch
        {
            "use-case" => DeclaredEffects(record).Count > 0,
            "reaction" => record.Ids("issues").Count + record.Ids("sends").Count > 0,
            "job" => record.Ids("issues").Count > 0,
            _ => false,
        };

    /// <summary>Whether the use case carries a written result for its own operation.</summary>
    static bool HasResults(ProjectModel model, Record useCase)
    {
        if (!Identifiers.TrySplit(useCase.Id, out _, out _, out var operation))
        {
            return false;
        }

        return model.Records.Any(record =>
            record.Type == "result"
            && !record.Derived
            && Identifiers.TrySplit(record.Id, out _, out var home, out _)
            && home == operation);
    }

    /// <summary>Dispatches in a stable order: file, line, verb, then target.</summary>
    static List<CodeDispatch> OrderedDispatches(IEnumerable<CodeDispatch> dispatches) =>
        dispatches
            .OrderBy(dispatch => dispatch.File, StringComparer.Ordinal)
            .ThenBy(dispatch => dispatch.Line)
            .ThenBy(dispatch => dispatch.Verb, StringComparer.Ordinal)
            .ThenBy(dispatch => dispatch.Target, StringComparer.Ordinal)
            .ToList();

    /// <summary>Every edge a use case declares in its effects entries, as verb and target pairs.</summary>
    static HashSet<(string Verb, string Target)> DeclaredEffects(Record useCase)
    {
        var edges = new HashSet<(string Verb, string Target)>();

        if (useCase.Raw.ValueKind != JsonValueKind.Object
            || !useCase.Raw.TryGetProperty("effects", out var effects)
            || effects.ValueKind != JsonValueKind.Array)
        {
            return edges;
        }

        foreach (var entry in effects.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            foreach (var verb in new[] { "issues", "sends", "publishes", "calls" })
            {
                if (entry.TryGetProperty(verb, out var target)
                    && target.ValueKind == JsonValueKind.String
                    && target.GetString() is { Length: > 0 } id)
                {
                    edges.Add((verb, id));
                }
            }
        }

        return edges;
    }

    /// <summary>Resolves one dispatch to the record id its edge declares, or null when none fits.</summary>
    static string? ResolveEffect(Facts facts, string module, CodeDispatch dispatch) =>
        dispatch.Verb switch
        {
            "issues" => ResolveUseCase(facts, module, dispatch.Target),
            "publishes" => ResolveIntegrationEvent(facts, dispatch.Target),
            "sends" => ResolveNotification(facts, dispatch),
            "calls" => ResolveCall(facts, dispatch),
            _ => null,
        };

    /// <summary>The aggregate a repository interface serves, preferring the record's own module.</summary>
    static string? ResolveAggregate(Facts facts, string module, string face)
    {
        if (RepositoryStem(face) is not { } stem)
        {
            return null;
        }

        var candidates = facts.Aggregates
            .Where(record => Identifiers.TrySplit(record.Id, out _, out _, out var name) && name == stem)
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .ToList();

        var home = candidates.Where(record => HomeOf(record.Id) == module).ToList();

        return home.Count > 0 ? home[0].Id : candidates.Count == 1 ? candidates[0].Id : null;
    }

    /// <summary>The aggregate name a repository interface serves, in kebab-case, or null when it names none.</summary>
    static string? RepositoryStem(string face)
    {
        var type = face;
        var generic = type.IndexOf('<');

        // A generic repository serves its first type argument.
        if (generic >= 0)
        {
            var args = type[(generic + 1)..].TrimEnd('>');
            type = args.Split(',')[0].Trim();

            var dot = type.LastIndexOf('.');

            if (dot >= 0)
            {
                type = type[(dot + 1)..];
            }

            return type.Length > 0 ? Naming.Kebab(type) : null;
        }

        if (type.StartsWith("I", StringComparison.Ordinal) && type.Length > 1 && char.IsUpper(type[1]))
        {
            type = type[1..];
        }

        if (!type.EndsWith("Repository", StringComparison.Ordinal) || type.Length <= "Repository".Length)
        {
            return null;
        }

        return Naming.Kebab(type[..^"Repository".Length]);
    }

    /// <summary>The use case a dispatched message names, preferring the record's own module.</summary>
    static string? ResolveUseCase(Facts facts, string module, string message)
    {
        var stems = new HashSet<string>(StringComparer.Ordinal) { Naming.Kebab(message) };

        foreach (var suffix in new[] { "Command", "Query" })
        {
            if (message.EndsWith(suffix, StringComparison.Ordinal) && message.Length > suffix.Length)
            {
                stems.Add(Naming.Kebab(message[..^suffix.Length]));
            }
        }

        var candidates = facts.UseCases
            .Where(record => Identifiers.TrySplit(record.Id, out _, out _, out var operation) && stems.Contains(operation))
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .ToList();

        var home = candidates.Where(record => HomeOf(record.Id) == module).ToList();

        return home.Count > 0 ? home[0].Id : candidates.Count == 1 ? candidates[0].Id : null;
    }

    /// <summary>The integration event a published message names, or null when none fits alone.</summary>
    static string? ResolveIntegrationEvent(Facts facts, string message)
    {
        var candidates = facts.IntegrationEvents
            .Where(record => MessageMatches(message, record.Id))
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .ToList();

        return candidates.Count == 1 ? candidates[0].Id : null;
    }

    /// <summary>The notification a send names: by template key, else by message type.</summary>
    static string? ResolveNotification(Facts facts, CodeDispatch dispatch)
    {
        if (dispatch.Detail == "template")
        {
            return facts.Notifications
                .Where(record => record.Field("template") == dispatch.Target)
                .OrderBy(record => record.Id, StringComparer.Ordinal)
                .Select(record => record.Id)
                .FirstOrDefault();
        }

        var candidates = facts.Notifications
            .Where(record => MessageMatches(dispatch.Target, record.Id))
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .ToList();

        return candidates.Count == 1 ? candidates[0].Id : null;
    }

    /// <summary>The external-system operation a port call names, or null when none fits alone.</summary>
    static string? ResolveCall(Facts facts, CodeDispatch dispatch)
    {
        var name = dispatch.Target;

        if (name.EndsWith("Async", StringComparison.Ordinal) && name.Length > "Async".Length)
        {
            name = name[..^"Async".Length];
        }

        var operation = Naming.Kebab(name);

        var candidates = facts.ExternalSystems
            .Where(record => OperationNames(record).Contains(operation))
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .ToList();

        return candidates.Count == 1 ? $"{candidates[0].Id}#{operation}" : null;
    }

    /// <summary>The operation names an external-system record declares.</summary>
    static HashSet<string> OperationNames(Record system)
    {
        var names = new HashSet<string>(StringComparer.Ordinal);

        if (system.Raw.ValueKind == JsonValueKind.Object
            && system.Raw.TryGetProperty("operations", out var operations)
            && operations.ValueKind == JsonValueKind.Array)
        {
            foreach (var entry in operations.EnumerateArray())
            {
                if (entry.ValueKind == JsonValueKind.Object
                    && entry.TryGetProperty("name", out var name)
                    && name.ValueKind == JsonValueKind.String
                    && name.GetString() is { Length: > 0 } operation)
                {
                    names.Add(operation);
                }
            }
        }

        return names;
    }

    /// <summary>
    ///     Whether a dispatched message names a declared edge: the message stem meets the
    ///     identifier after its slash, or its last segment, with dots reading as dashes.
    /// </summary>
    static bool MessageMatches(string message, string id)
    {
        var stem = message;

        foreach (var suffix in new[] { "IntegrationEvent", "Notification", "Event", "Message" })
        {
            if (stem.EndsWith(suffix, StringComparison.Ordinal) && stem.Length > suffix.Length)
            {
                stem = stem[..^suffix.Length];
                break;
            }
        }

        var kebab = Naming.Kebab(stem);
        var rest = id.Contains('/') ? id[(id.IndexOf('/') + 1)..] : id;
        var normalized = rest.Replace('.', '-');
        var last = rest.Contains('.') ? rest[(rest.LastIndexOf('.') + 1)..] : rest;

        return kebab == normalized || kebab == last;
    }

    /// <summary>
    ///     Every refusal code a class produces: its declaring literals plus the codes of the
    ///     exception and failure types it constructs.
    /// </summary>
    static HashSet<string> ProducedCodes(
        IReadOnlyList<CodeRefusal>? refusals,
        IReadOnlyList<CodeThrown>? thrown,
        Dictionary<string, HashSet<string>> declaring)
    {
        var produced = new HashSet<string>(StringComparer.Ordinal);

        if (refusals is not null)
        {
            foreach (var refusal in refusals)
            {
                produced.Add(refusal.Code);
            }
        }

        if (thrown is not null)
        {
            foreach (var construction in thrown)
            {
                if (!declaring.TryGetValue(construction.Type, out var codes))
                {
                    continue;
                }

                foreach (var code in codes)
                {
                    produced.Add(code);
                }
            }
        }

        return produced;
    }

    /// <summary>
    ///     Every refusal code a use case declares: its written refusal results plus the derived
    ///     generic codes, which a permission grant and a validated input each derive.
    /// </summary>
    static HashSet<string> DeclaredCodes(ProjectModel model, Record useCase)
    {
        var declared = new HashSet<string>(StringComparer.Ordinal);

        if (Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
        {
            foreach (var result in model.Records)
            {
                if (result.Type != "result" || result.Derived || result.Field("outcome") != "refusal")
                {
                    continue;
                }

                if (result.Field("code") is { } code
                    && Identifiers.TrySplit(result.Id, out _, out var home, out _)
                    && home == name)
                {
                    declared.Add(code);
                }
            }
        }

        if (ModelBuilder.GrantedPermission(useCase) is not null)
        {
            declared.Add(model.Config.ForbiddenCode);
        }

        if (ModelBuilder.HasValidatedInput(useCase))
        {
            declared.Add(model.Config.InvalidInputCode);
        }

        return declared;
    }

    /// <summary>A refusal-code slug in title words: ghost-refusal reads Ghost Refusal.</summary>
    static string TitleOf(string slug) =>
        string.Join(' ', slug.Split('-', StringSplitOptions.RemoveEmptyEntries).Select(part =>
            part.Length == 0 ? part : char.ToUpperInvariant(part[0]) + part[1..]));

    /// <summary>Writes every plan into its page's frontmatter, one write per file.</summary>
    static void Apply(List<RecordPlan> plans)
    {
        foreach (var group in plans.GroupBy(plan => plan.Record.File, StringComparer.OrdinalIgnoreCase))
        {
            var text = File.ReadAllText(group.Key);
            var json = group.Key.EndsWith(".json", StringComparison.OrdinalIgnoreCase);
            var (head, node, tail) = json ? ("", JsonNode.Parse(text), "") : SplitFrontmatter(text);

            if (node is null)
            {
                continue;
            }

            foreach (var plan in group)
            {
                if (Find(node, plan.Record.Id) is not JsonObject target)
                {
                    continue;
                }

                AppendStrings(target, "changes", plan.Changes);
                AppendStrings(target, "reads", plan.Reads);
                AppendEffects(target, plan.Effects);

                if (plan.Issues is not null)
                {
                    target["issues"] = plan.Issues;
                }

                if (plan.Sends is not null)
                {
                    target["sends"] = plan.Sends;
                }

                AppendStrings(target, "issues", plan.JobIssues);
                AppendResults(target, plan);

                if (plan.MarkTranscribed)
                {
                    target["source"] = "transcribed";
                }
            }

            var serialized = node.ToJsonString(Write);

            File.WriteAllText(group.Key, json ? serialized + "\n" : head + serialized + tail);
        }
    }

    /// <summary>Appends the missing ids to a string array field, creating it when absent.</summary>
    static void AppendStrings(JsonObject target, string field, IReadOnlyList<string> ids)
    {
        if (ids.Count == 0)
        {
            return;
        }

        // A lone string keeps its value first when the field grows into an array.
        if (target[field] is JsonValue single && single.TryGetValue<string>(out var held))
        {
            var grown = new JsonArray { held };

            foreach (var id in ids)
            {
                if (!string.Equals(id, held, StringComparison.Ordinal))
                {
                    grown.Add(id);
                }
            }

            target[field] = grown;

            return;
        }

        if (target[field] is not JsonArray array)
        {
            target[field] = new JsonArray(ids.Select(id => JsonValue.Create(id)).ToArray());
            return;
        }

        var present = new HashSet<string>(
            array.OfType<JsonValue>()
                .Select(value => value.TryGetValue<string>(out var text) ? text : null)
                .OfType<string>(),
            StringComparer.Ordinal);

        foreach (var id in ids)
        {
            if (present.Add(id))
            {
                array.Add(id);
            }
        }
    }

    /// <summary>Appends the missing effect entries, each with its transcribed timing.</summary>
    static void AppendEffects(JsonObject target, IReadOnlyList<(string Verb, string Target)> effects)
    {
        if (effects.Count == 0)
        {
            return;
        }

        if (target["effects"] is not JsonArray array)
        {
            array = [];
            target["effects"] = array;
        }

        foreach (var (verb, id) in effects)
        {
            // A call runs in its handler's call; any other edge is drafted after commit
            // because code cannot show its timing, for a person to tighten on review.
            var entry = new JsonObject
            {
                [verb] = id,
                ["timing"] = verb == "calls" ? "inline" : "after-commit",
            };

            array.Add(entry);
        }
    }

    /// <summary>Appends the missing refusal results to the page's records array.</summary>
    static void AppendResults(JsonObject target, RecordPlan plan)
    {
        if (plan.Results.Count == 0)
        {
            return;
        }

        if (target["records"] is not JsonArray array)
        {
            array = [];
            target["records"] = array;
        }

        foreach (var (code, id, title) in plan.Results)
        {
            var entry = new JsonObject
            {
                ["type"] = "result",
                ["id"] = id,
                ["title"] = title,
            };

            if (plan.Record.Owner is { } owner)
            {
                entry["owner"] = owner;
            }

            entry["outcome"] = "refusal";
            entry["code"] = code;
            entry["meaning"] = $"Transcribed from code ({code}).";
            entry["source"] = "transcribed";

            array.Add(entry);
        }
    }

    /// <summary>The object carrying the id: the page itself, an entry, or a nested entry.</summary>
    static JsonNode? Find(JsonNode node, string id)
    {
        switch (node)
        {
            case JsonObject obj:
                if (obj["id"] is JsonValue value && value.TryGetValue<string>(out var own) && own == id)
                {
                    return obj;
                }

                foreach (var (_, child) in obj)
                {
                    if (child is not null && Find(child, id) is { } found)
                    {
                        return found;
                    }
                }

                return null;

            case JsonArray array:
                foreach (var child in array)
                {
                    if (child is not null && Find(child, id) is { } found)
                    {
                        return found;
                    }
                }

                return null;

            default:
                return null;
        }
    }

    /// <summary>Splits a page into the opening fence, its frontmatter and the rest.</summary>
    static (string Head, JsonNode? Node, string Tail) SplitFrontmatter(string text)
    {
        const string fence = "---\n";
        var normalized = text.Replace("\r\n", "\n", StringComparison.Ordinal);

        if (!normalized.StartsWith(fence, StringComparison.Ordinal))
        {
            return ("", null, "");
        }

        var end = normalized.IndexOf("\n---", fence.Length, StringComparison.Ordinal);

        if (end < 0)
        {
            return ("", null, "");
        }

        var body = normalized[fence.Length..end];

        return (fence, JsonNode.Parse(body), normalized[end..]);
    }
}

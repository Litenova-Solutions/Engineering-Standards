using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace LiteSpec.Model;

/// <summary>
///     The record-graph and advisory checks: orphans, steps, loops, queries,
///     erasure, approval, transcription, jobs, prose and aged questions.
/// </summary>
static partial class Checker
{
    /// <summary>Fields the semantic hash skips: identity, workflow and approval data.</summary>
    private static readonly HashSet<string> ApprovalExcluded = new(StringComparer.Ordinal)
    {
        "type", "id", "title", "owner", "status", "decider", "decideBy",
        "approvedBy", "approvedOn", "approvedHash", "source",
    };

    /// <summary>
    ///     The semantic hash over the record fields: every written field except identity,
    ///     workflow and approval data, canonicalized and hashed to eight hex characters.
    ///     Prose bodies sit outside the hash, so rewording prose reopens no approval.
    /// </summary>
    public static string SemanticHash(Record record)
    {
        var built = new StringBuilder();

        CanonicalInto(record.Raw, built, true);

        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(built.ToString()));

        return Convert.ToHexString(bytes)[..8].ToLowerInvariant();
    }

    private static void CanonicalInto(JsonElement value, StringBuilder built, bool top)
    {
        switch (value.ValueKind)
        {
            case JsonValueKind.Object:
                built.Append('{');

                var first = true;

                foreach (var property in value.EnumerateObject().OrderBy(entry => entry.Name, StringComparer.Ordinal))
                {
                    if (top && ApprovalExcluded.Contains(property.Name))
                    {
                        continue;
                    }

                    if (!first)
                    {
                        built.Append(',');
                    }

                    first = false;
                    built.Append(JsonSerializer.Serialize(property.Name));
                    built.Append(':');
                    CanonicalInto(property.Value, built, false);
                }

                built.Append('}');
                break;

            case JsonValueKind.Array:
                built.Append('[');

                var head = true;

                foreach (var entry in value.EnumerateArray())
                {
                    if (!head)
                    {
                        built.Append(',');
                    }

                    head = false;
                    CanonicalInto(entry, built, false);
                }

                built.Append(']');
                break;

            case JsonValueKind.String:
                built.Append(JsonSerializer.Serialize(value.GetString()));
                break;

            default:
                built.Append(value.GetRawText());
                break;
        }
    }

    /// <summary>Whether the record carries any risk, which makes it tier 1.</summary>
    private static bool HasRisk(Record record) =>
        record.Raw.ValueKind == JsonValueKind.Object
        && record.Raw.TryGetProperty("risk", out var risk)
        && ((risk.ValueKind == JsonValueKind.Array && risk.GetArrayLength() > 0)
            || (risk.ValueKind == JsonValueKind.String && risk.GetString() is { Length: > 0 }));

    /// <summary>
    ///     The tier of a question entry or a draft: its own tier field, else tier 1
    ///     when the parent record carries risk, else tier 3.
    /// </summary>
    private static int TierOf(JsonElement element, Record? parent)
    {
        if (element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty("tier", out var tier))
        {
            if (tier.ValueKind == JsonValueKind.Number
                && tier.TryGetInt32(out var number)
                && number is 1 or 3)
            {
                return number;
            }

            if (tier.ValueKind == JsonValueKind.String
                && tier.GetString() is { } text)
            {
                var folded = text.Trim().ToLowerInvariant();

                if (folded is "1" or "tier-1" or "tier1")
                {
                    return 1;
                }

                if (folded is "3" or "tier-3" or "tier3")
                {
                    return 3;
                }
            }
        }

        return parent is not null && HasRisk(parent) ? 1 : 3;
    }

    /// <summary>Whether the question entry or draft carries a recommended answer.</summary>
    private static bool Recommended(JsonElement element) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty("recommended", out var value)
        && value.ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined)
        && (value.ValueKind != JsonValueKind.String || value.GetString() is { Length: > 0 })
        && (value.ValueKind != JsonValueKind.Array || value.GetArrayLength() > 0);

    /// <summary>The decide-by day of a question entry or a draft, when it parses.</summary>
    private static bool DecideDay(JsonElement element, out DateOnly day)
    {
        day = default;

        return element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty("decideBy", out var value)
            && value.ValueKind == JsonValueKind.String
            && value.GetString() is { } text
            && ParseDay(text, out day);
    }

    private static bool ParseDay(string text, out DateOnly day)
    {
        if (IsoDate(text, out day))
        {
            return true;
        }

        if (DateTimeOffset.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var moment))
        {
            day = DateOnly.FromDateTime(moment.UtcDateTime);
            return true;
        }

        return false;
    }

    /// <summary>
    ///     Whether the question entry or draft counts as auto-approved: tier 3 with a
    ///     recommended answer, past its decide-by date plus the veto window.
    /// </summary>
    private static bool AutoApproved(JsonElement element, Record? parent, ConsumerConfig config, DateOnly today) =>
        TierOf(element, parent) == 3
        && Recommended(element)
        && DecideDay(element, out var decideBy)
        && today > decideBy.AddDays(config.VetoWindowDays);

    /// <summary>Whether the question entry or draft stands past its decide-by date.</summary>
    private static bool AgedPast(JsonElement element, DateOnly today) =>
        DecideDay(element, out var decideBy) && today > decideBy;

    private static void CheckOrphaned(ProjectModel model, List<Finding> findings)
    {
        foreach (var record in model.Records.Where(record =>
            record.Type is "use-case" or "reaction" or "job" or "notification" or "setting"))
        {
            if (record.Status == "retired")
            {
                continue;
            }

            if (record.Ids("serves").Count == 0 && record.Ids("fulfills").Count == 0)
            {
                findings.Add(new Finding("record-orphaned", $"{Label(record.Type)} '{record.Id}' names neither serves nor fulfills.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    private static string Label(string type) => type switch
    {
        "use-case" => "Use case",
        "reaction" => "Reaction",
        "job" => "Job",
        "notification" => "Notification",
        "setting" => "Setting",
        _ => "Record",
    };

    private static void CheckStepUnserved(ProjectModel model, List<Finding> findings)
    {
        var served = model.Records
            .Where(record => (record.Type == "use-case" || record.Type == "reaction") && record.Status != "retired")
            .SelectMany(record => record.Ids("serves"))
            .ToHashSet(StringComparer.Ordinal);

        foreach (var journey in model.Records.Where(record => record.Type == "journey" && record.Status != "retired"))
        {
            foreach (var step in journey.StepIds().Order(StringComparer.Ordinal))
            {
                if (!served.Contains(step))
                {
                    findings.Add(new Finding("step-unserved", $"Journey step '{step}' is served by no use case or reaction.", journey.File, journey.Line, step));
                }
            }
        }
    }

    private static void CheckEffectLoop(ProjectModel model, List<Finding> findings)
    {
        var graph = EffectGraph(model);
        var reported = new HashSet<string>(StringComparer.Ordinal);

        foreach (var start in graph.Keys.Order(StringComparer.Ordinal))
        {
            var path = new List<string> { start };
            var inPath = new HashSet<string>(StringComparer.Ordinal) { start };

            WalkLoop(model, graph, start, path, inPath, reported, findings);
        }
    }

    /// <summary>
    ///     The declared effect edges: use-case effects and raises, reaction triggers
    ///     reversed into event edges with the reaction effects, and job effects.
    /// </summary>
    private static Dictionary<string, List<string>> EffectGraph(ProjectModel model)
    {
        var graph = new Dictionary<string, List<string>>(StringComparer.Ordinal);

        void Edge(string from, string to)
        {
            var baseId = Identifiers.BaseId(to);

            if (!model.ById.ContainsKey(baseId))
            {
                return;
            }

            if (!graph.TryGetValue(from, out var targets))
            {
                targets = [];
                graph[from] = targets;
            }

            if (!targets.Contains(baseId, StringComparer.Ordinal))
            {
                targets.Add(baseId);
            }
        }

        foreach (var record in model.Records)
        {
            if (record.Type == "use-case")
            {
                foreach (var entry in EffectEntries(record))
                {
                    if (EffectTarget(entry) is { } target)
                    {
                        Edge(record.Id, target);
                    }
                }

                foreach (var raised in record.Ids("raises"))
                {
                    Edge(record.Id, raised);
                }
            }
            else if (record.Type == "reaction")
            {
                foreach (var trigger in record.Ids("on"))
                {
                    var baseId = Identifiers.BaseId(trigger);

                    if (model.ById.TryGetValue(baseId, out var resolved)
                        && resolved.Type is "event" or "integration-event")
                    {
                        Edge(baseId, record.Id);
                    }
                }

                foreach (var entry in EffectEntries(record))
                {
                    if (EffectTarget(entry) is { } target)
                    {
                        Edge(record.Id, target);
                    }
                }
            }
            else if (record.Type == "job")
            {
                foreach (var entry in EffectEntries(record))
                {
                    if (EffectTarget(entry) is { } target)
                    {
                        Edge(record.Id, target);
                    }
                }
            }
        }

        foreach (var targets in graph.Values)
        {
            targets.Sort(StringComparer.Ordinal);
        }

        return graph;
    }

    private static void WalkLoop(
        ProjectModel model,
        Dictionary<string, List<string>> graph,
        string current,
        List<string> path,
        HashSet<string> inPath,
        HashSet<string> reported,
        List<Finding> findings)
    {
        if (!graph.TryGetValue(current, out var targets))
        {
            return;
        }

        foreach (var next in targets)
        {
            if (next == path[0] && path.Count >= 1)
            {
                ReportLoop(model, path, reported, findings);
            }
            else if (!inPath.Contains(next))
            {
                inPath.Add(next);
                path.Add(next);
                WalkLoop(model, graph, next, path, inPath, reported, findings);
                path.RemoveAt(path.Count - 1);
                inPath.Remove(next);
            }
        }
    }

    private static void ReportLoop(
        ProjectModel model, List<string> path, HashSet<string> reported, List<Finding> findings)
    {
        var turn = path.IndexOf(path.Min(StringComparer.Ordinal)!);
        var rotated = path.Skip(turn).Concat(path.Take(turn)).ToList();
        var key = string.Join(" -> ", rotated);

        if (!reported.Add(key) || LoopExempt(model, rotated))
        {
            return;
        }

        var holder = rotated
            .Select(id => model.ById[id])
            .First(record => record.Type is "use-case" or "reaction" or "job");

        findings.Add(new Finding("effect-loop", $"Effect loop with no stated end: {key} -> {rotated[0]}.", holder.File, holder.Line, holder.Id));
    }

    /// <summary>
    ///     Whether the loop is allowed: it passes through a domain event, and a
    ///     reaction in the loop states its skip condition as the end condition.
    /// </summary>
    private static bool LoopExempt(ProjectModel model, IReadOnlyList<string> rotated) =>
        rotated.Any(id => model.ById.TryGetValue(id, out var record) && record.Type == "event")
        && rotated.Any(id => model.ById.TryGetValue(id, out var record)
            && record.Type == "reaction"
            && record.Field("if") is { Length: > 0 });

    private static void CheckConsistency(ProjectModel model, List<Finding> findings)
    {
        foreach (var useCase in model.Records.Where(record => record.Type == "use-case"))
        {
            if (ConsistencyMode(useCase) != "atomic")
            {
                continue;
            }

            var changes = useCase.Ids("changes");

            if (changes.Count > 1 && BecauseCount(useCase) == 0)
            {
                findings.Add(new Finding("consistency-unexplained", $"Use case '{useCase.Id}' changes {changes.Count} aggregates atomically with no because rule.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }
        }
    }

    private static string? ConsistencyMode(Record useCase)
    {
        if (useCase.Raw.ValueKind != JsonValueKind.Object
            || !useCase.Raw.TryGetProperty("consistency", out var consistency))
        {
            return null;
        }

        if (consistency.ValueKind == JsonValueKind.Object
            && consistency.TryGetProperty("mode", out var mode)
            && mode.ValueKind == JsonValueKind.String)
        {
            return mode.GetString();
        }

        if (consistency.ValueKind == JsonValueKind.String
            && consistency.GetString() is { } text)
        {
            return text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        }

        return null;
    }

    private static int BecauseCount(Record useCase)
    {
        if (useCase.Raw.ValueKind != JsonValueKind.Object
            || !useCase.Raw.TryGetProperty("consistency", out var consistency)
            || consistency.ValueKind != JsonValueKind.Object
            || !consistency.TryGetProperty("because", out var because))
        {
            return 0;
        }

        return because.ValueKind switch
        {
            JsonValueKind.Array => because.GetArrayLength(),
            JsonValueKind.String when because.GetString() is { Length: > 0 } => 1,
            _ => 0,
        };
    }

    private static void CheckQueryOutput(ProjectModel model, List<Finding> findings)
    {
        foreach (var query in model.Records.Where(record => record.Type == "use-case" && record.Field("kind") == "query"))
        {
            if (!HasIncludeGroups(query))
            {
                findings.Add(new Finding("query-output-missing", $"Query '{query.Id}' declares no output in include groups.", query.File, query.Line, SubjectOf(query)));
            }
        }
    }

    private static bool HasIncludeGroups(Record query) =>
        query.Raw.ValueKind == JsonValueKind.Object
        && query.Raw.TryGetProperty("output", out var output)
        && output.ValueKind == JsonValueKind.Object
        && output.TryGetProperty("include", out var include)
        && include.ValueKind == JsonValueKind.Object
        && include.EnumerateObject().Any();

    private static void CheckPaging(ProjectModel model, List<Finding> findings)
    {
        foreach (var query in model.Records.Where(record => record.Type == "use-case" && record.Field("kind") == "query"))
        {
            if (!query.Has("paging")
                || (query.Raw.TryGetProperty("paging", out var paging) && paging.ValueKind == JsonValueKind.Null))
            {
                findings.Add(new Finding("paging-undeclared", $"Query '{query.Id}' declares no paging.", query.File, query.Line, SubjectOf(query)));
            }
        }
    }

    private static void CheckWidening(ProjectModel model, List<Finding> findings)
    {
        foreach (var query in model.Records.Where(record => record.Type == "use-case" && record.Field("kind") == "query"))
        {
            if (query.Raw.ValueKind != JsonValueKind.Object
                || !query.Raw.TryGetProperty("output", out var output)
                || output.ValueKind != JsonValueKind.Object
                || !output.TryGetProperty("include", out var include)
                || include.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            foreach (var group in include.EnumerateObject().OrderBy(entry => entry.Name, StringComparer.Ordinal))
            {
                foreach (var cited in LinkStrings(group.Value, "wideningBecause").Order(StringComparer.Ordinal))
                {
                    // An unknown target is left to reference-unresolved.
                    if (!model.ById.TryGetValue(cited, out var target))
                    {
                        continue;
                    }

                    if (target.Type != "requirement" || !LiveApproved(model, target))
                    {
                        findings.Add(new Finding("widening-unjustified", $"Query '{query.Id}' widens '{group.Name}' through '{cited}', which is no approved requirement.", query.File, query.Line, SubjectOf(query)));
                    }
                }
            }
        }
    }

    /// <summary>Whether the record stands approved: by effective status, else by status.</summary>
    private static bool LiveApproved(ProjectModel model, Record record) =>
        model.EffectiveStatus.TryGetValue(record.Id, out var effective)
            ? effective == "approved"
            : record.Status == "approved";

    /// <summary>One data class erasure position with its per-field exceptions.</summary>
    sealed record DataClassPosition(
        string Name,
        string Classification,
        string? OnErasure,
        string? EnforcedBy,
        string? ReviewBy,
        IReadOnlyList<string> AcceptedBy,
        IReadOnlyList<string> Fields,
        IReadOnlyList<DataClassException> Exceptions);

    /// <summary>One per-field erasure position differing from its class.</summary>
    sealed record DataClassException(
        string Field,
        string? OnErasure,
        string? EnforcedBy,
        string? ReviewBy,
        IReadOnlyList<string> AcceptedBy);

    /// <summary>The aggregate data classes, in array or map form.</summary>
    private static IReadOnlyList<DataClassPosition> DataClassesOf(Record aggregate)
    {
        if (aggregate.Raw.ValueKind != JsonValueKind.Object
            || !aggregate.Raw.TryGetProperty("dataClasses", out var classes))
        {
            return [];
        }

        var found = new List<DataClassPosition>();

        if (classes.ValueKind == JsonValueKind.Array)
        {
            foreach (var entry in classes.EnumerateArray())
            {
                if (entry.ValueKind == JsonValueKind.Object
                    && Str(entry, "name") is { Length: > 0 } name)
                {
                    found.Add(ReadClass(name, entry));
                }
            }
        }
        else if (classes.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in classes.EnumerateObject())
            {
                if (property.Value.ValueKind == JsonValueKind.Object)
                {
                    found.Add(ReadClass(property.Name, property.Value));
                }
            }
        }

        return found;
    }

    private static DataClassPosition ReadClass(string name, JsonElement element) => new(
        name,
        Str(element, "classification") ?? "",
        Str(element, "onErasure"),
        Str(element, "enforcedBy"),
        Str(element, "reviewBy"),
        LinkStrings(element, "acceptedBy"),
        LinkStrings(element, "fields"),
        ExceptionsOf(element));

    private static IReadOnlyList<DataClassException> ExceptionsOf(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object
            || !element.TryGetProperty("exceptions", out var exceptions)
            || exceptions.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var found = new List<DataClassException>();

        foreach (var entry in exceptions.EnumerateArray())
        {
            if (entry.ValueKind == JsonValueKind.Object
                && Str(entry, "field") is { Length: > 0 } field)
            {
                found.Add(new DataClassException(
                    field,
                    Str(entry, "onErasure"),
                    Str(entry, "enforcedBy"),
                    Str(entry, "reviewBy"),
                    LinkStrings(entry, "acceptedBy")));
            }
        }

        return found;
    }

    private static void CheckErasure(ProjectModel model, List<Finding> findings)
    {
        foreach (var aggregate in model.Records.Where(record => record.Type == "aggregate"))
        {
            var classes = DataClassesOf(aggregate);

            foreach (var position in classes.OrderBy(entry => entry.Name, StringComparer.Ordinal))
            {
                if (Personal(position.Classification) && position.OnErasure is not { Length: > 0 })
                {
                    findings.Add(new Finding("erasure-undeclared", $"Data class '{position.Name}' on aggregate '{aggregate.Id}' holds {position.Classification} data with no erasure position.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                }
            }

            var listed = classes.Any(position => position.Fields.Count > 0);

            foreach (var field in DataOf(aggregate)
                .Where(entry => Personal(entry.Classification))
                .OrderBy(entry => entry.Name, StringComparer.Ordinal))
            {
                if (!FieldCovered(classes, listed, field.Name))
                {
                    findings.Add(new Finding("erasure-undeclared", $"Field '{field.Name}' on aggregate '{aggregate.Id}' holds {field.Classification} data with no erasure position.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                }
            }
        }
    }

    /// <summary>
    ///     Whether a declared erasure position covers the field: its own exception,
    ///     a class listing it, or any class where no class lists fields.
    /// </summary>
    private static bool FieldCovered(IReadOnlyList<DataClassPosition> classes, bool listed, string field) =>
        classes.Any(position => position.Exceptions.Any(exception =>
            exception.Field == field && exception.OnErasure is { Length: > 0 }))
        || classes.Any(position => position is { OnErasure: { Length: > 0 } }
            && (!listed || position.Fields.Contains(field, StringComparer.Ordinal)));

    private static bool Personal(string classification) =>
        classification.Equals("personal", StringComparison.OrdinalIgnoreCase)
        || classification.Equals("sensitive", StringComparison.OrdinalIgnoreCase);

    private static void CheckRetention(ProjectModel model, List<Finding> findings)
    {
        foreach (var aggregate in model.Records.Where(record => record.Type == "aggregate"))
        {
            foreach (var position in DataClassesOf(aggregate).OrderBy(entry => entry.Name, StringComparer.Ordinal))
            {
                if (position.EnforcedBy is not { Length: > 0 })
                {
                    findings.Add(new Finding("retention-without-enforcement", $"Data class '{position.Name}' on aggregate '{aggregate.Id}' names no enforcedBy.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                }

                foreach (var exception in position.Exceptions.OrderBy(entry => entry.Field, StringComparer.Ordinal))
                {
                    if (exception.OnErasure is { Length: > 0 }
                        && exception.EnforcedBy is not { Length: > 0 }
                        && position.EnforcedBy is not { Length: > 0 })
                    {
                        findings.Add(new Finding("retention-without-enforcement", $"Field '{exception.Field}' of data class '{position.Name}' on aggregate '{aggregate.Id}' names no enforcedBy.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                    }
                }
            }
        }
    }

    private static void CheckRiskAcceptance(ProjectModel model, List<Finding> findings)
    {
        foreach (var aggregate in model.Records.Where(record => record.Type == "aggregate"))
        {
            foreach (var position in DataClassesOf(aggregate).OrderBy(entry => entry.Name, StringComparer.Ordinal))
            {
                if (Personal(position.Classification) && Kept(position.OnErasure))
                {
                    CheckAcceptedBy(model, aggregate, position.AcceptedBy, $"Data class '{position.Name}' on aggregate '{aggregate.Id}' keeps {position.Classification} data with '{position.OnErasure}'", findings);
                }

                foreach (var exception in position.Exceptions.OrderBy(entry => entry.Field, StringComparer.Ordinal))
                {
                    if (Personal(position.Classification) && Kept(exception.OnErasure))
                    {
                        var accepted = exception.AcceptedBy.Count > 0 ? exception.AcceptedBy : position.AcceptedBy;

                        CheckAcceptedBy(model, aggregate, accepted, $"Field '{exception.Field}' of data class '{position.Name}' on aggregate '{aggregate.Id}' keeps {position.Classification} data with '{exception.OnErasure}'", findings);
                    }
                }
            }
        }
    }

    private static bool Kept(string? onErasure) =>
        onErasure is not null
        && (onErasure.Equals("retain", StringComparison.OrdinalIgnoreCase)
            || onErasure.Equals("exempt", StringComparison.OrdinalIgnoreCase));

    private static void CheckAcceptedBy(
        ProjectModel model,
        Record aggregate,
        IReadOnlyList<string> acceptedBy,
        string stem,
        List<Finding> findings)
    {
        if (acceptedBy.Count == 0)
        {
            findings.Add(new Finding("risk-without-acceptance", $"{stem} and no acceptedBy in Intent.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
            return;
        }

        foreach (var cited in acceptedBy.Order(StringComparer.Ordinal))
        {
            // An unknown target is left to reference-unresolved.
            if (!model.ById.TryGetValue(cited, out var target))
            {
                continue;
            }

            if (target.Type is not ("decision" or "requirement"))
            {
                findings.Add(new Finding("risk-without-acceptance", $"{stem} and acceptedBy '{cited}', which is no Intent record.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
            }
        }
    }

    private static void CheckExemption(ProjectModel model, List<Finding> findings)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var aggregate in model.Records.Where(record => record.Type == "aggregate"))
        {
            foreach (var position in DataClassesOf(aggregate).OrderBy(entry => entry.Name, StringComparer.Ordinal))
            {
                if (Exempt(position.OnErasure))
                {
                    CheckReviewBy(aggregate, position.ReviewBy, $"Data class '{position.Name}' on aggregate '{aggregate.Id}' is exempt", today, findings);
                }

                foreach (var exception in position.Exceptions.OrderBy(entry => entry.Field, StringComparer.Ordinal))
                {
                    if (Exempt(exception.OnErasure))
                    {
                        CheckReviewBy(aggregate, exception.ReviewBy ?? position.ReviewBy, $"Field '{exception.Field}' of data class '{position.Name}' on aggregate '{aggregate.Id}' is exempt", today, findings);
                    }
                }
            }
        }
    }

    private static bool Exempt(string? onErasure) =>
        onErasure is not null && onErasure.Equals("exempt", StringComparison.OrdinalIgnoreCase);

    private static void CheckReviewBy(
        Record aggregate, string? reviewBy, string stem, DateOnly today, List<Finding> findings)
    {
        if (reviewBy is not { Length: > 0 })
        {
            findings.Add(new Finding("exemption-expired", $"{stem} with no reviewBy date.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
        }
        else if (ParseDay(reviewBy, out var day) && today > day)
        {
            findings.Add(new Finding("exemption-expired", $"{stem} past its reviewBy date {reviewBy}.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
        }
    }

    private static void CheckSettingDefault(ProjectModel model, List<Finding> findings)
    {
        foreach (var setting in model.Records.Where(record => record.Type == "setting"))
        {
            var carries = setting.Raw.ValueKind == JsonValueKind.Object
                && setting.Raw.TryGetProperty("default", out var value)
                && value.ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined);

            if (carries && setting.Ids("fulfills").Count == 0)
            {
                findings.Add(new Finding("setting-default-without-requirement", $"Setting '{setting.Id}' sets a default with no requirement behind it.", setting.File, setting.Line, SubjectOf(setting)));
            }
        }
    }

    private static void CheckReservation(ProjectModel model, List<Finding> findings)
    {
        foreach (var rule in model.Records.Where(record => record.Type == "rule" && record.Field("kind") == "reservation"))
        {
            var released = rule.Field("releasedBy") ?? rule.Ids("releasedBy").FirstOrDefault();

            if (released is not { Length: > 0 })
            {
                findings.Add(new Finding("reservation-without-release", $"Rule '{rule.Id}' reserves with no releasedBy.", rule.File, rule.Line, SubjectOf(rule)));
            }
            else if (released == "never" || (released.StartsWith("never", StringComparison.Ordinal) && !HasCost(released)))
            {
                findings.Add(new Finding("reservation-without-release", $"Rule '{rule.Id}' names never with no cost.", rule.File, rule.Line, SubjectOf(rule)));
            }
        }
    }

    private static bool HasCost(string released)
    {
        var open = released.IndexOf('(', StringComparison.Ordinal);
        var shut = released.LastIndexOf(')');

        return open >= 0 && shut > open && released[(open + 1)..shut].Trim().Length > 0;
    }

    private static void CheckNotificationSender(ProjectModel model, List<Finding> findings)
    {
        var sent = new HashSet<string>(StringComparer.Ordinal);

        foreach (var holder in model.Records.Where(record =>
            record.Type is "use-case" or "reaction" or "job" && record.Status != "retired"))
        {
            foreach (var entry in EffectEntries(holder))
            {
                if (Str(entry, "sends") is { Length: > 0 } target)
                {
                    sent.Add(target);
                }
            }
        }

        foreach (var notification in model.Records.Where(record => record.Type == "notification" && record.Status != "retired"))
        {
            if (!sent.Contains(notification.Id))
            {
                findings.Add(new Finding("notification-without-sender", $"Notification '{notification.Id}' is sent by no reaction or use case.", notification.File, notification.Line, SubjectOf(notification)));
            }
        }
    }

    private static void CheckExceptFallback(ProjectModel model, List<Finding> findings)
    {
        foreach (var requirement in model.Records.Where(record => record.Type == "requirement"))
        {
            foreach (var entry in ExceptEntries(requirement))
            {
                var fallbacks = LinkStrings(entry, "fallback");

                if (fallbacks.Count == 0)
                {
                    findings.Add(new Finding("except-without-fallback", $"Requirement '{requirement.Id}' names an except with no fallback.", requirement.File, requirement.Line, SubjectOf(requirement)));
                    continue;
                }

                foreach (var cited in fallbacks.Order(StringComparer.Ordinal))
                {
                    // An unknown target is left to reference-unresolved.
                    if (!model.ById.TryGetValue(cited, out var target))
                    {
                        continue;
                    }

                    if (target.Type == "requirement" && ExceptEntries(target).Count > 0)
                    {
                        findings.Add(new Finding("except-without-fallback", $"Requirement '{requirement.Id}' names fallback '{cited}' which carries its own except.", requirement.File, requirement.Line, SubjectOf(requirement)));
                    }
                }
            }
        }
    }

    private static IReadOnlyList<JsonElement> ExceptEntries(Record record)
    {
        if (record.Raw.ValueKind != JsonValueKind.Object
            || !record.Raw.TryGetProperty("except", out var except))
        {
            return [];
        }

        if (except.ValueKind == JsonValueKind.Object)
        {
            return [except];
        }

        return except.ValueKind == JsonValueKind.Array
            ? except.EnumerateArray().Where(entry => entry.ValueKind == JsonValueKind.Object).ToList()
            : [];
    }

    private static void CheckApproval(ProjectModel model, List<Finding> findings)
    {
        foreach (var record in model.Records.Where(record =>
            (record.Status == "approved" || record.Status == "reviewed") && !record.Derived))
        {
            if (record.ApprovedHash is not { Length: > 0 })
            {
                findings.Add(new Finding("record-shape", $"Record '{record.Id}' is {record.Status} with no approvedHash.", record.File, record.Line, SubjectOf(record)));
            }
            else if (SemanticHash(record) != record.ApprovedHash)
            {
                findings.Add(new Finding("approval-reopened", $"Record '{record.Id}' changed after {record.Status}: its semantic fields no longer match approvedHash.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    private static void CheckTranscribed(ProjectModel model, List<Finding> findings)
    {
        foreach (var record in model.Records.Where(record =>
            record.Field("source") == "transcribed" && record.Status == "reviewed"))
        {
            var parents = record.Ids("fulfills").Concat(record.Ids("serves")).ToList();

            if (parents.Count == 0)
            {
                findings.Add(new Finding("transcribed-reviewed", $"Record '{record.Id}' is reviewed from transcription with no fulfills or serves parent.", record.File, record.Line, SubjectOf(record)));
                continue;
            }

            var open = parents
                .Order(StringComparer.Ordinal)
                .FirstOrDefault(parent => !ParentApproved(model, parent));

            if (open is not null)
            {
                findings.Add(new Finding("transcribed-reviewed", $"Record '{record.Id}' is reviewed from transcription while '{open}' is not approved.", record.File, record.Line, SubjectOf(record)));
            }
        }

        var endsWith = model.Config.TranscriptionEndsWith;

        if (endsWith is { Length: > 0 }
            && model.ById.TryGetValue(endsWith, out var decision)
            && decision.Type == "decision"
            && model.EffectiveStatus.TryGetValue(endsWith, out var effective)
            && effective == "approved")
        {
            foreach (var record in model.Records
                .Where(record => record.Field("source") == "transcribed" && record.Status != "retired")
                .OrderBy(record => record.Id, StringComparer.Ordinal))
            {
                findings.Add(new Finding("transcribed-after-adoption", $"Record '{record.Id}' is still transcribed after '{endsWith}' ended adoption.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    /// <summary>Whether the fulfills or serves parent stands approved or reviewed.</summary>
    private static bool ParentApproved(ProjectModel model, string parent)
    {
        var baseId = Identifiers.BaseId(parent);

        if (!model.ById.ContainsKey(baseId))
        {
            return false;
        }

        return model.EffectiveStatus.TryGetValue(baseId, out var effective)
            ? effective is "approved" or "reviewed"
            : model.ById[baseId].Status is "approved" or "reviewed";
    }

    private static void CheckOperatorJob(ProjectModel model, List<Finding> findings)
    {
        foreach (var job in model.Records.Where(record => record.Type == "job" && record.Field("kind") == "operator"))
        {
            if (!FieldPresent(job, "runsWhere"))
            {
                findings.Add(new Finding("operator-job-without-guard", $"Operator job '{job.Id}' states no runsWhere.", job.File, job.Line, SubjectOf(job)));
            }

            if (!FieldPresent(job, "guard"))
            {
                findings.Add(new Finding("operator-job-without-guard", $"Operator job '{job.Id}' states no guard.", job.File, job.Line, SubjectOf(job)));
            }
        }
    }

    private static bool FieldPresent(Record record, string field)
    {
        if (record.Raw.ValueKind != JsonValueKind.Object
            || !record.Raw.TryGetProperty(field, out var value))
        {
            return false;
        }

        return value.ValueKind switch
        {
            JsonValueKind.Null or JsonValueKind.Undefined => false,
            JsonValueKind.String => value.GetString() is { Length: > 0 },
            JsonValueKind.Array => value.GetArrayLength() > 0,
            _ => true,
        };
    }

    private static void CheckSchedule(ProjectModel model, List<Finding> findings)
    {
        foreach (var job in model.Records.Where(record => record.Type == "job"))
        {
            var structured = StructuredSchedule(job);

            if (job.Field("kind") == "scheduled" && !structured)
            {
                var missing = !job.Has("schedule");

                findings.Add(new Finding("schedule-unstructured", missing
                    ? $"Job '{job.Id}' runs on time with no structured schedule."
                    : $"Job '{job.Id}' carries a schedule no tool can read.", job.File, job.Line, SubjectOf(job)));
            }
            else if (job.Field("kind") != "scheduled" && job.Has("schedule") && !structured)
            {
                findings.Add(new Finding("schedule-unstructured", $"Job '{job.Id}' carries a schedule no tool can read.", job.File, job.Line, SubjectOf(job)));
            }
        }
    }

    private static bool StructuredSchedule(Record job) =>
        job.Raw.ValueKind == JsonValueKind.Object
        && job.Raw.TryGetProperty("schedule", out var schedule)
        && schedule.ValueKind == JsonValueKind.Object
        && (Str(schedule, "every") is { Length: > 0 } || Str(schedule, "cron") is { Length: > 0 });

    private static void CheckProse(ProjectModel model, List<Finding> findings)
    {
        foreach (var useCase in model.Records
            .Where(record => record.Type == "use-case" && record.Status != "retired")
            .OrderBy(record => record.Id, StringComparer.Ordinal))
        {
            if (!Significant(model, useCase))
            {
                continue;
            }

            var body = model.Bodies.FirstOrDefault(page => page.File == useCase.File)?.Body ?? "";

            if (!HasSection(body, "Goal"))
            {
                findings.Add(new Finding("prose-missing", $"Use case '{useCase.Id}' needs a Goal section.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }

            // Queries carry no What Happens section, so only commands need one.
            if (useCase.Field("kind") != "query" && !HasSection(body, "What Happens"))
            {
                findings.Add(new Finding("prose-missing", $"Use case '{useCase.Id}' needs a What Happens section.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }
        }
    }

    /// <summary>
    ///     Whether the use case needs Goal and What Happens prose: it changes more
    ///     than one aggregate, refuses beyond the generic refusals, carries risk,
    ///     or issues inline effects.
    /// </summary>
    private static bool Significant(ProjectModel model, Record useCase)
    {
        if (useCase.Ids("changes").Count > 1 || HasRisk(useCase))
        {
            return true;
        }

        if (EffectEntries(useCase).Any(entry =>
            Str(entry, "timing") is { } timing
            && timing.Equals("inline", StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        if (!Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
        {
            return false;
        }

        return model.Records.Any(record => record.Type == "result"
            && !record.Derived
            && record.Field("outcome") == "refusal"
            && Identifiers.TrySplit(record.Id, out _, out var home, out _)
            && home == name);
    }

    private static bool HasSection(string body, string heading)
    {
        var inFence = false;

        foreach (var line in body.Replace("\r\n", "\n").Split('\n'))
        {
            var trimmed = line.Trim();

            if (trimmed.StartsWith("```", StringComparison.Ordinal) || trimmed.StartsWith("~~~", StringComparison.Ordinal))
            {
                inFence = !inFence;
                continue;
            }

            if (!inFence && SectionNamed(line, heading))
            {
                return true;
            }
        }

        return false;
    }

    private static bool SectionNamed(string line, string heading)
    {
        var trimmed = line.Trim();

        if (!trimmed.StartsWith('#'))
        {
            return false;
        }

        var hashes = 0;

        while (hashes < trimmed.Length && trimmed[hashes] == '#')
        {
            hashes++;
        }

        if (hashes is 0 or > 6)
        {
            return false;
        }

        var text = trimmed[hashes..].Trim().TrimEnd('#').Trim();

        return text.Equals(heading, StringComparison.OrdinalIgnoreCase);
    }

    private static void CheckManyAggregates(ProjectModel model, List<Finding> findings)
    {
        foreach (var useCase in model.Records.Where(record =>
            record.Type == "use-case" && record.Field("kind") == "command" && record.Status != "retired"))
        {
            if (ConsistencyMode(useCase) == "atomic" && BecauseCount(useCase) > 1)
            {
                findings.Add(new Finding("many-aggregates", $"Use case '{useCase.Id}' saves more than one atomic write group; consider splitting.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }
        }
    }

    private static void CheckQuestionAged(ProjectModel model, List<Finding> findings)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var record in model.Records.Where(record => record.Status != "retired"))
        {
            if (record.Raw.ValueKind == JsonValueKind.Object
                && record.Raw.TryGetProperty("questions", out var questions)
                && questions.ValueKind == JsonValueKind.Array)
            {
                foreach (var entry in questions.EnumerateArray())
                {
                    // A tier-1 question blocks instead of aging, and an auto-approved
                    // tier-3 question with a recommendation is closed, not open.
                    if (TierOf(entry, record) == 1
                        || AutoApproved(entry, record, model.Config, today)
                        || (TierOf(entry, record) == 3 && Recommended(entry))
                        || !AgedPast(entry, today))
                    {
                        continue;
                    }

                    findings.Add(new Finding("question-aged", $"Question on '{record.Id}' stands past its decide-by date.", record.File, record.Line, SubjectOf(record)));
                    break;
                }
            }

            if (record.Status == "draft"
                && TierOf(record.Raw, record) == 3
                && !Recommended(record.Raw)
                && AgedPast(record.Raw, today))
            {
                findings.Add(new Finding("question-aged", $"Draft '{record.Id}' stands past its decide-by date.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    private static void CheckReactionTrigger(ProjectModel model, List<Finding> findings)
    {
        foreach (var reaction in model.Records.Where(record => record.Type == "reaction"))
        {
            var triggers = reaction.Ids("on");

            if (triggers.Count == 0)
            {
                findings.Add(new Finding("reaction-trigger-unresolved", $"Reaction '{reaction.Id}' names no trigger.", reaction.File, reaction.Line, SubjectOf(reaction)));
                continue;
            }

            foreach (var trigger in triggers.Order(StringComparer.Ordinal))
            {
                var baseId = Identifiers.BaseId(trigger);

                if (!model.ById.TryGetValue(baseId, out var resolved))
                {
                    findings.Add(new Finding("reaction-trigger-unresolved", $"Reaction '{reaction.Id}' names trigger '{trigger}' which no event holds.", reaction.File, reaction.Line, SubjectOf(reaction)));
                }
                else if (resolved.Type is not ("event" or "integration-event"))
                {
                    findings.Add(new Finding("reaction-trigger-unresolved", $"Reaction '{reaction.Id}' names trigger '{trigger}' which is a {resolved.Type}.", reaction.File, reaction.Line, SubjectOf(reaction)));
                }
            }
        }
    }

    /// <summary>The record's effect entries: objects in its effects array. A reaction entry without timing reads as async.</summary>
    private static IReadOnlyList<JsonElement> EffectEntries(Record record)
    {
        if (record.Raw.ValueKind == JsonValueKind.Object
            && record.Raw.TryGetProperty("effects", out var effects)
            && effects.ValueKind == JsonValueKind.Array)
        {
            return effects.EnumerateArray().Where(entry => entry.ValueKind == JsonValueKind.Object).ToList();
        }

        return [];
    }

    /// <summary>The one target an effect entry names, across its four verbs.</summary>
    private static string? EffectTarget(JsonElement entry) =>
        (Str(entry, "issues") ?? Str(entry, "sends") ?? Str(entry, "publishes") ?? Str(entry, "calls")) is { Length: > 0 } target
            ? target
            : null;

    private static string? Str(JsonElement element, string name) =>
        element.ValueKind == JsonValueKind.Object
        && element.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    /// <summary>One field holding one id or an array of ids, read from any element.</summary>
    private static IReadOnlyList<string> LinkStrings(JsonElement element, string name)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(name, out var value))
        {
            return [];
        }

        if (value.ValueKind == JsonValueKind.String && value.GetString() is { } single)
        {
            return [single];
        }

        if (value.ValueKind == JsonValueKind.Array)
        {
            return
            [
                .. value.EnumerateArray()
                          .Where(entry => entry.ValueKind == JsonValueKind.String)
                          .Select(entry => entry.GetString()!),
            ];
        }

        return [];
    }
}

using System.Text.Json.Nodes;

namespace LiteSpec.Book;

/// <summary>One navigation layer: a heading over a fixed list of record types.</summary>
/// <param name="Name">The layer heading.</param>
/// <param name="Types">The record types in the layer.</param>
sealed record BookLayer(string Name, IReadOnlyList<string> Types);

/// <summary>A record id split into its type, home module and name.</summary>
/// <param name="Type">The part before the slash.</param>
/// <param name="Home">The part between the slash and the dot, or null when the id has no home.</param>
/// <param name="Name">The part after the dot, or after the slash when the id has no home.</param>
sealed record SplitId(string Type, string? Home, string Name);

/// <summary>One incoming link: the record it comes from and the field that holds it.</summary>
/// <param name="From">The linking record's id.</param>
/// <param name="Field">The link field on that record.</param>
sealed record Backlink(string From, string Field);

/// <summary>One proves link enriched with its test, if the scenario names one.</summary>
/// <param name="Scenario">The proving scenario name.</param>
/// <param name="Confirmed">Whether the proof claim holds.</param>
/// <param name="Indirect">Whether the proof is indirect.</param>
/// <param name="Passing">The scenario's last outcome, or null without a test run.</param>
/// <param name="Test">The scenario's test, or null when no test has that name.</param>
sealed record ProofLink(JsonNode? Scenario, bool Confirmed, bool Indirect, bool? Passing, JsonObject? Test);

/// <summary>One scenario's proof state from its proves links.</summary>
/// <param name="State">The proof state key.</param>
/// <param name="Links">The enriched proves links.</param>
/// <param name="Claimed">Whether a test claims the scenario without holding the claim.</param>
sealed record ScenarioProofResult(string State, IReadOnlyList<ProofLink> Links, bool Claimed);

/// <summary>The results and scenarios that belong to one use case.</summary>
/// <param name="Results">The use case's results.</param>
/// <param name="Scenarios">The use case's scenarios.</param>
sealed record UseCaseKids(IReadOnlyList<JsonObject> Results, IReadOnlyList<JsonObject> Scenarios);

/// <summary>One use case's implementation state from the status map.</summary>
/// <param name="Implemented">Whether code implements the use case.</param>
/// <param name="Verified">Whether every scenario is proved by a passing test.</param>
/// <param name="Stale">Whether a proof went stale after its scenario changed.</param>
sealed record UseCaseState(bool Implemented, bool Verified, bool Stale);

/// <summary>One requirement's verification state from the requirement status map.</summary>
/// <param name="Known">Whether the model holds an entry for the requirement.</param>
/// <param name="Verified">Whether everything fulfilling it is verified, with a passing measure check when measured.</param>
/// <param name="MeasurePassed">Whether the measure check passed, or null without a measure or a result.</param>
/// <param name="Stale">Whether a proof beneath it went stale.</param>
sealed record RequirementState(bool Known, bool Verified, bool? MeasurePassed, bool Stale);

/// <summary>One step of a record's why-chain: a plain label and the record it points at.</summary>
/// <param name="Label">The step label, such as Result or Goal.</param>
/// <param name="Id">The linked record's id.</param>
sealed record WhyLink(string Label, string Id);

/// <summary>One open question on a record, for the review and ballots pages.</summary>
/// <param name="Record">The record carrying the question.</param>
/// <param name="Question">The question in words.</param>
/// <param name="Decider">The decider, or null when none is named.</param>
/// <param name="DecideBy">The decide-by date, or null when none is named.</param>
/// <param name="Recommended">The recommendation, or null when none is named.</param>
/// <param name="Ballot">The ballot grouping, or null when none is named.</param>
/// <param name="Tier">The approval tier: 1 needs explicit approval, 3 may auto-approve.</param>
sealed record OpenQuestion(JsonObject Record, string Question, string? Decider, string? DecideBy, string? Recommended, string? Ballot, int Tier);

/// <summary>One ballot: the questions sharing a ballot name, tier 1 first.</summary>
/// <param name="Name">The ballot name, or null for questions with no ballot.</param>
/// <param name="Questions">The ballot's questions, tier 1 first.</param>
sealed record BallotGroup(string? Name, IReadOnlyList<OpenQuestion> Questions);

/// <summary>One goal-lens feature with the requirements it carries.</summary>
/// <param name="Feature">The feature record.</param>
/// <param name="Requirements">The requirements with this feature, sorted by title.</param>
sealed record GoalFeature(JsonObject Feature, IReadOnlyList<JsonObject> Requirements);

/// <summary>One goal's lens: the goal, its features, and the verified share of its requirements.</summary>
/// <param name="Goal">The goal record.</param>
/// <param name="Features">The features serving the goal, sorted by title.</param>
/// <param name="Verified">How many of its requirements are verified.</param>
/// <param name="Total">How many requirements its features carry.</param>
sealed record GoalLensView(JsonObject Goal, IReadOnlyList<GoalFeature> Features, int Verified, int Total);

/// <summary>One role an actor holds, with the role record when it resolves.</summary>
/// <param name="Hold">The holds entry naming the role and scope.</param>
/// <param name="Role">The role record, or null when the id resolves to nothing.</param>
sealed record RoleHold(JsonObject Hold, JsonObject? Role);

/// <summary>An actor's lens: its journeys, roles, permissions and reachable use cases.</summary>
/// <param name="Journeys">The journeys the actor takes.</param>
/// <param name="Roles">The roles the actor holds.</param>
/// <param name="Permissions">The permissions those roles allow.</param>
/// <param name="UseCases">The use cases those permissions open.</param>
sealed record ActorLens(
    IReadOnlyList<JsonObject> Journeys,
    IReadOnlyList<RoleHold> Roles,
    IReadOnlyList<JsonObject> Permissions,
    IReadOnlyList<JsonObject> UseCases);

/// <summary>One known gap with whether its end date has passed.</summary>
/// <param name="Record">The gap record.</param>
/// <param name="Expired">Whether the gap's end date has passed.</param>
sealed record GapEntry(JsonObject Record, bool Expired);

/// <summary>Everything the review page shows: gaps, drafts, questions and check findings.</summary>
/// <param name="Gaps">The known gaps, expired first.</param>
/// <param name="WithDecider">The drafts with a decide-by date.</param>
/// <param name="WithoutDecider">The drafts without one.</param>
/// <param name="Questions">The open questions on any record.</param>
/// <param name="Findings">The check findings.</param>
/// <param name="Known">The findings covered by a known gap.</param>
sealed record ReviewBundle(
    IReadOnlyList<GapEntry> Gaps,
    IReadOnlyList<JsonObject> WithDecider,
    IReadOnlyList<JsonObject> WithoutDecider,
    IReadOnlyList<OpenQuestion> Questions,
    IReadOnlyList<JsonObject?> Findings,
    IReadOnlyList<JsonObject?> Known);

/// <summary>The index over model.json that every page renderer reads.</summary>
sealed class BookIndex
{
    /// <summary>Every entry of the records array, including entries that are not objects.</summary>
    public List<JsonNode?> Records { get; init; } = [];

    /// <summary>Records by id; the first record wins when an id repeats.</summary>
    public Dictionary<string, JsonObject> ById { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Records by type, each list sorted by title.</summary>
    public Dictionary<string, List<JsonObject>> ByType { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Incoming record links by target id.</summary>
    public Dictionary<string, List<Backlink>> Backlinks { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Results by home module name.</summary>
    public Dictionary<string, List<JsonObject>> ResultsOf { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Scenarios by home module name.</summary>
    public Dictionary<string, List<JsonObject>> ScenariosOf { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Implements links by target record id.</summary>
    public Dictionary<string, List<JsonObject>> ImplementsByTarget { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Calls links by target record id.</summary>
    public Dictionary<string, List<JsonObject>> CallsByTarget { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Proves links by claimed record id.</summary>
    public Dictionary<string, List<JsonObject>> ProvesByClaim { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Every entry of the tests array.</summary>
    public List<JsonNode?> Tests { get; set; } = [];

    /// <summary>Tests by scenario name; the first test wins when a name repeats.</summary>
    public Dictionary<string, JsonObject> TestsByName { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Every entry of the screens array.</summary>
    public List<JsonNode?> Screens { get; set; } = [];

    /// <summary>Screens by "<c>frontend route</c>"; the last screen wins when a key repeats.</summary>
    public Dictionary<string, JsonObject> ScreensByKey { get; init; } = new(StringComparer.Ordinal);

    /// <summary>The use-case status map, or empty when the model holds none.</summary>
    public JsonObject Status { get; set; } = new();

    /// <summary>The requirement status map, or empty when the model holds none.</summary>
    public Dictionary<string, JsonObject> RequirementStatus { get; init; } = new(StringComparer.Ordinal);

    /// <summary>The reachable states by aggregate id, or empty when the model holds none.</summary>
    public Dictionary<string, HashSet<string>> ReachableStates { get; init; } = new(StringComparer.Ordinal);

    /// <summary>The latest test run, or null when the model holds none.</summary>
    public JsonNode? TestRun { get; set; }

    /// <summary>Days before a tier-3 question auto-approves; 7 when the model names none.</summary>
    public int VetoWindowDays { get; set; } = 7;
}

/// <summary>
///     The index over model.json for the book generator. Pure data shaping, no HTML.
/// </summary>
static class BookModel
{
    /// <summary>The navigation layers, in display order.</summary>
    public static readonly IReadOnlyList<BookLayer> Layers =
    [
        new("Why", ["product", "goal", "constraint", "research", "decision", "requirement"]),
        new("Problems and Features", ["problem", "feature"]),
        new("People", ["actor", "role", "permission"]),
        new("Journeys", ["journey"]),
        new("How the Business Works", ["module", "aggregate", "rule", "use-case", "result", "scenario", "event", "integration-event", "reaction", "job", "notification", "setting"]),
        new("Entry Points", ["entry-point", "external-system"]),
        new("Running It", ["runbook"]),
        new("How We Build", ["deviation", "known-gap"]),
        new("Terms", ["term"]),
    ];

    static readonly IReadOnlyDictionary<string, (string One, string Many)> TypeLabels =
        new Dictionary<string, (string One, string Many)>(StringComparer.Ordinal)
        {
            ["product"] = ("Product", "Products"),
            ["goal"] = ("Goal", "Goals"),
            ["constraint"] = ("Constraint", "Constraints"),
            ["research"] = ("Research", "Research"),
            ["decision"] = ("Decision", "Decisions"),
            ["requirement"] = ("Requirement", "Requirements"),
            ["problem"] = ("Problem", "Problems"),
            ["feature"] = ("Feature", "Features"),
            ["actor"] = ("Actor", "Actors"),
            ["role"] = ("Role", "Roles"),
            ["permission"] = ("Permission", "Permissions"),
            ["journey"] = ("Journey", "Journeys"),
            ["module"] = ("Module", "Modules"),
            ["aggregate"] = ("Aggregate", "Aggregates"),
            ["rule"] = ("Rule", "Rules"),
            ["use-case"] = ("Use case", "Use cases"),
            ["result"] = ("Result", "Results"),
            ["scenario"] = ("Scenario", "Scenarios"),
            ["event"] = ("Event", "Events"),
            ["integration-event"] = ("Integration event", "Integration events"),
            ["reaction"] = ("Reaction", "Reactions"),
            ["job"] = ("Job", "Jobs"),
            ["notification"] = ("Notification", "Notifications"),
            ["setting"] = ("Setting", "Settings"),
            ["entry-point"] = ("Entry point", "Entry points"),
            ["external-system"] = ("External system", "External systems"),
            ["runbook"] = ("Runbook", "Runbooks"),
            ["deviation"] = ("Deviation", "Deviations"),
            ["known-gap"] = ("Known gap", "Known gaps"),
            ["term"] = ("Term", "Terms"),
        };

    /// <summary>
    ///     The outgoing link fields, in display order with their headings. Refusal
    ///     renders as rule sentences instead, so it stays out of this list.
    /// </summary>
    public static readonly IReadOnlyList<(string Field, string Label)> LinkLabels =
    [
        ("decides", "Decides"),
        ("basedOn", "Based On"),
        ("affects", "Affects"),
        ("solves", "Solves"),
        ("serves", "Serves"),
        ("feature", "Feature"),
        ("fulfills", "Fulfills"),
        ("governs", "Governs"),
        ("computedBy", "Computed By"),
        ("raises", "Raises"),
        ("on", "On"),
        ("issues", "Issues"),
        ("sends", "Sends"),
        ("publishes", "Publishes"),
        ("calls", "Calls"),
        ("changes", "Changes"),
        ("reads", "Reads"),
        ("translates", "Translates"),
        ("enforcedBy", "Enforced By"),
        ("acceptedBy", "Accepted By"),
        ("allows", "Allows"),
        ("reachedThrough", "Reached Through"),
        ("dependsOn", "Depends On"),
        ("terms", "Terms"),
        ("result", "Illustrates"),
        ("actor", "Actor"),
        ("runbook", "Runbook"),
        ("subject", "About"),
        ("replaces", "Replaces"),
        ("provision", "Provision"),
    ];

    /// <summary>The incoming link headings by field.</summary>
    public static readonly IReadOnlyDictionary<string, string> LinkInverseLabels =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["decides"] = "Decided By",
            ["basedOn"] = "Basis For",
            ["affects"] = "Problems Affecting This",
            ["solves"] = "Solved By",
            ["serves"] = "Served By",
            ["feature"] = "Requirements",
            ["fulfills"] = "Fulfilled By",
            ["except"] = "Excepted By",
            ["fallback"] = "Fallback For",
            ["governs"] = "Governed By",
            ["computedBy"] = "Computes",
            ["raises"] = "Raised By",
            ["on"] = "Reactions",
            ["issues"] = "Issued By",
            ["sends"] = "Sent By",
            ["publishes"] = "Published By",
            ["calls"] = "Called By",
            ["effects"] = "Effect For",
            ["changes"] = "Changed By",
            ["reads"] = "Read By",
            ["translates"] = "Translated By",
            ["releasedBy"] = "Releases",
            ["enforcedBy"] = "Enforces",
            ["acceptedBy"] = "Accepts",
            ["dataClasses"] = "Data Class For",
            ["access"] = "Access For",
            ["allows"] = "Allowed By",
            ["reachedThrough"] = "Entry For",
            ["dependsOn"] = "Depended On By",
            ["terms"] = "Used By",
            ["result"] = "Illustrated By",
            ["actor"] = "Systems For",
            ["runbook"] = "Runbook For",
            ["subject"] = "Known Gaps",
            ["replaces"] = "Replaced By",
            ["refusal"] = "Refusal For",
            ["provision"] = "Deviations",
        };

    /// <summary>The record types in precedence order.</summary>
    public static readonly IReadOnlyList<string> Precedence = ["constraint", "product", "requirement", "rule", "use-case", "result", "scenario"];

    /// <summary>The proof-state labels.</summary>
    public static readonly IReadOnlyDictionary<string, string> ProofLabels =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["proved-passing"] = "Proved and passing",
            ["proved-failing"] = "Proved and failing",
            ["proved-indirect"] = "Proved indirect",
            ["awaiting-run"] = "Proved, awaiting test run",
            ["unproved"] = "Unproved",
        };

    /// <summary>The display label of a record type, singular or plural.</summary>
    public static string TypeLabel(string? type, bool plural = false) =>
        type is not null && TypeLabels.TryGetValue(type, out var labels)
            ? (plural ? labels.Many : labels.One)
            : (plural ? "Records" : "Record");

    /// <summary>The record URL: the id with "/" and "." mapped to path segments, keeping any "#step" fragment.</summary>
    public static string RecordUrl(string id)
    {
        var fragment = "";
        var baseId = id;
        var hash = id.IndexOf('#');
        if (hash >= 0)
        {
            baseId = id[..hash];
            fragment = id[hash..];
        }

        var slash = baseId.IndexOf('/');
        if (slash < 0)
        {
            return "index.html";
        }

        return $"{baseId[..slash]}/{baseId[(slash + 1)..].Replace(".", "/")}.html{fragment}";
    }

    /// <summary>The URL of a record type's index page.</summary>
    public static string TypeIndexUrl(string type) => $"{type}/index.html";

    /// <summary>The URL of the ballots page.</summary>
    public static string BallotsUrl() => "ballots/index.html";

    /// <summary>The URL of an actor's lens page.</summary>
    public static string LensUrl(string actorId)
    {
        var slash = actorId.IndexOf('/');
        var name = slash < 0 ? actorId : actorId[(slash + 1)..];
        return $"lens/{name}.html";
    }

    /// <summary>The URL of a goal's lens page: goal, features, requirements, verified state.</summary>
    public static string GoalUrl(string goalId)
    {
        var slash = goalId.IndexOf('/');
        var name = slash < 0 ? goalId : goalId[(slash + 1)..];
        return $"goals/{name}.html";
    }

    /// <summary>The relative prefix from a page back to the site root.</summary>
    public static string RelFor(string url)
    {
        var depth = url.Split('/').Length - 1;
        return depth <= 0 ? "" : string.Concat(Enumerable.Repeat("../", depth));
    }

    /// <summary>Splits "use-case/lending.borrow-copy" into type, home and name.</summary>
    public static SplitId SplitId(string id)
    {
        var slash = id.IndexOf('/');
        if (slash < 0)
        {
            return new SplitId(id, null, "");
        }

        var rest = id[(slash + 1)..];
        var dot = rest.IndexOf('.');
        return dot < 0
            ? new SplitId(id[..slash], null, rest)
            : new SplitId(id[..slash], rest[..dot], rest[(dot + 1)..]);
    }

    /// <summary>The title a record sorts and links under: its title, or its id when empty.</summary>
    public static string SortTitle(JsonObject record) =>
        BookRender.IsTruthy(record["title"]) ? BookRender.Str(record["title"]) : BookRender.PropText(record, "id");

    /// <summary>Builds the index over a parsed model.json object.</summary>
    public static BookIndex BuildIndex(JsonObject model)
    {
        var records = model["records"] as JsonArray ?? [];
        var index = new BookIndex { Records = records.ToList() };

        foreach (var record in records.OfType<JsonObject>())
        {
            if (BookRender.StrProp(record, "id") is { } id && !index.ById.ContainsKey(id))
            {
                index.ById[id] = record;
            }
        }

        foreach (var record in records.OfType<JsonObject>())
        {
            if (BookRender.StrProp(record, "type") is not { } type)
            {
                continue;
            }

            if (!index.ByType.TryGetValue(type, out var list))
            {
                list = [];
                index.ByType[type] = list;
            }

            list.Add(record);
        }

        // OrderBy is stable, so equal titles keep their file order.
        foreach (var type in index.ByType.Keys.ToList())
        {
            index.ByType[type] = index.ByType[type].OrderBy(SortTitle, BookRender.LocaleComparer).ToList();
        }

        foreach (var record in records.OfType<JsonObject>())
        {
            // Links arrive as a field map or as a list; a list reads by position.
            IEnumerable<(string Field, JsonNode? Targets)> entries = record["links"] switch
            {
                JsonObject linkMap => linkMap.Select(pair => (pair.Key, pair.Value)),
                JsonArray linkList => linkList.Select((targets, position) => (position.ToString(), targets)),
                _ => [],
            };
            foreach (var (field, targets) in entries)
            {
                if (targets is not JsonArray ids)
                {
                    continue;
                }

                foreach (var target in ids)
                {
                    if (target is JsonValue scalar && scalar.TryGetValue<string>(out var id) && id is { Length: > 0 })
                    {
                        if (!index.Backlinks.TryGetValue(id, out var from))
                        {
                            from = [];
                            index.Backlinks[id] = from;
                        }

                        from.Add(new Backlink(BookRender.StrProp(record, "id") ?? "", field));

                        // A step or operation target also links its carrying record, so the
                        // journey and system pages list what serves and calls them.
                        var hash = id.IndexOf('#');
                        if (hash > 0 && id[..hash] is { Length: > 0 } baseId && baseId != id)
                        {
                            if (!index.Backlinks.TryGetValue(baseId, out var baseFrom))
                            {
                                baseFrom = [];
                                index.Backlinks[baseId] = baseFrom;
                            }

                            baseFrom.Add(new Backlink(BookRender.StrProp(record, "id") ?? "", field));
                        }
                    }
                }
            }
        }

        foreach (var record in records.OfType<JsonObject>())
        {
            var type = BookRender.StrProp(record, "type");
            if (type != "result" && type != "scenario")
            {
                continue;
            }

            if (BookRender.StrProp(record, "id") is not { } id)
            {
                continue;
            }

            // A derived generic result carries its use case as home.name before the
            // forbidden or invalid-input suffix, so it files under the use case name.
            var key = SplitId(id).Home;
            if (type == "result" && BookRender.IsTrue(record["derived"]) && DerivedHolder(id) is { } holder)
            {
                key = holder;
            }

            if (key is not { Length: > 0 })
            {
                continue;
            }

            var map = type == "result" ? index.ResultsOf : index.ScenariosOf;
            if (!map.TryGetValue(key, out var list))
            {
                list = [];
                map[key] = list;
            }

            list.Add(record);
        }

        var links = model["links"] as JsonObject ?? new JsonObject();
        foreach (var link in links["implements"] as JsonArray ?? [])
        {
            if (link is JsonObject obj && BookRender.StrProp(obj, "to") is { } to)
            {
                if (!index.ImplementsByTarget.TryGetValue(to, out var list))
                {
                    list = [];
                    index.ImplementsByTarget[to] = list;
                }

                list.Add(obj);
            }
        }

        foreach (var link in links["calls"] as JsonArray ?? [])
        {
            if (link is JsonObject obj && BookRender.StrProp(obj, "to") is { } to)
            {
                if (!index.CallsByTarget.TryGetValue(to, out var list))
                {
                    list = [];
                    index.CallsByTarget[to] = list;
                }

                list.Add(obj);
            }
        }

        foreach (var link in links["proves"] as JsonArray ?? [])
        {
            if (link is JsonObject obj && BookRender.StrProp(obj, "claim") is { } claim)
            {
                if (!index.ProvesByClaim.TryGetValue(claim, out var list))
                {
                    list = [];
                    index.ProvesByClaim[claim] = list;
                }

                list.Add(obj);
            }
        }

        index.Tests = (model["tests"] as JsonArray ?? []).ToList();
        foreach (var test in index.Tests.OfType<JsonObject>())
        {
            if (BookRender.StrProp(test, "scenario") is { } scenario && !index.TestsByName.ContainsKey(scenario))
            {
                index.TestsByName[scenario] = test;
            }
        }

        index.Screens = (model["screens"] as JsonArray ?? []).ToList();
        foreach (var screen in index.Screens.OfType<JsonObject>())
        {
            if (BookRender.StrProp(screen, "frontend") is { } frontend && BookRender.StrProp(screen, "route") is { } route)
            {
                index.ScreensByKey[$"{frontend} {route}"] = screen;
            }
        }

        index.Status = model["status"] as JsonObject ?? new JsonObject();
        foreach (var pair in model["requirementStatus"] as JsonObject ?? new JsonObject())
        {
            if (pair.Value is JsonObject entry)
            {
                index.RequirementStatus[pair.Key] = entry;
            }
        }

        foreach (var pair in model["reachableStates"] as JsonObject ?? new JsonObject())
        {
            var names = new HashSet<string>(StringComparer.Ordinal);
            foreach (var name in pair.Value as JsonArray ?? [])
            {
                if (name is JsonValue scalar && scalar.TryGetValue<string>(out var state) && state is not null)
                {
                    names.Add(state);
                }
            }

            index.ReachableStates[pair.Key] = names;
        }

        index.TestRun = model["testRun"] is { } run && BookRender.IsTruthy(run) && run is JsonObject or JsonArray ? run : null;
        index.VetoWindowDays = VetoWindowOf(model);

        return index;
    }

    /// <summary>The veto window in days: the model's review value, or 7 when absent.</summary>
    static int VetoWindowOf(JsonObject model)
    {
        JsonNode? value = (model["review"] as JsonObject)?["vetoWindowDays"] ?? model["vetoWindowDays"];
        if (value is JsonValue scalar && scalar.TryGetValue<int>(out var days) && days > 0)
        {
            return days;
        }

        if (value is JsonValue text && text.TryGetValue<string>(out var words)
            && int.TryParse(words, out var parsed) && parsed > 0)
        {
            return parsed;
        }

        return 7;
    }

    /// <summary>The use-case name holding a derived generic result, or null when the id is not derived.</summary>
    static string? DerivedHolder(string id)
    {
        const string prefix = "result/";
        if (!id.StartsWith(prefix, StringComparison.Ordinal))
        {
            return null;
        }

        var rest = id[prefix.Length..];
        foreach (var suffix in new[] { ".forbidden", ".invalid-input" })
        {
            if (rest.EndsWith(suffix, StringComparison.Ordinal))
            {
                var holder = rest[..^suffix.Length];
                var dot = holder.IndexOf('.');
                return dot >= 0 && dot + 1 < holder.Length ? holder[(dot + 1)..] : null;
            }
        }

        return null;
    }

    /// <summary>One scenario's proof state from its proves links.</summary>
    public static ScenarioProofResult ScenarioProof(BookIndex index, string scenarioId)
    {
        var links = index.ProvesByClaim.TryGetValue(scenarioId, out var found) ? found : [];
        var enriched = links.Select(link => new ProofLink(
            link["scenario"],
            BookRender.IsTrue(link["confirmed"]),
            BookRender.IsTrue(link["indirect"]),
            link["passing"] is JsonValue scalar && scalar.TryGetValue<bool>(out var passing) ? passing : (bool?)null,
            BookRender.StrProp(link, "scenario") is { } scenario ? index.TestsByName.GetValueOrDefault(scenario) : null)).ToList();
        var confirmed = enriched.Where(link => link.Confirmed).ToList();
        var state = "unproved";
        if (confirmed.Count > 0)
        {
            if (confirmed.Any(link => link.Indirect))
            {
                state = "proved-indirect";
            }
            else if (confirmed.Any(link => link.Passing == false))
            {
                state = "proved-failing";
            }
            else if (confirmed.All(link => link.Passing == true))
            {
                state = "proved-passing";
            }
            else
            {
                state = "awaiting-run";
            }
        }

        return new ScenarioProofResult(state, enriched, links.Count > 0 && confirmed.Count == 0);
    }

    /// <summary>The results and scenarios that belong to one use case.</summary>
    public static UseCaseKids UseCaseChildren(BookIndex index, string useCaseId)
    {
        var name = SplitId(useCaseId).Name;
        return new UseCaseKids(
            index.ResultsOf.TryGetValue(name, out var results) ? results : [],
            index.ScenariosOf.TryGetValue(name, out var scenarios) ? scenarios : []);
    }

    /// <summary>One use case's implementation state from the status map.</summary>
    public static UseCaseState UseCaseStatus(BookIndex index, string? useCaseId)
    {
        var entry = useCaseId is not null && index.Status.TryGetPropertyValue(useCaseId, out var node) ? node as JsonObject : null;
        if (entry is null)
        {
            return new UseCaseState(false, false, IsStale(index, useCaseId));
        }

        return new UseCaseState(
            BookRender.IsTrue(entry["implemented"]),
            BookRender.IsTrue(entry["verified"]),
            BookRender.IsTrue(entry["stale"]) || IsStale(index, useCaseId));
    }

    /// <summary>Whether a record's proof went stale: the status map or the record says so.</summary>
    public static bool IsStale(BookIndex index, string? recordId)
    {
        if (recordId is null)
        {
            return false;
        }

        if (index.ById.TryGetValue(recordId, out var record) && BookRender.IsTrue(record["stale"]))
        {
            return true;
        }

        return index.Status.TryGetPropertyValue(recordId, out var node)
            && node is JsonObject entry
            && BookRender.IsTrue(entry["stale"]);
    }

    /// <summary>One requirement's verification state from the requirement status map.</summary>
    public static RequirementState RequirementStateOf(BookIndex index, string? requirementId)
    {
        if (requirementId is null || !index.RequirementStatus.TryGetValue(requirementId, out var entry))
        {
            return new RequirementState(false, false, null, IsStale(index, requirementId));
        }

        return new RequirementState(
            true,
            BookRender.IsTrue(entry["verified"]),
            entry["measurePassed"] is JsonValue scalar && scalar.TryGetValue<bool>(out var passed) ? passed : (bool?)null,
            BookRender.IsTrue(entry["stale"]) || IsStale(index, requirementId));
    }

    /// <summary>The latest test run's date, or null when the model holds none.</summary>
    public static string? TestRunDate(BookIndex index)
    {
        var run = index.TestRun as JsonObject;
        return BookRender.StrProp(run, "date") ?? BookRender.StrProp(run, "finished");
    }

    /// <summary>One rule kind as a predicate: this rule is always true, holds across records, and so on.</summary>
    public static string RuleKindWords(string? kind) =>
        kind switch
        {
            "invariant" => "is always true",
            "precondition" => "is checked before the use case runs",
            "calculation" => "is computed as stated",
            "cross-aggregate" => "holds across records",
            "atomicity" => "explains why one write covers several records",
            "reservation" => "holds something until its release",
            "commercial-data" => "freezes commercial facts as stated",
            "default" => "sets the starting value",
            { Length: > 0 } other => $"is {other}",
            _ => "",
        };

    /// <summary>One data classification in plain handling words for reviewers.</summary>
    public static string HandlingWords(string? classification) =>
        classification switch
        {
            "public" => "Visible to everyone",
            "internal" => "Stays inside the product",
            "personal" => "Exported or deleted on request",
            "sensitive" => "Exported or deleted on request",
            { Length: > 0 } other => other,
            _ => "",
        };

    /// <summary>The use case a result or scenario belongs to, matched by home name.</summary>
    public static JsonObject? UseCaseOf(BookIndex index, string childId)
    {
        if (DerivedHolder(childId) is { } holder)
        {
            return (index.ByType.TryGetValue("use-case", out var derived) ? derived : [])
                .FirstOrDefault(useCase => SplitId(BookRender.StrProp(useCase, "id") ?? "").Name == holder);
        }

        var home = SplitId(childId).Home;
        if (home is null)
        {
            return null;
        }

        return (index.ByType.TryGetValue("use-case", out var cases) ? cases : [])
            .FirstOrDefault(useCase => SplitId(BookRender.StrProp(useCase, "id") ?? "").Name == home);
    }

    /// <summary>One record's why-chain: the steps from the record up to its goal.</summary>
    public static IReadOnlyList<WhyLink> WhyChain(BookIndex index, JsonObject record)
    {
        var chain = new List<WhyLink>();
        void Add(string label, string? id)
        {
            if (id is { Length: > 0 } && index.ById.ContainsKey(id))
            {
                chain.Add(new WhyLink(label, id));
            }
        }

        void AddTail(string? requirementId)
        {
            if (requirementId is null || !index.ById.TryGetValue(requirementId, out var requirement))
            {
                return;
            }

            Add("Requirement", requirementId);
            var feature = FirstLink(requirement, "feature");
            Add("Feature", feature);
            if (feature is not null && index.ById.TryGetValue(feature, out var featureRecord))
            {
                foreach (var goal in LinksOf(featureRecord, "serves"))
                {
                    Add("Goal", goal);
                }
            }
        }

        void AddUseCaseTail(string? useCaseId)
        {
            if (useCaseId is null || !index.ById.TryGetValue(useCaseId, out var useCase))
            {
                return;
            }

            Add("Use case", useCaseId);
            foreach (var rule in GoverningRules(index, useCaseId))
            {
                Add("Rule", rule);
            }

            AddTail(FirstLink(useCase, "fulfills"));
        }

        var type = BookRender.StrProp(record, "type");
        var id = BookRender.StrProp(record, "id") ?? "";
        if (type == "scenario")
        {
            var result = FirstLink(record, "result");
            Add("Result", result);
            AddUseCaseTail(result is null ? null : UseCaseOf(index, result) is { } owner ? BookRender.StrProp(owner, "id") : null);
        }
        else if (type == "result")
        {
            AddUseCaseTail(UseCaseOf(index, id) is { } owner ? BookRender.StrProp(owner, "id") : null);
        }
        else if (type == "use-case")
        {
            foreach (var rule in GoverningRules(index, id))
            {
                Add("Rule", rule);
            }

            AddTail(FirstLink(record, "fulfills"));
        }
        else if (type == "rule")
        {
            AddTail(FirstLink(record, "fulfills"));
        }
        else if (type == "requirement")
        {
            var feature = FirstLink(record, "feature");
            Add("Feature", feature);
            if (feature is not null && index.ById.TryGetValue(feature, out var featureRecord))
            {
                foreach (var goal in LinksOf(featureRecord, "serves"))
                {
                    Add("Goal", goal);
                }
            }
        }
        else if (type == "feature")
        {
            foreach (var goal in LinksOf(record, "serves"))
            {
                Add("Goal", goal);
            }

            foreach (var problem in LinksOf(record, "solves"))
            {
                Add("Problem", problem);
            }
        }

        return chain;
    }

    /// <summary>The rules governing one use case, through incoming governs links.</summary>
    public static IReadOnlyList<string> GoverningRules(BookIndex index, string useCaseId)
    {
        if (!index.Backlinks.TryGetValue(useCaseId, out var incoming))
        {
            return [];
        }

        return incoming
            .Where(link => link.Field == "governs" && index.ById.TryGetValue(link.From, out var from) && BookRender.StrProp(from, "type") == "rule")
            .Select(link => link.From)
            .OrderBy(from => from, StringComparer.Ordinal)
            .ToList();
    }

    /// <summary>The first examples table proving a calculation rule, with its scenario, or null.</summary>
    public static (JsonObject Scenario, JsonNode Examples)? CalculationExample(BookIndex index, JsonObject rule)
    {
        foreach (var governed in LinksOf(rule, "governs"))
        {
            if (!index.ById.TryGetValue(governed, out var target) || BookRender.StrProp(target, "type") != "use-case")
            {
                continue;
            }

            var children = UseCaseChildren(index, governed);
            foreach (var scenario in children.Scenarios)
            {
                var examples = BookRender.Fields(scenario)?["examples"];
                if (examples is JsonArray rows && rows.Count > 0)
                {
                    return (scenario, examples);
                }
            }
        }

        return null;
    }

    /// <summary>One goal's lens: its features with their requirements and verified share.</summary>
    public static GoalLensView? GoalLensOf(BookIndex index, string goalId)
    {
        if (!index.ById.TryGetValue(goalId, out var goal) || BookRender.StrProp(goal, "type") != "goal")
        {
            return null;
        }

        var features = new List<GoalFeature>();
        var verified = 0;
        var total = 0;
        var candidates = (index.ByType.TryGetValue("feature", out var found) ? found : [])
            .Where(feature => LinksOf(feature, "serves").Contains(goalId))
            .OrderBy(feature => SortTitle(feature), BookRender.LocaleComparer);
        foreach (var feature in candidates)
        {
            var featureId = BookRender.StrProp(feature, "id") ?? "";
            var requirements = (index.ByType.TryGetValue("requirement", out var required) ? required : [])
                .Where(requirement => LinksOf(requirement, "feature").Contains(featureId))
                .OrderBy(requirement => SortTitle(requirement), BookRender.LocaleComparer)
                .ToList();
            features.Add(new GoalFeature(feature, requirements));
            foreach (var requirement in requirements)
            {
                total += 1;
                if (RequirementStateOf(index, BookRender.StrProp(requirement, "id")).Verified)
                {
                    verified += 1;
                }
            }
        }

        return new GoalLensView(goal, features, verified, total);
    }

    /// <summary>One scenario's proof state as a reviewer sentence, with the last proof date when known.</summary>
    public static string ScenarioProofSentence(BookIndex index, string scenarioId)
    {
        var proof = ScenarioProof(index, scenarioId);
        var date = TestRunDate(index);
        var on = date is { Length: > 0 } ? $" on {date}" : "";
        return proof.State switch
        {
            "proved-passing" => $"Proven by a passing test{on}.",
            "proved-failing" => "A test proves it, but the test fails.",
            "proved-indirect" => $"Proven indirectly by a passing test{on}.",
            "awaiting-run" => "A test proves it; no test run yet.",
            _ => "No passing proof yet.",
        };
    }

    static string? FirstLink(JsonObject record, string field)
    {
        var links = BookRender.Links(record)?[field] as JsonArray ?? [];
        foreach (var target in links)
        {
            if (target is JsonValue scalar && scalar.TryGetValue<string>(out var id) && id is { Length: > 0 })
            {
                return id;
            }
        }

        return null;
    }

    static IReadOnlyList<string> LinksOf(JsonObject record, string field)
    {
        var links = BookRender.Links(record)?[field] as JsonArray ?? [];
        return links
            .Where(target => target is JsonValue scalar && scalar.TryGetValue<string>(out _))
            .Select(target => BookRender.Str(target))
            .Where(id => id.Length > 0)
            .ToList();
    }

    /// <summary>An actor's lens: its journeys, roles, permissions and the use cases they open.</summary>
    public static ActorLens ActorLens(BookIndex index, string actorId)
    {
        var journeys = new List<JsonObject>();
        foreach (var record in index.ByType.TryGetValue("journey", out var found) ? found : [])
        {
            var fields = BookRender.Fields(record);
            if (BookRender.StrProp(fields, "actor") == actorId)
            {
                journeys.Add(record);
                continue;
            }

            var steps = fields?["steps"] as JsonArray ?? [];
            if (steps.OfType<JsonObject>().Any(step => BookRender.StrProp(step, "actor") == actorId))
            {
                journeys.Add(record);
            }
        }

        var actor = index.ById.GetValueOrDefault(actorId);
        var holds = BookRender.Fields(actor)?["holds"] as JsonArray ?? [];
        var roles = new List<RoleHold>();
        var permissionIds = new HashSet<string>(StringComparer.Ordinal);
        foreach (var hold in holds.OfType<JsonObject>())
        {
            if (BookRender.StrProp(hold, "role") is not { } roleId)
            {
                continue;
            }

            var role = index.ById.GetValueOrDefault(roleId);
            roles.Add(new RoleHold(hold, role));
            var allows = BookRender.Links(role)?["allows"] as JsonArray ?? [];
            foreach (var id in allows)
            {
                if (id is JsonValue scalar && scalar.TryGetValue<string>(out var allowed) && allowed is not null)
                {
                    permissionIds.Add(allowed);
                }
            }
        }

        var permissions = permissionIds
            .Select(id => index.ById.GetValueOrDefault(id))
            .OfType<JsonObject>()
            .OrderBy(record => BookRender.PropText(record, "title"), BookRender.LocaleComparer)
            .ToList();
        var actorKind = BookRender.StrProp(BookRender.Fields(actor), "kind");
        var useCases = new List<JsonObject>();
        foreach (var record in index.ByType.TryGetValue("use-case", out var cases) ? cases : [])
        {
            if (ActorReaches(index, record, permissionIds, actorKind))
            {
                useCases.Add(record);
            }
        }

        useCases = useCases.OrderBy(record => BookRender.PropText(record, "title"), BookRender.LocaleComparer).ToList();
        return new ActorLens(journeys, roles, permissions, useCases);
    }

    /// <summary>Whether an actor reaches a use case: its grant names a held permission, or it is open.</summary>
    static bool ActorReaches(BookIndex index, JsonObject useCase, HashSet<string> permissionIds, string? actorKind)
    {
        var grant = (BookRender.Fields(useCase)?["access"] as JsonObject)?["grant"];
        var grantText = BookRender.Str(grant);
        if (grantText == "anonymous")
        {
            return true;
        }

        if (grantText == "system")
        {
            return actorKind == "system";
        }

        var access = BookRender.Links(useCase)?["access"] as JsonArray ?? [];
        foreach (var id in access)
        {
            if (id is JsonValue scalar && scalar.TryGetValue<string>(out var allowed) && allowed is not null && permissionIds.Contains(allowed))
            {
                return true;
            }
        }

        // A grant written inline as a permission id still opens the use case.
        return grantText.StartsWith("permission/", StringComparison.Ordinal) && permissionIds.Contains(grantText);
    }

    /// <summary>Collects the gaps, drafts and findings the review page shows.</summary>
    public static ReviewBundle ReviewData(BookIndex index, JsonNode? findingsFile, string generatedDate)
    {
        var today = generatedDate.Length >= 10 ? generatedDate[..10] : generatedDate;
        var gaps = new List<GapEntry>();
        foreach (var record in index.ByType.TryGetValue("known-gap", out var found) ? found : [])
        {
            var endsBy = BookRender.Fields(record)?["endsBy"];
            gaps.Add(new GapEntry(record, endsBy is JsonValue scalar && scalar.TryGetValue<string>(out var date) && string.CompareOrdinal(date, today) < 0));
        }

        gaps = gaps
            .OrderByDescending(gap => gap.Expired)
            .ThenBy(gap => BookRender.OrStr(BookRender.Fields(gap.Record)?["endsBy"], ""), BookRender.LocaleComparer)
            .ToList();
        var drafts = index.Records.OfType<JsonObject>().Where(record => BookRender.StrProp(record, "status") == "draft").ToList();
        var withDecider = drafts
            .Where(record => BookRender.IsTruthy(record["fields"]) && BookRender.IsTruthy(BookRender.Fields(record)?["decideBy"]))
            .OrderBy(record => BookRender.Str(BookRender.Fields(record)?["decideBy"]), BookRender.LocaleComparer)
            .ToList();
        var withoutDecider = drafts
            .Where(record => !(BookRender.IsTruthy(record["fields"]) && BookRender.IsTruthy(BookRender.Fields(record)?["decideBy"])))
            .OrderBy(record => BookRender.PropText(record, "id"), BookRender.LocaleComparer)
            .ToList();
        var questions = CollectQuestions(index);
        questions = questions
            .OrderBy(question => question.DecideBy ?? "", BookRender.LocaleComparer)
            .ThenBy(question => BookRender.PropText(question.Record, "id"), BookRender.LocaleComparer)
            .ToList();
        var file = findingsFile as JsonObject;
        return new ReviewBundle(
            gaps,
            withDecider,
            withoutDecider,
            questions,
            (file?["findings"] as JsonArray ?? []).Select(entry => entry as JsonObject).ToList(),
            (file?["known"] as JsonArray ?? []).Select(entry => entry as JsonObject).ToList());
    }

    /// <summary>Every open question on every record, with its ballot and tier.</summary>
    public static List<OpenQuestion> CollectQuestions(BookIndex index)
    {
        var questions = new List<OpenQuestion>();
        foreach (var record in index.Records.OfType<JsonObject>())
        {
            foreach (var entry in BookRender.Fields(record)?["questions"] as JsonArray ?? [])
            {
                if (entry is JsonObject question && BookRender.IsTruthy(question["question"]))
                {
                    questions.Add(new OpenQuestion(
                        record,
                        BookRender.Str(question["question"]),
                        BookRender.StrProp(question, "decider"),
                        BookRender.StrProp(question, "decideBy"),
                        BookRender.StrProp(question, "recommended"),
                        BookRender.StrProp(question, "ballot"),
                        TierOf(question, record)));
                }
            }
        }

        return questions;
    }

    /// <summary>One question's tier: its own tier, else 1 when its record carries risk, else 3.</summary>
    public static int TierOf(JsonObject question, JsonObject record)
    {
        if (question["tier"] is JsonValue scalar && scalar.TryGetValue<int>(out var tier) && (tier == 1 || tier == 3))
        {
            return tier;
        }

        if (question["tier"] is JsonValue words && words.TryGetValue<string>(out var text) && int.TryParse(text, out var parsed) && (parsed == 1 || parsed == 3))
        {
            return parsed;
        }

        return HasRisk(record) ? 1 : 3;
    }

    /// <summary>Whether a record carries any risk value.</summary>
    public static bool HasRisk(JsonObject record) =>
        BookRender.Fields(record)?["risk"] is JsonArray risks && risks.Count > 0;

    /// <summary>Whether a record carries one risk value, such as money.</summary>
    public static bool HasRiskValue(JsonObject record, string value)
    {
        foreach (var entry in BookRender.Fields(record)?["risk"] as JsonArray ?? [])
        {
            if (entry is JsonValue scalar && scalar.TryGetValue<string>(out var named) && named == value)
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>The auto-approval date: decideBy plus the veto window, or "" without a date.</summary>
    public static string AutoApprovalDate(BookIndex index, string? decideBy)
    {
        if (decideBy is not { Length: >= 10 })
        {
            return "";
        }

        if (!DateOnly.TryParse(decideBy[..10], out var date))
        {
            return "";
        }

        return date.AddDays(index.VetoWindowDays).ToString("yyyy-MM-dd");
    }

    /// <summary>Every open question grouped by ballot, ballots with tier 1 first.</summary>
    public static IReadOnlyList<BallotGroup> BallotsOf(BookIndex index)
    {
        const string none = "\u0000none";
        var groups = new Dictionary<string, List<OpenQuestion>>(StringComparer.Ordinal);
        var order = new List<string>();
        foreach (var question in CollectQuestions(index))
        {
            var key = question.Ballot is { Length: > 0 } ? question.Ballot : none;
            if (!groups.TryGetValue(key, out var list))
            {
                list = [];
                groups[key] = list;
                order.Add(key);
            }

            list.Add(question);
        }

        var ballots = new List<BallotGroup>();
        foreach (var key in order)
        {
            var sorted = groups[key]
                .OrderBy(question => question.Tier)
                .ThenBy(question => question.DecideBy ?? "", BookRender.LocaleComparer)
                .ThenBy(question => question.Question, BookRender.LocaleComparer)
                .ToList();
            ballots.Add(new BallotGroup(key == none ? null : key, sorted));
        }

        return ballots
            .OrderBy(ballot => ballot.Questions.Any(question => question.Tier == 1) ? 0 : 1)
            .ThenBy(ballot => ballot.Name ?? "\uffff", BookRender.LocaleComparer)
            .ToList();
    }

    /// <summary>The use cases serving one journey step id, such as journey/name#s1.</summary>
    public static IReadOnlyList<JsonObject> ServingUseCases(BookIndex index, string stepId)
    {
        var serving = new List<JsonObject>();
        foreach (var record in index.ByType.TryGetValue("use-case", out var cases) ? cases : [])
        {
            var serves = BookRender.Links(record)?["serves"] as JsonArray ?? [];
            foreach (var target in serves)
            {
                if (target is JsonValue scalar && scalar.TryGetValue<string>(out var id) && id == stepId)
                {
                    serving.Add(record);
                    break;
                }
            }
        }

        return serving
            .OrderBy(record => SortTitle(record), BookRender.LocaleComparer)
            .ToList();
    }

    /// <summary>The use cases serving any step of one journey.</summary>
    public static IReadOnlyList<JsonObject> JourneyUseCases(BookIndex index, JsonObject journey)
    {
        var journeyId = BookRender.StrProp(journey, "id") ?? "";
        var steps = new HashSet<string>(StringComparer.Ordinal);
        foreach (var step in BookRender.Fields(journey)?["steps"] as JsonArray ?? [])
        {
            if (step is JsonObject obj && BookRender.StrProp(obj, "id") is { } stepId)
            {
                steps.Add($"{journeyId}#{stepId}");
            }
        }

        var serving = new List<JsonObject>();
        foreach (var record in index.ByType.TryGetValue("use-case", out var cases) ? cases : [])
        {
            var serves = BookRender.Links(record)?["serves"] as JsonArray ?? [];
            if (serves.Any(target => target is JsonValue scalar && scalar.TryGetValue<string>(out var id) && id is not null && steps.Contains(id)))
            {
                serving.Add(record);
            }
        }

        return serving
            .OrderBy(record => SortTitle(record), BookRender.LocaleComparer)
            .ToList();
    }

    /// <summary>The requirements one journey fulfils, in title order.</summary>
    public static IReadOnlyList<JsonObject> JourneyRequirements(BookIndex index, JsonObject journey)
    {
        var ids = LinksOf(journey, "fulfills");
        return ids
            .Select(id => index.ById.GetValueOrDefault(id))
            .OfType<JsonObject>()
            .OrderBy(record => SortTitle(record), BookRender.LocaleComparer)
            .ToList();
    }
}

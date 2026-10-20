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

/// <summary>One case's proof state from its proves links.</summary>
/// <param name="State">The proof state key.</param>
/// <param name="Links">The enriched proves links.</param>
/// <param name="Claimed">Whether a test claims the case without holding the claim.</param>
sealed record CaseProofResult(string State, IReadOnlyList<ProofLink> Links, bool Claimed);

/// <summary>The results and cases that belong to one use case.</summary>
/// <param name="Results">The use case's results.</param>
/// <param name="Cases">The use case's cases.</param>
sealed record UseCaseKids(IReadOnlyList<JsonObject> Results, IReadOnlyList<JsonObject> Cases);

/// <summary>One use case's implementation state from the status map.</summary>
/// <param name="Implemented">Whether code implements the use case.</param>
/// <param name="Verified">Whether every case is proved by a passing test.</param>
sealed record UseCaseState(bool Implemented, bool Verified);

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

/// <summary>Everything the review page shows: gaps, drafts and check findings.</summary>
/// <param name="Gaps">The known gaps, expired first.</param>
/// <param name="WithDecider">The drafts with a decide-by date.</param>
/// <param name="WithoutDecider">The drafts without one.</param>
/// <param name="Findings">The check findings.</param>
/// <param name="Known">The findings covered by a known gap.</param>
sealed record ReviewBundle(
    IReadOnlyList<GapEntry> Gaps,
    IReadOnlyList<JsonObject> WithDecider,
    IReadOnlyList<JsonObject> WithoutDecider,
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

    /// <summary>Cases by home module name.</summary>
    public Dictionary<string, List<JsonObject>> CasesOf { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Implements links by target record id.</summary>
    public Dictionary<string, List<JsonObject>> ImplementsByTarget { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Calls links by target record id.</summary>
    public Dictionary<string, List<JsonObject>> CallsByTarget { get; init; } = new(StringComparer.Ordinal);

    /// <summary>Proves links by case id.</summary>
    public Dictionary<string, List<JsonObject>> ProvesByCase { get; init; } = new(StringComparer.Ordinal);

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

    /// <summary>The latest test run, or null when the model holds none.</summary>
    public JsonNode? TestRun { get; set; }
}

/// <summary>
///     The index over model.json for the book generator. Pure data shaping, no HTML.
/// </summary>
static class BookModel
{
    /// <summary>The navigation layers, in display order.</summary>
    public static readonly IReadOnlyList<BookLayer> Layers =
    [
        new("Why", ["product", "constraint", "research", "decision", "requirement"]),
        new("Problems and features", ["problem", "feature"]),
        new("People", ["actor", "role", "permission"]),
        new("Journeys", ["journey"]),
        new("How the business works", ["module", "business-record", "rule", "use-case", "result", "case", "event"]),
        new("Entry points", ["entry-point"]),
        new("Running it", ["limit", "runbook"]),
        new("How we build", ["standard", "exception", "known-gap"]),
        new("Terms", ["term"]),
    ];

    static readonly IReadOnlyDictionary<string, (string One, string Many)> TypeLabels =
        new Dictionary<string, (string One, string Many)>(StringComparer.Ordinal)
        {
            ["product"] = ("Product", "Products"),
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
            ["business-record"] = ("Business record", "Business records"),
            ["rule"] = ("Rule", "Rules"),
            ["use-case"] = ("Use case", "Use cases"),
            ["result"] = ("Result", "Results"),
            ["case"] = ("Case", "Cases"),
            ["event"] = ("Event", "Events"),
            ["entry-point"] = ("Entry point", "Entry points"),
            ["limit"] = ("Limit", "Limits"),
            ["runbook"] = ("Runbook", "Runbooks"),
            ["standard"] = ("Standard", "Standards"),
            ["exception"] = ("Exception", "Exceptions"),
            ["known-gap"] = ("Known gap", "Known gaps"),
            ["term"] = ("Term", "Terms"),
        };

    /// <summary>The outgoing link fields, in display order with their headings.</summary>
    public static readonly IReadOnlyList<(string Field, string Label)> LinkLabels =
    [
        ("decides", "Decides"),
        ("basedOn", "Based on"),
        ("affects", "Affects"),
        ("solves", "Solves"),
        ("fulfills", "Fulfills"),
        ("governs", "Governs"),
        ("raises", "Raises"),
        ("reactsTo", "Reacts to"),
        ("allows", "Allows"),
        ("needs", "Needs"),
        ("reachedThrough", "Reached through"),
        ("dependsOn", "Depends on"),
        ("terms", "Terms"),
        ("result", "Illustrates"),
        ("offers", "Offers"),
        ("runbook", "Runbook"),
        ("limit", "Limit"),
        ("subject", "About"),
        ("replaces", "Replaces"),
        ("refusal", "Refusal"),
        ("standard", "Standard"),
    ];

    /// <summary>The incoming link headings by field.</summary>
    public static readonly IReadOnlyDictionary<string, string> LinkInverseLabels =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["decides"] = "Decided by",
            ["basedOn"] = "Basis for",
            ["affects"] = "Problems affecting this",
            ["solves"] = "Solved by",
            ["fulfills"] = "Fulfilled by",
            ["governs"] = "Governed by",
            ["raises"] = "Raised by",
            ["reactsTo"] = "Reactions",
            ["allows"] = "Allowed by",
            ["needs"] = "Needed by",
            ["reachedThrough"] = "Entry for",
            ["dependsOn"] = "Depended on by",
            ["terms"] = "Used by",
            ["result"] = "Illustrated by",
            ["offers"] = "Offered by",
            ["runbook"] = "Runbook for",
            ["limit"] = "Limit for",
            ["subject"] = "Known gaps",
            ["replaces"] = "Replaced by",
            ["refusal"] = "Refusal for",
            ["standard"] = "Exceptions",
        };

    /// <summary>The record types in precedence order.</summary>
    public static readonly IReadOnlyList<string> Precedence = ["constraint", "product", "requirement", "rule", "use-case"];

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

    /// <summary>The record URL: the id with "/" and "." mapped to path segments.</summary>
    public static string RecordUrl(string id)
    {
        var slash = id.IndexOf('/');
        if (slash < 0)
        {
            return "index.html";
        }

        return $"{id[..slash]}/{id[(slash + 1)..].Replace(".", "/")}.html";
    }

    /// <summary>The URL of a record type's index page.</summary>
    public static string TypeIndexUrl(string type) => $"{type}/index.html";

    /// <summary>The URL of an actor's lens page.</summary>
    public static string LensUrl(string actorId)
    {
        var slash = actorId.IndexOf('/');
        var name = slash < 0 ? actorId : actorId[(slash + 1)..];
        return $"lens/{name}.html";
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
                    }
                }
            }
        }

        foreach (var record in records.OfType<JsonObject>())
        {
            var type = BookRender.StrProp(record, "type");
            if (type != "result" && type != "case")
            {
                continue;
            }

            if (BookRender.StrProp(record, "id") is not { } id || SplitId(id).Home is not { } home)
            {
                continue;
            }

            var map = type == "result" ? index.ResultsOf : index.CasesOf;
            if (!map.TryGetValue(home, out var list))
            {
                list = [];
                map[home] = list;
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
            if (link is JsonObject obj && BookRender.StrProp(obj, "case") is { } kase)
            {
                if (!index.ProvesByCase.TryGetValue(kase, out var list))
                {
                    list = [];
                    index.ProvesByCase[kase] = list;
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
        index.TestRun = model["testRun"] is { } run && BookRender.IsTruthy(run) && run is JsonObject or JsonArray ? run : null;

        return index;
    }

    /// <summary>One case's proof state from its proves links.</summary>
    public static CaseProofResult CaseProof(BookIndex index, string caseId)
    {
        var links = index.ProvesByCase.TryGetValue(caseId, out var found) ? found : [];
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

        return new CaseProofResult(state, enriched, links.Count > 0 && confirmed.Count == 0);
    }

    /// <summary>The results and cases that belong to one use case.</summary>
    public static UseCaseKids UseCaseChildren(BookIndex index, string useCaseId)
    {
        var name = SplitId(useCaseId).Name;
        return new UseCaseKids(
            index.ResultsOf.TryGetValue(name, out var results) ? results : [],
            index.CasesOf.TryGetValue(name, out var cases) ? cases : []);
    }

    /// <summary>One use case's implementation state from the status map.</summary>
    public static UseCaseState UseCaseStatus(BookIndex index, string? useCaseId)
    {
        var entry = useCaseId is not null && index.Status.TryGetPropertyValue(useCaseId, out var node) ? node as JsonObject : null;
        if (entry is null)
        {
            return new UseCaseState(false, false);
        }

        return new UseCaseState(BookRender.IsTrue(entry["implemented"]), BookRender.IsTrue(entry["verified"]));
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
        var useCases = new List<JsonObject>();
        foreach (var record in index.ByType.TryGetValue("use-case", out var cases) ? cases : [])
        {
            var needs = BookRender.Links(record)?["needs"] as JsonArray ?? [];
            if (needs.Any(id => id is JsonValue scalar && scalar.TryGetValue<string>(out var need) && need is not null && permissionIds.Contains(need)))
            {
                useCases.Add(record);
            }
        }

        useCases = useCases.OrderBy(record => BookRender.PropText(record, "title"), BookRender.LocaleComparer).ToList();
        return new ActorLens(journeys, roles, permissions, useCases);
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
        var file = findingsFile as JsonObject;
        return new ReviewBundle(
            gaps,
            withDecider,
            withoutDecider,
            (file?["findings"] as JsonArray ?? []).Select(entry => entry as JsonObject).ToList(),
            (file?["known"] as JsonArray ?? []).Select(entry => entry as JsonObject).ToList());
    }
}

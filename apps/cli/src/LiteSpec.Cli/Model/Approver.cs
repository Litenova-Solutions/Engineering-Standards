using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace LiteSpec.Model;

/// <summary>
///     Writes approval data onto records: who approved or reviewed each one, when, and the
///     semantic hash of what they approved, so a later change inside it reopens the approval.
/// </summary>
static class Approver
{
    static readonly JsonSerializerOptions Write = new()
    {
        WriteIndented = true,
        IndentSize = 2,
        NewLine = "\n",
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    /// <summary>
    ///     Computes the approval hash over the record's semantic frontmatter fields.
    ///     The hash covers every written field except identity, workflow and approval
    ///     data (<c>type</c>, <c>id</c>, <c>title</c>, <c>owner</c>, <c>status</c>,
    ///     <c>decider</c>, <c>decideBy</c>, <c>approvedBy</c>, <c>approvedOn</c>,
    ///     <c>approvedHash</c> and <c>source</c>), canonicalized and hashed to eight hex
    ///     characters. Page prose bodies and rendered consequences summaries never feed
    ///     the hash, so rewording prose reopens no approval. The semantic fields per
    ///     record type include: product (boundary, neverDoes, audience); goal
    ///     (statement, measure, target, by); problem (affects, statement); feature
    ///     (state, refusedBecause, solves, by); requirement (kind, statement, values,
    ///     measure, by, except, setBy, risk); constraint (source, category, applies,
    ///     appliesBecause); decision (options, changeWhen, decided, chosen, decides);
    ///     research (sources, question); journey (actor, goal, finishedWhen, steps,
    ///     fulfills); actor (kind); term (term, meaning, layer, aliases); module
    ///     (dependsOn); aggregate (kind, states, transitions, data, dataClasses, steps,
    ///     exits, finishedWhen, driver, cursor, owner); rule (kind, statement, governs,
    ///     refusal, releasedBy, frozenWhen, historyLink, computedBy); use-case (kind,
    ///     serves, fulfills, access, reachedThrough, input, output, paging,
    ///     builtAsynchronously, changes, reads, consistency, effects, raises,
    ///     idempotency, audit, risk); result (outcome, code, meaning, recorded, codes);
    ///     scenario (given, when, then, result, examples); event (meaning, carries);
    ///     integration-event (direction, eventType, source, subject, payload, audience,
    ///     trust, correlation, translates); reaction (on, if, issues, sends, forEach,
    ///     reads, fulfills, serves, idempotency, onFailure, onExhausted); job (kind,
    ///     schedule, scope, batchSize, lease, issues, reads, serviceLevel, evidence,
    ///     runbook, runsWhere, guard, cursor, fulfills, serves, onFailure,
    ///     idempotency); notification (template, audience, channel, consent, frequency,
    ///     dedupKey, params, locale, suppressedWhen, claims, fulfills, sender); setting
    ///     (valueType, default, range, unit, setBy, atBound, secret, meaning, runbook,
    ///     fulfills); role (scope, allows); permission (meaning); entry-point (kind,
    ///     auth, path, contentType, cacheControl, versioning, fulfills, protocol);
    ///     external-system (actor, operations, erasure, acceptedBy); runbook (trigger,
    ///     steps); deviation (provision, reason, reviewBy, removeWhen); known-gap
    ///     (check, subject, endsBy, reason); plus questions, terms and replaces where a
    ///     record carries them.
    /// </summary>
    public static string SemanticHash(Record record) => Checker.SemanticHash(record);

    /// <summary>
    ///     Plans an approval without writing: each target with no approvedHash, or whose
    ///     semantic fields no longer match it. Returns the record with its reason: either
    ///     <c>no approvedHash</c> or <c>approvedHash differs</c>.
    /// </summary>
    public static IReadOnlyList<(Record Record, string Reason)> DryRun(IReadOnlyList<Record> targets)
    {
        var planned = new List<(Record, string)>();

        foreach (var record in targets)
        {
            if (record.ApprovedHash is not { Length: > 0 })
            {
                planned.Add((record, "no approvedHash"));
            }
            else if (SemanticHash(record) != record.ApprovedHash)
            {
                planned.Add((record, "approvedHash differs"));
            }
        }

        return planned;
    }

    /// <summary>
    ///     Stamps each record: approvedBy and approvedOn when missing, and approvedHash always.
    ///     Returns the records stamped and the ids no written record holds.
    /// </summary>
    public static (IReadOnlyList<Record> Stamped, IReadOnlyList<string> Missing) Approve(
        ProjectModel model, IReadOnlyList<Record> targets, string? by, string on)
    {
        var stamped = new List<Record>();
        var missing = new List<string>();

        foreach (var group in targets.GroupBy(record => record.File, StringComparer.OrdinalIgnoreCase))
        {
            var text = File.ReadAllText(group.Key);
            var json = group.Key.EndsWith(".json", StringComparison.OrdinalIgnoreCase);
            var (head, node, tail) = json ? ("", JsonNode.Parse(text), "") : SplitFrontmatter(text);

            if (node is null)
            {
                missing.AddRange(group.Select(record => record.Id));
                continue;
            }

            foreach (var record in group)
            {
                if (Find(node, record.Id) is not JsonObject target)
                {
                    missing.Add(record.Id);
                    continue;
                }

                if (target["approvedBy"] is null)
                {
                    target["approvedBy"] = by ?? record.Decider ?? record.Owner ?? "unknown";
                }

                if (target["approvedOn"] is null)
                {
                    target["approvedOn"] = on;
                }

                target["approvedHash"] = SemanticHash(record);
                stamped.Add(record);
            }

            var serialized = node.ToJsonString(Write);
            File.WriteAllText(group.Key, json ? serialized + "\n" : head + serialized + tail);
        }

        return (stamped, missing);
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

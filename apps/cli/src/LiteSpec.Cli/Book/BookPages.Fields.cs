using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace LiteSpec.Book;

/// <summary>Record-field rendering for the book generator: labels, order and value tables.</summary>
static partial class BookPages
{
    static readonly IReadOnlyDictionary<string, string> FieldLabels =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["boundary"] = "Boundary", ["neverDoes"] = "Never does", ["audience"] = "Audience",
            ["source"] = "Source", ["category"] = "Category", ["applies"] = "Applies", ["appliesBecause"] = "Why it applies",
            ["question"] = "Question", ["sources"] = "Sources", ["decided"] = "Decided",
            ["options"] = "Options", ["chosen"] = "Chosen", ["changeWhen"] = "Change when",
            ["kind"] = "Kind", ["statement"] = "Statement", ["rationale"] = "Rationale",
            ["measure"] = "Measure", ["target"] = "Target", ["by"] = "By", ["values"] = "Values",
            ["conditions"] = "Conditions", ["check"] = "Check", ["runsOn"] = "Runs on", ["evidence"] = "Evidence",
            ["except"] = "Except", ["fallback"] = "Fallback", ["setBy"] = "Set by", ["risk"] = "Risk",
            ["state"] = "State", ["refusedBecause"] = "Why refused",
            ["scope"] = "Scope", ["code"] = "Code", ["codes"] = "Codes", ["meaning"] = "Meaning", ["recorded"] = "Recorded",
            ["goal"] = "Goal", ["finishedWhen"] = "Finished when", ["actor"] = "Actor", ["dependsOn"] = "Depends on",
            ["summary"] = "Summary", ["states"] = "States", ["transitions"] = "Transitions", ["data"] = "Data",
            ["dataClasses"] = "Data classes", ["steps"] = "Steps", ["exits"] = "Exits", ["driver"] = "Driver", ["cursor"] = "Cursor",
            ["refusal"] = "Refusal", ["questions"] = "Open questions",
            ["input"] = "Input", ["output"] = "Output", ["paging"] = "Paging", ["builtAsynchronously"] = "Built asynchronously",
            ["changes"] = "Changes", ["reads"] = "Reads", ["consistency"] = "Consistency", ["effects"] = "Effects",
            ["idempotency"] = "Idempotency", ["audit"] = "Audit", ["access"] = "Access", ["computedBy"] = "Computed by",
            ["on"] = "On", ["if"] = "Skip when", ["issues"] = "Issues", ["sends"] = "Sends", ["publishes"] = "Publishes",
            ["calls"] = "Calls", ["forEach"] = "For each", ["onFailure"] = "On failure", ["onExhausted"] = "When exhausted",
            ["outcome"] = "Outcome",
            ["given"] = "Given", ["when"] = "When", ["then"] = "Then", ["examples"] = "Examples",
            ["carries"] = "Carries", ["path"] = "Path", ["contentType"] = "Content type", ["cacheControl"] = "Cache", ["versioning"] = "Versioning",
            ["receives"] = "Receives", ["failure"] = "On failure", ["operations"] = "Operations", ["erasure"] = "Erasure", ["acceptedBy"] = "Accepted by",
            ["direction"] = "Direction", ["eventType"] = "Event type", ["subject"] = "Subject", ["payload"] = "Payload",
            ["trust"] = "Trust", ["correlation"] = "Correlation", ["translates"] = "Translates",
            ["template"] = "Template", ["channel"] = "Channel", ["consent"] = "Consent", ["frequency"] = "Frequency",
            ["dedupKey"] = "Dedup key", ["params"] = "Params", ["locale"] = "Locale", ["suppressedWhen"] = "Suppressed when", ["claims"] = "Claims",
            ["schedule"] = "Schedule", ["batchSize"] = "Batch size", ["lease"] = "Lease", ["serviceLevel"] = "Service level",
            ["runsWhere"] = "Runs where", ["guard"] = "Guard",
            ["valueType"] = "Value type", ["default"] = "Default", ["range"] = "Range", ["unit"] = "Unit", ["atBound"] = "At bound", ["secret"] = "Secret",
            ["releasedBy"] = "Released by", ["frozenWhen"] = "Frozen when", ["historyLink"] = "History",
            ["value"] = "Value", ["trigger"] = "Trigger", ["severity"] = "Severity",
            ["reason"] = "Reason", ["reviewBy"] = "Review by", ["removeWhen"] = "Remove when",
            ["endsBy"] = "Ends by",
            ["term"] = "English", ["labels"] = "Labels", ["rejected"] = "Rejected words", ["aliases"] = "Also called", ["layer"] = "Layer",
            ["broader"] = "Broader", ["narrower"] = "Narrower", ["mannered"] = "Mannered",
            ["decider"] = "Decider", ["decideBy"] = "Decide by", ["owner"] = "Owner",
            ["approvedBy"] = "Approved by", ["approvedOn"] = "Approved on", ["approvedHash"] = "Approval hash",
        };

    static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> FieldOrder =
        new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal)
        {
            ["product"] = ["boundary", "neverDoes", "audience"],
            ["goal"] = ["statement", "measure", "target", "by"],
            ["constraint"] = ["source", "category", "applies", "appliesBecause"],
            ["research"] = ["question", "sources"],
            ["decision"] = ["decided", "options", "chosen", "changeWhen"],
            ["requirement"] = ["kind", "statement", "rationale", "measure", "target", "by", "conditions", "check", "runsOn", "evidence", "values", "except", "setBy", "risk"],
            ["problem"] = ["statement"],
            ["feature"] = ["state", "by", "refusedBecause"],
            ["actor"] = ["kind", "holds"],
            ["role"] = ["scope"],
            ["permission"] = ["meaning"],
            ["journey"] = ["goal", "finishedWhen", "steps"],
            ["module"] = ["summary", "risk", "source"],
            ["aggregate"] = ["summary", "kind", "states", "transitions", "data", "dataClasses", "steps", "exits", "finishedWhen", "driver", "cursor", "risk", "source"],
            ["rule"] = ["kind", "statement", "releasedBy", "frozenWhen", "historyLink"],
            ["use-case"] = ["kind", "access", "input", "output", "paging", "builtAsynchronously", "consistency", "effects", "idempotency", "audit", "risk", "source"],
            ["result"] = ["outcome", "code", "codes", "meaning", "recorded"],
            ["scenario"] = ["given", "when", "then", "examples"],
            ["event"] = ["meaning", "carries"],
            ["integration-event"] = ["direction", "eventType", "source", "subject", "payload", "audience", "trust", "correlation", "risk"],
            ["reaction"] = ["if", "forEach", "idempotency", "onFailure", "onExhausted", "risk", "source"],
            ["job"] = ["kind", "schedule", "scope", "batchSize", "lease", "serviceLevel", "evidence", "runsWhere", "guard", "cursor", "onFailure", "onExhausted", "idempotency", "risk", "source"],
            ["notification"] = ["template", "audience", "channel", "consent", "frequency", "dedupKey", "params", "locale", "suppressedWhen", "claims", "risk", "source"],
            ["setting"] = ["valueType", "meaning", "default", "range", "unit", "setBy", "atBound", "secret", "risk", "source"],
            ["entry-point"] = ["kind", "path", "contentType", "cacheControl", "versioning"],
            ["external-system"] = ["sends", "receives", "failure", "operations", "erasure", "risk", "source"],
            ["runbook"] = ["trigger", "severity", "risk", "source"],
            ["deviation"] = ["reason", "reviewBy", "removeWhen"],
            ["known-gap"] = ["check", "endsBy", "reason"],
            ["term"] = ["term", "meaning", "layer", "labels", "aliases", "rejected", "broader", "narrower", "values", "mannered"],
        };

    static readonly IReadOnlySet<string> SkipFields = new HashSet<string>(StringComparer.Ordinal)
    {
        "type", "id", "title", "owner", "status", "records",
        "decides", "basedOn", "affects", "solves", "serves", "feature", "fulfills", "governs", "raises",
        "allows", "reachedThrough", "dependsOn", "terms",
        "result", "runbook", "subject", "replaces", "provision", "refusal",
        "actor",
        "issues", "sends", "publishes", "calls", "on", "changes", "reads", "translates",
        "acceptedBy", "fallback", "releasedBy", "computedBy", "enforcedBy", "effects", "access",
        "except", "dataClasses",
        "implemented", "verified", "stale", "reachable", "effectiveStatus",
    };

    /// <summary>Fields a dedicated page section renders instead of the generic field table.</summary>
    static readonly IReadOnlyDictionary<string, IReadOnlySet<string>> SectionFields =
        new Dictionary<string, IReadOnlySet<string>>(StringComparer.Ordinal)
        {
            ["aggregate"] = new HashSet<string>(StringComparer.Ordinal) { "states", "transitions", "data", "dataClasses", "steps", "exits" },
            ["scenario"] = new HashSet<string>(StringComparer.Ordinal) { "given", "when", "then", "examples" },
            ["journey"] = new HashSet<string>(StringComparer.Ordinal) { "goal", "finishedWhen", "steps", "questions" },
        };

    /// <summary>Fields holding check names and codes, shown to developers only.</summary>
    static readonly IReadOnlySet<string> DevOnlyFields = new HashSet<string>(StringComparer.Ordinal)
    {
        "code", "codes", "check", "approvedHash",
    };

    static readonly IReadOnlySet<string> IdFields = new HashSet<string>(StringComparer.Ordinal)
        { "actor", "result", "refusal", "provision", "runbook", "fallback", "translates", "audience" };

    static readonly IReadOnlySet<string> IdListFields = new HashSet<string>(StringComparer.Ordinal)
        { "audience", "broader", "narrower", "refusal", "provision", "issues", "sends", "publishes", "changes", "reads", "computedBy" };

    static bool IsNumber(JsonNode? value) =>
        value is JsonValue scalar && scalar.GetValueKind() == System.Text.Json.JsonValueKind.Number;

    static string IdList(BookIndex index, string rel, JsonNode? value)
    {
        var ids = value is JsonArray items ? items.ToList() : [value];
        var links = ids
            .Where(id => id is JsonValue scalar && scalar.TryGetValue<string>(out _))
            .Select(id => BookRender.Str(id))
            .ToList();
        if (links.Count == 0)
        {
            return "";
        }

        if (links.Count == 1)
        {
            return BookRender.RecordLink(index, rel, links[0]);
        }

        return $"<ul class=\"links\">{string.Concat(links.Select(id => $"<li>{BookRender.RecordLink(index, rel, id)}</li>"))}</ul>";
    }

    static string RenderFieldValue(BookIndex index, string rel, string field, JsonNode? value)
    {
        if (value is null || (value is JsonValue empty && empty.TryGetValue<string>(out var blank) && blank is { Length: 0 }))
        {
            return "";
        }

        if (value is JsonValue boolean && boolean.TryGetValue<bool>(out var flag))
        {
            return flag ? "Yes" : "No";
        }

        if (IsNumber(value))
        {
            return BookRender.Esc(value);
        }

        if (field == "trigger")
        {
            return RenderTrigger(index, rel, value);
        }

        if (field == "examples")
        {
            return RenderExamples(value);
        }

        if (field == "questions")
        {
            return RenderQuestions(index, value);
        }

        if (field == "except")
        {
            return RenderExcept(index, rel, value);
        }

        if (field == "access")
        {
            return RenderAccess(index, rel, value);
        }

        if (field == "output")
        {
            return RenderOutput(index, rel, value);
        }

        if (field == "effects")
        {
            return RenderEffects(index, rel, value);
        }

        if (field == "consistency")
        {
            return RenderConsistency(index, rel, value);
        }

        if (field == "idempotency")
        {
            return RenderIdempotency(value);
        }

        if (field == "audit")
        {
            return RenderAudit(value);
        }

        if (field == "paging")
        {
            return RenderPaging(value);
        }

        if (field == "dataClasses")
        {
            return RenderDataClasses(index, rel, value);
        }

        if (field == "claims")
        {
            return RenderClaims(index, rel, value);
        }

        if (field == "payload")
        {
            return RenderPayload(value);
        }

        if (field == "operations")
        {
            return RenderOperations(value);
        }

        if (value is JsonValue text && text.TryGetValue<string>(out var str))
        {
            var content = str ?? "";
            if ((field == "source" || field == "evidence") && (content.StartsWith("http://", StringComparison.Ordinal) || content.StartsWith("https://", StringComparison.Ordinal)))
            {
                return $"<a href=\"{BookRender.Esc(content)}\">{BookRender.Esc(content)}</a>";
            }

            if (IdFields.Contains(field))
            {
                return BookRender.RecordLink(index, rel, content);
            }

            if (field is "releasedBy" or "enforcedBy" or "driver" or "cursor" or "erasure")
            {
                return RenderMaybeId(index, rel, content);
            }

            if (field is "code" or "dedupKey" or "eventType")
            {
                return $"<code>{BookRender.Esc(content)}</code>";
            }

            return BookRender.Esc(content);
        }

        if (value is JsonArray list)
        {
            if (list.Count == 0)
            {
                return "";
            }

            var hasObjects = list.Any(entry => entry is JsonObject or JsonArray);
            if (field == "options")
            {
                if (hasObjects)
                {
                    var rows = string.Concat(list.Select(entry =>
                    {
                        var obj = entry as JsonObject;
                        return $"<tr><td>{BookRender.EscOr(obj?["name"], "")}</td><td>{BookRender.EscOr(obj?["for"], "")}</td><td>{BookRender.EscOr(obj?["against"], "")}</td></tr>";
                    }));
                    return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Option</th><th>For</th><th>Against</th></tr></thead><tbody>{rows}</tbody></table></div>";
                }

                return $"<ol class=\"plain\">{string.Concat(list.Select(item => $"<li>{BookRender.Esc(item)}</li>"))}</ol>";
            }

            if (field == "states" && hasObjects)
            {
                return StatesTable(list);
            }

            if (field == "transitions" && hasObjects)
            {
                var rows = string.Concat(list.Select(entry =>
                {
                    var obj = entry as JsonObject;
                    var by = BookRender.StrProp(obj, "by") is { } byId ? BookRender.RecordLink(index, rel, byId) : "";
                    return $"<tr><td>{BookRender.EscOr(obj?["from"], "")}</td><td>{BookRender.EscOr(obj?["to"], "")}</td><td>{by}</td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>From</th><th>To</th><th>Triggered By</th></tr></thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "data" && hasObjects)
            {
                return DataTable(list);
            }

            if (field == "sources" && hasObjects)
            {
                return $"<ul class=\"links\">{string.Concat(list.Select(entry => RenderSource(entry)))}</ul>";
            }

            if (field == "values" && hasObjects)
            {
                var rows = string.Concat(list.Select(RenderValueRow));
                var head = list.Any(entry => entry is JsonObject obj && obj.ContainsKey("value"))
                    ? "<tr><th>Value</th><th>Effective From</th></tr>"
                    : "<tr><th>Code</th><th>Label</th></tr>";
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead>{head}</thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "input" && hasObjects)
            {
                var rows = string.Concat(list.Select(entry =>
                {
                    if (entry is JsonObject obj)
                    {
                        var rules = obj["rules"] is JsonArray bounds
                            ? string.Join("; ", bounds.Select(BookRender.Str).Where(part => part.Length > 0))
                            : BookRender.Str(obj["rules"]);
                        var handling = BookModel.HandlingWords(BookRender.StrProp(obj, "classification"));
                        return $"<tr><td><code>{BookRender.EscOr(obj["name"], "")}</code></td><td>{BookRender.EscOr(obj["meaning"], "")}</td>"
                            + $"<td>{BookRender.Esc(rules)}</td><td>{BookRender.EscOr(obj["source"], "")}</td><td>{BookRender.Esc(handling)}</td></tr>";
                    }

                    return $"<tr><td>{BookRender.Esc(entry)}</td><td></td><td></td><td></td><td></td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Name</th><th>Meaning</th><th>Rules</th><th>Source</th><th>Handling</th></tr></thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "output" && hasObjects)
            {
                return RenderOutput(index, rel, value);
            }

            if (field == "holds" && hasObjects)
            {
                var rows = string.Concat(list.Select(entry =>
                {
                    if (entry is JsonObject or JsonArray)
                    {
                        var obj = entry as JsonObject;
                        var role = obj?["role"] is JsonValue roleValue && roleValue.TryGetValue<string>(out var roleId) && roleId is not null
                            ? BookRender.RecordLink(index, rel, roleId)
                            : BookRender.EscOr(obj?["role"], "");
                        return $"<tr><td>{role}</td><td>{BookRender.EscOr(obj?["scope"], "")}</td></tr>";
                    }

                    return $"<tr><td>{BookRender.Esc(entry)}</td><td></td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Role</th><th>Scope</th></tr></thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "steps" && hasObjects)
            {
                // A journey step says a product sentence; a process step names its undo.
                if (list.OfType<JsonObject>().Any(step => step.ContainsKey("says")))
                {
                    return RenderJourneySteps(index, rel, list);
                }

                var rows = string.Concat(list.Select(entry =>
                {
                    var obj = entry as JsonObject;
                    var compensation = BookRender.StrProp(obj, "compensation") is { } undo
                        ? RenderMaybeId(index, rel, undo)
                        : "";
                    return $"<tr><td>{BookRender.EscOr(obj?["name"], "")}</td><td>{BookRender.EscOr(obj?["when"], "")}</td><td>{compensation}</td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Step</th><th>When</th><th>Undo</th></tr></thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "exits" && hasObjects)
            {
                var rows = string.Concat(list.Select(entry =>
                {
                    var obj = entry as JsonObject;
                    return $"<tr><td>{BookRender.EscOr(obj?["name"], "")}</td><td>{BookRender.EscOr(obj?["trigger"], "")}</td><td>{BookRender.EscOr(obj?["then"], "")}</td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Exit</th><th>Trigger</th><th>Then</th></tr></thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "driver")
            {
                var items = string.Concat(list.Select(entry =>
                {
                    var text = BookRender.Str(entry);
                    return $"<li>{RenderMaybeId(index, rel, text)}</li>";
                }));
                return $"<ul class=\"links\">{items}</ul>";
            }

            if (field == "codes")
            {
                return string.Join(", ", list.Select(item => $"<code>{BookRender.Esc(item)}</code>"));
            }

            if (field == "labels" && list.Count > 0 && !(list[0] is JsonValue candidate && candidate.TryGetValue<string>(out _)))
            {
                return "";
            }

            if (field == "settings" || list.OfType<JsonObject>().Any(entry => entry.ContainsKey("valueType")))
            {
                return RenderSettings(list);
            }

            if (list.All(item => item is JsonValue scalar && scalar.TryGetValue<string>(out _)))
            {
                if (IdListFields.Contains(field))
                {
                    return IdList(index, rel, value);
                }

                if (list.Count <= 3)
                {
                    return string.Join(", ", list.Select(BookRender.Esc));
                }

                return $"<ul class=\"plain\">{string.Concat(list.Select(item => $"<li>{BookRender.Esc(item)}</li>"))}</ul>";
            }

            return PlainBlock(value);
        }

        if (value is JsonObject objValue)
        {
            if (field == "labels")
            {
                var rows = string.Concat(objValue.Select(pair => $"<tr><td>{BookRender.Esc(pair.Key)}</td><td>{BookRender.Esc(pair.Value)}</td></tr>"));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Language</th><th>Label</th></tr></thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "rejected")
            {
                return "";
            }

            return PlainBlock(value);
        }

        return "";
    }

    /// <summary>Renders a reaction or runbook trigger: event links plus schedule words.</summary>
    static string RenderTrigger(BookIndex index, string rel, JsonNode? value)
    {
        var entries = value is JsonArray list ? list.ToList() : [value];
        var parts = new List<string>();
        foreach (var entry in entries)
        {
            if (entry is JsonObject trigger)
            {
                var words = new List<string>();
                if (BookRender.StrProp(trigger, "event") is { } eventId)
                {
                    words.Add(BookRender.RecordLink(index, rel, eventId));
                }

                foreach (var key in new[] { "schedule", "deadline", "every", "at", "when" })
                {
                    if (BookRender.IsTruthy(trigger[key]))
                    {
                        words.Add(BookRender.Esc(trigger[key]));
                    }
                }

                if (words.Count > 0)
                {
                    parts.Add(string.Join(" ", words));
                }
                else
                {
                    parts.Add(PlainCell(entry));
                }

                continue;
            }

            var text = BookRender.Str(entry);
            if (text.Length == 0)
            {
                continue;
            }

            parts.Add(index.ById.ContainsKey(text) ? BookRender.RecordLink(index, rel, text) : BookRender.MaybeRecordLink(index, rel, text));
        }

        if (parts.Count == 0)
        {
            return "";
        }

        if (parts.Count == 1)
        {
            return parts[0];
        }

        return $"<ul class=\"plain\">{string.Concat(parts.Select(part => $"<li>{part}</li>"))}</ul>";
    }

    /// <summary>Renders a scenario examples table: one row per example, one column per field.</summary>
    static string RenderExamples(JsonNode? value, int maxRows = -1)
    {
        if (value is JsonArray list && list.Count > 0 && list.All(entry => entry is JsonArray))
        {
            var rows = list.Select(entry => (entry as JsonArray ?? []).Select(BookRender.Str).ToList()).ToList();
            return GridTable(rows[0], rows.Skip(1).ToList(), maxRows);
        }

        if (value is JsonArray objects && objects.Count > 0 && objects.All(entry => entry is JsonObject))
        {
            var columns = new List<string>();
            foreach (var entry in objects.OfType<JsonObject>())
            {
                foreach (var pair in entry)
                {
                    if (!columns.Contains(pair.Key, StringComparer.Ordinal))
                    {
                        columns.Add(pair.Key);
                    }
                }
            }

            var table = new StringBuilder();
            table.Append("<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr>");
            foreach (var column in columns)
            {
                table.Append($"<th>{BookRender.Esc(FieldLabel(column))}</th>");
            }

            table.Append("</tr></thead><tbody>");
            var shown = 0;
            foreach (var entry in objects.OfType<JsonObject>())
            {
                if (maxRows >= 0 && shown >= maxRows)
                {
                    break;
                }

                shown += 1;
                table.Append("<tr>");
                foreach (var column in columns)
                {
                    table.Append($"<td>{PlainCell(entry[column])}</td>");
                }

                table.Append("</tr>");
            }

            table.Append("</tbody></table></div>");
            return table.ToString();
        }

        return PlainBlock(value);
    }

    static string GridTable(IReadOnlyList<string> head, IReadOnlyList<IReadOnlyList<string>> rows, int maxRows)
    {
        var table = new StringBuilder();
        table.Append("<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr>");
        foreach (var cell in head)
        {
            table.Append($"<th>{BookRender.Esc(cell)}</th>");
        }

        table.Append("</tr></thead><tbody>");
        var shown = 0;
        foreach (var row in rows)
        {
            if (maxRows >= 0 && shown >= maxRows)
            {
                break;
            }

            shown += 1;
            table.Append("<tr>");
            for (var column = 0; column < head.Count; column++)
            {
                table.Append($"<td>{BookRender.Esc(column < row.Count ? row[column] : "")}</td>");
            }

            table.Append("</tr>");
        }

        table.Append("</tbody></table></div>");
        return table.ToString();
    }

    /// <summary>Renders open questions: the question with its decider, dates and ballot.</summary>
    static string RenderQuestions(BookIndex index, JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var rows = string.Concat(entries.Select(entry =>
        {
            var auto = BookModel.AutoApprovalDate(index, BookRender.StrProp(entry, "decideBy"));
            return $"<tr><td>{BookRender.EscOr(entry["question"], "")}</td><td>{BookRender.EscOr(entry["decider"], "")}</td>"
                + $"<td>{BookRender.EscOr(entry["decideBy"], "")}</td><td>{BookRender.EscOr(entry["recommended"], "")}</td>"
                + $"<td>{BookRender.EscOr(entry["ballot"], "")}</td><td>{BookRender.Esc(auto)}</td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Question</th><th>Decider</th><th>Decide By</th><th>Recommended</th><th>Ballot</th><th>Auto-approves</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders aggregate states: each name with its meaning, bare words allowed.</summary>
    static string StatesTable(JsonArray list)
    {
        var rows = string.Concat(list.Select(entry =>
        {
            var obj = entry as JsonObject;
            var name = obj is null ? BookRender.Str(entry) : BookRender.Str(obj["name"]);
            var meaning = obj is null ? "" : BookRender.Str(obj["meaning"]);
            return $"<tr><td>{BookRender.Esc(name)}</td><td>{BookRender.Esc(meaning)}</td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>State</th><th>Meaning</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders aggregate data: each field with its meaning, data class and handling in words.</summary>
    static string DataTable(JsonArray list)
    {
        var rows = string.Concat(list.Select(entry =>
        {
            var obj = entry as JsonObject;
            if (obj is null)
            {
                return $"<tr><td>{BookRender.Esc(entry)}</td><td></td><td></td><td></td></tr>";
            }

            var classification = BookRender.StrProp(obj, "classification");
            var handling = BookModel.HandlingWords(classification);
            var raw = classification is { Length: > 0 } ? $" <span class=\"mono dim dev-only\">{BookRender.Esc(classification)}</span>" : "";
            return $"<tr><td><code>{BookRender.EscOr(obj["name"], "")}</code></td><td>{BookRender.EscOr(obj["meaning"], "")}</td>"
                + $"<td>{BookRender.EscOr(obj["dataClass"], "")}</td>"
                + $"<td>{BookRender.Esc(handling)}{raw}</td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Name</th><th>Meaning</th><th>Data Class</th><th>Handling</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders a value that may name a record: a link when it resolves, words otherwise.</summary>
    static string RenderMaybeId(BookIndex index, string rel, string content)
    {
        if (content.Length == 0)
        {
            return "";
        }

        if (content.Contains('/') && index.ById.ContainsKey(content))
        {
            return BookRender.RecordLink(index, rel, content);
        }

        if (content.StartsWith("via ", StringComparison.Ordinal) && content["via ".Length..] is { Length: > 0 } target && index.ById.ContainsKey(target))
        {
            return $"via {BookRender.RecordLink(index, rel, target)}";
        }

        if (content.Contains('/') && content.Contains('#'))
        {
            var hash = content.IndexOf('#');
            var baseId = content[..hash];
            if (index.ById.ContainsKey(baseId))
            {
                return BookRender.RecordLink(index, rel, content);
            }
        }

        return BookRender.Esc(content);
    }

    /// <summary>Renders journey steps as numbered sentences with their failure words.</summary>
    static string RenderJourneySteps(BookIndex index, string rel, JsonArray list)
    {
        var items = string.Concat(list.OfType<JsonObject>().Select((step, position) =>
        {
            var id = BookRender.StrProp(step, "id") ?? $"s{position + 1}";
            var says = BookRender.EscOr(step["says"], "");
            var actor = BookRender.StrProp(step, "actor") is { } actorId
                ? $" <span class=\"dim\">({BookRender.RecordLink(index, rel, actorId)})</span>"
                : "";
            var wrong = BookRender.IsTruthy(step["ifItGoesWrong"])
                ? $"<div class=\"dim\">If it goes wrong: {BookRender.Esc(step["ifItGoesWrong"])}</div>"
                : "";
            return $"<li id=\"{BookRender.Esc(id)}\">{says}{actor}{wrong}</li>";
        }));
        return $"<ol class=\"plain\">{items}</ol>";
    }

    /// <summary>Renders requirement exceptions: each condition with its fallback requirement.</summary>
    static string RenderExcept(BookIndex index, string rel, JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var items = string.Concat(entries.Select(entry =>
        {
            var fallback = BookRender.StrProp(entry, "fallback") is { } id
                ? BookRender.RecordLink(index, rel, id)
                : "";
            return $"<li>Except when {BookRender.EscOr(entry["when"], "")}. Then {fallback}.</li>";
        }));
        return $"<ul class=\"plain\">{items}</ul>";
    }

    /// <summary>Renders use-case access: auth kinds, the grant and the tenant scope.</summary>
    static string RenderAccess(BookIndex index, string rel, JsonNode? value)
    {
        if (value is not JsonObject access)
        {
            return PlainBlock(value);
        }

        var auth = access["auth"] is JsonArray kinds
            ? string.Join(", ", kinds.Select(BookRender.Str).Where(part => part.Length > 0))
            : BookRender.Str(access["auth"]);
        var grant = BookRender.Str(access["grant"]);
        var grantHtml = grant;
        if (grant.StartsWith("self(", StringComparison.Ordinal) && grant.EndsWith(")", StringComparison.Ordinal))
        {
            var inner = grant["self(".Length..^1];
            grantHtml = $"own {BookRender.MaybeRecordLink(index, rel, inner)}";
        }
        else if (grant.StartsWith("permission/", StringComparison.Ordinal))
        {
            grantHtml = BookRender.MaybeRecordLink(index, rel, grant);
        }
        else
        {
            grantHtml = BookRender.Esc(grant);
        }

        var tenant = BookRender.Str(access["tenant"]);
        return $"<dl class=\"fields\"><div><dt>Auth</dt><dd>{BookRender.Esc(auth)}</dd></div>"
            + $"<div><dt>Grant</dt><dd>{grantHtml}</dd></div>"
            + $"<div><dt>Tenant</dt><dd>{BookRender.Esc(tenant)}</dd></div></dl>";
    }

    /// <summary>Renders use-case output: query include groups or a command field list.</summary>
    static string RenderOutput(BookIndex index, string rel, JsonNode? value)
    {
        if (value is JsonObject query && query["include"] is JsonObject groups)
        {
            var parts = new List<string>();
            foreach (var group in groups)
            {
                var detail = group.Value as JsonObject ?? new JsonObject();
                var heading = $"<h4>{BookRender.Esc(group.Key)}</h4>";
                var meta = new List<string>();
                if (BookRender.IsTruthy(detail["classification"]))
                {
                    meta.Add(BookModel.HandlingWords(BookRender.StrProp(detail, "classification")));
                }

                if (BookRender.IsTruthy(detail["freshness"]))
                {
                    meta.Add($"fresh {BookRender.Str(detail["freshness"])}");
                }

                if (detail["source"] is JsonArray sources && sources.Count > 0)
                {
                    var links = string.Join(", ", sources.Select(source => BookRender.RecordLink(index, rel, BookRender.Str(source))));
                    meta.Add($"from {links}");
                }

                if (BookRender.IsTruthy(detail["visibleWhen"]))
                {
                    meta.Add($"visible when {BookRender.Esc(detail["visibleWhen"])}");
                }

                if (BookRender.StrProp(detail, "wideningBecause") is { } wider)
                {
                    meta.Add($"widened because {BookRender.RecordLink(index, rel, wider)}");
                }

                var fields = detail["fields"] as JsonArray ?? [];
                var rows = string.Concat(fields.Select(entry =>
                {
                    var obj = entry as JsonObject;
                    return obj is null
                        ? $"<tr><td>{BookRender.Esc(entry)}</td><td></td></tr>"
                        : $"<tr><td><code>{BookRender.EscOr(obj["name"], "")}</code></td><td>{BookRender.EscOr(obj["meaning"], "")}</td></tr>";
                }));
                parts.Add(heading
                    + (meta.Count > 0 ? $"<p class=\"dim\">{string.Join("; ", meta)}.</p>" : "")
                    + $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Field</th><th>Meaning</th></tr></thead><tbody>{rows}</tbody></table></div>");
            }

            return string.Join("\n", parts);
        }

        if (value is JsonArray list)
        {
            var rows = string.Concat(list.Select(entry =>
            {
                var obj = entry as JsonObject;
                return obj is null
                    ? $"<tr><td>{BookRender.Esc(entry)}</td><td></td></tr>"
                    : $"<tr><td><code>{BookRender.EscOr(obj["name"], "")}</code></td><td>{BookRender.EscOr(obj["meaning"], "")}</td></tr>";
            }));
            return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Field</th><th>Meaning</th></tr></thead><tbody>{rows}</tbody></table></div>";
        }

        return PlainBlock(value);
    }

    /// <summary>Renders use-case effects: each target with its timing and failure words.</summary>
    static string RenderEffects(BookIndex index, string rel, JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var rows = string.Concat(entries.Select(entry =>
        {
            var target = "";
            foreach (var verb in new[] { "issues", "sends", "publishes", "calls" })
            {
                if (BookRender.StrProp(entry, verb) is { } id)
                {
                    target = $"{verb} {BookRender.RecordLink(index, rel, id)}";
                    break;
                }
            }

            var timing = BookRender.EscOr(entry["timing"], "");
            if (BookRender.IsTrue(entry["sharesTransaction"]))
            {
                timing += " (shares transaction)";
            }
            else if (entry.ContainsKey("sharesTransaction"))
            {
                timing += " (own transaction)";
            }

            var failure = BookRender.EscOr(entry["onFailure"], "");
            return $"<tr><td>{target}</td><td>{timing}</td><td>{failure}</td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Effect</th><th>Timing</th><th>On Failure</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders write consistency: the mode with its explaining rules.</summary>
    static string RenderConsistency(BookIndex index, string rel, JsonNode? value)
    {
        if (value is not JsonObject consistency)
        {
            return PlainBlock(value);
        }

        var mode = BookRender.EscOr(consistency["mode"], "");
        var because = consistency["because"] as JsonArray ?? [];
        var rules = because.Count > 0
            ? " because " + string.Join(", ", because.Select(rule => BookRender.RecordLink(index, rel, BookRender.Str(rule))))
            : "";
        return $"<p>{mode}{rules}.</p>";
    }

    /// <summary>Renders idempotency in words.</summary>
    static string RenderIdempotency(JsonNode? value)
    {
        if (value is not JsonObject idem)
        {
            return PlainBlock(value);
        }

        var parts = new List<string>();
        foreach (var field in new[] { "mode", "key", "scope", "reason" })
        {
            if (BookRender.IsTruthy(idem[field]))
            {
                parts.Add($"{FieldLabel(field)}: {BookRender.Str(idem[field])}");
            }
        }

        return BookRender.Esc(string.Join("; ", parts));
    }

    /// <summary>Renders the audit declaration in words.</summary>
    static string RenderAudit(JsonNode? value)
    {
        if (value is JsonObject audit && BookRender.IsTruthy(audit["exempt"]))
        {
            return $"Exempt: {BookRender.Esc(audit["exempt"])}.";
        }

        if (value is JsonObject declared)
        {
            return $"Reason {BookRender.EscOr(declared["reason"], "")}, target {BookRender.EscOr(declared["target"], "")}.";
        }

        return PlainBlock(value);
    }

    /// <summary>Renders paging: the order and limits, or the reason for none.</summary>
    static string RenderPaging(JsonNode? value)
    {
        if (value is JsonValue words && words.TryGetValue<string>(out var none) && none is not null)
        {
            return BookRender.Esc(none);
        }

        if (value is JsonObject paging)
        {
            var parts = new List<string>();
            foreach (var field in new[] { "order", "cursor", "offset", "defaultLimit", "maxLimit" })
            {
                if (BookRender.IsTruthy(paging[field]))
                {
                    parts.Add($"{FieldLabel(field)}: {BookRender.Str(paging[field])}");
                }
            }

            return BookRender.Esc(string.Join("; ", parts));
        }

        return PlainBlock(value);
    }

    /// <summary>Renders data classes: each class with its handling, erasure and enforcement.</summary>
    static string RenderDataClasses(BookIndex index, string rel, JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var rows = string.Concat(entries.Select(entry =>
        {
            var handling = BookModel.HandlingWords(BookRender.StrProp(entry, "classification"));
            var fields = entry["fields"] is JsonArray names
                ? string.Join(", ", names.Select(BookRender.Str).Where(part => part.Length > 0))
                : "";
            var enforced = BookRender.StrProp(entry, "enforcedBy") is { } enforcer
                ? RenderMaybeId(index, rel, enforcer)
                : "";
            return $"<tr><td>{BookRender.EscOr(entry["name"], "")}</td><td>{BookRender.Esc(handling)}</td>"
                + $"<td>{BookRender.Esc(fields)}</td><td>{BookRender.EscOr(entry["onErasure"], "")}</td>"
                + $"<td>{BookRender.EscOr(entry["period"], "")}</td><td>{enforced}</td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Class</th><th>Handling</th><th>Fields</th><th>On Erasure</th><th>Kept For</th><th>Enforced By</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders notification claims: each promise with its requirement.</summary>
    static string RenderClaims(BookIndex index, string rel, JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var rows = string.Concat(entries.Select(entry =>
        {
            var requirement = BookRender.StrProp(entry, "requirement") is { } id
                ? BookRender.RecordLink(index, rel, id)
                : "";
            return $"<tr><td>{BookRender.EscOr(entry["claim"], "")}</td><td>{requirement}</td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Claim</th><th>Requirement</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders integration-event payload fields as a table.</summary>
    static string RenderPayload(JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var rows = string.Concat(entries.Select(entry =>
            $"<tr><td><code>{BookRender.EscOr(entry["name"], "")}</code></td><td>{BookRender.EscOr(entry["meaning"], "")}</td>"
            + $"<td>{BookRender.Esc(BookModel.HandlingWords(BookRender.StrProp(entry, "classification")))}</td></tr>"));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Field</th><th>Meaning</th><th>Handling</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders settings as a table: each value with its type, default and bounds.</summary>
    static string RenderSettings(JsonArray list)
    {
        var rows = string.Concat(list.OfType<JsonObject>().Select(entry =>
            $"<tr><td>{BookRender.EscOr(entry["title"], BookRender.StrProp(entry, "id") ?? "")}</td>"
            + $"<td>{BookRender.EscOr(entry["valueType"], "")}</td>"
            + $"<td>{BookRender.EscOr(entry["default"], "")}</td>"
            + $"<td>{BookRender.EscOr(entry["range"], "")}</td>"
            + $"<td>{BookRender.EscOr(entry["setBy"], "")}</td></tr>"));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Setting</th><th>Type</th><th>Default</th><th>Range</th><th>Set By</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders external-system operations as a table.</summary>
    static string RenderOperations(JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var rows = string.Concat(entries.Select(entry =>
            $"<tr><td>{BookRender.EscOr(entry["name"], "")}</td><td>{BookRender.EscOr(entry["direction"], "")}</td>"
            + $"<td>{BookRender.EscOr(entry["timeout"], "")}</td><td>{BookRender.EscOr(entry["retries"], "")}</td>"
            + $"<td>{BookRender.EscOr(entry["response"], "")}</td></tr>"));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Operation</th><th>Direction</th><th>Timeout</th><th>Retries</th><th>Response</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }

    /// <summary>Renders any value as words and tables, so raw JSON never reaches a reviewer.</summary>
    static string PlainBlock(JsonNode? value)
    {
        if (value is JsonArray list)
        {
            var entries = list.ToList();
            if (entries.Count == 0)
            {
                return "";
            }

            if (entries.All(entry => entry is JsonValue))
            {
                var items = entries.Select(PlainCell).ToList();
                if (items.Count <= 3)
                {
                    return string.Join(", ", items);
                }

                return $"<ul class=\"plain\">{string.Concat(items.Select(item => $"<li>{item}</li>"))}</ul>";
            }

            if (entries.All(entry => entry is JsonObject))
            {
                var columns = new List<string>();
                foreach (var entry in entries.OfType<JsonObject>())
                {
                    foreach (var pair in entry)
                    {
                        if (!columns.Contains(pair.Key, StringComparer.Ordinal))
                        {
                            columns.Add(pair.Key);
                        }
                    }
                }

                var table = new StringBuilder();
                table.Append("<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr>");
                foreach (var column in columns)
                {
                    table.Append($"<th>{BookRender.Esc(FieldLabel(column))}</th>");
                }

                table.Append("</tr></thead><tbody>");
                foreach (var entry in entries.OfType<JsonObject>())
                {
                    table.Append("<tr>");
                    foreach (var column in columns)
                    {
                        table.Append($"<td>{PlainCell(entry[column])}</td>");
                    }

                    table.Append("</tr>");
                }

                table.Append("</tbody></table></div>");
                return table.ToString();
            }

            return $"<ul class=\"plain\">{string.Concat(entries.Select(entry => $"<li>{PlainCell(entry)}</li>"))}</ul>";
        }

        if (value is JsonObject obj)
        {
            var rows = string.Concat(obj.Select(pair => $"<tr><td>{BookRender.Esc(FieldLabel(pair.Key))}</td><td>{PlainCell(pair.Value)}</td></tr>"));
            return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>{rows}</tbody></table></div>";
        }

        return PlainCell(value);
    }

    /// <summary>Renders one value inline: scalars as text, deeper values joined in words.</summary>
    static string PlainCell(JsonNode? value) =>
        value switch
        {
            null => "",
            JsonValue => BookRender.Esc(value),
            JsonArray items => string.Join("; ", items.Select(PlainCell).Where(part => part.Length > 0)),
            JsonObject obj => string.Join("; ", obj.Select(pair =>
            {
                var cell = PlainCell(pair.Value);
                return cell.Length > 0 ? $"{FieldLabel(pair.Key)}: {cell}" : "";
            }).Where(part => part.Length > 0)),
            _ => "",
        };

    static string RenderSource(JsonNode? entry)
    {
        if (entry is JsonObject source && BookRender.IsTruthy(source["url"]))
        {
            var read = BookRender.IsTruthy(source["read"]) ? $" <span class=\"dim\">read {BookRender.Esc(source["read"])}</span>" : "";
            return $"<li><a href=\"{BookRender.Esc(source["url"])}\">{BookRender.Esc(source["url"])}</a>{read}</li>";
        }

        return $"<li>{PlainCell(entry)}</li>";
    }

    static string RenderValueRow(JsonNode? entry)
    {
        if (entry is JsonObject or JsonArray)
        {
            var obj = entry as JsonObject;
            if (obj is not null && obj.ContainsKey("value"))
            {
                return $"<tr><td>{BookRender.Esc(obj["value"])}</td><td>{BookRender.EscOr(obj["effectiveFrom"], "")}</td></tr>";
            }

            return $"<tr><td><code>{BookRender.EscOr(obj?["code"], "")}</code></td><td>{BookRender.EscOr(obj?["label"], "")}</td></tr>";
        }

        return $"<tr><td>{BookRender.Esc(entry)}</td><td></td></tr>";
    }

    static string FieldLabel(string field)
    {
        if (FieldLabels.TryGetValue(field, out var label))
        {
            return label;
        }

        var spaced = Regex.Replace(field, "([A-Z])", " $1");
        return spaced.Length == 0 ? spaced : char.ToUpperInvariant(spaced[0]) + spaced[1..];
    }

    static string RenderFields(BookIndex index, string rel, JsonObject record)
    {
        var fields = BookRender.Fields(record) ?? new JsonObject();
        var type = BookRender.StrProp(record, "type");
        var order = type is not null && FieldOrder.TryGetValue(type, out var found) ? found : [];
        var dedicated = type is not null && SectionFields.TryGetValue(type, out var skipped) ? skipped : new HashSet<string>(StringComparer.Ordinal);
        var rows = new List<string>();
        var seen = new HashSet<string>(StringComparer.Ordinal);
        void Push(string field)
        {
            if (!fields.ContainsKey(field) || !seen.Add(field) || dedicated.Contains(field))
            {
                return;
            }


            var html = field == "rejected"
                ? RenderRejected(index, rel, fields[field])
                : RenderFieldValue(index, rel, field, fields[field]);
            if (html != "")
            {
                var dev = DevOnlyFields.Contains(field) ? " class=\"dev-only\"" : "";
                rows.Add($"<div{dev}><dt>{BookRender.Esc(FieldLabel(field))}</dt><dd>{html}</dd></div>");
            }
        }

        foreach (var field in order)
        {
            Push(field);
        }

        foreach (var field in fields.Select(pair => pair.Key).ToList())
        {
            if (!SkipFields.Contains(field) && !seen.Contains(field))
            {
                Push(field);
            }
        }

        if (rows.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"fields\">Fields</h2>\n<dl class=\"fields\">{string.Concat(rows)}</dl>";
    }

    static string RenderRejected(BookIndex index, string rel, JsonNode? value)
    {
        var items = value as JsonArray ?? [];
        if (items.Count == 0)
        {
            return "";
        }

        var rows = string.Concat(items.Select(entry =>
        {
            if (entry is JsonObject obj)
            {
                var scope = BookRender.IsTruthy(obj["scope"]) ? $" <span class=\"dim\">({BookRender.Esc(obj["scope"])})</span>" : "";
                var except = BookRender.IsTruthy(obj["except"]) ? $" <span class=\"dim\">except {BookRender.Esc(obj["except"])}</span>" : "";
                return $"<tr><td>{BookRender.EscOr(obj["word"], "")}{scope}</td><td>{BookRender.EscOr(obj["reason"], "")}{except}</td></tr>";
            }

            return $"<tr><td>{BookRender.Esc(entry)}</td><td></td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Word</th><th>Reason</th></tr></thead><tbody>{rows}</tbody></table></div>";
    }
}

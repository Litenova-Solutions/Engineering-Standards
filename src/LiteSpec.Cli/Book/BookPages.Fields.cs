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
            ["source"] = "Source", ["applies"] = "Applies", ["appliesBecause"] = "Why it applies",
            ["question"] = "Question", ["sources"] = "Sources", ["decided"] = "Decided",
            ["options"] = "Options", ["changeWhen"] = "Change when",
            ["kind"] = "Kind", ["statement"] = "Statement", ["values"] = "Values",
            ["state"] = "State", ["refusedBecause"] = "Why refused",
            ["scope"] = "Scope", ["code"] = "Code", ["codeType"] = "Name in code", ["meaning"] = "Meaning",
            ["goal"] = "Goal", ["actor"] = "Actor", ["dependsOn"] = "Depends on",
            ["codeName"] = "Name in code", ["states"] = "States",
            ["enforcedBy"] = "Enforced by", ["refusal"] = "Refusal",
            ["operation"] = "Operation", ["anonymous"] = "Anonymous",
            ["outcome"] = "Outcome", ["status"] = "HTTP status",
            ["situation"] = "Situation", ["action"] = "Action", ["expect"] = "Expect",
            ["carries"] = "Carries", ["path"] = "Path", ["offers"] = "Offers",
            ["bound"] = "Bound", ["value"] = "Value", ["trigger"] = "Trigger",
            ["reason"] = "Reason", ["reviewBy"] = "Review by", ["removeWhen"] = "Remove when",
            ["check"] = "Check", ["endsBy"] = "Ends by",
            ["term"] = "English", ["labels"] = "Labels", ["rejected"] = "Rejected words",
            ["broader"] = "Broader", ["narrower"] = "Narrower", ["mannered"] = "Mannered",
            ["decider"] = "Decider", ["decideBy"] = "Decide by", ["owner"] = "Owner",
        };

    static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> FieldOrder =
        new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal)
        {
            ["product"] = ["boundary", "neverDoes", "audience"],
            ["constraint"] = ["source", "applies", "appliesBecause"],
            ["research"] = ["question", "sources"],
            ["decision"] = ["decided", "options", "changeWhen"],
            ["requirement"] = ["kind", "statement", "values"],
            ["problem"] = ["statement"],
            ["feature"] = ["state", "refusedBecause"],
            ["actor"] = ["kind", "holds"],
            ["role"] = ["scope"],
            ["permission"] = ["code", "codeType", "meaning"],
            ["journey"] = ["actor", "goal", "steps"],
            ["module"] = [],
            ["business-record"] = ["codeName", "states"],
            ["rule"] = ["kind", "enforcedBy", "statement"],
            ["use-case"] = ["operation", "anonymous", "input"],
            ["result"] = ["outcome", "code", "status", "meaning"],
            ["case"] = ["situation", "action", "expect"],
            ["event"] = ["meaning", "carries"],
            ["entry-point"] = ["kind", "path"],
            ["limit"] = ["bound", "value"],
            ["runbook"] = ["trigger"],
            ["standard"] = [],
            ["exception"] = ["reason", "reviewBy", "removeWhen"],
            ["known-gap"] = ["check", "endsBy", "reason"],
            ["term"] = ["term", "meaning", "labels", "rejected", "broader", "narrower", "values", "mannered"],
        };

    static readonly IReadOnlySet<string> SkipFields = new HashSet<string>(StringComparer.Ordinal)
    {
        "type", "id", "title", "owner", "status", "records",
        "decides", "basedOn", "affects", "solves", "fulfils", "governs", "raises",
        "reactsTo", "allows", "needs", "reachedThrough", "dependsOn", "terms",
        "result", "offers", "runbook", "limit", "subject", "replaces",
    };

    static readonly IReadOnlySet<string> IdFields = new HashSet<string>(StringComparer.Ordinal)
        { "actor", "result", "refusal", "standard", "limit", "runbook" };

    static readonly IReadOnlySet<string> IdListFields = new HashSet<string>(StringComparer.Ordinal)
        { "audience", "broader", "narrower", "refusal", "standard" };

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

        if (value is JsonValue text && text.TryGetValue<string>(out var str))
        {
            var content = str ?? "";
            if (field == "source" && (content.StartsWith("http://", StringComparison.Ordinal) || content.StartsWith("https://", StringComparison.Ordinal)))
            {
                return $"<a href=\"{BookRender.Esc(content)}\">{BookRender.Esc(content)}</a>";
            }

            if (IdFields.Contains(field))
            {
                return BookRender.RecordLink(index, rel, content);
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
                return $"<ol class=\"plain\">{string.Concat(list.Select(item => $"<li>{BookRender.Esc(item)}</li>"))}</ol>";
            }

            if (field == "sources" && hasObjects)
            {
                return $"<ul class=\"links\">{string.Concat(list.Select(entry => RenderSource(index, entry)))}</ul>";
            }

            if (field == "values" && hasObjects)
            {
                var rows = string.Concat(list.Select(RenderValueRow));
                var head = list.Any(entry => entry is JsonObject obj && obj.ContainsKey("value"))
                    ? "<tr><th>Value</th><th>Effective from</th></tr>"
                    : "<tr><th>Code</th><th>Label</th></tr>";
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead>{head}</thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "input" && hasObjects)
            {
                var rows = string.Concat(list.Select(entry =>
                {
                    if (entry is JsonObject or JsonArray)
                    {
                        var obj = entry as JsonObject;
                        return $"<tr><td><code>{BookRender.EscOr(obj?["name"], "")}</code></td><td>{BookRender.EscOr(obj?["meaning"], "")}</td><td>{BookRender.EscOr(obj?["rules"], "")}</td></tr>";
                    }

                    return $"<tr><td>{BookRender.Esc(entry)}</td><td></td><td></td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Name</th><th>Meaning</th><th>Rules</th></tr></thead><tbody>{rows}</tbody></table></div>";
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
                var rows = string.Concat(list.Select((step, position) =>
                {
                    if (step is not JsonObject && step is not JsonArray)
                    {
                        return $"<tr><td>{position + 1}</td><td>{BookRender.Esc(step)}</td><td></td><td></td></tr>";
                    }

                    var obj = step as JsonObject;
                    var useCase = BookRender.StrProp(obj, "useCase") is { } useCaseId ? BookRender.RecordLink(index, rel, useCaseId) : "";
                    var actor = BookRender.StrProp(obj, "actor") is { } actorId ? BookRender.RecordLink(index, rel, actorId) : "";
                    var requires = obj?["requires"] is JsonArray needed
                        ? string.Join(", ", needed.Select(BookRender.Esc))
                        : BookRender.EscOr(obj?["requires"], "");
                    return $"<tr><td class=\"num\">{position + 1}</td><td>{useCase}</td><td>{actor}</td><td>{requires}</td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th></th><th>Use case</th><th>Actor</th><th>Requires</th></tr></thead><tbody>{rows}</tbody></table></div>";
            }

            if (field == "labels" && list.Count > 0 && !(list[0] is JsonValue candidate && candidate.TryGetValue<string>(out _)))
            {
                return "";
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

            return $"<pre class=\"json\">{BookRender.Esc(BookRender.JsonIndented(value))}</pre>";
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

            return $"<pre class=\"json\">{BookRender.Esc(BookRender.JsonIndented(value))}</pre>";
        }

        return "";
    }

    static string RenderSource(BookIndex index, JsonNode? entry)
    {
        if (entry is JsonObject source && BookRender.IsTruthy(source["url"]))
        {
            var read = BookRender.IsTruthy(source["read"]) ? $" <span class=\"dim\">read {BookRender.Esc(source["read"])}</span>" : "";
            return $"<li><a href=\"{BookRender.Esc(source["url"])}\">{BookRender.Esc(source["url"])}</a>{read}</li>";
        }

        if (entry is JsonObject or JsonArray)
        {
            return $"<li><code>{BookRender.Esc(BookRender.JsonCompact(entry))}</code></li>";
        }

        return $"<li>{BookRender.Esc(entry)}</li>";
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
        var order = BookRender.StrProp(record, "type") is { } type && FieldOrder.TryGetValue(type, out var found) ? found : [];
        var rows = new List<string>();
        var seen = new HashSet<string>(StringComparer.Ordinal);
        void Push(string field)
        {
            if (!fields.ContainsKey(field) || !seen.Add(field))
            {
                return;
            }

            // A result's record status and its HTTP status share one field name; only
            // a number is the HTTP status. The record status is already in the strip.
            if (BookRender.StrProp(record, "type") == "result" && field == "status" && !IsNumber(fields[field]))
            {
                return;
            }

            var html = field == "rejected"
                ? RenderRejected(index, rel, fields[field])
                : RenderFieldValue(index, rel, field, fields[field]);
            if (html != "")
            {
                rows.Add($"<div><dt>{BookRender.Esc(FieldLabel(field))}</dt><dd>{html}</dd></div>");
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

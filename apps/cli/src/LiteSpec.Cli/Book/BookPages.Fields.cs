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
            ["state"] = "State", ["refusedBecause"] = "Why refused",
            ["scope"] = "Scope", ["code"] = "Code", ["meaning"] = "Meaning",
            ["goal"] = "Goal", ["actor"] = "Actor", ["dependsOn"] = "Depends on",
            ["summary"] = "Summary", ["states"] = "States", ["transitions"] = "Transitions", ["data"] = "Data",
            ["refusal"] = "Refusal", ["questions"] = "Open questions",
            ["anonymous"] = "Anonymous", ["input"] = "Input", ["output"] = "Output",
            ["outcome"] = "Outcome",
            ["given"] = "Given", ["when"] = "When", ["then"] = "Then", ["examples"] = "Examples",
            ["carries"] = "Carries", ["path"] = "Path",
            ["sends"] = "Sends", ["receives"] = "Receives", ["failure"] = "On failure",
            ["bound"] = "Bound", ["value"] = "Value", ["trigger"] = "Trigger", ["severity"] = "Severity",
            ["reason"] = "Reason", ["reviewBy"] = "Review by", ["removeWhen"] = "Remove when",
            ["endsBy"] = "Ends by",
            ["term"] = "English", ["labels"] = "Labels", ["rejected"] = "Rejected words",
            ["broader"] = "Broader", ["narrower"] = "Narrower", ["mannered"] = "Mannered",
            ["decider"] = "Decider", ["decideBy"] = "Decide by", ["owner"] = "Owner",
        };

    static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> FieldOrder =
        new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal)
        {
            ["product"] = ["boundary", "neverDoes", "audience"],
            ["goal"] = ["statement", "measure", "target", "by"],
            ["constraint"] = ["source", "category", "applies", "appliesBecause"],
            ["research"] = ["question", "sources"],
            ["decision"] = ["decided", "options", "chosen", "changeWhen"],
            ["requirement"] = ["kind", "statement", "rationale", "measure", "target", "by", "conditions", "check", "runsOn", "evidence", "values"],
            ["problem"] = ["statement"],
            ["feature"] = ["state", "by", "refusedBecause"],
            ["actor"] = ["kind", "holds"],
            ["role"] = ["scope"],
            ["permission"] = ["meaning"],
            ["journey"] = ["goal", "steps"],
            ["module"] = ["summary"],
            ["aggregate"] = ["summary", "states", "transitions", "data"],
            ["rule"] = ["kind", "statement"],
            ["use-case"] = ["kind", "anonymous", "trigger", "input", "output"],
            ["result"] = ["outcome", "code", "meaning"],
            ["scenario"] = ["given", "when", "then", "examples"],
            ["event"] = ["meaning", "carries"],
            ["entry-point"] = ["kind", "path"],
            ["external-system"] = ["sends", "receives", "failure"],
            ["limit"] = ["bound", "value"],
            ["runbook"] = ["trigger", "severity"],
            ["deviation"] = ["reason", "reviewBy", "removeWhen"],
            ["known-gap"] = ["check", "endsBy", "reason"],
            ["term"] = ["term", "meaning", "labels", "rejected", "broader", "narrower", "values", "mannered"],
        };

    static readonly IReadOnlySet<string> SkipFields = new HashSet<string>(StringComparer.Ordinal)
    {
        "type", "id", "title", "owner", "status", "records",
        "decides", "basedOn", "affects", "solves", "serves", "feature", "fulfills", "governs", "raises",
        "allows", "needs", "reachedThrough", "dependsOn", "terms",
        "result", "runbook", "subject", "replaces", "provision", "refusal",
        "actor",
    };

    /// <summary>Fields a dedicated page section renders instead of the generic field table.</summary>
    static readonly IReadOnlyDictionary<string, IReadOnlySet<string>> SectionFields =
        new Dictionary<string, IReadOnlySet<string>>(StringComparer.Ordinal)
        {
            ["aggregate"] = new HashSet<string>(StringComparer.Ordinal) { "states", "transitions", "data" },
            ["scenario"] = new HashSet<string>(StringComparer.Ordinal) { "given", "when", "then", "examples" },
        };

    /// <summary>Fields holding check names and codes, shown to developers only.</summary>
    static readonly IReadOnlySet<string> DevOnlyFields = new HashSet<string>(StringComparer.Ordinal)
    {
        "code", "check",
    };

    static readonly IReadOnlySet<string> IdFields = new HashSet<string>(StringComparer.Ordinal)
        { "actor", "result", "refusal", "provision", "runbook" };

    static readonly IReadOnlySet<string> IdListFields = new HashSet<string>(StringComparer.Ordinal)
        { "audience", "broader", "narrower", "refusal", "provision" };

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
            return RenderQuestions(value);
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

            return field == "code" ? $"<code>{BookRender.Esc(content)}</code>" : BookRender.Esc(content);
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

            if ((field == "input" || field == "output") && hasObjects)
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
                    return $"<tr><td class=\"num\">{position + 1}</td><td>{useCase}</td><td>{actor}</td><td>{requires}</td><td>{BookRender.EscOr(obj?["gives"], "")}</td></tr>";
                }));
                return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th></th><th>Use Case</th><th>Actor</th><th>Requires</th><th>Gives</th></tr></thead><tbody>{rows}</tbody></table></div>";
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

    /// <summary>Renders open questions: the question with its decider and decide-by date.</summary>
    static string RenderQuestions(JsonNode? value)
    {
        var entries = (value as JsonArray ?? []).OfType<JsonObject>().ToList();
        if (entries.Count == 0)
        {
            return PlainBlock(value);
        }

        var rows = string.Concat(entries.Select(entry =>
            $"<tr><td>{BookRender.EscOr(entry["question"], "")}</td><td>{BookRender.EscOr(entry["decider"], "")}</td>"
            + $"<td>{BookRender.EscOr(entry["decideBy"], "")}</td></tr>"));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Question</th><th>Decider</th><th>Decide By</th></tr></thead><tbody>{rows}</tbody></table></div>";
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

    /// <summary>Renders aggregate data: each field with its meaning and handling in words.</summary>
    static string DataTable(JsonArray list)
    {
        var rows = string.Concat(list.Select(entry =>
        {
            var obj = entry as JsonObject;
            if (obj is null)
            {
                return $"<tr><td>{BookRender.Esc(entry)}</td><td></td><td></td></tr>";
            }

            var classification = BookRender.StrProp(obj, "classification");
            var handling = BookModel.HandlingWords(classification);
            var raw = classification is { Length: > 0 } ? $" <span class=\"mono dim dev-only\">{BookRender.Esc(classification)}</span>" : "";
            return $"<tr><td><code>{BookRender.EscOr(obj["name"], "")}</code></td><td>{BookRender.EscOr(obj["meaning"], "")}</td>"
                + $"<td>{BookRender.Esc(handling)}{raw}</td></tr>";
        }));
        return $"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Name</th><th>Meaning</th><th>Handling</th></tr></thead><tbody>{rows}</tbody></table></div>";
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

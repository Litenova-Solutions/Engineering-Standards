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

                target["approvedHash"] = Checker.SemanticHash(record);
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

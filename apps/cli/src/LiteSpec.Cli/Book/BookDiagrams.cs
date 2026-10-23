using System.Text;
using System.Text.Json.Nodes;

namespace LiteSpec.Book;

/// <summary>Builds the Mermaid lifecycle diagrams the book renders from aggregate records.</summary>
static class BookDiagrams
{
    /// <summary>Builds the <c>stateDiagram-v2</c> source for one aggregate, or "" without states.</summary>
    public static string StateDiagramSource(JsonObject aggregate, BookIndex index)
    {
        var fields = BookRender.Fields(aggregate) ?? new JsonObject();
        var states = StateNames(fields["states"]);
        if (states.Count == 0)
        {
            return "";
        }

        var diagram = new StringBuilder();
        diagram.AppendLine("stateDiagram-v2");
        for (var position = 0; position < states.Count; position++)
        {
            diagram.AppendLine($"    state \"{Quote(states[position])}\" as s{position}");
        }

        diagram.AppendLine("    [*] --> s0");
        var transitions = fields["transitions"] as JsonArray ?? [];
        foreach (var entry in transitions.OfType<JsonObject>())
        {
            var to = states.IndexOf(BookRender.Str(entry["to"]));
            if (BookRender.Str(entry["from"]) == "-" && to >= 0)
            {
                diagram.AppendLine($"    [*] --> s{to}");
                continue;
            }

            var from = states.IndexOf(BookRender.Str(entry["from"]));
            if (from < 0 || to < 0)
            {
                continue;
            }

            var label = TransitionLabel(index, BookRender.Str(entry["by"]));
            diagram.Append(label.Length > 0 ? $"    s{from} --> s{to} : {label}" : $"    s{from} --> s{to}");
            diagram.AppendLine();
        }

        var id = BookRender.StrProp(aggregate, "id") ?? "";
        if (index.ReachableStates.TryGetValue(id, out var reachable))
        {
            for (var position = 0; position < states.Count; position++)
            {
                if (position != 0 && !reachable.Contains(states[position]))
                {
                    diagram.AppendLine($"    note right of s{position}");
                    diagram.AppendLine("        No transition reaches this state.");
                    diagram.AppendLine("    end note");
                }
            }
        }

        return diagram.ToString().TrimEnd();
    }

    /// <summary>Every state name in order: entries read as objects with a name, or bare words.</summary>
    public static List<string> StateNames(JsonNode? states)
    {
        var names = new List<string>();
        foreach (var entry in states as JsonArray ?? [])
        {
            var name = entry is JsonObject obj ? BookRender.Str(obj["name"]) : BookRender.Str(entry);
            if (name.Length > 0)
            {
                names.Add(name);
            }
        }

        return names;
    }

    static string TransitionLabel(BookIndex index, string by)
    {
        var words = by.Length > 0 && index.ById.TryGetValue(by, out var useCase)
            ? BookModel.SortTitle(useCase)
            : by;
        return Quote(words)
            .Replace(":", " - ", StringComparison.Ordinal)
            .Replace(";", ",", StringComparison.Ordinal)
            .Replace("-->", "->", StringComparison.Ordinal);
    }

    static string Quote(string words) =>
        words.Replace("\r", " ", StringComparison.Ordinal).Replace("\n", " ", StringComparison.Ordinal)
            .Replace("\"", "'", StringComparison.Ordinal).Trim();
}

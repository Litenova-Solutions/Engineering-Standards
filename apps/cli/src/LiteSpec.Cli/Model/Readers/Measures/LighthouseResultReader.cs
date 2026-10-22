using System.Text.Json;

namespace LiteSpec.Model.Readers.Measures;

/// <summary>
///     Reads Lighthouse report files: one result per category and per audit with a
///     measured value. A result records evidence, so it passes when the run holds
///     the score; the Lighthouse CI assert step stays the gate that judges it.
/// </summary>
static class LighthouseResultReader
{
    /// <summary>Reads the categories and measured audits of a Lighthouse report.</summary>
    public static List<MeasureResult> Parse(JsonElement root, string file)
    {
        var measures = new List<MeasureResult>();

        if (root.TryGetProperty("categories", out var categories) && categories.ValueKind == JsonValueKind.Object)
        {
            foreach (var category in categories.EnumerateObject())
            {
                var score = ScoreOf(category.Value);

                measures.Add(new MeasureResult(
                    "lighthouse",
                    $"categories:{category.Name}",
                    true,
                    score,
                    file));
            }
        }

        if (root.TryGetProperty("audits", out var audits) && audits.ValueKind == JsonValueKind.Object)
        {
            foreach (var audit in audits.EnumerateObject())
            {
                if (audit.Value.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                string? value = null;

                if (audit.Value.TryGetProperty("numericValue", out var numeric) && numeric.ValueKind == JsonValueKind.Number)
                {
                    value = audit.Value.TryGetProperty("numericUnit", out var unit)
                        && unit.ValueKind == JsonValueKind.String
                        && unit.GetString() is { Length: > 0 } named
                            ? $"{numeric.GetRawText()} {named}"
                            : numeric.GetRawText();
                }
                else if (ScoreOf(audit.Value) is { } score)
                {
                    value = score;
                }

                if (value is not null)
                {
                    measures.Add(new MeasureResult(
                        "lighthouse",
                        $"audits:{audit.Name}",
                        true,
                        value,
                        file));
                }
            }
        }

        return measures;
    }

    private static string? ScoreOf(JsonElement node) =>
        node.ValueKind == JsonValueKind.Object
        && node.TryGetProperty("score", out var score)
        && score.ValueKind == JsonValueKind.Number
            ? score.GetRawText()
            : null;
}

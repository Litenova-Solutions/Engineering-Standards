using System.Text.Json;

namespace LiteSpec.Model.Readers.Measures;

/// <summary>
///     Reads ZAP JSON reports: one result per alert plus a summary. An alert passes
///     at informational or low risk and fails at medium or high; the summary passes
///     when no alert reaches medium or high.
/// </summary>
static class ZapResultReader
{
    /// <summary>Reads the alerts of a ZAP report object.</summary>
    public static List<MeasureResult> Parse(JsonElement root, string file)
    {
        var measures = new List<MeasureResult>();
        var high = 0;
        var medium = 0;
        var low = 0;
        var total = 0;

        if (!root.TryGetProperty("site", out var sites) || sites.ValueKind != JsonValueKind.Array)
        {
            return measures;
        }

        foreach (var site in sites.EnumerateArray())
        {
            if (site.ValueKind != JsonValueKind.Object
                || !site.TryGetProperty("alerts", out var alerts)
                || alerts.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var alert in alerts.EnumerateArray())
            {
                if (alert.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                var name = StringOf(alert, "alert") ?? StringOf(alert, "name") ?? "";
                var plugin = StringOf(alert, "pluginid") ?? "";
                var risk = RiskOf(alert);
                var passed = risk is "0" or "1";

                if (risk is "3")
                {
                    high++;
                }
                else if (risk is "2")
                {
                    medium++;
                }
                else if (risk is "1")
                {
                    low++;
                }

                total++;

                var check = plugin.Length > 0 && name.Length > 0
                    ? $"alert {plugin} {name}"
                    : name.Length > 0 ? $"alert {name}" : $"alert {plugin}";
                var count = StringOf(alert, "count") ?? "1";
                var level = StringOf(alert, "riskdesc") ?? (risk is "0" or "1" or "2" or "3" ? risk : "");

                measures.Add(new MeasureResult(
                    "zap",
                    check,
                    passed,
                    level.Length > 0 ? $"{level} x{count}" : $"x{count}",
                    file));
            }
        }

        measures.Add(new MeasureResult(
            "zap",
            "alerts",
            high == 0 && medium == 0,
            $"{total} alerts ({high} high, {medium} medium, {low} low)",
            file));

        return measures;
    }

    /// <summary>The alert's risk as a ZAP risk code from 0 to 3, or empty when unknown.</summary>
    private static string RiskOf(JsonElement alert)
    {
        if (alert.TryGetProperty("riskcode", out var code))
        {
            if (code.ValueKind == JsonValueKind.String && code.GetString() is { } text)
            {
                return text.Trim();
            }

            if (code.ValueKind == JsonValueKind.Number)
            {
                return code.GetRawText();
            }
        }

        return StringOf(alert, "riskdesc")?.ToLowerInvariant() switch
        {
            "high" => "3",
            "medium" => "2",
            "low" => "1",
            "informational" or "info" => "0",
            _ => "",
        };
    }

    private static string? StringOf(JsonElement alert, string field) =>
        alert.TryGetProperty(field, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
}

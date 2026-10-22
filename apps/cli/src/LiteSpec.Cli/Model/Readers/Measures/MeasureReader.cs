using System.Text.Json;

namespace LiteSpec.Model.Readers.Measures;

/// <summary>
///     Reads measured-check results the way the test-run reader reads test runs:
///     every result file under the test results folder, dispatched by shape to the
///     k6, Lighthouse, or ZAP reader. A measured requirement shows verified when
///     its check names one of these results and that result passes.
/// </summary>
static class MeasureReader
{
    /// <summary>Reads every measure result file under the test results folder.</summary>
    public static List<MeasureResult> Read(ConsumerConfig config)
    {
        var measures = new List<MeasureResult>();

        foreach (var file in SourceTree.Files(config.TestResultsDir, ".json"))
        {
            JsonDocument document;

            try
            {
                document = JsonDocument.Parse(File.ReadAllBytes(file));
            }
            catch (Exception exception) when (exception is JsonException or IOException or UnauthorizedAccessException)
            {
                continue;
            }

            using (document)
            {
                if (document.RootElement.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                var root = document.RootElement;

                if (root.TryGetProperty("site", out var site) && site.ValueKind == JsonValueKind.Array)
                {
                    measures.AddRange(ZapResultReader.Parse(root, file));
                }
                else if (root.TryGetProperty("audits", out var audits) && audits.ValueKind == JsonValueKind.Object
                    && root.TryGetProperty("categories", out var categories) && categories.ValueKind == JsonValueKind.Object)
                {
                    measures.AddRange(LighthouseResultReader.Parse(root, file));
                }
                else if (root.TryGetProperty("metrics", out var metrics) && metrics.ValueKind == JsonValueKind.Object)
                {
                    measures.AddRange(K6ResultReader.Parse(root, file));
                }
            }
        }

        measures.Sort((left, right) =>
        {
            var tool = string.Compare(left.Tool, right.Tool, StringComparison.Ordinal);

            if (tool != 0)
            {
                return tool;
            }

            var check = string.Compare(left.Check, right.Check, StringComparison.Ordinal);

            return check != 0
                ? check
                : string.Compare(left.Source, right.Source, StringComparison.Ordinal);
        });

        return measures;
    }
}

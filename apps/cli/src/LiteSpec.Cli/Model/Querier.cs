using System.Text.Json;

namespace LiteSpec.Model;

/// <summary>
///     Prints one record with its links in both directions.
/// </summary>
static class Querier
{
    /// <summary>Queries one id, or null when no record holds it.</summary>
    public static string? Query(ProjectModel model, string id)
    {
        if (!model.ById.TryGetValue(id, out var record))
        {
            return null;
        }

        var incoming = new Dictionary<string, List<string>>(StringComparer.Ordinal);

        foreach (var other in model.Records)
        {
            if (other.Raw.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            foreach (var property in other.Raw.EnumerateObject())
            {
                if (RecordTypes.LinkTargets.ContainsKey(property.Name)
                    || RecordTypes.NestedLinkFields.Contains(property.Name)
                    || property.Name is "replaces" or "refusal" or "standard")
                {
                    var targets = ModelBuilder.TargetsOf(property.Value);

                    if (targets.Contains(id, StringComparer.Ordinal))
                    {
                        if (!incoming.TryGetValue(other.Id, out var fields))
                        {
                            fields = [];
                            incoming[other.Id] = fields;
                        }

                        fields.Add(property.Name);
                    }
                }
            }
        }

        object? status = null;

        if (record.Type == "use-case" && model.Status.TryGetValue(id, out var held))
        {
            status = new
            {
                implemented = held.Implemented,
                verified = held.Verified,
                implements = model.Implements.Where(link => link.To == id).Select(link => link.Path).ToList(),
                calls = model.Calls.Where(link => link.To == id).Select(link => link.Screen).ToList(),
                proves = model.Proves
                    .Where(link => CaseOf(model, link.Case) == CaseName(id))
                    .Select(link => new { scenario = link.Scenario, kase = link.Case, confirmed = link.Confirmed, passing = link.Passing })
                    .ToList(),
            };
        }

        return JsonSerializer.Serialize(
            new
            {
                type = record.Type,
                id = record.Id,
                title = record.Title,
                owner = record.Owner,
                status = record.Status,
                file = model.Config.Relative(record.File),
                line = record.Line,
                fields = JsonSerializer.Deserialize<JsonElement>(record.Raw.GetRawText()),
                links = ModelBuilder.ResolvedLinks(model, record),
                linkedBy = incoming,
                computed = status,
            },
            new JsonSerializerOptions { WriteIndented = true, NewLine = "\n" });
    }

    private static string? CaseOf(ProjectModel model, string caseId) =>
        Identifiers.TrySplit(caseId, out _, out var home, out _) ? home : null;

    private static string? CaseName(string useCaseId) =>
        Identifiers.TrySplit(useCaseId, out _, out _, out var name) ? name : null;
}

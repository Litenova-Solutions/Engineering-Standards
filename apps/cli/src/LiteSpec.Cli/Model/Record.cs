using System.Text.Json;

namespace LiteSpec.Model;

/// <summary>
///     One record: a page, an entry on a page, a term, or a derived generic result.
/// </summary>
sealed class Record
{
    /// <summary>The record type, kebab-case.</summary>
    public string Type { get; init; } = "";

    /// <summary>The identifier.</summary>
    public string Id { get; init; } = "";

    /// <summary>The display title.</summary>
    public string Title { get; init; } = "";

    /// <summary>The resolved owner: the entry's own, else its page's.</summary>
    public string? Owner { get; init; }

    /// <summary>The resolved status: the entry's own, else its page's.</summary>
    public string? Status { get; init; }

    /// <summary>The resolved decider.</summary>
    public string? Decider { get; init; }

    /// <summary>The resolved decide-by date.</summary>
    public string? DecideBy { get; init; }

    /// <summary>Who approved or reviewed the record: an owner name, or auto (veto window).</summary>
    public string? ApprovedBy { get; init; }

    /// <summary>The date the record was approved or reviewed.</summary>
    public string? ApprovedOn { get; init; }

    /// <summary>The semantic hash the approval covers, written by the builder.</summary>
    public string? ApprovedHash { get; init; }

    /// <summary>Whether the builder derived the record rather than reading it from a page.</summary>
    public bool Derived { get; init; }

    /// <summary>The absolute file path.</summary>
    public string File { get; init; } = "";

    /// <summary>The 1-based line.</summary>
    public int Line { get; init; }

    /// <summary>Whether the record is an entry rather than a page.</summary>
    public bool IsEntry { get; init; }

    /// <summary>The carrying page's record id, for an entry.</summary>
    public string? PageId { get; init; }

    /// <summary>The raw fields as written.</summary>
    public JsonElement Raw { get; init; }

    /// <summary>Reads one optional string field.</summary>
    public string? Field(string name) =>
        Raw.ValueKind == JsonValueKind.Object
        && Raw.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    /// <summary>Reads one string array field.</summary>
    public IReadOnlyList<string> Strings(string name)
    {
        if (Raw.ValueKind != JsonValueKind.Object
            || !Raw.TryGetProperty(name, out var value)
            || value.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return
        [
            .. value.EnumerateArray()
                      .Where(entry => entry.ValueKind == JsonValueKind.String)
                      .Select(entry => entry.GetString()!),
        ];
    }

    /// <summary>Reads one field that holds one id or an array of ids.</summary>
    public IReadOnlyList<string> Ids(string name)
    {
        if (Raw.ValueKind != JsonValueKind.Object || !Raw.TryGetProperty(name, out var value))
        {
            return [];
        }

        if (value.ValueKind == JsonValueKind.String && value.GetString() is { } single)
        {
            return [single];
        }

        if (value.ValueKind == JsonValueKind.Array)
        {
            return
            [
                .. value.EnumerateArray()
                          .Where(entry => entry.ValueKind == JsonValueKind.String)
                          .Select(entry => entry.GetString()!),
            ];
        }

        return [];
    }

    /// <summary>The journey's step targets: journey/name#step for each step carrying an id.</summary>
    public IReadOnlyList<string> StepIds()
    {
        if (Type != "journey"
            || Raw.ValueKind != JsonValueKind.Object
            || !Raw.TryGetProperty("steps", out var steps)
            || steps.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var ids = new List<string>();

        foreach (var step in steps.EnumerateArray())
        {
            if (step.ValueKind == JsonValueKind.Object
                && step.TryGetProperty("id", out var id)
                && id.ValueKind == JsonValueKind.String
                && id.GetString() is { Length: > 0 } stepId)
            {
                ids.Add($"{Id}#{stepId}");
            }
        }

        return ids;
    }

    /// <summary>Whether the record carries the field.</summary>
    public bool Has(string name) =>
        Raw.ValueKind == JsonValueKind.Object && Raw.TryGetProperty(name, out _);
}

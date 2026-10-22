namespace LiteSpec.Model;

/// <summary>
///     The record types, page styles, required fields and link targets of the model.
/// </summary>
static class RecordTypes
{
    /// <summary>Every written record type.</summary>
    public static readonly HashSet<string> All = new(StringComparer.Ordinal)
    {
        "product", "goal", "constraint", "research", "decision", "requirement", "problem",
        "feature", "actor", "role", "permission", "journey", "module",
        "aggregate", "rule", "use-case", "result", "scenario", "event",
        "entry-point", "external-system", "limit", "runbook", "deviation", "known-gap", "term",
    };

    /// <summary>Page styles: templates a page may carry instead of a record.</summary>
    public static readonly HashSet<string> PageStyles = new(StringComparer.Ordinal)
    {
        "requirement-page", "permission-list", "entry-point-list", "limit-set",
        "rule-set", "index", "tutorial", "how-to", "reference", "command",
        "configuration", "glossary", "example-cast",
    };

    /// <summary>Types whose identifier carries a home: type/home.name.</summary>
    public static readonly HashSet<string> WithHome = new(StringComparer.Ordinal)
    {
        "requirement", "aggregate", "rule", "use-case", "result",
        "scenario", "event",
    };

    /// <summary>Types the small size requires.</summary>
    public static readonly IReadOnlyList<string> SmallRequired =
    [
        "product", "decision", "requirement", "actor", "role", "permission",
        "module", "aggregate", "rule", "use-case", "result", "event",
        "entry-point", "deviation", "known-gap", "term",
    ];

    /// <summary>Types only the large size requires.</summary>
    public static readonly IReadOnlyList<string> LargeAdded = ["problem", "feature", "journey", "scenario"];

    /// <summary>The entry-point kinds that run in the background.</summary>
    public static readonly HashSet<string> BackgroundEntryKinds = new(StringComparer.Ordinal)
    {
        "reaction", "job",
    };

    /// <summary>
    ///     Whether the field names a link, and which record types it may point at.
    ///     An empty set means any record type.
    /// </summary>
    public static readonly Dictionary<string, HashSet<string>> LinkTargets = new(StringComparer.Ordinal)
    {
        ["decides"] = [],
        ["feature"] = ["feature"],
        ["basedOn"] = ["constraint", "research"],
        ["affects"] = ["actor"],
        ["solves"] = ["problem"],
        ["serves"] = ["goal"],
        ["fulfills"] = ["requirement"],
        ["governs"] = ["aggregate", "use-case"],
        ["raises"] = ["event"],
        ["trigger"] = ["event"],
        ["allows"] = ["permission"],
        ["needs"] = ["permission"],
        ["reachedThrough"] = ["entry-point"],
        ["dependsOn"] = ["module"],
        ["terms"] = ["term"],
        ["result"] = ["result"],
        ["actor"] = ["actor"],
        ["runbook"] = ["runbook"],
        ["subject"] = [],
        ["values"] = [],
    };

    /// <summary>Fields that hold links but are read from nested objects.</summary>
    public static readonly HashSet<string> NestedLinkFields = new(StringComparer.Ordinal)
    {
        "holds", "steps",
    };

    /// <summary>Fields that hold identifiers but are not links.</summary>
    public static readonly HashSet<string> IdentityFields = new(StringComparer.Ordinal)
    {
        "type", "id", "title", "owner", "status", "decider", "decideBy",
        "replaces", "code",
    };
}

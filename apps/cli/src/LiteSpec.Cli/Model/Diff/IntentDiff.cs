using System.Security.Cryptography;
using System.Text;

namespace LiteSpec.Model.Diff;

/// <summary>How one record changed between the base model and the head model.</summary>
enum ChangeKind
{
    Removed,
    Modified,
    Added,
}

/// <summary>Which records a diff shows: Intent, Behavior, or both.</summary>
enum DiffView
{
    Both,
    Intent,
    Behavior,
}

/// <summary>One named breaking reason: a stable code and its sentence.</summary>
/// <param name="Code">The stable reason code.</param>
/// <param name="Message">What the change breaks, in one sentence.</param>
sealed record BreakingReason(string Code, string Message);

/// <summary>One record's change: what moved, in intent words, with its breaking reasons.</summary>
/// <param name="Id">The record identifier.</param>
/// <param name="Title">The record title.</param>
/// <param name="Type">The record type.</param>
/// <param name="Family">The record family: goals-requirements, domain, access or operations.</param>
/// <param name="Qualifier">The parenthetical after the title, such as a kind or an outcome.</param>
/// <param name="Change">Whether the record was removed, modified or added.</param>
/// <param name="Breaking">Whether the change breaks approved intent.</param>
/// <param name="Reasons">The named breaking reasons, empty when the change keeps intent.</param>
/// <param name="Details">What changed, one intent-words line each.</param>
/// <param name="View">Which view shows the change: intent, behavior, or both.</param>
/// <param name="Fingerprint">The stable fingerprint of this change.</param>
sealed record IntentChange(
    string Id,
    string Title,
    string Type,
    string Family,
    string Qualifier,
    ChangeKind Change,
    bool Breaking,
    IReadOnlyList<BreakingReason> Reasons,
    IReadOnlyList<string> Details,
    string View = "both",
    string Fingerprint = "");

/// <summary>One security queue entry: a change the security reviewer approves.</summary>
/// <param name="Id">The record identifier.</param>
/// <param name="Title">The record title.</param>
/// <param name="Type">The record type.</param>
/// <param name="Detail">What changed, in one sentence.</param>
sealed record SecurityQueueEntry(string Id, string Title, string Type, string Detail);

/// <summary>The intent diff between two models: every change in review order.</summary>
sealed class IntentDiff
{
    public IntentDiff(
        string baseLabel,
        string headLabel,
        IReadOnlyList<IntentChange> changes,
        IReadOnlyList<SecurityQueueEntry>? securityQueue = null)
    {
        BaseLabel = baseLabel;
        HeadLabel = headLabel;
        Changes = changes;
        SecurityQueue = securityQueue ?? [];
    }

    /// <summary>The base name, as the caller passed it.</summary>
    public string BaseLabel { get; }

    /// <summary>The head name: the branch, or the working tree.</summary>
    public string HeadLabel { get; }

    /// <summary>Every change: removed, then modified, then added.</summary>
    public IReadOnlyList<IntentChange> Changes { get; }

    /// <summary>The security queue: tenant scope widenings, new outside calls, new personal data.</summary>
    public IReadOnlyList<SecurityQueueEntry> SecurityQueue { get; }

    /// <summary>The changes one view shows, in review order.</summary>
    public IReadOnlyList<IntentChange> ChangesIn(DiffView view) =>
        view == DiffView.Both
            ? Changes
            : Changes.Where(change => change.View == "both" || change.View == ViewName(view)).ToList();

    /// <summary>How many changes in one view break approved intent.</summary>
    public int BreakingCountIn(DiffView view) => ChangesIn(view).Count(change => change.Breaking);

    /// <summary>How many changes break approved intent.</summary>
    public int BreakingCount => Changes.Count(change => change.Breaking);

    /// <summary>How many records the head no longer holds.</summary>
    public int RemovedCount => Changes.Count(change => change.Change == ChangeKind.Removed);

    /// <summary>How many records changed intent.</summary>
    public int ModifiedCount => Changes.Count(change => change.Change == ChangeKind.Modified);

    /// <summary>How many records the base did not hold.</summary>
    public int AddedCount => Changes.Count(change => change.Change == ChangeKind.Added);

    /// <summary>The family a record type belongs to.</summary>
    public static string FamilyOf(string type) => type switch
    {
        "product" or "goal" or "problem" or "feature" or "constraint"
            or "research" or "decision" or "requirement" or "journey" => "goals-requirements",
        "module" or "aggregate" or "rule" or "event" or "integration-event" or "use-case"
            or "result" or "scenario" or "reaction" or "job" or "notification" or "setting" => "domain",
        "actor" or "role" or "permission" or "entry-point" or "external-system" => "access",
        _ => "operations",
    };

    /// <summary>The view name a <see cref="DiffView"/> filters on.</summary>
    public static string ViewName(DiffView view) => view switch
    {
        DiffView.Intent => "intent",
        DiffView.Behavior => "behavior",
        _ => "both",
    };

    /// <summary>
    ///     The view showing a record type: Intent records, Behavior records, or both
    ///     for governance records, terms without a layer, and unknown types.
    /// </summary>
    public static string ViewOf(Record record) => record.Type switch
    {
        "product" or "goal" or "problem" or "feature" or "requirement"
            or "constraint" or "decision" or "research" or "journey" or "actor" => "intent",
        "module" or "aggregate" or "rule" or "event" or "integration-event" or "use-case"
            or "result" or "scenario" or "reaction" or "job" or "notification" or "setting"
            or "role" or "permission" or "entry-point" or "external-system" or "runbook" => "behavior",
        "term" => record.Field("layer") is "intent" or "behavior" ? record.Field("layer")! : "both",
        _ => "both",
    };

    /// <summary>The display name of a family.</summary>
    public static string FamilyName(string family) => family switch
    {
        "goals-requirements" => "Goals and requirements",
        "domain" => "Domain",
        "access" => "Access",
        _ => "Operations",
    };

    /// <summary>The review order of a family.</summary>
    public static int FamilyOrder(string family) => family switch
    {
        "goals-requirements" => 0,
        "domain" => 1,
        "access" => 2,
        _ => 3,
    };

    /// <summary>The display name of a record type, such as Use case.</summary>
    public static string TypeName(string type) =>
        type.Length == 0 ? type : char.ToUpperInvariant(type[0]) + type[1..].Replace('-', ' ');

    /// <summary>
    ///     The stable fingerprint of one change, so a pull request comment can be
    ///     amended rather than reposted while the change it describes stays the same.
    /// </summary>
    public static string FingerprintOf(
        ChangeKind change, string id, IEnumerable<string> reasonCodes, IEnumerable<string> details)
    {
        var canonical = string.Join(
            "\n",
            new[] { change.ToString(), id }
                .Concat(reasonCodes.OrderBy(code => code, StringComparer.Ordinal))
                .Concat(details.OrderBy(line => line, StringComparer.Ordinal)));
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(canonical));

        return Convert.ToHexString(hash)[..16].ToLowerInvariant();
    }
}

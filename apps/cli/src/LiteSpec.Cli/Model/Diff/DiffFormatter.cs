using System.Text;

namespace LiteSpec.Model.Diff;

/// <summary>
///     Renders an intent diff for people, for a pull request comment, or for machines.
/// </summary>
static class DiffFormatter
{
    static readonly ChangeKind[] Sections = [ChangeKind.Removed, ChangeKind.Modified, ChangeKind.Added];

    /// <summary>Renders the changelog reviewers read.</summary>
    public static string Text(IntentDiff diff, bool breakingOnly)
    {
        var shown = Shown(diff, breakingOnly);
        var builder = new StringBuilder();

        builder.Append(Header(diff, breakingOnly));

        foreach (var section in Sections)
        {
            var entries = shown.Where(entry => entry.Change == section).ToList();

            builder.Append("\n\n");
            builder.Append(SectionName(section));

            if (entries.Count == 0)
            {
                builder.Append(" (none)");
                continue;
            }

            builder.Append($" ({entries.Count})");

            string? family = null;

            foreach (var entry in entries)
            {
                if (entry.Family != family)
                {
                    family = entry.Family;
                    builder.Append($"\n{IntentDiff.FamilyName(family)}");
                }

                builder.Append($"\n- {(entry.Breaking ? "[BREAKING] " : "")}{IntentDiff.TypeName(entry.Type)} \"{entry.Title}\"{entry.Qualifier}");

                foreach (var detail in entry.Details)
                {
                    builder.Append($"\n  {detail}");
                }

                foreach (var reason in entry.Reasons)
                {
                    builder.Append($"\n  Why it breaks ({reason.Code}): {reason.Message}");
                }
            }
        }

        return builder.ToString();
    }

    /// <summary>Renders the comment a pull request carries, amended on every push.</summary>
    public static string Markdown(IntentDiff diff, bool breakingOnly)
    {
        var shown = Shown(diff, breakingOnly);
        var builder = new StringBuilder();

        builder.Append($"# {Header(diff, breakingOnly)}");

        foreach (var section in Sections)
        {
            var entries = shown.Where(entry => entry.Change == section).ToList();

            builder.Append($"\n\n## {SectionName(section)}");

            if (entries.Count == 0)
            {
                builder.Append(" (none)");
                continue;
            }

            builder.Append($" ({entries.Count})");

            string? family = null;

            foreach (var entry in entries)
            {
                if (entry.Family != family)
                {
                    family = entry.Family;
                    builder.Append($"\n\n### {IntentDiff.FamilyName(family)}");
                }

                builder.Append($"\n- {(entry.Breaking ? "**[BREAKING]** " : "")}{IntentDiff.TypeName(entry.Type)} \"{entry.Title}\"{entry.Qualifier}");

                foreach (var detail in entry.Details)
                {
                    builder.Append($"\n  - {detail}");
                }

                foreach (var reason in entry.Reasons)
                {
                    builder.Append($"\n  - Why it breaks ({reason.Code}): {reason.Message}");
                }
            }
        }

        return builder.ToString();
    }

    /// <summary>Renders the machine diff: every change with its fingerprint and the counts.</summary>
    public static string Json(IntentDiff diff, bool breakingOnly) =>
        CliJson.Serialize(new
        {
            @base = diff.BaseLabel,
            head = diff.HeadLabel,
            summary = new
            {
                breaking = diff.BreakingCount,
                removed = diff.RemovedCount,
                modified = diff.ModifiedCount,
                added = diff.AddedCount,
            },
            changes = Shown(diff, breakingOnly).Select(entry => new
            {
                id = entry.Id,
                title = entry.Title,
                type = entry.Type,
                family = entry.Family,
                change = entry.Change.ToString().ToLowerInvariant(),
                breaking = entry.Breaking,
                reasons = entry.Reasons.Select(reason => new { code = reason.Code, message = reason.Message }).ToList(),
                details = entry.Details,
                fingerprint = entry.Fingerprint,
            }).ToList(),
        });

    static IReadOnlyList<IntentChange> Shown(IntentDiff diff, bool breakingOnly) =>
        breakingOnly ? diff.Changes.Where(entry => entry.Breaking).ToList() : diff.Changes;

    static string Header(IntentDiff diff, bool breakingOnly)
    {
        var header = $"Intent diff: {diff.BaseLabel} -> {diff.HeadLabel} " +
            $"({diff.BreakingCount} breaking, {diff.RemovedCount} removed, " +
            $"{diff.ModifiedCount} modified, {diff.AddedCount} added)";

        return breakingOnly ? $"{header} (breaking only)" : header;
    }

    static string SectionName(ChangeKind section) => section switch
    {
        ChangeKind.Removed => "REMOVED",
        ChangeKind.Modified => "MODIFIED",
        _ => "ADDED",
    };
}

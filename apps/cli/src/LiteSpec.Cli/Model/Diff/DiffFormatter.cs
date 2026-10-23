using System.Text;

namespace LiteSpec.Model.Diff;

/// <summary>
///     Renders an intent diff for people, for a pull request comment, or for machines.
/// </summary>
static class DiffFormatter
{
    static readonly ChangeKind[] Sections = [ChangeKind.Removed, ChangeKind.Modified, ChangeKind.Added];

    /// <summary>Renders the changelog reviewers read.</summary>
    public static string Text(IntentDiff diff, bool breakingOnly, DiffView view = DiffView.Both)
    {
        var shown = Shown(diff, breakingOnly, view);
        var counted = diff.ChangesIn(view);
        var builder = new StringBuilder();

        builder.Append(Header(diff, counted, breakingOnly, view));

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

        if (view != DiffView.Intent)
        {
            builder.Append("\n\nSECURITY QUEUE");

            if (diff.SecurityQueue.Count == 0)
            {
                builder.Append(" (none)");
            }
            else
            {
                builder.Append($" ({diff.SecurityQueue.Count})");

                foreach (var entry in diff.SecurityQueue)
                {
                    builder.Append($"\n- {IntentDiff.TypeName(entry.Type)} \"{entry.Title}\": {entry.Detail}");
                }
            }
        }

        return builder.ToString();
    }

    /// <summary>Renders the comment a pull request carries, amended on every push.</summary>
    public static string Markdown(IntentDiff diff, bool breakingOnly, DiffView view = DiffView.Both)
    {
        var shown = Shown(diff, breakingOnly, view);
        var counted = diff.ChangesIn(view);
        var builder = new StringBuilder();

        builder.Append($"# {Header(diff, counted, breakingOnly, view)}");

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

        if (view != DiffView.Intent)
        {
            builder.Append("\n\n## SECURITY QUEUE");

            if (diff.SecurityQueue.Count == 0)
            {
                builder.Append(" (none)");
            }
            else
            {
                builder.Append($" ({diff.SecurityQueue.Count})");

                foreach (var entry in diff.SecurityQueue)
                {
                    builder.Append($"\n- {IntentDiff.TypeName(entry.Type)} \"{entry.Title}\": {entry.Detail}");
                }
            }
        }

        return builder.ToString();
    }

    /// <summary>Renders the machine diff: every change with its fingerprint and the counts.</summary>
    public static string Json(IntentDiff diff, bool breakingOnly, DiffView view = DiffView.Both)
    {
        var counted = diff.ChangesIn(view);
        IReadOnlyList<SecurityQueueEntry> queue = view == DiffView.Intent ? [] : diff.SecurityQueue;

        return CliJson.Serialize(new
        {
            @base = diff.BaseLabel,
            head = diff.HeadLabel,
            summary = new
            {
                breaking = counted.Count(entry => entry.Breaking),
                removed = counted.Count(entry => entry.Change == ChangeKind.Removed),
                modified = counted.Count(entry => entry.Change == ChangeKind.Modified),
                added = counted.Count(entry => entry.Change == ChangeKind.Added),
            },
            changes = Shown(diff, breakingOnly, view).Select(entry => new
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
            securityQueue = queue.Select(entry => new
            {
                id = entry.Id,
                title = entry.Title,
                type = entry.Type,
                detail = entry.Detail,
            }).ToList(),
        });
    }

    static IReadOnlyList<IntentChange> Shown(IntentDiff diff, bool breakingOnly, DiffView view)
    {
        var changes = diff.ChangesIn(view);

        return breakingOnly ? changes.Where(entry => entry.Breaking).ToList() : changes;
    }

    static string Header(IntentDiff diff, IReadOnlyList<IntentChange> counted, bool breakingOnly, DiffView view)
    {
        var name = view == DiffView.Behavior ? "Behavior diff" : "Intent diff";
        var header = $"{name}: {diff.BaseLabel} -> {diff.HeadLabel} " +
            $"({counted.Count(entry => entry.Breaking)} breaking, " +
            $"{counted.Count(entry => entry.Change == ChangeKind.Removed)} removed, " +
            $"{counted.Count(entry => entry.Change == ChangeKind.Modified)} modified, " +
            $"{counted.Count(entry => entry.Change == ChangeKind.Added)} added)";

        return breakingOnly ? $"{header} (breaking only)" : header;
    }

    static string SectionName(ChangeKind section) => section switch
    {
        ChangeKind.Removed => "REMOVED",
        ChangeKind.Modified => "MODIFIED",
        _ => "ADDED",
    };
}

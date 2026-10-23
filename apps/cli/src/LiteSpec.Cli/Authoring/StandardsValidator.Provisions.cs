using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     The provision contract: labels, assertions, and verification tables.
/// </summary>
static partial class StandardsValidator
{
    static readonly HashSet<string> VerificationMarks = new(["checkable", "guidance"], StringComparer.Ordinal);

    static readonly HashSet<string> LiteSpecCommands = new(
        ["validate", "provisions", "consumer", "ui", "model", "book", "patterns", "init", "new", "rename"],
        StringComparer.Ordinal);

    // A claim is the comparable core of a heading, a Statement, a Default, or a
    // summary bullet: lowercase words with punctuation, code marks, and any leading
    // actor and normative modal removed.
    static string Claim(string text)
    {
        var normalized = ClaimCleanPattern().Replace(text.ToLowerInvariant().Replace("`", "", StringComparison.Ordinal), " ").Trim();
        return ClaimModalPattern().Replace(normalized, "").Trim();
    }

    static void CheckProvisionBodies(string relative, List<Provision> provisions, Action<string, int, string, string> add)
    {
        foreach (var provision in provisions)
        {
            var nonblank = provision.Body.Where(item => item.Line.Trim().Length > 0).ToList();
            string[] allowedLabels = provision.Section == "Standards"
                ? ["Statement", "Deviation", "Rationale", "Example"]
                : ["Default", "Replacement", "Rationale", "Example"];
            var labels = new List<(string Name, int Line)>();
            var activeLabel = "";
            var fenceReported = false;
            foreach (var item in provision.Body)
            {
                var label = ProvisionLabelPattern().Match(item.Line);
                if (label.Success)
                {
                    var name = label.Groups[1].Value;
                    labels.Add((name, item.Number));
                    activeLabel = name;
                    if (!allowedLabels.Contains(name))
                    {
                        add(relative, item.Number, "STANDARD_LABEL_INVALID", $"label '{name}' is invalid in {provision.Section}");
                    }

                    if (name is "Rationale" or "Example")
                    {
                        if (HasNormativeVocabulary(item.Line))
                        {
                            add(relative, item.Number, "STANDARD_INFORMATIVE_NORMATIVE", $"informative content in '{provision.Id}' contains normative vocabulary");
                        }
                    }
                    else if (name == "Deviation" && provision.Section == "Standards")
                    {
                        // The modal lives in the Statement; the Deviation states the
                        // bounded reason that permits a departure, in plain words.
                        if (HasNormativeVocabulary(item.Line))
                        {
                            add(relative, item.Number, "STANDARD_DEVIATION_NORMATIVE", $"Deviation for '{provision.Id}' contains normative vocabulary");
                        }
                    }

                    continue;
                }

                if (item.Fenced)
                {
                    if (activeLabel != "Example" && !fenceReported)
                    {
                        add(relative, item.Number, "STANDARD_EXAMPLE_LABEL", $"fenced example in '{provision.Id}' must follow an Example label");
                        fenceReported = true;
                    }

                    continue;
                }

                if (item.Line.Trim().Length == 0)
                {
                    continue;
                }

                if (activeLabel == "" || activeLabel is "Statement" or "Deviation" or "Default" or "Replacement")
                {
                    add(relative, item.Number, "STANDARD_UNLABELED_CONTENT", $"content in '{provision.Id}' must follow a Rationale or Example label");
                }

                if (activeLabel is "Rationale" or "Example")
                {
                    if (HasNormativeVocabulary(item.Line))
                    {
                        add(relative, item.Number, "STANDARD_INFORMATIVE_NORMATIVE", $"informative content in '{provision.Id}' contains normative vocabulary");
                    }
                }
            }

            foreach (var name in labels.Select(label => label.Name).Distinct().ToList())
            {
                var count = labels.Count(label => label.Name == name);
                if (count > 1)
                {
                    add(relative, labels.First(label => label.Name == name).Line, "STANDARD_LABEL_DUPLICATE", $"provision '{provision.Id}' has {count} {name} labels");
                }
            }

            var previousLabel = -1;
            foreach (var label in labels)
            {
                var position = Array.IndexOf(allowedLabels, label.Name);
                if (position >= 0 && position < previousLabel)
                {
                    add(relative, label.Line, "STANDARD_LABEL_ORDER", $"label '{label.Name}' is out of order in '{provision.Id}'");
                    break;
                }

                if (position >= 0)
                {
                    previousLabel = position;
                }
            }

            if (provision.Section == "Standards")
            {
                CheckStandardAssertion(relative, provision, nonblank, add);
            }
            else
            {
                CheckConventionAssertion(relative, provision, nonblank, add);
            }
        }
    }

    static bool HasNormativeVocabulary(string line)
    {
        var visible = Prose.VisibleText(line);
        return ModalsPattern().Matches(visible).Count > 0 || OtherNormativePattern().IsMatch(visible);
    }

    static void CheckStandardAssertion(string relative, Provision provision, List<LineItem> nonblank, Action<string, int, string, string> add)
    {
        var statements = nonblank.Where(item => item.Line.StartsWith("**Statement:**", StringComparison.Ordinal)).ToList();
        if (statements.Count == 0)
        {
            add(relative, provision.Line, "STANDARD_MISSING_REQUIREMENT", $"Standard '{provision.Id}' has no Statement");
            return;
        }

        if (statements.Count > 1)
        {
            add(relative, provision.Line, "STANDARD_REQUIREMENT_COUNT", $"Standard '{provision.Id}' has {statements.Count} Statements");
        }

        var assertion = statements[0];
        var statement = assertion.Line["**Statement:**".Length..].Trim();
        var modalCount = ModalsPattern().Matches(Prose.VisibleText(statement)).Count;
        if (modalCount != 1)
        {
            add(relative, assertion.Number, "STANDARD_MODAL_COUNT", $"Statement for '{provision.Id}' has {modalCount} normative modals");
        }

        if (OtherNormativePattern().IsMatch(Prose.VisibleText(statement)))
        {
            add(relative, assertion.Number, "STANDARD_MODAL_VOCABULARY", $"Statement for '{provision.Id}' uses an unsupported normative term");
        }

        if (Prose.Sentences(statement).Count != 1)
        {
            add(relative, assertion.Number, "STANDARD_SENTENCE_COUNT", $"Statement for '{provision.Id}' must contain one sentence");
        }

        var should = ShouldPattern().IsMatch(Prose.VisibleText(statement));
        var deviations = nonblank.Where(item => item.Line.StartsWith("**Deviation:**", StringComparison.Ordinal)).ToList();
        if (should && deviations.Count == 0)
        {
            add(relative, provision.Line, "STANDARD_MISSING_DEVIATION", $"recommendation '{provision.Id}' has no Deviation statement");
        }

        if (!should && deviations.Count > 0)
        {
            add(relative, deviations[0].Number, "STANDARD_UNEXPECTED_DEVIATION", $"non-recommendation '{provision.Id}' cannot contain a Deviation statement");
        }

        if (deviations.Count > 0 && Prose.Sentences(deviations[0].Line["**Deviation:**".Length..].Trim()).Count != 1)
        {
            add(relative, deviations[0].Number, "STANDARD_DEVIATION_SENTENCE", $"Deviation for '{provision.Id}' must contain one sentence");
        }
    }

    static void CheckConventionAssertion(string relative, Provision provision, List<LineItem> nonblank, Action<string, int, string, string> add)
    {
        var defaults = nonblank.Where(item => item.Line.StartsWith("**Default:**", StringComparison.Ordinal)).ToList();
        var replacements = nonblank.Where(item => item.Line.StartsWith("**Replacement:**", StringComparison.Ordinal)).ToList();
        if (defaults.Count == 0)
        {
            add(relative, provision.Line, "CONVENTION_MISSING_DEFAULT", $"convention '{provision.Id}' has no Default statement");
        }

        if (replacements.Count == 0)
        {
            add(relative, provision.Line, "CONVENTION_MISSING_REPLACEMENT", $"convention '{provision.Id}' has no Replacement statement");
        }

        if (defaults.Count > 0 && Prose.Sentences(defaults[0].Line["**Default:**".Length..].Trim()).Count != 1)
        {
            add(relative, defaults[0].Number, "CONVENTION_DEFAULT_SENTENCE", $"Default for '{provision.Id}' must contain one sentence");
        }

        if (replacements.Count > 0 && Prose.Sentences(replacements[0].Line["**Replacement:**".Length..].Trim()).Count != 1)
        {
            add(relative, replacements[0].Number, "CONVENTION_REPLACEMENT_SENTENCE", $"Replacement for '{provision.Id}' must contain one sentence");
        }

        // A Replacement names the local convention that takes the default's
        // place. A departure instrument belongs to a Standard, never here.
        if (replacements.Count > 0 && DeviationMentionPattern().IsMatch(Prose.VisibleText(replacements[0].Line["**Replacement:**".Length..])))
        {
            add(relative, replacements[0].Number, "CONVENTION_REPLACEMENT_DEVIATION", $"Replacement for '{provision.Id}' names an exception or deviation; name the local convention instead");
        }
    }

    static void CheckProvisionClaims(string relative, List<Provision> provisions, Action<string, int, string, string> add)
    {
        // A provision whose Statement or Default only repeats its own heading
        // states no obligation. The heading is a label; the assertion belongs in the
        // labeled block. (litespec/core/authoring#write-atomic-standards-provisions, litespec/core/authoring#identify-actionable-conventions)
        foreach (var provision in provisions)
        {
            var label = provision.Section == "Standards" ? "Statement" : "Default";
            var prefix = $"**{label}:**";
            var assertion = provision.Body.FirstOrDefault(item => item.Line.StartsWith(prefix, StringComparison.Ordinal));
            if (assertion is null)
            {
                continue;
            }

            provision.Claim = Claim(assertion.Line[prefix.Length..]);
            if (provision.Claim.Length > 0 && provision.Claim == Claim(provision.Title))
            {
                add(relative, provision.Line, "PROVISION_RESTATES_HEADING", $"{label} for '{provision.Id}' only restates its heading");
            }
        }
    }

    static void CheckNormativeLocation(string relative, List<LineItem> clean, List<Provision> provisions, Action<string, int, string, string> add)
    {
        var provisionLines = new HashSet<int>(provisions.SelectMany(provision => new[] { provision.Line }.Concat(provision.Body.Select(item => item.Number))));
        foreach (var item in clean)
        {
            if (provisionLines.Contains(item.Number))
            {
                continue;
            }

            var text = Prose.VisibleText(item.Line);
            if (ModalsPattern().Matches(text).Count > 0 || OtherNormativePattern().IsMatch(text))
            {
                add(relative, item.Number, "PROSE_NORMATIVE_LOCATION", "normative vocabulary is outside a Statement, Default, or Replacement");
            }
        }
    }

    static void CheckVerificationTable(string relative, string? kind, List<PageSection> sections, List<LineItem> clean, List<Provision> provisions, List<VerificationRow> verificationRows, string root, Action<string, int, string, string> add)
    {
        // Every provision carries its verification mark: checkable with the command
        // that checks it, or guidance with the question a reviewer answers. The table
        // header names the columns, so the provision index reads the marks from the
        // same rows this gate checks.
        var verification = sections.FirstOrDefault(section => section.Name == "Verification");
        if (verification is null || (kind != "topic" && kind != "stack" && kind != "extension" && kind != "pattern"))
        {
            return;
        }

        var position = sections.FindIndex(section => section.Name == "Verification");
        var end = position + 1 < sections.Count ? sections[position + 1].Line - 1 : clean.Count;
        var header = clean.Skip(verification.Line).Take(Math.Max(0, end - verification.Line)).FirstOrDefault(item => VerifyHeaderPattern().IsMatch(item.Line));
        if (header is null)
        {
            add(relative, verification.Line, "VERIFY_HEADER", "Verification must use a table with the header row | ID | Mark | Evidence |");
        }

        // Evidence shared word for word across rows is one check written by
        // hand N times. The owning tool generates such rows instead.
        var seenEvidence = new HashSet<string>(StringComparer.Ordinal);
        for (var index = verification.Line; index < end; index++)
        {
            var match = VerificationRowPattern.Match(clean[index].Line);
            if (!match.Success)
            {
                continue;
            }

            var rowId = match.Groups[1].Value;
            var mark = match.Groups[2].Value.Trim();
            if (!VerificationMarks.Contains(mark))
            {
                add(relative, index + 1, "VERIFY_MARK", $"unknown verification mark '{(mark.Length > 0 ? mark : "(empty)")}' for '{rowId}'; write checkable or guidance");
            }

            var evidence = match.Groups[3].Value.Trim();
            if (GenericEvidencePattern().IsMatch(Prose.VisibleText(evidence)))
            {
                add(relative, index + 1, "VERIFY_GENERIC_EVIDENCE", $"Verification for '{rowId}' uses generic evidence");
            }

            // Evidence that echoes its own provision heading names no artifact. It
            // tells a reviewer to confirm that a rule says what it says.
            var owner = provisions.FirstOrDefault(provision => provision.Id == rowId);
            var ownerClaim = owner is not null ? Claim(owner.Title) : "";
            // A tool's finding tag such as `[litespec/page#slug]` names the
            // provision on purpose, so it does not count as a restatement.
            var withoutTags = ProvisionTagPattern().Replace(evidence, " ");
            if (ownerClaim.Length > 0 && Claim(withoutTags).Contains(ownerClaim, StringComparison.Ordinal))
            {
                add(relative, index + 1, "VERIFY_TEMPLATED_EVIDENCE", $"Verification for '{rowId}' repeats its provision heading instead of naming evidence");
            }

            var normalized = evidence.Trim();
            if (normalized.Length > 0 && !seenEvidence.Add(normalized))
            {
                add(relative, index + 1, "VERIFY_DUPLICATE_EVIDENCE", $"Verification for '{rowId}' repeats evidence used by another row on this page");
            }

            if (mark == "checkable")
            {
                CheckVerificationCommand(relative, index + 1, rowId, evidence, root, add);
            }

            verificationRows.Add(new VerificationRow(rowId, mark, index + 1, evidence));
        }

        var rowIds = verificationRows.Select(row => row.Id).ToList();
        foreach (var provision in provisions)
        {
            var count = rowIds.Count(id => id == provision.Id);
            if (count == 0)
            {
                add(relative, verification.Line, "VERIFY_MISSING_ID", $"Verification has no row for '{provision.Id}'");
            }

            if (count > 1)
            {
                add(relative, verification.Line, "VERIFY_DUPLICATE_ID", $"Verification has {count} rows for '{provision.Id}'");
            }
        }

        foreach (var row in verificationRows)
        {
            if (!provisions.Any(provision => provision.Id == row.Id))
            {
                add(relative, row.Line, "VERIFY_UNKNOWN_ID", $"Verification references unknown page provision '{row.Id}'");
            }
        }
    }

    // A checkable row's Evidence starts with the command that checks it, in
    // backticks. A shipped tool is cited in its consumer-side form, so a leading
    // `litespec/` resolves against the repository root with the prefix removed. A
    // path outside the shipped trees is a consumer command the page itself defines,
    // such as the consumer's route suite, which exists in consumers rather than
    // here, so only a shipped tool path that does not exist fails.
    static void CheckVerificationCommand(string relative, int line, string id, string evidence, string root, Action<string, int, string, string> add)
    {
        var command = EvidenceCommandPattern().Match(evidence);
        if (!command.Success)
        {
            add(relative, line, "VERIFY_COMMAND", $"Verification for '{id}' is checkable but names no command");
            return;
        }

        var tokens = TokenSplitPattern().Split(command.Groups[1].Value);
        CheckLiteSpecCommandName(relative, line, id, tokens, add);

        var candidates = new List<string>();
        var projectIndex = Array.IndexOf(tokens, "--project");
        if (projectIndex >= 0 && projectIndex + 1 < tokens.Length && tokens[projectIndex + 1].Length > 0)
        {
            candidates.Add(tokens[projectIndex + 1]);
        }

        foreach (var token in tokens)
        {
            var cleaned = TokenCleanPattern().Replace(token, "").Split('#')[0];
            if (PathShapedPattern().IsMatch(cleaned))
            {
                candidates.Add(cleaned);
            }
        }

        foreach (var rawCandidate in candidates)
        {
            var candidate = rawCandidate.StartsWith("litespec/", StringComparison.Ordinal) ? rawCandidate["litespec/".Length..] : rawCandidate;
            if (!candidate.StartsWith("tools/", StringComparison.Ordinal)
                && !candidate.StartsWith("apps/", StringComparison.Ordinal)
                && !candidate.StartsWith("packages/", StringComparison.Ordinal))
            {
                continue;
            }

            var target = JoinRoot(root, candidate);
            if (!File.Exists(target) && !Directory.Exists(target))
            {
                add(relative, line, "VERIFY_COMMAND", $"Verification for '{id}' names '{candidate}', which does not exist in the repository");
                return;
            }
        }
    }

    static void CheckLiteSpecCommandName(string relative, int line, string id, string[] tokens, Action<string, int, string, string> add)
    {
        if (tokens.Length > 0 && tokens[0] == "litespec")
        {
            var subcommand = tokens.Length > 1 ? tokens[1] : "";
            if (!LiteSpecCommands.Contains(subcommand))
            {
                add(relative, line, "VERIFY_COMMAND", $"Verification for '{id}' names 'litespec {subcommand}', which is not a litespec command");
            }

            return;
        }

        if (tokens.Length > 5 && tokens[0] == "dotnet" && tokens[1] == "run" && tokens[2] == "--project" && tokens[4] == "--"
            && tokens[3].EndsWith("LiteSpec.Cli", StringComparison.Ordinal) && !LiteSpecCommands.Contains(tokens[5]))
        {
            add(relative, line, "VERIFY_COMMAND", $"Verification for '{id}' names 'litespec {tokens[5]}', which is not a litespec command");
        }
    }

    [GeneratedRegex(@"\b(?:MUST NOT|SHOULD NOT|MUST|SHOULD|MAY)\b")]
    private static partial Regex ModalsPattern();

    [GeneratedRegex(@"\b(?:REQUIRED|FORBIDDEN|SHALL)\b")]
    private static partial Regex OtherNormativePattern();

    [GeneratedRegex(@"^\*\*(Statement|Deviation|Rationale|Example|Default|Replacement):\*\*")]
    private static partial Regex ProvisionLabelPattern();

    [GeneratedRegex(@"\b(?:exceptions?|deviations?)\b", RegexOptions.IgnoreCase)]
    private static partial Regex DeviationMentionPattern();

    [GeneratedRegex(@"\b(?:verify compliance|check compliance|inspect evidence|verify evidence)\b", RegexOptions.IgnoreCase)]
    private static partial Regex GenericEvidencePattern();

    [GeneratedRegex(@"[^a-z0-9]+")]
    private static partial Regex ClaimCleanPattern();

    [GeneratedRegex(@"^.*?\b(must not|must|should not|should|may)\b\s*")]
    private static partial Regex ClaimModalPattern();

    [GeneratedRegex(@"\bSHOULD(?: NOT)?\b")]
    private static partial Regex ShouldPattern();

    [GeneratedRegex(@"^\|\s*ID\s*\|\s*Mark\s*\|\s*Evidence\s*\|\s*$")]
    private static partial Regex VerifyHeaderPattern();

    [GeneratedRegex(@"`([^`]+)`")]
    private static partial Regex EvidenceCommandPattern();

    [GeneratedRegex(@"\s+")]
    private static partial Regex TokenSplitPattern();

    [GeneratedRegex(@"^['""]|['"",;]+$")]
    private static partial Regex TokenCleanPattern();

    [GeneratedRegex(@"^(?:[A-Za-z0-9_.-]+/)+[A-Za-z0-9_.-]+$")]
    private static partial Regex PathShapedPattern();

    [GeneratedRegex(@"\[litespec/[^\]\s]+\]")]
    private static partial Regex ProvisionTagPattern();
}

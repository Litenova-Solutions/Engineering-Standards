using System.Text.Json;

namespace LiteSpec.Model.Diff;

/// <summary>
///     Compares two project models record by record, matched by identifier.
/// </summary>
static class Differ
{
    /// <summary>
    ///     Fields that carry no intent: identity, ownership, review planning and the
    ///     entries a page carries, which diff as records of their own.
    /// </summary>
    static readonly HashSet<string> MetaFields = new(StringComparer.Ordinal)
    {
        "type", "id", "title", "owner", "status", "decider", "decideBy",
        "terms", "questions", "records",
    };

    /// <summary>One parsed access grant: auth kinds, grant and tenant scope.</summary>
    sealed record AccessValue(HashSet<string> Auth, string? Grant, string? Tenant);

    /// <summary>One parsed effect edge: its verb, target and timing.</summary>
    sealed record EffectEntry(string Verb, string Target, string? Timing)
    {
        /// <summary>The edge without its timing, such as calls external-system/stripe#charge.</summary>
        public string Edge() => $"{Verb} {Target}";

        /// <summary>The edge with its timing.</summary>
        public string Describe() => $"{Verb} {Target} ({Timing ?? "no timing"})";
    }

    /// <summary>One parsed data class: its classification and erasure position.</summary>
    sealed record DataClassValue(string? Classification, string? OnErasure);

    /// <summary>One parsed journey step: its sentence, actor and fallback.</summary>
    sealed record JourneyStep(string Says, string? Actor, string? IfItGoesWrong);

    /// <summary>Diffs the base model against the head model.</summary>
    public static IntentDiff Diff(
        ProjectModel baseModel, ProjectModel headModel, string baseLabel, string headLabel)
    {
        var baseById = baseModel.ById;
        var headById = headModel.ById;

        // A derived generic result follows its use case, so the use case's own
        // entry carries the change and the derived record stays out of the diff.
        var removedIds = baseById.Keys.Where(id => !headById.ContainsKey(id) && !baseById[id].Derived)
            .ToHashSet(StringComparer.Ordinal);
        var addedIds = headById.Keys.Where(id => !baseById.ContainsKey(id) && !headById[id].Derived)
            .ToHashSet(StringComparer.Ordinal);
        var changes = new List<IntentChange>();
        var byId = new Dictionary<string, IntentChange>(StringComparer.Ordinal);

        foreach (var id in removedIds)
        {
            var entry = RemovedEntry(baseModel, baseById[id]);

            changes.Add(entry);
            byId[id] = entry;
        }

        foreach (var id in addedIds)
        {
            var entry = AddedEntry(baseModel, headModel, headById[id], addedIds);

            changes.Add(entry);
            byId[id] = entry;
        }

        foreach (var id in baseById.Keys.Where(id => headById.ContainsKey(id) && !baseById[id].Derived))
        {
            var entry = ModifiedEntry(
                baseModel, headModel, baseById[id], headById[id], addedIds, removedIds, byId);

            if (entry is not null)
            {
                changes.Add(entry);
                byId[id] = entry;
            }
        }

        changes.Sort((left, right) =>
        {
            var section = left.Change.CompareTo(right.Change);

            if (section != 0)
            {
                return section;
            }

            var family = IntentDiff.FamilyOrder(left.Family).CompareTo(IntentDiff.FamilyOrder(right.Family));

            if (family != 0)
            {
                return family;
            }

            var type = string.Compare(left.Type, right.Type, StringComparison.Ordinal);

            return type != 0
                ? type
                : string.Compare(left.Id, right.Id, StringComparison.Ordinal);
        });

        for (var index = 0; index < changes.Count; index++)
        {
            var entry = changes[index];

            changes[index] = entry with
            {
                Fingerprint = IntentDiff.FingerprintOf(
                    entry.Change, entry.Id,
                    entry.Reasons.Select(reason => reason.Code), entry.Details),
            };
        }

        return new IntentDiff(
            baseLabel, headLabel, changes, SecurityQueue(baseModel, headModel, addedIds, removedIds));
    }

    static IntentChange RemovedEntry(ProjectModel baseModel, Record record)
    {
        var details = new List<string> { RemovedLine(record) };

        if (record.Type == "scenario")
        {
            details.Add(ScenarioLine(record));
        }

        if (record.Type == "aggregate")
        {
            details.Add(AggregateStatesLine(record));
        }

        if (record.Type == "journey")
        {
            details.AddRange(JourneyStepsLines(record));
        }

        var reasons = new List<BreakingReason>();

        if (Approved(baseModel, record))
        {
            var reason = record.Type switch
            {
                "requirement" => "requirement-removed",
                "result" => "result-removed",
                "scenario" => "scenario-removed",
                "aggregate" => "aggregate-removed",
                _ => null,
            };

            if (reason is not null)
            {
                reasons.Add(Reason(reason));
            }
        }

        return Entry(record, ChangeKind.Removed, reasons, details);
    }

    static IntentChange AddedEntry(
        ProjectModel baseModel, ProjectModel headModel, Record record, HashSet<string> addedIds)
    {
        var details = new List<string> { AddedLine(baseModel, headModel, record) };

        if (record.Type == "scenario")
        {
            details.Add(ScenarioLine(record));
        }

        if (record.Type == "journey")
        {
            details.AddRange(JourneyStepsLines(record));
        }

        var reasons = new List<BreakingReason>();

        if (record.Type == "result"
            && record.Field("outcome") == "refusal"
            && Identifiers.TrySplit(record.Id, out _, out var home, out _)
            && home is not null
            && ModelBuilder.UseCaseOf(baseModel, home) is { } useCase
            && Approved(baseModel, useCase))
        {
            reasons.Add(Reason("refusal-added"));
        }

        if (record.Type == "rule"
            && record.Field("kind") == "precondition"
            && record.Ids("governs").Any(target =>
                target.StartsWith("use-case/", StringComparison.Ordinal)
                && baseModel.ById.TryGetValue(target, out var governed)
                && Approved(baseModel, governed)))
        {
            reasons.Add(Reason("precondition-added"));
        }

        if (record.Type == "scenario"
            && record.Ids("result").FirstOrDefault() is { } resultId
            && addedIds.Contains(resultId)
            && headModel.ById.TryGetValue(resultId, out var result)
            && result.Field("outcome") == "refusal")
        {
            reasons.Add(Reason("refusal-path-added"));
        }

        return Entry(record, ChangeKind.Added, reasons, details);
    }

    static IntentChange? ModifiedEntry(
        ProjectModel baseModel,
        ProjectModel headModel,
        Record before,
        Record after,
        HashSet<string> addedIds,
        HashSet<string> removedIds,
        Dictionary<string, IntentChange> byId)
    {
        var details = new List<string>();
        var reasons = new List<BreakingReason>();
        var approved = Approved(baseModel, before);

        if (before.Type != after.Type)
        {
            details.Add($"Type changed from {before.Type} to {after.Type}.");
            return Entry(after, ChangeKind.Modified, reasons, details);
        }

        CompareStatus(before, after, details);
        CompareQuestions(before, after, details);

        switch (before.Type)
        {
            case "requirement":
                CompareRequirement(before, after, approved, details, reasons);
                break;

            case "journey":
                CompareJourney(before, after, details);
                break;

            case "decision":
                CompareDecision(before, after, details);
                break;

            case "rule":
                CompareRule(before, after, approved, details, reasons);
                break;

            case "result":
                CompareResult(before, after, approved, details, reasons);
                break;

            case "scenario":
                CompareScenario(before, after, details);
                break;

            case "aggregate":
                CompareAggregate(before, after, baseModel, headModel, approved, details, reasons);
                break;

            case "use-case":
                CompareUseCase(before, after, details);
                EnrichUseCase(baseModel, headModel, before, addedIds, removedIds, byId, details, reasons);
                break;

            default:
                CompareFields(before, after, details);
                break;
        }

        return details.Count == 0 ? null : Entry(after, ChangeKind.Modified, reasons, details);
    }

    static IntentChange Entry(
        Record record, ChangeKind change, List<BreakingReason> reasons, List<string> details) =>
        new(
            record.Id,
            record.Title,
            record.Type,
            IntentDiff.FamilyOf(record.Type),
            Qualifier(record),
            change,
            reasons.Count > 0,
            reasons,
            details,
            IntentDiff.ViewOf(record));

    static string Qualifier(Record record) => record.Type switch
    {
        "requirement" => record.Field("kind") is { } kind ? $" ({kind})" : "",
        "rule" => record.Field("kind") is { } kind ? $" ({kind})" : "",
        "use-case" => record.Field("kind") is { } kind ? $" ({kind})" : "",
        "result" => record.Field("outcome") is { } outcome ? $" ({outcome})" : "",
        _ => "",
    };

    static string RemovedLine(Record record)
    {
        var title = record.Title;

        return record.Type switch
        {
            "result" when record.Field("outcome") == "refusal"
                => $"Removed refusal: {title} ({record.Field("code") ?? "no code"}).",
            "result" => $"Removed success result: {title}.",
            "scenario" => $"Removed scenario: {title}.",
            "requirement" => $"Removed {record.Field("kind") ?? "requirement"} requirement: {title}.",
            "rule" => $"Removed {record.Field("kind") ?? "rule"} rule: {title}.",
            "use-case" => $"Removed {record.Field("kind") ?? "use case"}: {title}.",
            "aggregate" => $"Removed aggregate: {title}.",
            _ => $"Removed {record.Type.Replace('-', ' ')}: {title}.",
        };
    }

    static string AddedLine(ProjectModel baseModel, ProjectModel headModel, Record record)
    {
        var title = record.Title;

        if (record.Type == "result" && record.Field("outcome") == "refusal")
        {
            var holder = Identifiers.TrySplit(record.Id, out _, out var home, out _) && home is not null
                ? ModelBuilder.UseCaseOf(headModel, home) ?? ModelBuilder.UseCaseOf(baseModel, home)
                : null;

            return holder is null
                ? $"New refusal: {title} ({record.Field("code") ?? "no code"})."
                : $"New refusal: {title} ({record.Field("code") ?? "no code"}) on use case \"{holder.Title}\".";
        }

        return record.Type switch
        {
            "result" => $"New success result: {title}.",
            "scenario" => $"New scenario: {title}.",
            "requirement" => $"New {record.Field("kind") ?? "requirement"} requirement: {title}.",
            "rule" => $"New {record.Field("kind") ?? "rule"} rule: {title}.",
            "use-case" => $"New {record.Field("kind") ?? "use case"}: {title}.",
            _ => $"New {record.Type.Replace('-', ' ')}: {title}.",
        };
    }

    static string ScenarioLine(Record record) =>
        $"Given {record.Field("given") ?? "nothing"}; when {record.Field("when") ?? "nothing"}; then {record.Field("then") ?? "nothing"}.";

    /// <summary>One product sentence per journey step, in step order.</summary>
    static List<string> JourneyStepsLines(Record record)
    {
        var steps = JourneySteps(record);

        if (steps is null)
        {
            return [];
        }

        return steps
            .OrderBy(step => step.Key, StringComparer.Ordinal)
            .Select(step => $"Step {step.Key}: \"{step.Value.Says}\".")
            .ToList();
    }

    static string AggregateStatesLine(Record record)
    {
        var states = StateNames(record);

        return states.Count == 0 ? "It held no states." : $"It held states: {string.Join(", ", states)}.";
    }

    /// <summary>
    ///     Lists the refusals and preconditions a change adds to or removes from a use
    ///     case, mirroring the breaking reasons of their own entries.
    /// </summary>
    static void EnrichUseCase(
        ProjectModel baseModel,
        ProjectModel headModel,
        Record useCase,
        HashSet<string> addedIds,
        HashSet<string> removedIds,
        Dictionary<string, IntentChange> byId,
        List<string> details,
        List<BreakingReason> reasons)
    {
        if (!Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
        {
            return;
        }

        var seen = new HashSet<string>(StringComparer.Ordinal);

        void Mirror(string id)
        {
            if (byId.TryGetValue(id, out var entry))
            {
                foreach (var reason in entry.Reasons)
                {
                    if (seen.Add(reason.Code))
                    {
                        reasons.Add(reason);
                    }
                }
            }
        }

        foreach (var result in AddedResults(headModel, addedIds, name)
                     .OrderBy(record => record.Title, StringComparer.Ordinal))
        {
            details.Add(result.Field("outcome") == "refusal"
                ? $"Added refusal: \"{result.Title}\" ({result.Field("code") ?? "no code"})."
                : $"Added result: \"{result.Title}\".");
            Mirror(result.Id);
        }

        foreach (var result in RemovedResults(baseModel, removedIds, name)
                     .OrderBy(record => record.Title, StringComparer.Ordinal))
        {
            details.Add(result.Field("outcome") == "refusal"
                ? $"Removed refusal: \"{result.Title}\" ({result.Field("code") ?? "no code"})."
                : $"Removed result: \"{result.Title}\".");
            Mirror(result.Id);
        }

        foreach (var rule in AddedRules(headModel, addedIds, useCase.Id)
                     .OrderBy(record => record.Title, StringComparer.Ordinal))
        {
            details.Add($"Added precondition: \"{rule.Title}\".");
            Mirror(rule.Id);
        }

        foreach (var rule in RemovedRules(baseModel, removedIds, useCase.Id)
                     .OrderBy(record => record.Title, StringComparer.Ordinal))
        {
            details.Add($"Removed precondition: \"{rule.Title}\".");
            Mirror(rule.Id);
        }
    }

    static IEnumerable<Record> AddedResults(ProjectModel headModel, HashSet<string> addedIds, string home) =>
        headModel.Records.Where(record =>
            record.Type == "result"
            && addedIds.Contains(record.Id)
            && Identifiers.TrySplit(record.Id, out _, out var resultHome, out _)
            && resultHome == home);

    static IEnumerable<Record> RemovedResults(ProjectModel baseModel, HashSet<string> removedIds, string home) =>
        baseModel.Records.Where(record =>
            record.Type == "result"
            && removedIds.Contains(record.Id)
            && Identifiers.TrySplit(record.Id, out _, out var resultHome, out _)
            && resultHome == home);

    static IEnumerable<Record> AddedRules(ProjectModel headModel, HashSet<string> addedIds, string useCaseId) =>
        headModel.Records.Where(record =>
            record.Type == "rule"
            && record.Field("kind") == "precondition"
            && addedIds.Contains(record.Id)
            && record.Ids("governs").Contains(useCaseId, StringComparer.Ordinal));

    static IEnumerable<Record> RemovedRules(ProjectModel baseModel, HashSet<string> removedIds, string useCaseId) =>
        baseModel.Records.Where(record =>
            record.Type == "rule"
            && record.Field("kind") == "precondition"
            && removedIds.Contains(record.Id)
            && record.Ids("governs").Contains(useCaseId, StringComparer.Ordinal));

    static void CompareStatus(Record before, Record after, List<string> details)
    {
        var oldStatus = before.Status ?? "approved";
        var newStatus = after.Status ?? "approved";

        if (!string.Equals(oldStatus, newStatus, StringComparison.Ordinal))
        {
            details.Add($"Status changed from {oldStatus} to {newStatus}.");
        }
    }

    static void CompareRequirement(
        Record before, Record after, bool approved, List<string> details, List<BreakingReason> reasons)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "statement", "measure", "by", "except" };

        if (CompareValue("Statement", Field(before, "statement"), Field(after, "statement"), details) && approved)
        {
            reasons.Add(Reason("requirement-narrowed"));
        }

        var measureChanged = CompareValue("Measure", Field(before, "measure"), Field(after, "measure"), details);
        var targetChanged = CompareValue("Target", Field(before, "by"), Field(after, "by"), details);

        if ((measureChanged || targetChanged) && approved && before.Field("kind") == "quality")
        {
            reasons.Add(Reason("quality-measure-changed"));
        }

        CompareExcept(before, after, details);
        CompareFields(before, after, details, handled);
    }

    static void CompareExcept(Record before, Record after, List<string> details)
    {
        var oldExcept = ExceptEntries(before);
        var newExcept = ExceptEntries(after);

        if (oldExcept is null || newExcept is null)
        {
            CompareValue("Except", Field(before, "except"), Field(after, "except"), details);
            return;
        }

        foreach (var when in oldExcept.Keys.Where(when => !newExcept.ContainsKey(when))
                     .OrderBy(when => when, StringComparer.Ordinal))
        {
            details.Add($"Exception removed: \"{when}\".");
        }

        foreach (var when in newExcept.Keys.Where(when => !oldExcept.ContainsKey(when))
                     .OrderBy(when => when, StringComparer.Ordinal))
        {
            details.Add($"Exception added: \"{when}\", falling back to {newExcept[when]}.");
        }

        foreach (var when in oldExcept.Keys.Where(newExcept.ContainsKey)
                     .OrderBy(when => when, StringComparer.Ordinal))
        {
            if (!string.Equals(oldExcept[when], newExcept[when], StringComparison.Ordinal))
            {
                details.Add($"Exception \"{when}\" now falls back to {newExcept[when]} (was: {oldExcept[when]}).");
            }
        }
    }

    static void CompareJourney(Record before, Record after, List<string> details)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "goal", "finishedWhen", "steps" };

        CompareValue("Goal", Field(before, "goal"), Field(after, "goal"), details);
        CompareValue("Finished when", Field(before, "finishedWhen"), Field(after, "finishedWhen"), details);
        CompareJourneySteps(before, after, details);
        CompareFields(before, after, details, handled);
    }

    static void CompareJourneySteps(Record before, Record after, List<string> details)
    {
        var oldSteps = JourneySteps(before);
        var newSteps = JourneySteps(after);

        if (oldSteps is null || newSteps is null)
        {
            CompareValue("Steps", Field(before, "steps"), Field(after, "steps"), details);
            return;
        }

        foreach (var id in oldSteps.Keys.Where(id => !newSteps.ContainsKey(id))
                     .OrderBy(id => id, StringComparer.Ordinal))
        {
            details.Add($"Step {id} removed: \"{oldSteps[id].Says}\".");
        }

        foreach (var id in newSteps.Keys.Where(id => !oldSteps.ContainsKey(id))
                     .OrderBy(id => id, StringComparer.Ordinal))
        {
            details.Add($"Step {id} added: \"{newSteps[id].Says}\".");
        }

        foreach (var id in oldSteps.Keys.Where(newSteps.ContainsKey)
                     .OrderBy(id => id, StringComparer.Ordinal))
        {
            var oldStep = oldSteps[id];
            var newStep = newSteps[id];

            if (!string.Equals(oldStep.Says, newStep.Says, StringComparison.Ordinal))
            {
                details.Add($"Step {id} changed: \"{newStep.Says}\" (was: \"{oldStep.Says}\").");
            }

            if (!string.Equals(oldStep.Actor, newStep.Actor, StringComparison.Ordinal))
            {
                details.Add($"Step {id} actor changed from {oldStep.Actor ?? "none"} to {newStep.Actor ?? "none"}.");
            }

            if (!string.Equals(oldStep.IfItGoesWrong, newStep.IfItGoesWrong, StringComparison.Ordinal))
            {
                details.Add(oldStep.IfItGoesWrong is null
                    ? $"Step {id} gained a fallback: \"{newStep.IfItGoesWrong}\"."
                    : newStep.IfItGoesWrong is null
                        ? $"Step {id} lost its fallback."
                        : $"Step {id} fallback changed: \"{newStep.IfItGoesWrong}\" (was: \"{oldStep.IfItGoesWrong}\").");
            }
        }
    }

    static void CompareDecision(Record before, Record after, List<string> details)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "chosen", "decided", "options" };

        CompareValue("Chosen", Field(before, "chosen"), Field(after, "chosen"), details);
        CompareValue("Decided", Field(before, "decided"), Field(after, "decided"), details);
        CompareDecisionOptions(before, after, details);
        CompareFields(before, after, details, handled);
    }

    static void CompareDecisionOptions(Record before, Record after, List<string> details)
    {
        var oldOptions = OptionNames(before);
        var newOptions = OptionNames(after);

        if (oldOptions is null || newOptions is null)
        {
            CompareValue("Options", Field(before, "options"), Field(after, "options"), details);
            return;
        }

        foreach (var name in oldOptions.Where(name => !newOptions.Contains(name, StringComparer.Ordinal))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"Option removed: \"{name}\".");
        }

        foreach (var name in newOptions.Where(name => !oldOptions.Contains(name, StringComparer.Ordinal))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"Option added: \"{name}\".");
        }
    }

    /// <summary>
    ///     Compares the open questions on any record, keyed by the question text.
    ///     The generic field walk skips questions, so this runs for every type.
    /// </summary>
    static void CompareQuestions(Record before, Record after, List<string> details)
    {
        var oldQuestions = QuestionEntries(before);
        var newQuestions = QuestionEntries(after);

        if (oldQuestions is null || newQuestions is null)
        {
            if (Field(before, "questions") is not null || Field(after, "questions") is not null)
            {
                CompareValue("Questions", Field(before, "questions"), Field(after, "questions"), details);
            }

            return;
        }

        if (oldQuestions.Count == 0 && newQuestions.Count == 0)
        {
            return;
        }

        foreach (var question in oldQuestions.Keys.Where(question => !newQuestions.ContainsKey(question))
                     .OrderBy(question => question, StringComparer.Ordinal))
        {
            details.Add($"Question removed: \"{question}\".");
        }

        foreach (var question in newQuestions.Keys.Where(question => !oldQuestions.ContainsKey(question))
                     .OrderBy(question => question, StringComparer.Ordinal))
        {
            details.Add($"Question added: \"{question}\".");
        }

        foreach (var question in oldQuestions.Keys.Where(newQuestions.ContainsKey)
                     .OrderBy(question => question, StringComparer.Ordinal))
        {
            var oldEntry = oldQuestions[question];
            var newEntry = newQuestions[question];

            CompareQuestionField(question, "recommended", oldEntry, newEntry, details);
            CompareQuestionField(question, "decideBy", oldEntry, newEntry, details);
            CompareQuestionField(question, "decider", oldEntry, newEntry, details);
            CompareQuestionField(question, "ballot", oldEntry, newEntry, details);
        }
    }

    static void CompareQuestionField(
        string question, string field, JsonElement oldEntry, JsonElement newEntry, List<string> details)
    {
        var oldValue = StringOf(oldEntry, field);
        var newValue = StringOf(newEntry, field);

        if (!string.Equals(oldValue, newValue, StringComparison.Ordinal))
        {
            details.Add($"Question \"{question}\" {field} changed: \"{newValue ?? "none"}\" (was: \"{oldValue ?? "none"}\").");
        }
    }

    static void CompareRule(
        Record before, Record after, bool approved, List<string> details, List<BreakingReason> reasons)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "kind" };
        var oldKind = before.Field("kind");
        var newKind = after.Field("kind");

        if (!string.Equals(oldKind, newKind, StringComparison.Ordinal))
        {
            details.Add($"Rule kind changed from {oldKind ?? "none"} to {newKind ?? "none"}.");

            if (approved && Weakened(oldKind, newKind))
            {
                reasons.Add(Reason("rule-weakened"));
            }
        }

        CompareFields(before, after, details, handled);
    }

    /// <summary>
    ///     Whether the kind change weakens the rule: an invariant always holds, so any
    ///     move away from it narrows what it promises, as does a move from a
    ///     precondition to a calculation or a cross-aggregate rule.
    /// </summary>
    static bool Weakened(string? oldKind, string? newKind) =>
        oldKind switch
        {
            "invariant" => newKind != "invariant",
            "precondition" => newKind is "calculation" or "cross-aggregate",
            _ => false,
        };

    static void CompareResult(
        Record before, Record after, bool approved, List<string> details, List<BreakingReason> reasons)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "outcome", "meaning" };
        var oldOutcome = before.Field("outcome");
        var newOutcome = after.Field("outcome");

        if (!string.Equals(oldOutcome, newOutcome, StringComparison.Ordinal))
        {
            details.Add($"Outcome changed from {oldOutcome ?? "none"} to {newOutcome ?? "none"}.");

            if (approved)
            {
                reasons.Add(Reason("result-outcome-changed"));
            }
        }

        if (CompareValue("Meaning", Field(before, "meaning"), Field(after, "meaning"), details)
            && approved
            && oldOutcome == "refusal"
            && newOutcome == "refusal")
        {
            reasons.Add(Reason("refusal-meaning-changed"));
        }

        CompareFields(before, after, details, handled);
    }

    static void CompareScenario(Record before, Record after, List<string> details)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "given", "when", "then", "result", "examples" };

        CompareValue("Given", Field(before, "given"), Field(after, "given"), details);
        CompareValue("When", Field(before, "when"), Field(after, "when"), details);
        CompareValue("Then", Field(before, "then"), Field(after, "then"), details);
        CompareValue("Result", Field(before, "result"), Field(after, "result"), details);
        CompareExamples(Field(before, "examples"), Field(after, "examples"), details);
        CompareFields(before, after, details, handled);
    }

    static void CompareExamples(JsonElement? before, JsonElement? after, List<string> details)
    {
        var oldRows = ExampleRows(before);
        var newRows = ExampleRows(after);

        if (oldRows is null || newRows is null)
        {
            if (!JsonEquals(before, after))
            {
                details.Add("Examples changed.");
            }

            return;
        }

        var added = newRows.Except(oldRows).Count();
        var removed = oldRows.Except(newRows).Count();

        if (added > 0 && removed > 0)
        {
            details.Add($"Examples changed: +{added} rows, -{removed} rows.");
        }
        else if (added > 0)
        {
            details.Add($"Examples changed: +{added} rows.");
        }
        else if (removed > 0)
        {
            details.Add($"Examples changed: -{removed} rows.");
        }
    }

    static HashSet<string>? ExampleRows(JsonElement? value)
    {
        if (value is null)
        {
            return new HashSet<string>(StringComparer.Ordinal);
        }

        if (value.Value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        return value.Value.EnumerateArray().Select(Canonical).ToHashSet(StringComparer.Ordinal);
    }

    static void CompareAggregate(
        Record before,
        Record after,
        ProjectModel baseModel,
        ProjectModel headModel,
        bool approved,
        List<string> details,
        List<BreakingReason> reasons)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "states", "transitions", "data", "dataClasses" };

        CompareStates(before, after, approved, details, reasons);
        CompareTransitions(before, after, baseModel, headModel, approved, details, reasons);
        CompareData(before, after, details);
        CompareDataClasses(before, after, details);
        CompareFields(before, after, details, handled);
    }

    static void CompareUseCase(Record before, Record after, List<string> details)
    {
        var handled = new HashSet<string>(StringComparer.Ordinal) { "access", "effects" };

        CompareAccess(before, after, details);
        CompareEffects(before, after, details);
        CompareFields(before, after, details, handled);
    }

    static void CompareAccess(Record before, Record after, List<string> details)
    {
        var oldAccess = AccessOf(before);
        var newAccess = AccessOf(after);

        if (oldAccess is null || newAccess is null)
        {
            CompareValue("Access", Field(before, "access"), Field(after, "access"), details);
            return;
        }

        if (!string.Equals(oldAccess.Tenant, newAccess.Tenant, StringComparison.Ordinal))
        {
            details.Add($"Tenant scope changed from {oldAccess.Tenant ?? "none"} to {newAccess.Tenant ?? "none"}.");
        }

        if (!string.Equals(oldAccess.Grant, newAccess.Grant, StringComparison.Ordinal))
        {
            details.Add($"Grant changed: \"{newAccess.Grant ?? "none"}\" (was: \"{oldAccess.Grant ?? "none"}\").");
        }

        var oldAuth = oldAccess.Auth;
        var newAuth = newAccess.Auth;

        if (!oldAuth.SetEquals(newAuth))
        {
            var parts = newAuth.Except(oldAuth, StringComparer.Ordinal).OrderBy(kind => kind, StringComparer.Ordinal)
                    .Select(kind => $"+{kind}")
                .Concat(oldAuth.Except(newAuth, StringComparer.Ordinal).OrderBy(kind => kind, StringComparer.Ordinal)
                    .Select(kind => $"-{kind}"))
                .ToList();

            details.Add($"Auth changed: {string.Join(", ", parts)}.");
        }
    }

    static void CompareEffects(Record before, Record after, List<string> details)
    {
        var oldEffects = EffectEntries(before);
        var newEffects = EffectEntries(after);

        if (oldEffects is null || newEffects is null)
        {
            CompareValue("Effects", Field(before, "effects"), Field(after, "effects"), details);
            return;
        }

        foreach (var key in oldEffects.Keys.Where(key => !newEffects.ContainsKey(key))
                     .OrderBy(key => key, StringComparer.Ordinal))
        {
            details.Add($"Effect removed: {oldEffects[key].Describe()}.");
        }

        foreach (var key in newEffects.Keys.Where(key => !oldEffects.ContainsKey(key))
                     .OrderBy(key => key, StringComparer.Ordinal))
        {
            details.Add($"Effect added: {newEffects[key].Describe()}.");
        }

        foreach (var key in oldEffects.Keys.Where(newEffects.ContainsKey)
                     .OrderBy(key => key, StringComparer.Ordinal))
        {
            var oldEffect = oldEffects[key];
            var newEffect = newEffects[key];

            if (!string.Equals(oldEffect.Timing, newEffect.Timing, StringComparison.Ordinal))
            {
                details.Add($"Effect {oldEffect.Edge()} timing changed from {oldEffect.Timing ?? "none"} to {newEffect.Timing ?? "none"}.");
            }
        }
    }

    static void CompareDataClasses(Record before, Record after, List<string> details)
    {
        var oldClasses = DataClassEntries(before);
        var newClasses = DataClassEntries(after);

        if (oldClasses is null || newClasses is null)
        {
            CompareValue("Data classes", Field(before, "dataClasses"), Field(after, "dataClasses"), details);
            return;
        }

        foreach (var name in oldClasses.Keys.Where(name => !newClasses.ContainsKey(name))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"Data class removed: {name}.");
        }

        foreach (var name in newClasses.Keys.Where(name => !oldClasses.ContainsKey(name))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"Data class added: {name} ({newClasses[name].Classification ?? "no classification"}).");
        }

        foreach (var name in oldClasses.Keys.Where(newClasses.ContainsKey)
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            var oldClass = oldClasses[name];
            var newClass = newClasses[name];

            if (!string.Equals(oldClass.Classification, newClass.Classification, StringComparison.Ordinal))
            {
                details.Add($"Data class {name} classification changed from {oldClass.Classification ?? "none"} to {newClass.Classification ?? "none"}.");
            }

            if (!string.Equals(oldClass.OnErasure, newClass.OnErasure, StringComparison.Ordinal))
            {
                details.Add($"Data class {name} erasure changed from {oldClass.OnErasure ?? "none"} to {newClass.OnErasure ?? "none"}.");
            }
        }
    }

    static void CompareStates(
        Record before, Record after, bool approved, List<string> details, List<BreakingReason> reasons)
    {
        var oldStates = StateEntries(before);
        var newStates = StateEntries(after);

        if (oldStates is null || newStates is null)
        {
            if (!JsonEquals(Field(before, "states"), Field(after, "states")))
            {
                details.Add("States changed.");
            }

            return;
        }

        foreach (var name in oldStates.Keys.Where(name => !newStates.ContainsKey(name))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"State removed: {name}.");
        }

        foreach (var name in newStates.Keys.Where(name => !oldStates.ContainsKey(name))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"State added: {name}.");
        }

        foreach (var name in oldStates.Keys.Where(newStates.ContainsKey)
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            if (!string.Equals(oldStates[name], newStates[name], StringComparison.Ordinal))
            {
                details.Add($"State {name} meaning changed: \"{newStates[name]}\" (was: \"{oldStates[name]}\").");
            }
        }

        if (approved && oldStates.Keys.Any(name => !newStates.ContainsKey(name)))
        {
            reasons.Add(Reason("state-removed"));
        }
    }

    static void CompareTransitions(
        Record before,
        Record after,
        ProjectModel baseModel,
        ProjectModel headModel,
        bool approved,
        List<string> details,
        List<BreakingReason> reasons)
    {
        var oldTransitions = TransitionEntries(before, baseModel);
        var newTransitions = TransitionEntries(after, headModel);

        if (oldTransitions is null || newTransitions is null)
        {
            if (!JsonEquals(Field(before, "transitions"), Field(after, "transitions")))
            {
                details.Add("Transitions changed.");
            }

            return;
        }

        var removed = oldTransitions.Keys.Except(newTransitions.Keys)
            .OrderBy(key => key, StringComparer.Ordinal).ToList();
        var added = newTransitions.Keys.Except(oldTransitions.Keys)
            .OrderBy(key => key, StringComparer.Ordinal).ToList();

        foreach (var key in removed)
        {
            details.Add($"Transition removed: {oldTransitions[key]}.");
        }

        foreach (var key in added)
        {
            details.Add($"Transition added: {newTransitions[key]}.");
        }

        if (approved && removed.Count > 0)
        {
            reasons.Add(Reason("transition-removed"));
        }
    }

    static void CompareData(Record before, Record after, List<string> details)
    {
        var oldData = DataEntries(before);
        var newData = DataEntries(after);

        if (oldData is null || newData is null)
        {
            if (!JsonEquals(Field(before, "data"), Field(after, "data")))
            {
                details.Add("Data changed.");
            }

            return;
        }

        foreach (var name in oldData.Keys.Where(name => !newData.ContainsKey(name))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"Data removed: {name}.");
        }

        foreach (var name in newData.Keys.Where(name => !oldData.ContainsKey(name))
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            details.Add($"Data added: {name}.");
        }

        foreach (var name in oldData.Keys.Where(newData.ContainsKey)
                     .OrderBy(name => name, StringComparer.Ordinal))
        {
            var (oldMeaning, oldClassification) = oldData[name];
            var (newMeaning, newClassification) = newData[name];

            if (!string.Equals(oldClassification, newClassification, StringComparison.Ordinal))
            {
                details.Add($"Data {name} classification changed from {oldClassification} to {newClassification}.");
            }

            if (!string.Equals(oldMeaning, newMeaning, StringComparison.Ordinal))
            {
                details.Add($"Data {name} meaning changed: \"{newMeaning}\" (was: \"{oldMeaning}\").");
            }
        }
    }

    static void CompareFields(
        Record before, Record after, List<string> details, HashSet<string>? handled = null)
    {
        if (before.Raw.ValueKind != JsonValueKind.Object || after.Raw.ValueKind != JsonValueKind.Object)
        {
            if (!JsonEquals(before.Raw, after.Raw))
            {
                details.Add("Fields changed.");
            }

            return;
        }

        var names = before.Raw.EnumerateObject().Select(property => property.Name)
            .Concat(after.Raw.EnumerateObject().Select(property => property.Name))
            .Where(name => !MetaFields.Contains(name) && !(handled?.Contains(name) ?? false))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(name => name, StringComparer.Ordinal);

        foreach (var name in names)
        {
            CompareValue(Label(before.Type, name), Field(before, name), Field(after, name), details);
        }
    }

    static string Label(string type, string name) => (type, name) switch
    {
        ("requirement", "by") => "Target",
        _ => name.Length == 0 ? name : char.ToUpperInvariant(name[0]) + name[1..],
    };

    /// <summary>Compares one field, adding a detail line when it changed.</summary>
    /// <returns>Whether the field changed.</returns>
    static bool CompareValue(string label, JsonElement? before, JsonElement? after, List<string> details)
    {
        if (before is null && after is null)
        {
            return false;
        }

        if (before is null)
        {
            details.Add(after!.Value.ValueKind == JsonValueKind.String
                ? $"{label} added: \"{after.Value.GetString()}\"."
                : $"{label} added.");
            return true;
        }

        if (after is null)
        {
            details.Add($"{label} removed.");
            return true;
        }

        if (JsonEquals(before.Value, after.Value))
        {
            return false;
        }

        if (before.Value.ValueKind == JsonValueKind.String && after.Value.ValueKind == JsonValueKind.String)
        {
            details.Add($"{label} changed: \"{after.Value.GetString()}\" (was: \"{before.Value.GetString()}\").");
            return true;
        }

        if (before.Value.ValueKind == JsonValueKind.True || before.Value.ValueKind == JsonValueKind.False)
        {
            if (after.Value.ValueKind == JsonValueKind.True || after.Value.ValueKind == JsonValueKind.False)
            {
                details.Add($"{label} changed from {Flat(before.Value)} to {Flat(after.Value)}.");
                return true;
            }
        }

        if (before.Value.ValueKind == JsonValueKind.Number && after.Value.ValueKind == JsonValueKind.Number)
        {
            details.Add($"{label} changed from {before.Value.GetRawText()} to {after.Value.GetRawText()}.");
            return true;
        }

        if (before.Value.ValueKind == JsonValueKind.Array && after.Value.ValueKind == JsonValueKind.Array
            && before.Value.EnumerateArray().All(entry => entry.ValueKind == JsonValueKind.String)
            && after.Value.EnumerateArray().All(entry => entry.ValueKind == JsonValueKind.String))
        {
            var oldItems = before.Value.EnumerateArray().Select(entry => entry.GetString()!)
                .ToHashSet(StringComparer.Ordinal);
            var newItems = after.Value.EnumerateArray().Select(entry => entry.GetString()!)
                .ToHashSet(StringComparer.Ordinal);
            var parts = newItems.Except(oldItems).OrderBy(item => item, StringComparer.Ordinal)
                    .Select(item => $"+{item}")
                .Concat(oldItems.Except(newItems).OrderBy(item => item, StringComparer.Ordinal)
                    .Select(item => $"-{item}"))
                .ToList();

            if (parts.Count == 0)
            {
                return false;
            }

            details.Add($"{label} changed: {string.Join(", ", parts)}.");
            return true;
        }

        details.Add($"{label} changed.");
        return true;
    }

    static string Flat(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.True => "true",
        JsonValueKind.False => "false",
        JsonValueKind.Null => "none",
        JsonValueKind.Number => value.GetRawText(),
        JsonValueKind.String => $"\"{value.GetString()}\"",
        _ => value.ValueKind.ToString().ToLowerInvariant(),
    };

    static JsonElement? Field(Record record, string name) =>
        record.Raw.ValueKind == JsonValueKind.Object
        && record.Raw.TryGetProperty(name, out var value)
            ? value
            : null;

    static bool JsonEquals(JsonElement? left, JsonElement? right)
    {
        if (left is null || right is null)
        {
            return left is null && right is null;
        }

        return JsonEquals(left.Value, right.Value);
    }

    static bool JsonEquals(JsonElement left, JsonElement right)
    {
        if (left.ValueKind != right.ValueKind)
        {
            return false;
        }

        return left.ValueKind switch
        {
            JsonValueKind.Object => left.EnumerateObject().Count() == right.EnumerateObject().Count()
                && left.EnumerateObject().All(property =>
                    right.TryGetProperty(property.Name, out var other)
                    && JsonEquals(property.Value, other)),
            JsonValueKind.Array => left.GetArrayLength() == right.GetArrayLength()
                && left.EnumerateArray().Zip(right.EnumerateArray()).All(pair => JsonEquals(pair.First, pair.Second)),
            JsonValueKind.String => left.GetString() == right.GetString(),
            JsonValueKind.Number => left.GetRawText() == right.GetRawText(),
            _ => true,
        };
    }

    /// <summary>
    ///     One entry per transition, keyed by its from, to and use case id and
    ///     displayed with the use case title, so a retitled use case reads the same.
    /// </summary>
    static Dictionary<string, string>? TransitionEntries(Record record, ProjectModel model)
    {
        if (Field(record, "transitions") is not { } value)
        {
            return new Dictionary<string, string>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var lines = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            var from = StringOf(entry, "from") ?? "none";
            var to = StringOf(entry, "to") ?? "none";
            var by = StringOf(entry, "by");
            var line = $"{from} -> {to}";

            if (by is not null)
            {
                line += model.ById.TryGetValue(by, out var useCase)
                    ? $" by \"{useCase.Title}\""
                    : $" by {by}";
            }

            lines[$"{from}\0{to}\0{by ?? ""}"] = line;
        }

        return lines;
    }

    static Dictionary<string, string>? StateEntries(Record record)
    {
        if (Field(record, "states") is not { } value)
        {
            return new Dictionary<string, string>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var states = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            states[StringOf(entry, "name") ?? "none"] = StringOf(entry, "meaning") ?? "";
        }

        return states;
    }

    static List<string> StateNames(Record record) =>
        StateEntries(record)?.Keys.OrderBy(name => name, StringComparer.Ordinal).ToList() ?? [];

    static Dictionary<string, (string Meaning, string Classification)>? DataEntries(Record record)
    {
        if (Field(record, "data") is not { } value)
        {
            return new Dictionary<string, (string, string)>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var data = new Dictionary<string, (string, string)>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            data[StringOf(entry, "name") ?? "none"] =
                (StringOf(entry, "meaning") ?? "", StringOf(entry, "classification") ?? "none");
        }

        return data;
    }

    static string? StringOf(JsonElement element, string name) =>
        element.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    static AccessValue? AccessOf(Record record)
    {
        if (Field(record, "access") is not { } value)
        {
            return null;
        }

        if (value.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var auth = new HashSet<string>(StringComparer.Ordinal);

        if (value.TryGetProperty("auth", out var kinds))
        {
            if (kinds.ValueKind == JsonValueKind.String && kinds.GetString() is { } single)
            {
                auth.Add(single);
            }
            else if (kinds.ValueKind == JsonValueKind.Array)
            {
                foreach (var kind in kinds.EnumerateArray())
                {
                    if (kind.ValueKind == JsonValueKind.String && kind.GetString() is { } name)
                    {
                        auth.Add(name);
                    }
                }
            }
            else
            {
                return null;
            }
        }

        return new AccessValue(auth, StringOf(value, "grant"), StringOf(value, "tenant"));
    }

    /// <summary>One entry per effect, keyed by its verb and target.</summary>
    static Dictionary<string, EffectEntry>? EffectEntries(Record record)
    {
        if (Field(record, "effects") is not { } value)
        {
            return new Dictionary<string, EffectEntry>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var effects = new Dictionary<string, EffectEntry>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            var verb = StringOf(entry, "issues") is not null ? "issues"
                : StringOf(entry, "sends") is not null ? "sends"
                : StringOf(entry, "publishes") is not null ? "publishes"
                : StringOf(entry, "calls") is not null ? "calls"
                : null;

            if (verb is null)
            {
                return null;
            }

            var target = StringOf(entry, verb)!;

            effects[$"{verb}\0{target}"] = new EffectEntry(verb, target, StringOf(entry, "timing"));
        }

        return effects;
    }

    /// <summary>One entry per data class, keyed by its name.</summary>
    static Dictionary<string, DataClassValue>? DataClassEntries(Record record)
    {
        if (Field(record, "dataClasses") is not { } value)
        {
            return new Dictionary<string, DataClassValue>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var classes = new Dictionary<string, DataClassValue>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            classes[StringOf(entry, "name") ?? "none"] =
                new DataClassValue(StringOf(entry, "classification"), StringOf(entry, "onErasure"));
        }

        return classes;
    }

    /// <summary>One entry per journey step, keyed by its step id.</summary>
    static Dictionary<string, JourneyStep>? JourneySteps(Record record)
    {
        if (Field(record, "steps") is not { } value)
        {
            return new Dictionary<string, JourneyStep>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var steps = new Dictionary<string, JourneyStep>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            steps[StringOf(entry, "id") ?? "none"] = new JourneyStep(
                StringOf(entry, "says") ?? "",
                StringOf(entry, "actor"),
                StringOf(entry, "ifItGoesWrong"));
        }

        return steps;
    }

    /// <summary>One fallback per exception, keyed by its when condition.</summary>
    static Dictionary<string, string>? ExceptEntries(Record record)
    {
        if (Field(record, "except") is not { } value)
        {
            return new Dictionary<string, string>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var except = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            except[StringOf(entry, "when") ?? "none"] = StringOf(entry, "fallback") ?? "none";
        }

        return except;
    }

    static List<string>? OptionNames(Record record)
    {
        if (Field(record, "options") is not { } value)
        {
            return [];
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var names = new List<string>();

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind == JsonValueKind.String && entry.GetString() is { } name)
            {
                names.Add(name);
            }
            else if (entry.ValueKind == JsonValueKind.Object)
            {
                names.Add(StringOf(entry, "name") ?? "none");
            }
            else
            {
                return null;
            }
        }

        return names;
    }

    /// <summary>One entry per open question, keyed by the question text.</summary>
    static Dictionary<string, JsonElement>? QuestionEntries(Record record)
    {
        if (Field(record, "questions") is not { } value)
        {
            return new Dictionary<string, JsonElement>(StringComparer.Ordinal);
        }

        if (value.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        var questions = new Dictionary<string, JsonElement>(StringComparer.Ordinal);

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object || StringOf(entry, "question") is not { } question)
            {
                return null;
            }

            questions[question] = entry;
        }

        return questions;
    }

    /// <summary>One canonical string per JSON value, with object keys sorted.</summary>
    static string Canonical(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.Object => "{" + string.Join(
            ",",
            value.EnumerateObject()
                .OrderBy(property => property.Name, StringComparer.Ordinal)
                .Select(property => $"{JsonSerializer.Serialize(property.Name)}:{Canonical(property.Value)}")) + "}",
        JsonValueKind.Array => "[" + string.Join(",", value.EnumerateArray().Select(Canonical)) + "]",
        JsonValueKind.String => JsonSerializer.Serialize(value.GetString()),
        JsonValueKind.Number => value.GetRawText(),
        JsonValueKind.True => "true",
        JsonValueKind.False => "false",
        _ => "null",
    };

    /// <summary>
    ///     The security queue: use cases widened to tenant scope cross, new calls
    ///     effects, and new personal or sensitive data classes, in record order.
    /// </summary>
    static List<SecurityQueueEntry> SecurityQueue(
        ProjectModel baseModel, ProjectModel headModel, HashSet<string> addedIds, HashSet<string> removedIds)
    {
        var queue = new List<SecurityQueueEntry>();

        foreach (var record in headModel.Records
                     .OrderBy(left => left.Type, StringComparer.Ordinal)
                     .ThenBy(left => left.Id, StringComparer.Ordinal))
        {
            if (removedIds.Contains(record.Id))
            {
                continue;
            }

            var added = addedIds.Contains(record.Id);
            baseModel.ById.TryGetValue(record.Id, out var before);

            if (record.Type == "use-case")
            {
                QueueTenantWidening(before, record, added, queue);
                QueueNewCalls(before, record, added, queue);
            }

            if (record.Type == "aggregate")
            {
                QueueNewDataClasses(before, record, added, queue);
            }
        }

        return queue;
    }

    static void QueueTenantWidening(
        Record? before, Record after, bool added, List<SecurityQueueEntry> queue)
    {
        var tenant = AccessOf(after)?.Tenant;

        if (!string.Equals(tenant, "cross", StringComparison.Ordinal))
        {
            return;
        }

        if (!added && before is not null
            && string.Equals(AccessOf(before)?.Tenant, "cross", StringComparison.Ordinal))
        {
            return;
        }

        queue.Add(new SecurityQueueEntry(
            after.Id,
            after.Title,
            after.Type,
            added || before is null
                ? "Access tenant scope is cross."
                : $"Access tenant scope widened from {AccessOf(before)?.Tenant ?? "none"} to cross."));
    }

    static void QueueNewCalls(Record? before, Record after, bool added, List<SecurityQueueEntry> queue)
    {
        var newEffects = EffectEntries(after);

        if (newEffects is null)
        {
            return;
        }

        var oldEffects = !added && before is not null ? EffectEntries(before) : new Dictionary<string, EffectEntry>();

        if (oldEffects is null)
        {
            return;
        }

        foreach (var key in newEffects.Keys
                     .Where(key => !oldEffects.ContainsKey(key) && newEffects[key].Verb == "calls")
                     .OrderBy(key => key, StringComparer.Ordinal))
        {
            queue.Add(new SecurityQueueEntry(
                after.Id, after.Title, after.Type, $"New calls effect: {newEffects[key].Describe()}."));
        }
    }

    static void QueueNewDataClasses(Record? before, Record after, bool added, List<SecurityQueueEntry> queue)
    {
        var newClasses = DataClassEntries(after);

        if (newClasses is null)
        {
            return;
        }

        var oldClasses = !added && before is not null ? DataClassEntries(before) : new Dictionary<string, DataClassValue>();

        if (oldClasses is null)
        {
            return;
        }

        foreach (var name in newClasses.Keys.OrderBy(left => left, StringComparer.Ordinal))
        {
            var classification = newClasses[name].Classification;

            if (classification is not ("personal" or "sensitive"))
            {
                continue;
            }

            if (!oldClasses.TryGetValue(name, out var oldClass))
            {
                queue.Add(new SecurityQueueEntry(
                    after.Id, after.Title, after.Type, $"New {classification} data class: {name}."));
            }
            else if (oldClass.Classification is not ("personal" or "sensitive"))
            {
                queue.Add(new SecurityQueueEntry(
                    after.Id,
                    after.Title,
                    after.Type,
                    $"Data class {name} is now {classification} (was: {oldClass.Classification ?? "none"})."));
            }
        }
    }

    /// <summary>Whether the record stands approved or reviewed: its effective status, else its own.</summary>
    static bool Approved(ProjectModel model, Record record)
    {
        if (model.EffectiveStatus.TryGetValue(record.Id, out var effective))
        {
            return effective is "approved" or "reviewed";
        }

        return record.Status is null or "approved" or "reviewed";
    }

    static BreakingReason Reason(string code) => new(code, code switch
    {
        "requirement-removed" => "An approved requirement no longer exists.",
        "requirement-narrowed" => "An approved requirement statement changed.",
        "quality-measure-changed" => "A quality requirement measure or target changed.",
        "refusal-added" => "A refusal was added to an approved use case.",
        "precondition-added" => "A precondition was added to an approved use case.",
        "refusal-path-added" => "A scenario proves a new refusal path.",
        "result-removed" => "A result was removed from approved intent.",
        "scenario-removed" => "A scenario was removed from approved intent.",
        "state-removed" => "A state was removed from an approved aggregate.",
        "transition-removed" => "A transition was removed from an approved aggregate.",
        "aggregate-removed" => "An approved aggregate was removed.",
        "rule-weakened" => "A rule was weakened.",
        "refusal-meaning-changed" => "A refusal meaning changed.",
        "result-outcome-changed" => "A result outcome changed.",
        _ => "Approved intent changed.",
    });
}

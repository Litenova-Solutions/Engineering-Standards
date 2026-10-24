using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace LiteSpec.Model;

/// <summary>
///     Every model check: schema, identifiers, citations, gates, proof, reach, graph and tiers.
/// </summary>
static partial class Checker
{
    /// <summary>Every finding code a known gap may name.</summary>
    public static readonly HashSet<string> Codes = new(StringComparer.Ordinal)
    {
        "record-shape", "invalid-field", "identifier-form", "identifier-duplicate",
        "use-case-name-clash", "reference-unresolved", "draft-gate",
        "owner-unknown", "draft-without-decider", "known-gap-expired", "gap-unknown-check",
        "rule-name-negation", "use-case-without-success", "scenario-result-unresolved",
        "refusal-not-thrown", "use-case-unimplemented", "proves-unconfirmed",
        "size-type-missing", "product-not-singleton",
        "journey-reach", "use-case-access",
        "use-case-without-scenario", "requirement-unfulfilled",
        "aggregate-name-clash", "decision-decides-nothing", "link-unresolved",
        "behavior-unrecorded", "state-unreachable", "transition-unresolved",
        "erasure-undeclared", "calculation-without-table",
        "reaction-trigger-unresolved", "requirement-unmeasured",
        "record-orphaned", "step-unserved", "effect-loop", "consistency-unexplained",
        "query-output-missing", "paging-undeclared", "widening-unjustified",
        "retention-without-enforcement", "risk-without-acceptance", "exemption-expired",
        "setting-default-without-requirement", "reservation-without-release",
        "notification-without-sender", "except-without-fallback", "approval-reopened",
        "transcribed-reviewed", "transcribed-after-adoption",
        "operator-job-without-guard", "schedule-unstructured",
        "write-undeclared", "result-undeclared", "effect-undeclared",
        "prose-missing", "many-aggregates", "question-aged",
    };

    /// <summary>Requirement kinds that code makes true, so some rule, use case or journey fulfills them.</summary>
    private static readonly HashSet<string> FulfilledKinds = new(StringComparer.Ordinal)
    {
        "functional", "quality", "business",
    };

    /// <summary>Feature states under which a requirement is not yet, or never, made true by code.</summary>
    private static readonly HashSet<string> UndeliveredStates = new(StringComparer.Ordinal)
    {
        "planned", "later", "refused",
    };

    /// <summary>Runs every check, partitioning findings from known gaps.</summary>
    public static (IReadOnlyList<Finding> Findings, IReadOnlyList<Finding> Known) Check(ProjectModel model)
    {
        var findings = new List<Finding>(model.Problems);
        var owners = Codeowners.Load(model.Config.Root);

        Time("schema", () => CheckSchema(model, findings, owners));
        Time("identifiers", () => CheckIdentifiers(model, findings));
        Time("citations", () => CheckCitations(model, findings));
        Time("gates", () => CheckGates(model, findings));
        Time("proof", () => CheckProof(model, findings));
        Time("fulfillment", () => CheckFulfilment(model, findings));
        Time("links", () => CheckLinks(model, findings));
        Time("profile", () => CheckSizeTypes(model, findings));
        Time("reach", () => CheckJourneyReach(model, findings));
        Time("behavior", () => CheckBehaviorUnrecorded(model, findings));
        Time("code", () => CheckCode(model, findings));
        Time("lifecycle", () => CheckLifecycle(model, findings));
        Time("erasure", () => CheckErasure(model, findings));
        Time("retention", () => CheckRetention(model, findings));
        Time("acceptance", () => CheckRiskAcceptance(model, findings));
        Time("exemption", () => CheckExemption(model, findings));
        Time("calculations", () => CheckCalculations(model, findings));
        Time("reactions", () => CheckReactionTrigger(model, findings));
        Time("measured", () => CheckMeasured(model, findings));
        Time("questions", () => CheckQuestions(model, findings));
        Time("aged", () => CheckQuestionAged(model, findings));
        Time("orphaned", () => CheckOrphaned(model, findings));
        Time("steps", () => CheckStepUnserved(model, findings));
        Time("loops", () => CheckEffectLoop(model, findings));
        Time("consistency", () => CheckConsistency(model, findings));
        Time("output", () => CheckQueryOutput(model, findings));
        Time("paging", () => CheckPaging(model, findings));
        Time("widening", () => CheckWidening(model, findings));
        Time("settings", () => CheckSettingDefault(model, findings));
        Time("reservations", () => CheckReservation(model, findings));
        Time("senders", () => CheckNotificationSender(model, findings));
        Time("except", () => CheckExceptFallback(model, findings));
        Time("approval", () => CheckApproval(model, findings));
        Time("transcribed", () => CheckTranscribed(model, findings));
        Time("operator", () => CheckOperatorJob(model, findings));
        Time("schedule", () => CheckSchedule(model, findings));
        Time("prose", () => CheckProse(model, findings));
        Time("groups", () => CheckManyAggregates(model, findings));

        findings.Sort((left, right) =>
        {
            // Several checks run in parallel, so findings on one line are tied
            // by code and message to print in the same order on every run.
            var path = string.Compare(left.Path, right.Path, StringComparison.Ordinal);

            if (path != 0)
            {
                return path;
            }

            var line = left.Line.CompareTo(right.Line);

            if (line != 0)
            {
                return line;
            }

            var code = string.Compare(left.Code, right.Code, StringComparison.Ordinal);
            return code != 0 ? code : string.Compare(left.Message, right.Message, StringComparison.Ordinal);
        });

        return Suppress(model, findings);
    }

    private static void Time(string name, Action run)
    {
        var watch = System.Diagnostics.Stopwatch.StartNew();

        run();

        Timing.Report($"[time] check-{name} {watch.Elapsed.TotalSeconds:0.0}s");
    }

    private static (IReadOnlyList<Finding> Findings, IReadOnlyList<Finding> Known) Suppress(
        ProjectModel model, List<Finding> findings)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var gaps = model.Records.Where(record => record.Type == "known-gap").ToList();
        var kept = new List<Finding>();
        var known = new List<Finding>();

        foreach (var finding in findings)
        {
            if (finding.Code == "known-gap-expired" || finding.Subject is null)
            {
                kept.Add(finding);
                continue;
            }

            // A gap naming a use case also covers findings about the scenarios and results it holds.
            var subjects = new List<string> { finding.Subject };

            if ((finding.Subject.StartsWith("scenario/", StringComparison.Ordinal) || finding.Subject.StartsWith("result/", StringComparison.Ordinal))
                && Identifiers.TrySplit(finding.Subject, out _, out var home, out _)
                && home is not null
                && ModelBuilder.UseCaseOf(model, home) is { } holder)
            {
                subjects.Add(holder.Id);
            }

            var covered = gaps.Any(gap =>
                gap.Field("check") == finding.Code
                && gap.Ids("subject").Any(subject => subjects.Contains(subject, StringComparer.Ordinal))
                && gap.Status != "retired"
                && gap.Field("endsBy") is { } endsBy
                && IsoDate(endsBy, out var ends)
                && today <= ends);

            (covered ? known : kept).Add(finding);
        }

        return (kept, known);
    }

    /// <summary>Record types using the Behavior status vocabulary.</summary>
    private static readonly HashSet<string> BehaviorTypes = new(StringComparer.Ordinal)
    {
        "module", "aggregate", "rule", "use-case", "result", "scenario", "event",
        "integration-event", "reaction", "job", "notification", "setting",
        "role", "permission", "entry-point", "external-system", "runbook",
    };

    private static void CheckSchema(ProjectModel model, List<Finding> findings, Codeowners owners)
    {
        foreach (var record in model.Records)
        {
            // A derived generic result inherits its shape from its use case.
            if (record.Derived)
            {
                continue;
            }

            if (record.Type.Length == 0)
            {
                findings.Add(new Finding("record-shape", "The record has no type.", record.File, record.Line, null));
                continue;
            }

            if (!RecordTypes.All.Contains(record.Type))
            {
                continue;
            }

            if (record.Id.Length == 0)
            {
                findings.Add(new Finding("record-shape", $"The {record.Type} record has no id.", record.File, record.Line, null));
            }

            if (record.Title.Length == 0)
            {
                findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no title.", record.File, record.Line, SubjectOf(record)));
            }

            if (record.Owner is null)
            {
                findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no owner.", record.File, record.Line, SubjectOf(record)));
            }
            else if (model.Config.HasOwners && !model.Config.Owners.Contains(record.Owner, StringComparer.Ordinal))
            {
                findings.Add(new Finding("owner-unknown", $"Record '{record.Id}' names owner '{record.Owner}', which the owner list does not hold.", record.File, record.Line, SubjectOf(record)));
            }
            else if (record.Owner is { } owner && !owners.Covers(model.Config.Root, record.File, model.Config.CandidatesFor(owner)))
            {
                findings.Add(new Finding("owner-unknown", $"Record '{record.Id}' names owner '{owner}', which belongs to no team owning its path.", record.File, record.Line, SubjectOf(record)));
            }

            if (record.Status is null)
            {
                findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no status.", record.File, record.Line, SubjectOf(record)));
            }
            else if (!ValidStatus(record))
            {
                findings.Add(new Finding("invalid-field", $"Record '{record.Id}' has status '{record.Status}'; {StatusVocabulary(record)}.", record.File, record.Line, SubjectOf(record)));
            }

            if (record.Status == "draft")
            {
                if (record.Decider is null)
                {
                    findings.Add(new Finding("draft-without-decider", $"Draft '{record.Id}' names no decider.", record.File, record.Line, SubjectOf(record)));
                }
                else if (model.Config.HasOwners && !model.Config.Owners.Contains(record.Decider, StringComparer.Ordinal))
                {
                    findings.Add(new Finding("owner-unknown", $"Draft '{record.Id}' names decider '{record.Decider}', which the owner list does not hold.", record.File, record.Line, SubjectOf(record)));
                }

                if (record.DecideBy is null)
                {
                    findings.Add(new Finding("draft-without-decider", $"Draft '{record.Id}' names no decide-by date.", record.File, record.Line, SubjectOf(record)));
                }
                else if (!ValidDate(record.DecideBy))
                {
                    findings.Add(new Finding("invalid-field", $"Draft '{record.Id}' has decide-by '{record.DecideBy}', which is not a date.", record.File, record.Line, SubjectOf(record)));
                }
            }

            CheckTypeFields(model, record, findings);
            CheckReplaces(model, record, findings);
        }
    }

    /// <summary>Whether the status fits the record layer vocabulary.</summary>
    private static bool ValidStatus(Record record)
    {
        if (record.Status is "draft" or "retired")
        {
            return true;
        }

        // Terms span both layers, so either live status fits.
        if (record.Type == "term")
        {
            return record.Status is "approved" or "reviewed";
        }

        return BehaviorTypes.Contains(record.Type)
            ? record.Status == "reviewed"
            : record.Status == "approved";
    }

    /// <summary>The status words the record layer vocabulary allows.</summary>
    private static string StatusVocabulary(Record record)
    {
        if (record.Type == "term")
        {
            return "draft, approved, reviewed or retired";
        }

        return BehaviorTypes.Contains(record.Type)
            ? "draft, reviewed or retired"
            : "draft, approved or retired";
    }

    private static void CheckTypeFields(ProjectModel model, Record record, List<Finding> findings)
    {
        switch (record.Type)
        {
            case "product":
                RequireString(record, "boundary", findings);
                RequireArray(record, "neverDoes", 0, findings);
                RequireIds(record, "audience", 1, findings);
                break;

            case "goal":
                RequireString(record, "statement", findings);
                RequireString(record, "measure", findings);
                RequireString(record, "target", findings);
                RequireString(record, "by", findings);
                break;

            case "constraint":
                RequireString(record, "source", findings);
                RequireEnum(record, "category", ["technical", "organizational", "convention"], findings);
                RequireBoolean(record, "applies", findings);
                RequireString(record, "appliesBecause", findings);
                break;

            case "research":
                RequireArray(record, "sources", 1, findings);
                RequireString(record, "question", findings);
                break;

            case "decision":
                RequireArray(record, "options", 1, findings);
                RequireString(record, "changeWhen", findings);

                if (record.Status == "approved")
                {
                    RequireDate(record, "decided", findings);
                    RequireString(record, "chosen", findings);
                }

                break;

            case "requirement":
                RequireEnum(record, "kind", ["functional", "quality", "business"], findings);
                RequireString(record, "statement", findings);

                if (record.Field("kind") == "business")
                {
                    RequireArray(record, "values", 1, findings);
                }

                if (record.Has("measure"))
                {
                    RequireString(record, "by", findings);
                }

                if (record.Has("by"))
                {
                    RequireString(record, "measure", findings);
                }

                break;

            case "problem":
                RequireIds(record, "affects", 1, findings);
                RequireString(record, "statement", findings);
                break;

            case "feature":
                RequireEnum(record, "state", ["planned", "shipped", "later", "refused"], findings);

                if (record.Field("state") == "refused")
                {
                    RequireString(record, "refusedBecause", findings);
                }
                else
                {
                    RequireIds(record, "solves", 1, findings);
                }

                if (record.Field("state") == "planned")
                {
                    RequireString(record, "by", findings);
                }

                break;

            case "actor":
                RequireEnum(record, "kind", ["person", "organization", "system"], findings);
                break;

            case "role":
                RequirePattern(record, "scope", @"^[a-z0-9]+(-[a-z0-9]+)*$", "kebab-case", findings);
                RequireIds(record, "allows", 1, findings);
                break;

            case "permission":
                RequireString(record, "meaning", findings);
                break;

            case "journey":
                RequireIds(record, "actor", 1, findings);
                RequireString(record, "goal", findings);
                RequireArray(record, "steps", 1, findings);
                break;

            case "module":
                RequireArray(record, "dependsOn", 0, findings);
                break;

            case "aggregate":
                // A store carries no lifecycle, so it carries no states.
                if (record.Field("kind") is not "store")
                {
                    RequireArray(record, "states", 1, findings);
                    RequireStateEntries(record, findings);
                }

                break;

            case "rule":
                RequireEnum(record, "kind", ["invariant", "precondition", "calculation", "cross-aggregate", "atomicity", "reservation", "commercial-data", "default"], findings);
                RequireString(record, "statement", findings);
                RequireIds(record, "governs", 1, findings);
                break;

            case "use-case":
                RequireEnum(record, "kind", ["command", "query"], findings);
                // A retired use case names no entry point, so only a live one must be reached.
                if (record.Status != "retired")
                {
                    RequireIds(record, "reachedThrough", 1, findings);
                }
                break;

            case "external-system":
                RequireIds(record, "actor", 1, findings);
                break;

            case "result":
                RequireEnum(record, "outcome", ["success", "refusal"], findings);
                RequireString(record, "meaning", findings);

                if (record.Field("outcome") == "refusal")
                {
                    RequireString(record, "code", findings);

                    if (record.Field("code") is { } code
                        && (code.Length == 0
                            || !Identifiers.RefusalCode().IsMatch(code)
                            || Identifiers.RefusalCode().Match(code).Value != code))
                    {
                        findings.Add(new Finding("invalid-field", $"Result '{record.Id}' has code '{code}', which is not a refusal code.", record.File, record.Line, SubjectOf(record)));
                    }
                }

                break;

            case "scenario":
                RequireString(record, "given", findings);
                RequireString(record, "when", findings);
                RequireString(record, "then", findings);
                RequireString(record, "result", findings);
                break;

            case "event":
                RequireString(record, "meaning", findings);
                RequireArray(record, "carries", 0, findings);
                break;

            case "entry-point":
                RequireEnum(record, "kind", ["browser", "api", "webhook", "device", "cli", "mcp", "served-content", "reaction", "job"], findings);
                break;

            case "runbook":
                RequireString(record, "trigger", findings);
                break;

            case "deviation":
                RequireString(record, "provision", findings);
                RequireString(record, "reason", findings);
                RequireDate(record, "reviewBy", findings);
                RequireString(record, "removeWhen", findings);

                if (record.Field("provision") is { } provision
                    && !IsProvisionCitation(provision))
                {
                    findings.Add(new Finding("invalid-field", $"Deviation '{record.Id}' names '{provision}', which is not a shared provision.", record.File, record.Line, SubjectOf(record)));
                }

                break;

            case "known-gap":
                RequireString(record, "check", findings);
                RequireIds(record, "subject", 1, findings);
                RequireDate(record, "endsBy", findings);
                RequireString(record, "reason", findings);

                if (record.Field("check") is { } check && !Codes.Contains(check))
                {
                    findings.Add(new Finding("gap-unknown-check", $"Known gap '{record.Id}' names check '{check}', which no check uses.", record.File, record.Line, SubjectOf(record)));
                }

                break;

            case "term":
                if (record.Field("meaning") is not { Length: > 0 })
                {
                    findings.Add(new Finding("record-shape", $"Term '{record.Id}' has no meaning.", record.File, record.Line, SubjectOf(record)));
                }
                else if (record.Field("meaning")!.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length > 25)
                {
                    findings.Add(new Finding("invalid-field", $"Term '{record.Id}' has a meaning over 25 words.", record.File, record.Line, SubjectOf(record)));
                }

                break;
        }

        CheckLinkTypes(model, record, findings);
    }

    private static void CheckLinkTypes(ProjectModel model, Record record, List<Finding> findings)
    {
        if (record.Raw.ValueKind != JsonValueKind.Object)
        {
            return;
        }

        foreach (var property in record.Raw.EnumerateObject())
        {
            if (!RecordTypes.LinkTargets.TryGetValue(property.Name, out var allowed))
            {
                continue;
            }

            foreach (var target in ModelBuilder.TargetsOf(property.Value))
            {
                var baseId = Identifiers.BaseId(target);

                if (!model.ById.TryGetValue(baseId, out var resolved))
                {
                    continue;
                }

                if (allowed.Count > 0 && !allowed.Contains(resolved.Type))
                {
                    findings.Add(new Finding("invalid-field", $"Record '{record.Id}' links {property.Name} to '{target}', which is a {resolved.Type}.", record.File, record.Line, SubjectOf(record)));
                }

                CheckFragment(model, record, target, baseId, resolved, findings);
            }
        }

        if (record.Type == "journey"
            && record.Raw.TryGetProperty("steps", out var steps)
            && steps.ValueKind == JsonValueKind.Array)
        {
            foreach (var step in steps.EnumerateArray())
            {
                if (step.ValueKind != JsonValueKind.Object)
                {
                    continue;
                }

                if (step.TryGetProperty("useCase", out var useCase)
                    && useCase.ValueKind == JsonValueKind.String
                    && useCase.GetString() is { } id
                    && model.ById.TryGetValue(id, out var resolved)
                    && resolved.Type != "use-case")
                {
                    findings.Add(new Finding("invalid-field", $"Journey '{record.Id}' steps to '{id}', which is a {resolved.Type}.", record.File, record.Line, SubjectOf(record)));
                }

                if (step.TryGetProperty("actor", out var actor)
                    && actor.ValueKind == JsonValueKind.String
                    && actor.GetString() is { } actorId
                    && model.ById.TryGetValue(actorId, out var actorRecord)
                    && actorRecord.Type != "actor")
                {
                    findings.Add(new Finding("invalid-field", $"Journey '{record.Id}' names actor '{actorId}', which is a {actorRecord.Type}.", record.File, record.Line, SubjectOf(record)));
                }
            }
        }
    }

    /// <summary>
    ///     Whether the link fragment names a journey step or an external-system
    ///     operation its record holds. The citation check reads only the base id,
    ///     so a missing step or operation is reported here.
    /// </summary>
    private static void CheckFragment(
        ProjectModel model, Record record, string target, string baseId, Record resolved, List<Finding> findings)
    {
        if (target == baseId)
        {
            return;
        }

        if (Identifiers.TrySplitStep(target, out _, out _))
        {
            if (resolved.Type == "journey" && !resolved.StepIds().Contains(target, StringComparer.Ordinal))
            {
                findings.Add(new Finding("reference-unresolved", $"Record '{record.Id}' serves '{target}', which names no step of the journey.", record.File, record.Line, SubjectOf(record)));
            }

            return;
        }

        if (resolved.Type == "external-system")
        {
            var operation = target[(target.IndexOf('#', StringComparison.Ordinal) + 1)..];

            if (!OperationNames(resolved).Contains(operation, StringComparer.Ordinal))
            {
                findings.Add(new Finding("reference-unresolved", $"Record '{record.Id}' calls '{target}', which names no operation of the system.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    private static IReadOnlyList<string> OperationNames(Record system)
    {
        if (system.Raw.ValueKind != JsonValueKind.Object
            || !system.Raw.TryGetProperty("operations", out var operations)
            || operations.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return
        [
            .. operations.EnumerateArray()
                          .Where(entry => entry.ValueKind == JsonValueKind.Object
                              && entry.TryGetProperty("name", out var name)
                              && name.ValueKind == JsonValueKind.String)
                          .Select(entry => entry.GetProperty("name").GetString()!),
        ];
    }

    private static void CheckReplaces(ProjectModel model, Record record, List<Finding> findings)
    {
        if (record.Type != "decision" && record.Ids("replaces").Any())
        {
            findings.Add(new Finding("invalid-field", $"Record '{record.Id}' carries replaces; only a decision replaces another record.", record.File, record.Line, SubjectOf(record)));
        }

        foreach (var target in record.Ids("replaces"))
        {
            if (model.ById.TryGetValue(target, out var resolved) && resolved.Type != record.Type)
            {
                findings.Add(new Finding("invalid-field", $"Record '{record.Id}' replaces '{target}', which is a {resolved.Type}.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    private static void CheckIdentifiers(ProjectModel model, List<Finding> findings)
    {
        var seen = new HashSet<string>(StringComparer.Ordinal);
        var moduleNames = new HashSet<string>(StringComparer.Ordinal);
        var recordNames = new HashSet<string>(StringComparer.Ordinal);
        var useCaseNames = new Dictionary<string, List<Record>>(StringComparer.Ordinal);

        foreach (var record in model.Records)
        {
            // A derived generic result carries its use case home and name, not the grammar.
            if (record.Id.Length == 0 || record.Derived)
            {
                continue;
            }

            if (!seen.Add(record.Id))
            {
                findings.Add(new Finding("identifier-duplicate", $"Identifier '{record.Id}' is used twice.", record.File, record.Line, record.Id));
            }

            if (!Identifiers.TrySplit(record.Id, out var prefix, out var home, out var name))
            {
                findings.Add(new Finding("identifier-form", $"Identifier '{record.Id}' is not type/name or type/home.name.", record.File, record.Line, SubjectOf(record)));
                continue;
            }

            if (prefix != record.Type)
            {
                findings.Add(new Finding("identifier-form", $"Identifier '{record.Id}' names type {prefix} on a {record.Type} record.", record.File, record.Line, SubjectOf(record)));
            }

            var wantsHome = RecordTypes.WithHome.Contains(record.Type);

            if (wantsHome && home is null)
            {
                findings.Add(new Finding("identifier-form", $"Identifier '{record.Id}' names no home.", record.File, record.Line, SubjectOf(record)));
            }
            else if (!wantsHome && home is not null)
            {
                findings.Add(new Finding("identifier-form", $"Identifier '{record.Id}' names a home a {record.Type} id has none.", record.File, record.Line, SubjectOf(record)));
            }

            if (!Identifiers.ValidName(name, record.Type == "decision") || Identifiers.AllDigitsName(name))
            {
                findings.Add(new Finding("identifier-form", $"Identifier '{record.Id}' breaks the name rules.", record.File, record.Line, SubjectOf(record)));
            }

            if (record.Type == "module")
            {
                moduleNames.Add(name);
            }

            if (record.Type == "aggregate" && !recordNames.Add(name))
            {
                findings.Add(new Finding("aggregate-name-clash", $"Aggregate name '{name}' is used twice; rule and event homes cannot resolve.", record.File, record.Line, SubjectOf(record)));
            }

            if (record.Type == "use-case")
            {
                if (!useCaseNames.TryGetValue(name, out var grouped))
                {
                    grouped = [];
                    useCaseNames[name] = grouped;
                }

                grouped.Add(record);
            }
        }

        foreach (var clash in useCaseNames.Where(entry => entry.Value.Count > 1))
        {
            foreach (var record in clash.Value)
            {
                findings.Add(new Finding("use-case-name-clash", $"Use-case name '{clash.Key}' is used twice; result and scenario homes cannot resolve.", record.File, record.Line, SubjectOf(record)));
            }
        }

        foreach (var record in model.Records)
        {
            if (!Identifiers.TrySplit(record.Id, out var prefix, out var home, out _))
            {
                continue;
            }

            if (home is null)
            {
                continue;
            }

            var known = prefix switch
            {
                "use-case" or "aggregate" or "reaction" or "job" or "notification" or "setting" => moduleNames.Contains(home),
                "rule" => moduleNames.Contains(home) || recordNames.Contains(home),
                "result" or "scenario" => useCaseNames.ContainsKey(home),
                "event" => recordNames.Contains(home),
                _ => true,
            };

            if (!known)
            {
                findings.Add(new Finding("identifier-form", $"Identifier '{record.Id}' names home '{home}', which no record holds.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    private static void CheckCitations(ProjectModel model, List<Finding> findings)
    {
        foreach (var record in model.Records)
        {
            if (record.Raw.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            var cited = new HashSet<string>(StringComparer.Ordinal);

            foreach (var property in record.Raw.EnumerateObject())
            {
                if (property.Name is "id" or "type")
                {
                    continue;
                }

                foreach (var text in StringsOf(property.Value))
                {
                    foreach (Match match in Identifiers.Citation.Matches(text))
                    {
                        cited.Add(Identifiers.TrimCitation(match.Value));
                    }

                    foreach (Match match in Identifiers.SharedCitation().Matches(text))
                    {
                        cited.Add(match.Value);
                    }
                }
            }

            foreach (var id in cited.Order(StringComparer.Ordinal))
            {
                if (!Resolves(model, id))
                {
                    findings.Add(new Finding("reference-unresolved", $"Record '{record.Id}' cites '{id}', which no record holds.", record.File, record.Line, SubjectOf(record)));
                }
            }
        }

        var texts = new List<(string File, string Text, int StartLine, string? Subject)>(model.Bodies.Count);

        foreach (var body in model.Bodies)
        {
            texts.Add((body.File, body.Body, body.BodyStartLine, body.PageId));
        }

        foreach (var comment in model.Code.Comments)
        {
            texts.Add((comment.File, comment.Text, comment.Line, null));
        }

        foreach (var comment in model.ScreenComments)
        {
            texts.Add((comment.File, comment.Text, comment.Line, null));
        }

        foreach (var comment in model.TestComments)
        {
            texts.Add((comment.File, comment.Text, comment.Line, null));
        }

        var found = new List<Finding>();

        System.Threading.Tasks.Parallel.ForEach(
            texts,
            () => new List<Finding>(),
            (text, _, local) =>
            {
                CheckTextCitations(model, text.File, text.Text, text.StartLine, text.Subject, local);

                return local;
            },
            local =>
            {
                lock (found)
                {
                    found.AddRange(local);
                }
            });

        findings.AddRange(found);
    }

    private static void CheckTextCitations(
        ProjectModel model,
        string file,
        string text,
        int startLine,
        string? subject,
        List<Finding> findings)
    {
        var cited = new Dictionary<string, int>(StringComparer.Ordinal);
        var starts = LineStarts(text);

        void Collect(MatchCollection matches, Func<string, string> clean)
        {
            foreach (Match match in matches)
            {
                cited.TryAdd(clean(match.Value), startLine + LineOf(starts, match.Index) - 1);
            }
        }

        // A link target is a file path, so a path that starts with a record type's name, such as
        // product/brief.md, is not a citation. Blanking the targets keeps every offset in place.
        var prose = LinkTarget().Replace(text, match => "](" + new string(' ', match.Length - 3) + ")");

        Collect(Identifiers.Citation.Matches(prose), Identifiers.TrimCitation);
        Collect(Identifiers.SharedCitation().Matches(prose), value => value);

        foreach (var entry in cited.OrderBy(left => left.Value).ThenBy(left => left.Key, StringComparer.Ordinal))
        {
            if (!Resolves(model, entry.Key))
            {
                findings.Add(new Finding("reference-unresolved", $"Citation '{entry.Key}' resolves to no record.", file, entry.Value, subject));
            }
        }
    }

    private static bool Resolves(ProjectModel model, string id)
    {
        if (model.ById.ContainsKey(id))
        {
            return true;
        }

        if (id.StartsWith("litespec/", StringComparison.Ordinal))
        {
            return model.Provisions.Count == 0 || model.Provisions.Contains(id);
        }

        return false;
    }

    private static void CheckGates(ProjectModel model, List<Finding> findings)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // A tier-3 draft with a recommendation past its decide-by date plus the veto
        // window counts as auto-approved. A tier-1 draft is never auto-approved, so it blocks.
        var drafts = model.Records
            .Where(record => record.Type == "decision"
                && record.Status == "draft"
                && !AutoApproved(record.Raw, record, model.Config, today))
            .SelectMany(decision => decision.Ids("decides"))
            .ToHashSet(StringComparer.Ordinal);

        foreach (var record in model.Records)
        {
            if ((record.Status == "approved" || record.Status == "reviewed") && drafts.Contains(record.Id))
            {
                findings.Add(new Finding("draft-gate", $"Record '{record.Id}' is {record.Status} while its decision is a draft.", record.File, record.Line, SubjectOf(record)));
            }
        }

        foreach (var decision in model.Records.Where(record => record.Type == "decision" && record.Status != "retired"))
        {
            if (!decision.Ids("decides").Any())
            {
                findings.Add(new Finding("decision-decides-nothing", $"Decision '{decision.Id}' names nothing it decides.", decision.File, decision.Line, SubjectOf(decision)));
            }
        }

        foreach (var gap in model.Records.Where(record => record.Type == "known-gap"))
        {
            if (gap.Field("endsBy") is { } endsBy
                && IsoDate(endsBy, out var ends)
                && today > ends)
            {
                findings.Add(new Finding("known-gap-expired", $"Known gap '{gap.Id}' ended {endsBy}.", gap.File, gap.Line, SubjectOf(gap)));
            }
        }

        foreach (var rule in model.Records.Where(record => record.Type == "rule"))
        {
            if (rule.Field("statement") is not { } statement)
            {
                continue;
            }

            if (!Identifiers.TrySplit(rule.Id, out _, out _, out var name))
            {
                continue;
            }

            var words = name.Split('-', StringSplitOptions.RemoveEmptyEntries).ToHashSet(StringComparer.Ordinal);

            foreach (Match match in Regex.Matches(statement, @"\b(not|no|never|cannot)\b", RegexOptions.IgnoreCase))
            {
                var negation = match.Value.ToLowerInvariant();

                if (!words.Contains(negation))
                {
                    findings.Add(new Finding("rule-name-negation", $"Rule '{rule.Id}' says '{negation}' but its name keeps none.", rule.File, rule.Line, SubjectOf(rule)));
                    break;
                }
            }
        }
    }

    private static void CheckFulfilment(ProjectModel model, List<Finding> findings)
    {
        var fulfilled = model.Records
            .Where(record => record.Type is "rule" or "use-case" or "journey")
            .SelectMany(record => record.Ids("fulfills"))
            .ToHashSet(StringComparer.Ordinal);

        foreach (var requirement in model.Records.Where(record => record.Type == "requirement" && record.Status != "retired"))
        {
            if (!FulfilledKinds.Contains(requirement.Field("kind") ?? ""))
            {
                continue;
            }

            var undelivered = requirement.Ids("feature").Any(id =>
                model.ById.TryGetValue(id, out var feature)
                && UndeliveredStates.Contains(feature.Field("state") ?? ""));

            if (!fulfilled.Contains(requirement.Id) && !undelivered)
            {
                findings.Add(new Finding("requirement-unfulfilled", $"Requirement '{requirement.Id}' is fulfilled by no rule, use case or journey.", requirement.File, requirement.Line, SubjectOf(requirement)));
            }
        }
    }

    private static void CheckProof(ProjectModel model, List<Finding> findings)
    {
        var results = model.Records.Where(record => record.Type == "result").ToList();
        var thrown = model.Code.Literals.Select(literal => literal.Value).ToHashSet(StringComparer.Ordinal);

        foreach (var useCase in model.Records.Where(record => record.Type == "use-case"))
        {
            if (!Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
            {
                continue;
            }

            var own = results.Where(result =>
                Identifiers.TrySplit(result.Id, out _, out var home, out _) && home == name).ToList();

            if (!own.Any(result => result.Field("outcome") == "success"))
            {
                findings.Add(new Finding("use-case-without-success", $"Use case '{useCase.Id}' has no success result.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }

            if (model.Config.Size == "large"
                && !model.Records.Any(record => record.Type == "scenario"
                    && Identifiers.TrySplit(record.Id, out _, out var scenarioHome, out _) && scenarioHome == name))
            {
                findings.Add(new Finding("use-case-without-scenario", $"Use case '{useCase.Id}' has no scenario.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }

            if (model.Status.TryGetValue(useCase.Id, out var status) && !status.Implemented)
            {
                findings.Add(new Finding("use-case-unimplemented", $"Use case '{useCase.Id}' has no handler, reaction or job.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }
        }

        foreach (var scenario in model.Records.Where(record => record.Type == "scenario"))
        {
            var resultId = scenario.Ids("result").FirstOrDefault();

            if (resultId is null)
            {
                continue;
            }

            if (!model.ById.TryGetValue(resultId, out var result) || result.Type != "result")
            {
                continue;
            }

            if (!ResultBelongsToScenario(model, scenario, result))
            {
                findings.Add(new Finding("scenario-result-unresolved", $"Scenario '{scenario.Id}' ends in '{resultId}' outside its use case.", scenario.File, scenario.Line, SubjectOf(scenario)));
            }
        }

        // A derived generic refusal is enforced by the access pipeline and input
        // validation, never thrown by handler code, so only written refusals count.
        foreach (var result in results.Where(left => !left.Derived && left.Field("outcome") == "refusal"))
        {
            if (result.Field("code") is { } code && !thrown.Contains(code))
            {
                findings.Add(new Finding("refusal-not-thrown", $"Result '{result.Id}' names code '{code}', which no code throws.", result.File, result.Line, SubjectOf(result)));
            }
        }

        var provesByClaim = model.Proves
            .GroupBy(link => (link.Scenario, link.Claim))
            .ToDictionary(group => group.Key, group => group.First());

        foreach (var test in model.Tests)
        {
            foreach (var claim in test.Claims)
            {
                if (provesByClaim.TryGetValue((test.Name, claim), out var link) && !link.Confirmed)
                {
                    findings.Add(new Finding("proves-unconfirmed", $"Scenario '{test.Name}' claims '{claim}' but carries no step, message or effect that proves it.", test.File, test.Line, claim));
                }
            }
        }
    }

    /// <summary>
    ///     Whether the scenario ends where it may: a reaction scenario in a result of
    ///     the use case its reaction issues, any other scenario in a written result of
    ///     its own use case or a derived generic result its use case carries.
    /// </summary>
    private static bool ResultBelongsToScenario(ProjectModel model, Record scenario, Record result)
    {
        if (scenario.PageId is not null
            && model.ById.TryGetValue(scenario.PageId, out var page)
            && page.Type == "reaction"
            && page.Ids("issues").FirstOrDefault() is { } issued
            && model.ById.TryGetValue(issued, out var target)
            && target.Type == "use-case"
            && Identifiers.TrySplit(issued, out _, out _, out var operation))
        {
            return (!result.Derived
                    && Identifiers.TrySplit(result.Id, out _, out var home, out _)
                    && home == operation)
                || (result.Derived && result.PageId == issued);
        }

        var scenarioHome = Identifiers.TrySplit(scenario.Id, out _, out var left, out _) ? left : null;

        if (result.Derived)
        {
            return result.PageId is not null
                && Identifiers.TrySplit(result.PageId, out _, out _, out var holder)
                && holder == scenarioHome;
        }

        var resultHome = Identifiers.TrySplit(result.Id, out _, out var right, out _) ? right : null;

        return scenarioHome is not null && scenarioHome == resultHome;
    }

    private static void CheckLinks(ProjectModel model, List<Finding> findings)
    {
        var found = new System.Collections.Concurrent.ConcurrentBag<Finding>();

        Parallel.ForEach(model.Bodies, body =>
        {
            var text = WithoutCode(body.Body);
            var starts = LineStarts(text);
            var folder = Path.GetDirectoryName(body.File) ?? ".";

            foreach (Match match in MarkdownLink().Matches(text))
            {
                var target = match.Groups["target"].Value.Trim('<', '>');

                if (target.Length == 0 || target.StartsWith('#') || UriScheme().IsMatch(target))
                {
                    continue;
                }

                var path = Uri.UnescapeDataString(target.Split('#')[0].Split('?')[0]);
                var resolved = Path.GetFullPath(Path.Combine(folder, path.Replace('/', Path.DirectorySeparatorChar)));

                if (!File.Exists(resolved) && !Directory.Exists(resolved))
                {
                    found.Add(new Finding("link-unresolved", $"Link '{target}' resolves to no file.", body.File, body.BodyStartLine + LineOf(starts, match.Index) - 1, body.PageId));
                }
            }
        });

        findings.AddRange(found);
    }

    /// <summary>Blanks fenced and inline code, keeping offsets and line breaks, so links in examples are not read.</summary>
    private static string WithoutCode(string text)
    {
        static string Blank(Match match) => Regex.Replace(match.Value, @"[^\r\n]", " ");

        var fenced = FencedCode().Replace(text, Blank);
        return InlineCode().Replace(fenced, Blank);
    }

    [GeneratedRegex(@"!?\[[^\]\r\n]*\]\((?<target>[^)\s]+)(?:\s+""[^""]*"")?\)")]
    private static partial Regex MarkdownLink();

    [GeneratedRegex(@"^[a-zA-Z][a-zA-Z0-9+.-]*:")]
    private static partial Regex UriScheme();

    [GeneratedRegex(@"\]\([^)\s]*\)")]
    private static partial Regex LinkTarget();

    [GeneratedRegex(@"(?ms)^[ \t]*(```|~~~).*?^[ \t]*\1[^\r\n]*$")]
    private static partial Regex FencedCode();

    [GeneratedRegex(@"`[^`\r\n]*`")]
    private static partial Regex InlineCode();

    private static void CheckSizeTypes(ProjectModel model, List<Finding> findings)
    {
        var declaration = Path.Combine(model.Config.Root, "litespec.project.json");
        var required = model.Config.Size == "small"
            ? RecordTypes.SmallRequired
            : RecordTypes.SmallRequired.Concat(RecordTypes.LargeAdded).ToList();

        foreach (var type in required.Concat(model.Config.OptionalTypes).Distinct(StringComparer.Ordinal))
        {
            if (type is "runbook" && !model.Config.OptionalTypes.Contains(type, StringComparer.Ordinal))
            {
                continue;
            }

            if (RecordTypes.All.Contains(type) && !model.Records.Any(record => record.Type == type))
            {
                findings.Add(new Finding("size-type-missing", $"The {model.Config.Size} size requires {type}, which no record holds.", declaration, 1, null));
            }
        }

        if (model.Records.Count(record => record.Type == "product") != 1)
        {
            findings.Add(new Finding("product-not-singleton", "The project holds no single product record.", declaration, 1, null));
        }
    }

    private static void CheckJourneyReach(ProjectModel model, List<Finding> findings)
    {
        if (model.Config.Size == "small")
        {
            return;
        }

        foreach (var useCase in model.Records.Where(record => record.Type == "use-case"))
        {
            if (ModelBuilder.BackgroundOnly(model, useCase))
            {
                continue;
            }

            var servesStep = useCase.Ids("serves")
                .Any(id => Identifiers.TrySplitStep(id, out _, out _));

            if (!servesStep)
            {
                findings.Add(new Finding("journey-reach", $"Use case '{useCase.Id}' sits in no journey.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }
        }
    }

    /// <summary>The remedy every behavior-unrecorded finding carries.</summary>
    private const string UnrecordedRemedy =
        "delete the code, or write its parent record from a requirement, drafting the requirement if none exists";

    private static void CheckBehaviorUnrecorded(ProjectModel model, List<Finding> findings)
    {
        foreach (var handler in model.Code.Handlers)
        {
            if (!IsUseCase(model, handler.UseCaseId))
            {
                findings.Add(new Finding("behavior-unrecorded", $"Handler for '{handler.UseCaseId}' has no use case record; {UnrecordedRemedy}.", handler.File, 1, handler.UseCaseId));
            }
        }

        foreach (var endpoint in model.Code.Endpoints)
        {
            if (!IsUseCase(model, endpoint.UseCaseId))
            {
                findings.Add(new Finding("behavior-unrecorded", $"Endpoint for '{endpoint.UseCaseId}' has no use case record; {UnrecordedRemedy}.", endpoint.File, 1, endpoint.UseCaseId));
            }
        }

        foreach (var reaction in model.Code.Reactions)
        {
            var kind = reaction.Kind == "job" ? "Job" : "Reaction";

            if (reaction.UseCaseId is null)
            {
                if (!HasImplements(model, reaction))
                {
                    findings.Add(new Finding("behavior-unrecorded", $"{kind} '{reaction.Class}' names no use case; {UnrecordedRemedy}.", reaction.File, reaction.Line, null));
                }
            }
            else if (!IsUseCase(model, reaction.UseCaseId))
            {
                findings.Add(new Finding("behavior-unrecorded", $"{kind} '{reaction.Class}' names '{reaction.UseCaseId}', which no use case record holds; {UnrecordedRemedy}.", reaction.File, reaction.Line, reaction.UseCaseId));
            }
        }

        foreach (var domainEvent in model.Code.Events)
        {
            if (domainEvent.EventId is null)
            {
                findings.Add(new Finding("behavior-unrecorded", $"Domain event '{domainEvent.Class}' is named by no event record; {UnrecordedRemedy}.", domainEvent.File, domainEvent.Line, null));
            }
        }

        // A refusal result declares the code a caller sees. A rule whose refusal is a bare code
        // declares a domain guard that no caller reaches, such as one a validator pre-empts.
        var declared = model.Records
            .Where(record => record.Type == "result" && record.Field("outcome") == "refusal")
            .Select(record => record.Field("code"))
            .Concat(model.Records
                .Where(record => record.Type == "rule")
                .Select(record => record.Field("refusal"))
                .Where(refusal => refusal is not null && !refusal.StartsWith("result/", StringComparison.Ordinal)))
            .OfType<string>()
            .ToHashSet(StringComparer.Ordinal);

        foreach (var literal in model.Code.Literals.Where(literal => literal.Declares))
        {
            if (!declared.Contains(literal.Value))
            {
                findings.Add(new Finding("behavior-unrecorded", $"Code '{literal.Value}' in code is declared by no refusal result; {UnrecordedRemedy}.", literal.File, literal.Line, null));
            }
        }

        CheckUnmatchedCalls(model, findings);
    }

    /// <summary>Whether the id names a use case record.</summary>
    /// <summary>Whether the reaction or job already links to a use case record.</summary>
    private static bool HasImplements(ProjectModel model, ReactionInfo reaction)
    {
        var relative = Path.IsPathRooted(reaction.File)
            ? model.Config.Relative(reaction.File)
            : reaction.File.Replace(Path.DirectorySeparatorChar, '/');

        return model.Implements.Any(link =>
            string.Equals(link.Kind, reaction.Kind, StringComparison.Ordinal)
            && string.Equals(link.Path, relative, StringComparison.Ordinal)
            && IsUseCase(model, link.To));
    }

    private static bool IsUseCase(ProjectModel model, string id) =>
        model.ById.TryGetValue(id, out var record) && record.Type == "use-case";

    private static void CheckUnmatchedCalls(ProjectModel model, List<Finding> findings)
    {
        if (model.Screens.Count == 0 || model.Config.Shape == "client-only")
        {
            return;
        }

        var byRoute = new Dictionary<string, string>(StringComparer.Ordinal);
        var byOperation = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var endpoint in model.Code.Endpoints)
        {
            if (endpoint.Operation.Length > 0)
            {
                byOperation.TryAdd(endpoint.Operation, endpoint.UseCaseId);
            }

            if (endpoint.Method.Length > 0 && endpoint.Route.Length > 0)
            {
                byRoute.TryAdd($"{endpoint.Method} {Template(endpoint.Route)}", endpoint.UseCaseId);
            }
        }

        foreach (var screen in model.Screens.OrderBy(left => left.File, StringComparer.Ordinal))
        {
            foreach (var operation in screen.Operations.OrderBy(left => left.Name, StringComparer.Ordinal))
            {
                if (byRoute.ContainsKey($"{operation.Method} {Template(operation.Path)}")
                    || byOperation.ContainsKey(Naming.Pascal(operation.Name)))
                {
                    continue;
                }

                findings.Add(new Finding(
                    "behavior-unrecorded",
                    $"Screen '{screen.Frontend} {screen.Route}' calls '{operation.Name}', which matches no endpoint; {UnrecordedRemedy}.",
                    ScreenFile(model, screen.File),
                    1,
                    null));
            }
        }
    }

    /// <summary>The route template with parameter constraints removed, so `{id:guid}` reads `{id}`.</summary>
    private static string Template(string route) => TemplateConstraint().Replace(route, "{$1}");

    [GeneratedRegex(@"\{(?<name>[^}:]+):[^}]+\}")]
    private static partial Regex TemplateConstraint();

    /// <summary>The screen's absolute file: screens keep the path relative to the consumer root.</summary>
    private static string ScreenFile(ProjectModel model, string file) =>
        Path.IsPathRooted(file)
            ? file
            : Path.GetFullPath(Path.Combine(model.Config.Root, file.Replace('/', Path.DirectorySeparatorChar)));

    private static void CheckLifecycle(ProjectModel model, List<Finding> findings)
    {
        foreach (var aggregate in model.Records.Where(record => record.Type == "aggregate"))
        {
            var states = StateNames(aggregate);
            var transitions = TransitionsOf(aggregate);

            if (transitions.Count == 0)
            {
                continue;
            }

            foreach (var transition in transitions)
            {
                if (transition.From != RecordReader.Creation && !states.Contains(transition.From))
                {
                    findings.Add(new Finding("transition-unresolved", $"Transition on aggregate '{aggregate.Id}' leads from '{transition.From}', which is not a state of the aggregate.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                }

                if (!states.Contains(transition.To))
                {
                    findings.Add(new Finding("transition-unresolved", $"Transition on aggregate '{aggregate.Id}' leads to '{transition.To}', which is not a state of the aggregate.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                }

                if (transition.By is not null && !IsUseCase(model, transition.By))
                {
                    findings.Add(new Finding("transition-unresolved", $"Transition on aggregate '{aggregate.Id}' is by '{transition.By}', which no use case record holds.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                }
            }

            var targets = transitions.Select(transition => transition.To).ToHashSet(StringComparer.Ordinal);
            var sources = transitions.Select(transition => transition.From).ToHashSet(StringComparer.Ordinal);

            foreach (var state in states.Order(StringComparer.Ordinal))
            {
                if (!targets.Contains(state) && !sources.Contains(state))
                {
                    findings.Add(new Finding("state-unreachable", $"State '{state}' of aggregate '{aggregate.Id}' is reached by no transition.", aggregate.File, aggregate.Line, SubjectOf(aggregate)));
                }
            }
        }
    }

    /// <summary>One aggregate transition: the states it leaves and enters, and the use case behind it.</summary>
    sealed record AggregateTransition(string From, string To, string? By);

    /// <summary>The aggregate's transitions; entries without both states are left to the shape check.</summary>
    private static IReadOnlyList<AggregateTransition> TransitionsOf(Record aggregate)
    {
        if (aggregate.Raw.ValueKind != JsonValueKind.Object
            || !aggregate.Raw.TryGetProperty("transitions", out var value)
            || value.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var found = new List<AggregateTransition>();

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind == JsonValueKind.Object
                && entry.TryGetProperty("from", out var from)
                && from.ValueKind == JsonValueKind.String
                && from.GetString() is { Length: > 0 } leave
                && entry.TryGetProperty("to", out var to)
                && to.ValueKind == JsonValueKind.String
                && to.GetString() is { Length: > 0 } enter)
            {
                found.Add(new AggregateTransition(
                    leave,
                    enter,
                    entry.TryGetProperty("by", out var by) && by.ValueKind == JsonValueKind.String ? by.GetString() : null));
            }
        }

        return found;
    }

    /// <summary>The aggregate's state names.</summary>
    private static IReadOnlySet<string> StateNames(Record aggregate)
    {
        if (aggregate.Raw.ValueKind != JsonValueKind.Object
            || !aggregate.Raw.TryGetProperty("states", out var value)
            || value.ValueKind != JsonValueKind.Array)
        {
            return new HashSet<string>(StringComparer.Ordinal);
        }

        return value.EnumerateArray()
            .Where(entry => entry.ValueKind == JsonValueKind.Object
                && entry.TryGetProperty("name", out var name)
                && name.ValueKind == JsonValueKind.String
                && name.GetString() is { Length: > 0 })
            .Select(entry => entry.GetProperty("name").GetString()!)
            .ToHashSet(StringComparer.Ordinal);
    }

    /// <summary>One aggregate data field: its name and classification.</summary>
    sealed record AggregateField(string Name, string Classification);

    /// <summary>The aggregate's data fields; entries without a name and classification are left to the shape check.</summary>
    private static IReadOnlyList<AggregateField> DataOf(Record aggregate)
    {
        if (aggregate.Raw.ValueKind != JsonValueKind.Object
            || !aggregate.Raw.TryGetProperty("data", out var value)
            || value.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var found = new List<AggregateField>();

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind == JsonValueKind.Object
                && entry.TryGetProperty("name", out var name)
                && name.ValueKind == JsonValueKind.String
                && name.GetString() is { Length: > 0 } field
                && entry.TryGetProperty("classification", out var classification)
                && classification.ValueKind == JsonValueKind.String
                && classification.GetString() is { Length: > 0 } level)
            {
                found.Add(new AggregateField(field, level));
            }
        }

        return found;
    }

    private static void CheckCalculations(ProjectModel model, List<Finding> findings)
    {
        foreach (var rule in model.Records.Where(record => record.Type == "rule" && record.Field("kind") == "calculation"))
        {
            var covered = GovernedUseCases(model, rule)
                .SelectMany(useCase => ScenariosOf(model, useCase))
                .Any(scenario => scenario.Status != "retired" && HasExamples(scenario));

            if (!covered)
            {
                findings.Add(new Finding("calculation-without-table", $"Rule '{rule.Id}' is a calculation with no scenario examples table.", rule.File, rule.Line, SubjectOf(rule)));
            }
        }
    }

    /// <summary>The use cases a rule governs: directly, or through the aggregate that holds them.</summary>
    private static IReadOnlyList<Record> GovernedUseCases(ProjectModel model, Record rule)
    {
        var found = new List<Record>();

        foreach (var target in rule.Ids("governs"))
        {
            if (!model.ById.TryGetValue(target, out var governed))
            {
                continue;
            }

            if (governed.Type == "use-case")
            {
                found.Add(governed);
            }
            else if (governed.Type == "aggregate")
            {
                found.AddRange(model.Records.Where(record =>
                    record.Type == "use-case" && ModelBuilder.AggregateOf(model, record)?.Id == governed.Id));
            }
        }

        return found;
    }

    /// <summary>The scenarios on a use case page.</summary>
    private static IReadOnlyList<Record> ScenariosOf(ProjectModel model, Record useCase)
    {
        if (!Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
        {
            return [];
        }

        return model.Records
            .Where(record => record.Type == "scenario"
                && Identifiers.TrySplit(record.Id, out _, out var home, out _)
                && home == name)
            .ToList();
    }

    /// <summary>Whether the scenario carries a non-empty examples table.</summary>
    private static bool HasExamples(Record scenario) =>
        scenario.Raw.ValueKind == JsonValueKind.Object
        && scenario.Raw.TryGetProperty("examples", out var value)
        && value.ValueKind == JsonValueKind.Array
        && value.GetArrayLength() > 0;

    private static void CheckMeasured(ProjectModel model, List<Finding> findings)
    {
        foreach (var requirement in model.Records.Where(record => record.Type == "requirement" && record.Field("measure") is { Length: > 0 }))
        {
            var check = requirement.Field("check");

            if (check is not { Length: > 0 })
            {
                findings.Add(new Finding("requirement-unmeasured", $"Requirement '{requirement.Id}' is measured but names no check.", requirement.File, requirement.Line, SubjectOf(requirement)));
            }
            else if (!model.Measures.Any(measure => measure.Passed && MeasureMatches(measure, check)))
            {
                findings.Add(new Finding("requirement-unmeasured", $"Requirement '{requirement.Id}' names check '{check}' with no passing run.", requirement.File, requirement.Line, SubjectOf(requirement)));
            }
        }
    }

    /// <summary>Whether the tool result is the requirement's check: the check alone, or the tool and the check.</summary>
    private static bool MeasureMatches(MeasureResult measure, string check) =>
        measure.Check.Equals(check, StringComparison.Ordinal)
        || $"{measure.Tool} {measure.Check}".Equals(check, StringComparison.Ordinal);

    private static void CheckQuestions(ProjectModel model, List<Finding> findings)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var record in model.Records)
        {
            if ((record.Status == "approved" || record.Status == "reviewed") && HasOpenQuestions(record, model.Config, today))
            {
                findings.Add(new Finding("record-shape", $"Record '{record.Id}' is {record.Status} with open questions.", record.File, record.Line, SubjectOf(record)));
            }
        }
    }

    /// <summary>
    ///     Whether the record carries open questions: entries that are not
    ///     auto-approved. An auto-approved question is closed, not open.
    /// </summary>
    private static bool HasOpenQuestions(Record record, ConsumerConfig config, DateOnly today) =>
        record.Raw.ValueKind == JsonValueKind.Object
        && record.Raw.TryGetProperty("questions", out var value)
        && value.ValueKind == JsonValueKind.Array
        && value.EnumerateArray().Any(entry => !AutoApproved(entry, record, config, today));

    /// <summary>One CODEOWNERS line: the paths it owns and the owners it names.</summary>
    sealed record CodeownerRule(Regex Matcher, IReadOnlyList<string> Owners);

    /// <summary>
    ///     The consumer CODEOWNERS file, when one exists: a record's owner, or a CODEOWNERS
    ///     handle its project owners entry lists, matches an owner of the last pattern its
    ///     path matches. Basename patterns match in any folder, directory patterns own
    ///     everything beneath, and `*`, `**` and `?` span as usual.
    /// </summary>
    sealed class Codeowners
    {
        private readonly IReadOnlyList<CodeownerRule> _rules;

        private Codeowners(IReadOnlyList<CodeownerRule> rules) => _rules = rules;

        /// <summary>Reads the CODEOWNERS file from its usual homes, or no rules when none exists.</summary>
        public static Codeowners Load(string root)
        {
            foreach (var candidate in new[] { ".github/CODEOWNERS", "CODEOWNERS", "docs/CODEOWNERS" })
            {
                var file = Path.Combine(root, candidate.Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(file))
                {
                    return new Codeowners(Parse(SourceTree.Read(file)));
                }
            }

            return new Codeowners([]);
        }

        /// <summary>Whether a candidate matches an owner of the file's path, or no rule constrains the path.</summary>
        public bool Covers(string root, string file, IReadOnlyList<string> candidates)
        {
            if (_rules.Count == 0)
            {
                return true;
            }

            var relative = Path.GetRelativePath(root, file).Replace(Path.DirectorySeparatorChar, '/');
            IReadOnlyList<string>? hit = null;

            foreach (var rule in _rules)
            {
                if (rule.Matcher.IsMatch(relative))
                {
                    hit = rule.Owners;
                }
            }

            return hit is null || candidates.Any(candidate => hit.Any(entry => OwnerMatches(entry, candidate)));
        }

        private static IReadOnlyList<CodeownerRule> Parse(string text)
        {
            var rules = new List<CodeownerRule>();

            foreach (var line in text.Split('\n'))
            {
                var trimmed = line.Trim();

                if (trimmed.Length == 0 || trimmed.StartsWith('#'))
                {
                    continue;
                }

                var parts = trimmed.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);

                if (parts.Length < 2)
                {
                    continue;
                }

                rules.Add(new CodeownerRule(RuleMatcher(parts[0]), parts[1..]));
            }

            return rules;
        }

        private static bool OwnerMatches(string entry, string owner)
        {
            var named = entry.StartsWith('@') ? entry[1..] : entry;
            var claimed = owner.StartsWith('@') ? owner[1..] : owner;

            return named.Equals(claimed, StringComparison.OrdinalIgnoreCase)
                || named.EndsWith("/" + claimed, StringComparison.OrdinalIgnoreCase);
        }

        private static Regex RuleMatcher(string pattern)
        {
            var mine = pattern.StartsWith('/') ? pattern[1..] : pattern;
            string full;

            if (mine.EndsWith('/'))
            {
                full = $"^(?:{GlobBody(mine.TrimEnd('/'))})/";
            }
            else if (!mine.Contains('/'))
            {
                full = $"^(?:.*/)?(?:{GlobBody(mine)})$";
            }
            else if (mine.IndexOfAny(['*', '?']) < 0)
            {
                full = $"^(?:{GlobBody(mine)})(?:/.*)?$";
            }
            else
            {
                full = $"^(?:{GlobBody(mine)})$";
            }

            return new Regex(full, RegexOptions.Compiled);
        }

        /// <summary>Turns a CODEOWNERS pattern into its regex body: `**` spans folders, `*` and `?` stay inside one.</summary>
        private static string GlobBody(string pattern)
        {
            var built = new StringBuilder();

            for (var index = 0; index < pattern.Length; index++)
            {
                if (pattern[index] == '*' && index + 1 < pattern.Length && pattern[index + 1] == '*')
                {
                    if (index + 2 < pattern.Length && pattern[index + 2] == '/')
                    {
                        built.Append("(?:.*/)?");
                        index += 2;
                    }
                    else
                    {
                        built.Append(".*");
                        index += 1;
                    }
                }
                else if (pattern[index] == '*')
                {
                    built.Append("[^/]*");
                }
                else if (pattern[index] == '?')
                {
                    built.Append("[^/]");
                }
                else
                {
                    built.Append(Regex.Escape(pattern[index].ToString()));
                }
            }

            return built.ToString();
        }
    }

    private static string? SubjectOf(Record record) => record.Id.Length > 0 ? record.Id : null;

    private static bool ValidDate(string text) =>
        IsoDate(text, out _)
        || DateTimeOffset.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out _);

    // Record dates are ISO 8601, so they parse the same under every culture.
    private static bool IsoDate(string text, out DateOnly date) =>
        DateOnly.TryParseExact(text, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date);

    private static bool IsProvisionCitation(string text) =>
        Identifiers.SharedCitation().IsMatch(text)
        && Identifiers.SharedCitation().Match(text).Value == text;

    private static void RequireString(Record record, string field, List<Finding> findings)
    {
        if (record.Field(field) is not { Length: > 0 })
        {
            findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
        }
    }

    private static void RequireStateEntries(Record record, List<Finding> findings)
    {
        if (!record.Raw.TryGetProperty("states", out var value) || value.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        foreach (var entry in value.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object
                || !entry.TryGetProperty("name", out var name)
                || name.ValueKind != JsonValueKind.String
                || string.IsNullOrEmpty(name.GetString())
                || !entry.TryGetProperty("meaning", out var meaning)
                || meaning.ValueKind != JsonValueKind.String
                || string.IsNullOrEmpty(meaning.GetString()))
            {
                findings.Add(new Finding("invalid-field", $"Aggregate '{record.Id}' holds a state without a name and a meaning.", record.File, record.Line, SubjectOf(record)));
                return;
            }
        }
    }

    private static void RequireArray(Record record, string field, int minimum, List<Finding> findings)
    {
        if (!record.Has(field))
        {
            findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
            return;
        }

        if (record.Raw.TryGetProperty(field, out var value) && value.ValueKind != JsonValueKind.Array)
        {
            findings.Add(new Finding("invalid-field", $"Record '{record.Id}' holds {field} as no array.", record.File, record.Line, SubjectOf(record)));
            return;
        }

        if (value.GetArrayLength() < minimum)
        {
            findings.Add(new Finding("invalid-field", $"Record '{record.Id}' holds an empty {field}.", record.File, record.Line, SubjectOf(record)));
        }
    }

    private static void RequireIds(Record record, string field, int minimum, List<Finding> findings)
    {
        var ids = record.Ids(field);

        if (!record.Has(field) || ids.Count == 0)
        {
            if (minimum > 0 || !record.Has(field))
            {
                findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
            }

            return;
        }
    }

    private static void RequireEnum(Record record, string field, string[] values, List<Finding> findings)
    {
        var value = record.Field(field);

        if (value is null)
        {
            findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
        }
        else if (!values.Contains(value, StringComparer.Ordinal))
        {
            findings.Add(new Finding("invalid-field", $"Record '{record.Id}' has {field} '{value}'; {string.Join(", ", values)}.", record.File, record.Line, SubjectOf(record)));
        }
    }

    private static void RequireBoolean(Record record, string field, List<Finding> findings)
    {
        if (!record.Has(field))
        {
            findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
        }
        else if (record.Raw.TryGetProperty(field, out var value)
            && value.ValueKind is not (JsonValueKind.True or JsonValueKind.False))
        {
            findings.Add(new Finding("invalid-field", $"Record '{record.Id}' holds {field} as no boolean.", record.File, record.Line, SubjectOf(record)));
        }
    }

    private static void RequireDate(Record record, string field, List<Finding> findings)
    {
        var value = record.Field(field);

        if (value is null)
        {
            findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
        }
        else if (!ValidDate(value))
        {
            findings.Add(new Finding("invalid-field", $"Record '{record.Id}' has {field} '{value}', which is not a date.", record.File, record.Line, SubjectOf(record)));
        }
    }

    private static void RequirePattern(Record record, string field, string pattern, string shape, List<Finding> findings)
    {
        var value = record.Field(field);

        if (value is null)
        {
            findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
        }
        else if (!Regex.IsMatch(value, pattern))
        {
            findings.Add(new Finding("invalid-field", $"Record '{record.Id}' has {field} '{value}', which is not {shape}.", record.File, record.Line, SubjectOf(record)));
        }
    }

    private static IEnumerable<string> StringsOf(JsonElement value)
    {
        if (value.ValueKind == JsonValueKind.String && value.GetString() is { } text)
        {
            yield return text;
        }
        else if (value.ValueKind == JsonValueKind.Array)
        {
            foreach (var entry in value.EnumerateArray())
            {
                foreach (var nested in StringsOf(entry))
                {
                    yield return nested;
                }
            }
        }
        else if (value.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in value.EnumerateObject())
            {
                foreach (var nested in StringsOf(property.Value))
                {
                    yield return nested;
                }
            }
        }
    }

    /// <summary>Every line's start offset, for offset-to-line reads.</summary>
    private static int[] LineStarts(string text)
    {
        var starts = new List<int> { 0 };

        for (var index = 0; index < text.Length; index++)
        {
            if (text[index] == '\n')
            {
                starts.Add(index + 1);
            }
        }

        return [.. starts];
    }

    /// <summary>The 1-based line holding the offset.</summary>
    private static int LineOf(int[] starts, int offset)
    {
        var found = Array.BinarySearch(starts, offset);

        return found >= 0 ? found + 1 : ~found;
    }
}

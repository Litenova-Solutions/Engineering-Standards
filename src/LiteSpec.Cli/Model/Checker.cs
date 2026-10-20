using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace LiteSpec.Model;

/// <summary>
///     Every model check: schema, identifiers, citations, gates, proof and reach.
/// </summary>
static partial class Checker
{
    /// <summary>Every finding code a known gap may name.</summary>
    public static readonly HashSet<string> Codes = new(StringComparer.Ordinal)
    {
        "record-shape", "invalid-field", "identifier-form", "identifier-duplicate",
        "use-case-name-clash", "reference-unresolved", "identifier-refused-form", "draft-gate",
        "owner-unknown", "draft-without-decider", "known-gap-expired", "gap-unknown-check",
        "rule-name-negation", "use-case-without-success", "case-result-unresolved",
        "refusal-not-thrown", "use-case-unimplemented", "proves-unconfirmed",
        "profile-type-missing", "product-not-singleton",
        "journey-reach", "use-case-access", "result-status", "region-unknown",
        "use-case-without-case", "requirement-unfulfilled",
        "business-record-name-clash", "decision-decides-nothing", "link-unresolved",
    };

    /// <summary>Requirement kinds that code makes true, so some rule, use case or journey fulfils them.</summary>
    private static readonly HashSet<string> FulfilledKinds = new(StringComparer.Ordinal)
    {
        "promise", "behaviour", "quality",
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

        Time("schema", () => CheckSchema(model, findings));
        Time("identifiers", () => CheckIdentifiers(model, findings));
        Time("citations", () => CheckCitations(model, findings));
        Time("refused", () => CheckRefusedForms(model, findings));
        Time("gates", () => CheckGates(model, findings));
        Time("proof", () => CheckProof(model, findings));
        Time("fulfilment", () => CheckFulfilment(model, findings));
        Time("links", () => CheckLinks(model, findings));
        Time("access", () => CheckAccess(model, findings));
        Time("status", () => CheckResultStatus(model, findings));
        Time("regions", () => CheckRegions(model, findings));
        Time("profile", () => CheckProfile(model, findings));
        Time("reach", () => CheckJourneyReach(model, findings));

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

            // A gap naming a use case also covers findings about the cases and results it holds.
            var subjects = new List<string> { finding.Subject };

            if ((finding.Subject.StartsWith("case/", StringComparison.Ordinal) || finding.Subject.StartsWith("result/", StringComparison.Ordinal))
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

    private static void CheckSchema(ProjectModel model, List<Finding> findings)
    {
        foreach (var record in model.Records)
        {
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

            if (record.Status is null)
            {
                findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no status.", record.File, record.Line, SubjectOf(record)));
            }
            else if (record.Status is not ("draft" or "approved" or "retired"))
            {
                findings.Add(new Finding("invalid-field", $"Record '{record.Id}' has status '{record.Status}'; draft, approved or retired.", record.File, record.Line, SubjectOf(record)));
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

    private static void CheckTypeFields(ProjectModel model, Record record, List<Finding> findings)
    {
        switch (record.Type)
        {
            case "product":
                RequireString(record, "boundary", findings);
                RequireArray(record, "neverDoes", 0, findings);
                RequireIds(record, "audience", 1, findings);
                break;

            case "constraint":
                RequireString(record, "source", findings);
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
                }

                break;

            case "requirement":
                RequireEnum(record, "kind", ["promise", "behaviour", "quality", "target", "practice"], findings);
                RequireString(record, "statement", findings);

                if (record.Field("kind") == "promise")
                {
                    RequireArray(record, "values", 1, findings);
                }

                if (record.Field("kind") == "target")
                {
                    RequireString(record, "measure", findings);
                    RequireString(record, "by", findings);
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

                break;

            case "actor":
                RequireEnum(record, "kind", ["person", "company", "provider", "system", "guest"], findings);
                break;

            case "role":
                RequirePattern(record, "scope", @"^[a-z0-9]+(-[a-z0-9]+)*$", "kebab-case", findings);
                RequireIds(record, "allows", 1, findings);
                break;

            case "permission":
                RequirePattern(record, "code", @"^[a-z0-9]+(-[a-z0-9]+)*$", "kebab-case", findings);
                RequirePattern(record, "codeType", @"^[A-Z][A-Za-z0-9]*$", "PascalCase", findings);
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

            case "business-record":
                RequireString(record, "codeName", findings);
                RequireArray(record, "states", 1, findings);
                break;

            case "rule":
                RequireEnum(record, "kind", ["always-true", "checked-before", "across-records"], findings);
                RequireEnum(record, "enforcedBy", ["validator", "aggregate", "store", "guard", "reaction"], findings);
                RequireString(record, "statement", findings);
                RequireIds(record, "governs", 1, findings);
                break;

            case "use-case":
                RequireEnum(record, "operation", ["command", "query"], findings);
                // A retired use case names no entry point (litespec/rule/core-principles.retire-public-behavior-deliberately), so only a live one must be reached.
                if (record.Status != "retired")
                {
                    RequireIds(record, "reachedThrough", 1, findings);
                }
                break;

            case "result":
                RequireEnum(record, "outcome", ["success", "refusal"], findings);
                RequireString(record, "meaning", findings);

                if (record.Field("outcome") == "refusal")
                {
                    RequireString(record, "code", findings);

                    if (record.Field("code") is { } code && !Identifiers.FailureCode().IsMatch(code))
                    {
                        findings.Add(new Finding("invalid-field", $"Result '{record.Id}' has code '{code}', which is not a failure code.", record.File, record.Line, SubjectOf(record)));
                    }
                }

                break;

            case "case":
                RequireString(record, "situation", findings);
                RequireString(record, "action", findings);
                RequireString(record, "result", findings);
                RequireString(record, "expect", findings);
                break;

            case "event":
                RequireString(record, "meaning", findings);
                RequireArray(record, "carries", 0, findings);
                break;

            case "entry-point":
                RequireEnum(record, "kind", ["web-app", "public-api", "cli", "mcp-server", "site", "reaction", "job"], findings);
                break;

            case "limit":
                RequireString(record, "bound", findings);
                RequireString(record, "value", findings);
                RequireIds(record, "runbook", 1, findings);
                break;

            case "runbook":
                if (!record.Has("limit") && !record.Has("trigger"))
                {
                    findings.Add(new Finding("record-shape", $"Runbook '{record.Id}' names neither a limit nor a trigger.", record.File, record.Line, SubjectOf(record)));
                }

                break;

            case "exception":
                RequireString(record, "standard", findings);
                RequireString(record, "reason", findings);
                RequireDate(record, "reviewBy", findings);
                RequireString(record, "removeWhen", findings);

                if (record.Field("standard") is { } provision
                    && !IsProvisionCitation(provision)
                    && !(model.ById.TryGetValue(provision, out var standard) && standard.Type == "standard"))
                {
                    findings.Add(new Finding("invalid-field", $"Exception '{record.Id}' names '{provision}', which is neither a shared provision nor a project standard.", record.File, record.Line, SubjectOf(record)));
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
                if (!model.ById.TryGetValue(target, out var resolved))
                {
                    continue;
                }

                if (allowed.Count > 0 && !allowed.Contains(resolved.Type))
                {
                    findings.Add(new Finding("invalid-field", $"Record '{record.Id}' links {property.Name} to '{target}', which is a {resolved.Type}.", record.File, record.Line, SubjectOf(record)));
                }
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
            if (record.Id.Length == 0)
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

            if (record.Type == "business-record" && !recordNames.Add(name))
            {
                findings.Add(new Finding("business-record-name-clash", $"Business-record name '{name}' is used twice; rule and event homes cannot resolve.", record.File, record.Line, SubjectOf(record)));
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
                findings.Add(new Finding("use-case-name-clash", $"Use-case name '{clash.Key}' is used twice; result and case homes cannot resolve.", record.File, record.Line, SubjectOf(record)));
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
                "use-case" or "business-record" => moduleNames.Contains(home),
                "rule" => moduleNames.Contains(home) || recordNames.Contains(home),
                "result" or "case" => useCaseNames.ContainsKey(home),
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
        var codes = new HashSet<string>(model.Code.Literals.Select(literal => literal.Value), StringComparer.Ordinal);

        foreach (var record in model.Records.Where(left => left.Type == "result"))
        {
            if (record.Field("code") is { } code)
            {
                codes.Add(code);
            }
        }

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
                if (!Resolves(model, codes, id))
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
                CheckTextCitations(model, codes, text.File, text.Text, text.StartLine, text.Subject, local);

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
        HashSet<string> codes,
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
            if (!Resolves(model, codes, entry.Key))
            {
                findings.Add(new Finding("reference-unresolved", $"Citation '{entry.Key}' resolves to no record.", file, entry.Value, subject));
            }
        }
    }

    private static bool Resolves(ProjectModel model, HashSet<string> codes, string id)
    {
        if (model.ById.ContainsKey(id))
        {
            return true;
        }

        if (id.StartsWith("litespec/", StringComparison.Ordinal))
        {
            return model.Provisions.Count == 0 || model.Provisions.Contains(id);
        }

        if (id.StartsWith("failure/", StringComparison.Ordinal))
        {
            return codes.Contains(id);
        }

        return false;
    }

    private static void CheckRefusedForms(ProjectModel model, List<Finding> findings)
    {
        var pageByFile = model.Bodies
            .Where(body => body.PageId is not null)
            .ToDictionary(body => body.File, body => body.PageId, StringComparer.Ordinal);
        var files = new List<(string File, string? Subject)>();

        foreach (var root in model.Config.RecordRoots)
        {
            foreach (var file in SourceTree.Files(root, ".md"))
            {
                files.Add((file, pageByFile.GetValueOrDefault(file)));
            }
        }

        foreach (var root in new[] { model.Config.ApplicationRoot, model.Config.DomainRoot, model.Config.WebApiRoot, model.Config.InfrastructureRoot })
        {
            foreach (var file in SourceTree.Files(root, ".cs"))
            {
                files.Add((file, null));
            }
        }

        foreach (var root in model.Config.TestRoots)
        {
            foreach (var file in SourceTree.Files(root, ".cs"))
            {
                files.Add((file, null));
            }
        }

        foreach (var frontend in model.Config.Frontends)
        {
            foreach (var file in SourceTree.Files(frontend.Path, ".ts", ".tsx", ".js", ".jsx", ".svelte", ".svelte.ts"))
            {
                files.Add((file, null));
            }
        }

        var found = new List<Finding>();

        System.Threading.Tasks.Parallel.ForEach(
            files,
            () => new List<Finding>(),
            (file, _, local) =>
            {
                ScanRefused(file.File, SourceTree.Read(file.File), file.Subject, local);

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

    private static readonly string[] FileTails =
    [
        ".ts", ".tsx", ".js", ".jsx", ".svelte", ".md", ".json", ".css", ".mjs", ".cjs",
    ];

    private static void ScanRefused(string file, string text, string? subject, List<Finding> findings)
    {
        var seen = new Dictionary<string, int>(StringComparer.Ordinal);
        var starts = LineStarts(text);

        foreach (Match match in Identifiers.RefusedAny().Matches(text))
        {
            if (FileTails.Any(tail => match.Value.EndsWith(tail, StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            seen.TryAdd(match.Value, LineOf(starts, match.Index));
        }

        foreach (var entry in seen.OrderBy(left => left.Value).ThenBy(left => left.Key, StringComparer.Ordinal))
        {
            findings.Add(new Finding("identifier-refused-form", $"Old form '{entry.Key}' is refused.", file, entry.Value, subject));
        }
    }

    private static void CheckGates(ProjectModel model, List<Finding> findings)
    {
        var drafts = model.Records
            .Where(record => record.Type == "decision" && record.Status == "draft")
            .SelectMany(decision => decision.Ids("decides"))
            .ToHashSet(StringComparer.Ordinal);

        foreach (var record in model.Records)
        {
            if (record.Status == "approved" && drafts.Contains(record.Id))
            {
                findings.Add(new Finding("draft-gate", $"Record '{record.Id}' is approved while its decision is a draft.", record.File, record.Line, SubjectOf(record)));
            }
        }

        foreach (var decision in model.Records.Where(record => record.Type == "decision" && record.Status != "retired"))
        {
            if (!decision.Ids("decides").Any())
            {
                findings.Add(new Finding("decision-decides-nothing", $"Decision '{decision.Id}' names nothing it decides.", decision.File, decision.Line, SubjectOf(decision)));
            }
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

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
            .SelectMany(record => record.Ids("fulfils"))
            .ToHashSet(StringComparer.Ordinal);

        foreach (var requirement in model.Records.Where(record => record.Type == "requirement" && record.Status != "retired"))
        {
            if (!FulfilledKinds.Contains(requirement.Field("kind") ?? ""))
            {
                continue;
            }

            var undelivered = requirement.Ids("deliveredBy").Any(id =>
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
                && !model.Records.Any(record => record.Type == "case"
                    && Identifiers.TrySplit(record.Id, out _, out var caseHome, out _) && caseHome == name))
            {
                findings.Add(new Finding("use-case-without-case", $"Use case '{useCase.Id}' has no case.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }

            if (model.Status.TryGetValue(useCase.Id, out var status) && !status.Implemented)
            {
                findings.Add(new Finding("use-case-unimplemented", $"Use case '{useCase.Id}' has no handler, reaction or job.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }
        }

        foreach (var kase in model.Records.Where(record => record.Type == "case"))
        {
            var resultId = kase.Ids("result").FirstOrDefault();

            if (resultId is null)
            {
                continue;
            }

            if (!model.ById.TryGetValue(resultId, out var result) || result.Type != "result")
            {
                continue;
            }

            var caseHome = Identifiers.TrySplit(kase.Id, out _, out var left, out _) ? left : null;
            var resultHome = Identifiers.TrySplit(result.Id, out _, out var right, out _) ? right : null;

            if (caseHome is null || caseHome != resultHome)
            {
                findings.Add(new Finding("case-result-unresolved", $"Case '{kase.Id}' ends in '{resultId}' of another use case.", kase.File, kase.Line, SubjectOf(kase)));
            }
        }

        foreach (var result in results.Where(left => left.Field("outcome") == "refusal"))
        {
            if (result.Field("code") is { } code && !thrown.Contains(code))
            {
                findings.Add(new Finding("refusal-not-thrown", $"Result '{result.Id}' names code '{code}', which no code throws.", result.File, result.Line, SubjectOf(result)));
            }
        }

        var provesByClaim = model.Proves
            .GroupBy(link => (link.Scenario, link.Case))
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

    private static void CheckAccess(ProjectModel model, List<Finding> findings)
    {
        foreach (var useCase in model.Records.Where(record => record.Type == "use-case"))
        {
            if (useCase.Ids("needs").Count > 0 || ModelBuilder.Anonymous(useCase))
            {
                continue;
            }

            if (ModelBuilder.BackgroundOnly(model, useCase))
            {
                continue;
            }

            findings.Add(new Finding("use-case-access", $"Use case '{useCase.Id}' names no permission, is not anonymous, and is reached beyond reactions and jobs.", useCase.File, useCase.Line, SubjectOf(useCase)));
        }
    }

    private static void CheckResultStatus(ProjectModel model, List<Finding> findings)
    {
        var useCaseByName = model.Records
            .Where(record => record.Type == "use-case")
            .Select(record => (Record: record, Split: Identifiers.TrySplit(record.Id, out _, out _, out var name) ? name : null))
            .Where(entry => entry.Split is not null)
            .GroupBy(entry => entry.Split!, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.First().Record, StringComparer.Ordinal);

        foreach (var result in model.Records.Where(record => record.Type == "result"))
        {
            if (!Identifiers.TrySplit(result.Id, out _, out var home, out _)
                || home is null
                || !useCaseByName.TryGetValue(home, out var useCase)
                || useCase.Ids("reachedThrough").Count == 0)
            {
                continue;
            }

            if (ModelBuilder.BackgroundOnly(model, useCase))
            {
                if (result.Has("httpStatus"))
                {
                    findings.Add(new Finding("result-status", $"Result '{result.Id}' carries an httpStatus but '{useCase.Id}' is reached only through reactions or jobs.", result.File, result.Line, SubjectOf(result)));
                }

                continue;
            }

            if (!result.Has("httpStatus"))
            {
                findings.Add(new Finding("result-status", $"Result '{result.Id}' has no httpStatus.", result.File, result.Line, SubjectOf(result)));
            }
            else if (ResultStatus(result) is not (>= 200 and <= 599))
            {
                findings.Add(new Finding("result-status", $"Result '{result.Id}' has httpStatus '{result.Raw.GetProperty("httpStatus")}', which is no HTTP status.", result.File, result.Line, SubjectOf(result)));
            }
        }
    }

    private static void CheckRegions(ProjectModel model, List<Finding> findings)
    {
        foreach (var body in model.Bodies)
        {
            var starts = LineStarts(body.Body);

            foreach (var region in Renderer.Regions(body.Body))
            {
                if (!Renderer.KnownRegions.Contains(region.Name))
                {
                    findings.Add(new Finding("region-unknown", $"Region '{region.Name}' is not a region the model builder renders.", body.File, body.BodyStartLine + LineOf(starts, region.Index) - 1, body.PageId));
                }
            }
        }
    }

    private static void CheckProfile(ProjectModel model, List<Finding> findings)
    {
        var declaration = Path.Combine(model.Config.Root, "litespec.project.json");
        var required = model.Config.Size == "small"
            ? RecordTypes.SmallRequired
            : RecordTypes.SmallRequired.Concat(RecordTypes.LargeAdded).ToList();

        foreach (var type in required.Concat(model.Config.OptionalTypes).Distinct(StringComparer.Ordinal))
        {
            if (type is "limit" or "runbook" && !model.Config.OptionalTypes.Contains(type, StringComparer.Ordinal))
            {
                continue;
            }

            if (RecordTypes.All.Contains(type) && !model.Records.Any(record => record.Type == type))
            {
                findings.Add(new Finding("profile-type-missing", $"The {model.Config.Size} profile requires {type}, which no record holds.", declaration, 1, null));
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

        var stepped = model.Records
            .Where(record => record.Type == "journey")
            .SelectMany(journey => ModelBuilder.TargetsOf(JourneySteps(journey)))
            .ToHashSet(StringComparer.Ordinal);

        foreach (var useCase in model.Records.Where(record => record.Type == "use-case"))
        {
            var entries = useCase.Ids("reachedThrough");
            var background = entries.Count > 0 && entries.All(entry =>
                model.ById.TryGetValue(entry, out var point)
                && RecordTypes.BackgroundEntryKinds.Contains(point.Field("kind") ?? ""));

            if (!background && !stepped.Contains(useCase.Id))
            {
                findings.Add(new Finding("journey-reach", $"Use case '{useCase.Id}' sits in no journey.", useCase.File, useCase.Line, SubjectOf(useCase)));
            }
        }
    }

    private static JsonElement JourneySteps(Record journey) =>
        journey.Raw.ValueKind == JsonValueKind.Object
        && journey.Raw.TryGetProperty("steps", out var steps)
            ? steps
            : default;

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

    private static int? ResultStatus(Record record)
    {
        if (record.Raw.ValueKind != JsonValueKind.Object
            || !record.Raw.TryGetProperty("httpStatus", out var value))
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var number))
        {
            return number;
        }

        if (value.ValueKind == JsonValueKind.String
            && int.TryParse(value.GetString(), out var text))
        {
            return text;
        }

        return null;
    }

    private static void RequireString(Record record, string field, List<Finding> findings)
    {
        if (record.Field(field) is not { Length: > 0 })
        {
            findings.Add(new Finding("record-shape", $"Record '{record.Id}' has no {field}.", record.File, record.Line, SubjectOf(record)));
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

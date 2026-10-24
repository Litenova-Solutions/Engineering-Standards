using System.Text.Json;

namespace LiteSpec.Model;

/// <summary>
///     The S-tier checks that read code: a write outside the declared aggregates, a refusal
///     code the code produces that no result declares, and an edge the code takes that no
///     record declares.
/// </summary>
static partial class Checker
{
    /// <summary>Runs the code-reading checks.</summary>
    private static void CheckCode(ProjectModel model, List<Finding> findings) =>
        CodeChecks.Run(model, findings);
}

/// <summary>
///     The code-reading checks, kept in one class so the partial checker holds only the entry point.
/// </summary>
static class CodeChecks
{
    /// <summary>Runs write-undeclared, result-undeclared and effect-undeclared.</summary>
    public static void Run(ProjectModel model, List<Finding> findings)
    {
        CheckWriteUndeclared(model, findings);
        CheckResultUndeclared(model, findings);
        CheckEffectUndeclared(model, findings);
    }

    /// <summary>
    ///     One S-tier finding. The tier comes from the finding code through Finding.Tiers,
    ///     which maps these three codes to S, so this helper builds the finding as written.
    /// </summary>
    private static Finding CodeFinding(string code, string message, string path, int line, string? subject) =>
        new(code, message, path, line, subject);

    private static void CheckWriteUndeclared(ProjectModel model, List<Finding> findings)
    {
        foreach (var handler in model.Code.Handlers)
        {
            if (handler.Repositories is not { Count: > 0 }
                || !model.ById.TryGetValue(handler.UseCaseId, out var useCase)
                || useCase.Type != "use-case")
            {
                continue;
            }

            var declared = new HashSet<string>(useCase.Ids("changes"), StringComparer.Ordinal);
            declared.UnionWith(useCase.Ids("reads"));

            foreach (var repository in handler.Repositories)
            {
                if (!RepositoryDeclared(model, repository.Interface, declared))
                {
                    findings.Add(CodeFinding(
                        "write-undeclared",
                        $"Handler for '{handler.UseCaseId}' takes repository '{repository.Interface}', whose aggregate is outside its changes and reads.",
                        repository.File,
                        repository.Line,
                        handler.UseCaseId));
                }
            }
        }

        foreach (var reaction in model.Code.Reactions)
        {
            if (reaction.Repositories is not { Count: > 0 }
                || reaction.RecordId is null
                || !model.ById.TryGetValue(reaction.RecordId, out var record)
                || record.Type is not ("reaction" or "job"))
            {
                continue;
            }

            var declared = new HashSet<string>(record.Ids("reads"), StringComparer.Ordinal);
            var kind = record.Type == "job" ? "Job" : "Reaction";

            foreach (var repository in reaction.Repositories)
            {
                if (!RepositoryDeclared(model, repository.Interface, declared))
                {
                    findings.Add(CodeFinding(
                        "write-undeclared",
                        $"{kind} '{record.Id}' takes repository '{repository.Interface}', whose aggregate is outside its reads.",
                        repository.File,
                        repository.Line,
                        record.Id));
                }
            }
        }
    }

    /// <summary>Whether the repository interface serves an aggregate the declared ids hold.</summary>
    private static bool RepositoryDeclared(ProjectModel model, string face, HashSet<string> declared)
    {
        if (RepositoryAggregate(face) is not { } stem)
        {
            return true;
        }

        foreach (var record in model.Records)
        {
            if (record.Type != "aggregate")
            {
                continue;
            }

            if (Identifiers.TrySplit(record.Id, out _, out _, out var name)
                && name == stem
                && declared.Contains(record.Id))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>The aggregate name a repository interface serves, in kebab-case, or null when it names none.</summary>
    private static string? RepositoryAggregate(string face)
    {
        var type = face;
        var generic = type.IndexOf('<');

        // A generic repository serves its first type argument.
        if (generic >= 0)
        {
            var args = type[(generic + 1)..].TrimEnd('>');
            type = args.Split(',')[0].Trim();

            var dot = type.LastIndexOf('.');

            if (dot >= 0)
            {
                type = type[(dot + 1)..];
            }

            return type.Length > 0 ? Naming.Kebab(type) : null;
        }

        if (type.StartsWith("I", StringComparison.Ordinal) && type.Length > 1 && char.IsUpper(type[1]))
        {
            type = type[1..];
        }

        if (!type.EndsWith("Repository", StringComparison.Ordinal) || type.Length <= "Repository".Length)
        {
            return null;
        }

        return Naming.Kebab(type[..^"Repository".Length]);
    }

    private static void CheckResultUndeclared(ProjectModel model, List<Finding> findings)
    {
        var refusals = GenericRefusals(model);
        var declaring = DeclaringCodes(model);

        foreach (var handler in model.Code.Handlers)
        {
            if (!model.ById.TryGetValue(handler.UseCaseId, out var useCase) || useCase.Type != "use-case")
            {
                continue;
            }

            var declared = DeclaredCodes(model, useCase, refusals);

            foreach (var (code, file, line) in ProducedCodes(handler.Refusals, handler.Thrown, declaring))
            {
                if (!declared.Contains(code))
                {
                    findings.Add(CodeFinding(
                        "result-undeclared",
                        $"Handler for '{handler.UseCaseId}' produces '{code}', which no result of the use case declares.",
                        file,
                        line,
                        handler.UseCaseId));
                }
            }
        }

        foreach (var reaction in model.Code.Reactions)
        {
            if (reaction.RecordId is null
                || !model.ById.TryGetValue(reaction.RecordId, out var record)
                || record.Type is not ("reaction" or "job"))
            {
                continue;
            }

            var issued = IssuedUseCases(model, record);

            if (issued.Count == 0)
            {
                continue;
            }

            var declared = new HashSet<string>(StringComparer.Ordinal);

            foreach (var useCase in issued)
            {
                declared.UnionWith(DeclaredCodes(model, useCase, refusals));
            }

            var holder = record.Type == "job" ? "its issued use cases" : "the issued use case";

            foreach (var (code, file, line) in ProducedCodes(reaction.Refusals, reaction.Thrown, declaring))
            {
                if (!declared.Contains(code))
                {
                    findings.Add(CodeFinding(
                        "result-undeclared",
                        $"{(record.Type == "job" ? "Job" : "Reaction")} '{record.Id}' produces '{code}', which {holder} declare none of.",
                        file,
                        line,
                        record.Id));
                }
            }
        }
    }

    /// <summary>
    ///     Every refusal code a use case declares: its written refusal results plus the derived
    ///     generic codes, which a permission grant and a validated input each derive.
    /// </summary>
    private static HashSet<string> DeclaredCodes(
        ProjectModel model, Record useCase, (string Forbidden, string InvalidInput) refusals)
    {
        var declared = new HashSet<string>(StringComparer.Ordinal);

        if (Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
        {
            foreach (var result in model.Records)
            {
                if (result.Type != "result" || result.Derived || result.Field("outcome") != "refusal")
                {
                    continue;
                }

                if (result.Field("code") is { } code
                    && Identifiers.TrySplit(result.Id, out _, out var home, out _)
                    && home == name)
                {
                    declared.Add(code);
                }
            }
        }

        if (ModelBuilder.GrantedPermission(useCase) is not null)
        {
            declared.Add(refusals.Forbidden);
        }

        if (ModelBuilder.HasValidatedInput(useCase))
        {
            declared.Add(refusals.InvalidInput);
        }

        return declared;
    }

    /// <summary>The generic refusal codes from litespec.project.json refusals, or the defaults.</summary>
    private static (string Forbidden, string InvalidInput) GenericRefusals(ProjectModel model)
    {
        const string forbidden = "authorization.forbidden";
        const string invalidInput = "request.validation-failed";

        try
        {
            var file = Path.Combine(model.Config.Root, "litespec.project.json");

            if (!File.Exists(file))
            {
                return (forbidden, invalidInput);
            }

            using var document = JsonDocument.Parse(File.ReadAllBytes(file));

            if (!document.RootElement.TryGetProperty("refusals", out var refusals)
                || refusals.ValueKind != JsonValueKind.Object)
            {
                return (forbidden, invalidInput);
            }

            return (
                refusals.TryGetProperty("forbidden", out var denied)
                    && denied.ValueKind == JsonValueKind.String
                    && denied.GetString() is { Length: > 0 } customForbidden
                        ? customForbidden
                        : forbidden,
                refusals.TryGetProperty("invalidInput", out var invalid)
                    && invalid.ValueKind == JsonValueKind.String
                    && invalid.GetString() is { Length: > 0 } customInvalid
                        ? customInvalid
                        : invalidInput);
        }
        catch (Exception exception) when (exception is IOException or JsonException or UnauthorizedAccessException)
        {
            return (forbidden, invalidInput);
        }
    }

    /// <summary>Refusal codes by the class whose declaring literal carries them.</summary>
    private static Dictionary<string, HashSet<string>> DeclaringCodes(ProjectModel model)
    {
        var declaring = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);

        foreach (var literal in model.Code.Literals)
        {
            if (!literal.Declares || literal.Class is null)
            {
                continue;
            }

            if (!declaring.TryGetValue(literal.Class, out var codes))
            {
                codes = new HashSet<string>(StringComparer.Ordinal);
                declaring[literal.Class] = codes;
            }

            codes.Add(literal.Value);
        }

        return declaring;
    }

    /// <summary>
    ///     Every refusal code a class produces: its declaring literals plus the codes of the
    ///     exception and failure types it constructs, earliest site first.
    /// </summary>
    private static List<(string Code, string File, int Line)> ProducedCodes(
        IReadOnlyList<CodeRefusal>? refusals,
        IReadOnlyList<CodeThrown>? thrown,
        Dictionary<string, HashSet<string>> declaring)
    {
        var produced = new Dictionary<string, (string File, int Line)>(StringComparer.Ordinal);

        if (refusals is not null)
        {
            foreach (var refusal in refusals)
            {
                produced.TryAdd(refusal.Code, (refusal.File, refusal.Line));
            }
        }

        if (thrown is not null)
        {
            foreach (var construction in thrown)
            {
                if (!declaring.TryGetValue(construction.Type, out var codes))
                {
                    continue;
                }

                foreach (var code in codes.Order(StringComparer.Ordinal))
                {
                    produced.TryAdd(code, (construction.File, construction.Line));
                }
            }
        }

        return [.. produced
            .OrderBy(entry => entry.Value.Line)
            .ThenBy(entry => entry.Key, StringComparer.Ordinal)
            .Select(entry => (entry.Key, entry.Value.File, entry.Value.Line))];
    }

    /// <summary>The use cases a reaction or job issues.</summary>
    private static List<Record> IssuedUseCases(ProjectModel model, Record record)
    {
        var found = new List<Record>();

        foreach (var id in record.Ids("issues"))
        {
            if (model.ById.TryGetValue(id, out var useCase) && useCase.Type == "use-case")
            {
                found.Add(useCase);
            }
        }

        return found;
    }

    private static void CheckEffectUndeclared(ProjectModel model, List<Finding> findings)
    {
        foreach (var handler in model.Code.Handlers)
        {
            if (handler.Dispatches is not { Count: > 0 }
                || !model.ById.TryGetValue(handler.UseCaseId, out var useCase)
                || useCase.Type != "use-case")
            {
                continue;
            }

            var edges = UseCaseEdges(useCase);

            foreach (var dispatch in handler.Dispatches)
            {
                if (!EdgeDeclared(model, edges, dispatch))
                {
                    findings.Add(CodeFinding(
                        "effect-undeclared",
                        $"Handler for '{handler.UseCaseId}' {dispatch.Verb} '{DispatchTarget(dispatch)}'{ViaText(dispatch)}, which no effects entry of the use case declares.",
                        dispatch.File,
                        dispatch.Line,
                        handler.UseCaseId));
                }
            }
        }

        foreach (var reaction in model.Code.Reactions)
        {
            if (reaction.Dispatches is not { Count: > 0 }
                || reaction.RecordId is null
                || !model.ById.TryGetValue(reaction.RecordId, out var record)
                || record.Type is not ("reaction" or "job"))
            {
                continue;
            }

            var edges = HolderEdges(record);
            var kind = record.Type == "job" ? "Job" : "Reaction";

            foreach (var dispatch in reaction.Dispatches)
            {
                if (!EdgeDeclared(model, edges, dispatch))
                {
                    findings.Add(CodeFinding(
                        "effect-undeclared",
                        $"{kind} '{record.Id}' {dispatch.Verb} '{DispatchTarget(dispatch)}'{ViaText(dispatch)}, which no declared edge of the {record.Type} names.",
                        dispatch.File,
                        dispatch.Line,
                        record.Id));
                }
            }
        }
    }

    /// <summary>One dispatch's target as the message reads it: the port and method for calls, else the message.</summary>
    private static string DispatchTarget(CodeDispatch dispatch) =>
        dispatch.Verb == "calls" ? $"{dispatch.Detail}.{dispatch.Target}" : dispatch.Target;

    /// <summary>The helper a one-hop attribution found the dispatch through, or nothing when direct.</summary>
    private static string ViaText(CodeDispatch dispatch) =>
        dispatch.Via is { Length: > 0 } via ? $" via '{via}'" : "";

    /// <summary>Every edge a use case declares in its effects entries.</summary>
    private static List<(string Verb, string Target)> UseCaseEdges(Record useCase)
    {
        var edges = new List<(string Verb, string Target)>();

        if (useCase.Raw.ValueKind != JsonValueKind.Object
            || !useCase.Raw.TryGetProperty("effects", out var effects)
            || effects.ValueKind != JsonValueKind.Array)
        {
            return edges;
        }

        foreach (var entry in effects.EnumerateArray())
        {
            if (entry.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            foreach (var verb in new[] { "issues", "sends", "publishes", "calls" })
            {
                if (entry.TryGetProperty(verb, out var target)
                    && target.ValueKind == JsonValueKind.String
                    && target.GetString() is { Length: > 0 } id)
                {
                    edges.Add((verb, id));
                }
            }
        }

        return edges;
    }

    /// <summary>Every edge a reaction or job declares: its issues, and a reaction's sends.</summary>
    private static List<(string Verb, string Target)> HolderEdges(Record record)
    {
        var edges = new List<(string Verb, string Target)>();

        foreach (var id in record.Ids("issues"))
        {
            edges.Add(("issues", id));
        }

        if (record.Type == "reaction")
        {
            foreach (var id in record.Ids("sends"))
            {
                edges.Add(("sends", id));
            }
        }

        return edges;
    }

    /// <summary>Whether a declared edge of the same verb names the dispatch's target.</summary>
    private static bool EdgeDeclared(ProjectModel model, List<(string Verb, string Target)> edges, CodeDispatch dispatch) =>
        dispatch.Verb switch
        {
            "issues" => ResolveMessageUseCases(model, dispatch.Target)
                .Any(id => edges.Any(edge => edge.Verb == "issues" && edge.Target == id)),
            "publishes" => edges.Any(edge => edge.Verb == "publishes" && MessageMatches(dispatch.Target, edge.Target)),
            "sends" => edges.Any(edge => edge.Verb == "sends" && NotificationMatches(model, dispatch, edge.Target)),
            "calls" => edges.Any(edge => edge.Verb == "calls" && OperationMatches(dispatch.Target, edge.Target)),
            _ => true,
        };

    /// <summary>The use cases a dispatched message names, by its operation stem, in identifier order.</summary>
    private static List<string> ResolveMessageUseCases(ProjectModel model, string message)
    {
        var stems = new HashSet<string>(StringComparer.Ordinal) { Naming.Kebab(message) };

        foreach (var suffix in new[] { "Command", "Query" })
        {
            if (message.EndsWith(suffix, StringComparison.Ordinal) && message.Length > suffix.Length)
            {
                stems.Add(Naming.Kebab(message[..^suffix.Length]));
            }
        }

        var found = new List<string>();

        foreach (var record in model.Records)
        {
            if (record.Type != "use-case")
            {
                continue;
            }

            if (Identifiers.TrySplit(record.Id, out _, out _, out var operation) && stems.Contains(operation))
            {
                found.Add(record.Id);
            }
        }

        found.Sort(StringComparer.Ordinal);

        return found;
    }

    /// <summary>
    ///     Whether a dispatched message names a declared event edge: the message stem meets the
    ///     identifier after its slash, or its last segment, with dots reading as dashes.
    /// </summary>
    private static bool MessageMatches(string message, string id)
    {
        var stem = message;

        foreach (var suffix in new[] { "IntegrationEvent", "Notification", "Event", "Message" })
        {
            if (stem.EndsWith(suffix, StringComparison.Ordinal) && stem.Length > suffix.Length)
            {
                stem = stem[..^suffix.Length];
                break;
            }
        }

        var kebab = Naming.Kebab(stem);
        var rest = id.Contains('/') ? id[(id.IndexOf('/') + 1)..] : id;
        var normalized = rest.Replace('.', '-');
        var last = rest.Contains('.') ? rest[(rest.LastIndexOf('.') + 1)..] : rest;

        return kebab == normalized || kebab == last;
    }

    /// <summary>
    ///     Whether a dispatched send names a declared notification: a template key meets the
    ///     notification's template, and a message type meets its identifier.
    /// </summary>
    private static bool NotificationMatches(ProjectModel model, CodeDispatch dispatch, string id)
    {
        if (dispatch.Detail == "template")
        {
            return model.ById.TryGetValue(id, out var notification)
                && notification.Type == "notification"
                && notification.Field("template") == dispatch.Target;
        }

        return MessageMatches(dispatch.Target, id);
    }

    /// <summary>Whether a port call names a declared operation: the method, without Async, meets the fragment.</summary>
    private static bool OperationMatches(string method, string id)
    {
        var hash = id.IndexOf('#');

        if (hash < 0 || hash == id.Length - 1)
        {
            return false;
        }

        var operation = id[(hash + 1)..];
        var name = method;

        if (name.EndsWith("Async", StringComparison.Ordinal) && name.Length > "Async".Length)
        {
            name = name[..^"Async".Length];
        }

        return Naming.Kebab(name) == operation;
    }
}

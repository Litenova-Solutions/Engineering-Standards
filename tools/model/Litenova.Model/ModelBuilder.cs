using System.Text.Json;

namespace Litenova.Model;

/// <summary>
///     Builds the project model: reads records, code, screens, tests and the test
///     run, then computes the implements, calls and proves links and the status.
/// </summary>
static class ModelBuilder
{
    /// <summary>Builds the model for the consumer.</summary>
    public static ProjectModel Build(ConsumerConfig config)
    {
        var total = System.Diagnostics.Stopwatch.StartNew();
        var model = new ProjectModel { Config = config };

        var read = Timed("records", () => RecordReader.Read(config));

        model.Problems.AddRange(read.Problems);
        model.Records.AddRange(read.Records);
        model.Bodies.AddRange(read.Bodies);
        model.Provisions = read.Provisions;
        model.Code = Timed("code", () => CodeReader.Read(config));

        var screens = Timed("screens", () => ScreenReader.Read(config, model.Code));

        model.Screens.AddRange(screens.Screens);
        model.ScreenComments.AddRange(screens.Comments);

        var tests = Timed("tests", () => TestReader.Read(config));

        model.Tests.AddRange(tests.Scenarios);
        model.StepCalls = tests.StepCalls;
        model.TestComments.AddRange(tests.Comments);
        model.TestRun = Timed("testrun", () => TestRunReader.Read(config));

        Timed("compute", () =>
        {
            MatchEvents(model);
            ComputeImplements(model);
            ComputeCalls(model);
            ComputeExceptionCodes(model);
            ComputeProves(model);
            ComputeStatus(model);
        });

        Console.Error.WriteLine($"[time] build total {total.Elapsed.TotalSeconds:0.0}s");

        return model;
    }

    private static T Timed<T>(string name, Func<T> run)
    {
        var watch = System.Diagnostics.Stopwatch.StartNew();
        var value = run();

        Console.Error.WriteLine($"[time] {name} {watch.Elapsed.TotalSeconds:0.0}s");

        return value;
    }

    private static void Timed(string name, Action run) =>
        Timed(name, () => { run(); return 0; });

    /// <summary>The record's links with their targets, for model.json.</summary>
    public static Dictionary<string, List<string>> ResolvedLinks(ProjectModel model, Record record)
    {
        var links = new Dictionary<string, List<string>>(StringComparer.Ordinal);

        if (record.Raw.ValueKind != JsonValueKind.Object)
        {
            return links;
        }

        foreach (var property in record.Raw.EnumerateObject())
        {
            if (RecordTypes.LinkTargets.TryGetValue(property.Name, out _)
                || RecordTypes.NestedLinkFields.Contains(property.Name)
                || property.Name is "replaces" or "refusal" or "standard")
            {
                var targets = TargetsOf(property.Value);

                if (targets.Count > 0)
                {
                    links[property.Name] = targets;
                }
            }
        }

        return links;
    }

    /// <summary>Every id a link field names, reading through nested objects.</summary>
    public static List<string> TargetsOf(JsonElement value)
    {
        var targets = new List<string>();

        switch (value.ValueKind)
        {
            case JsonValueKind.String:
                if (value.GetString() is { } single)
                {
                    targets.Add(single);
                }

                break;

            case JsonValueKind.Array:
                foreach (var entry in value.EnumerateArray())
                {
                    targets.AddRange(TargetsOf(entry));
                }

                break;

            case JsonValueKind.Object:
                foreach (var name in new[] { "role", "useCase", "requires" })
                {
                    if (value.TryGetProperty(name, out var nested))
                    {
                        targets.AddRange(TargetsOf(nested));
                    }
                }

                break;
        }

        return targets;
    }

    private static void MatchEvents(ProjectModel model)
    {
        var events = model.Records.Where(record => record.Type == "event").ToList();

        for (var index = 0; index < model.Code.Events.Count; index++)
        {
            var code = model.Code.Events[index];
            var kebab = Naming.Kebab(code.Class.EndsWith("Event", StringComparison.Ordinal)
                ? code.Class[..^"Event".Length]
                : code.Class);

            var match = events.FirstOrDefault(record =>
                Identifiers.TrySplit(record.Id, out _, out _, out var name)
                && name == kebab);

            if (match is not null)
            {
                model.Code.Events[index] = code with { EventId = match.Id };
                model.Implements.Add(new ImplementsLink(
                    model.Config.Relative(code.File), match.Id, "event"));
            }
        }
    }

    private static void ComputeImplements(ProjectModel model)
    {
        foreach (var handler in model.Code.Handlers)
        {
            model.Implements.Add(new ImplementsLink(
                model.Config.Relative(handler.File), handler.UseCaseId, "handler"));
        }

        foreach (var reaction in model.Code.Reactions)
        {
            if (reaction.UseCaseId is not null)
            {
                model.Implements.Add(new ImplementsLink(
                    model.Config.Relative(reaction.File), reaction.UseCaseId, reaction.Kind));
            }
        }

        var codes = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var literal in model.Code.Literals)
        {
            codes.TryAdd(literal.Value, model.Config.Relative(literal.File));
        }

        foreach (var result in model.Records.Where(record => record.Type == "result"))
        {
            if (result.Field("code") is { } code && codes.TryGetValue(code, out var path))
            {
                model.Implements.Add(new ImplementsLink(path, result.Id, "result"));
            }
        }
    }

    private static void ComputeCalls(ProjectModel model)
    {
        foreach (var screen in model.Screens)
        {
            foreach (var useCase in screen.UseCases)
            {
                var operation = screen.Operations.FirstOrDefault()?.Name ?? "";

                model.Calls.Add(new CallsLink(
                    $"{screen.Frontend} {screen.Route}", useCase, operation));
            }
        }
    }

    /// <summary>Whether the use case lets anonymous callers in.</summary>
    public static bool Anonymous(Record useCase) =>
        useCase.Raw.ValueKind == JsonValueKind.Object
        && useCase.Raw.TryGetProperty("anonymous", out var value)
        && value.ValueKind == JsonValueKind.True;

    /// <summary>Whether the use case runs only through reactions or jobs.</summary>
    public static bool BackgroundOnly(ProjectModel model, Record useCase)
    {
        var entries = useCase.Ids("reachedThrough");

        return entries.Count > 0
            && entries.All(entry =>
                model.ById.TryGetValue(entry, out var point)
                && point.Type == "entry-point"
                && RecordTypes.BackgroundEntryKinds.Contains(point.Field("kind") ?? ""));
    }

    /// <summary>The business record whose folder holds the use case's page.</summary>
    public static Record? BusinessRecordOf(ProjectModel model, Record useCase)
    {
        if (useCase.Type != "use-case")
        {
            return null;
        }

        var folder = Path.GetDirectoryName(useCase.File);

        return model.Records
            .Where(record => record.Type == "business-record"
                && string.Equals(Path.GetDirectoryName(record.File), folder, StringComparison.Ordinal))
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .FirstOrDefault();
    }

    /// <summary>The use case a result or case home names, when one holds it.</summary>
    public static Record? UseCaseOf(ProjectModel model, string home) =>
        model.ById.Values.FirstOrDefault(record =>
            record.Type == "use-case"
            && Identifiers.TrySplit(record.Id, out _, out _, out var name)
            && name == home);

    private static void ComputeExceptionCodes(ProjectModel model)
    {
        foreach (var literal in model.Code.Literals)
        {
            if (literal.Class is null)
            {
                continue;
            }

            if (!model.ExceptionCodes.TryGetValue(literal.Class, out var codes))
            {
                codes = new HashSet<string>(StringComparer.Ordinal);
                model.ExceptionCodes[literal.Class] = codes;
            }

            codes.Add(literal.Value);
        }
    }

    private static void ComputeProves(ProjectModel model)
    {
        foreach (var test in model.Tests)
        {
            var passing = model.TestRun is not null
                && model.TestRun.OutcomeByMethod.TryGetValue(test.Name, out var outcome)
                    ? outcome == "Passed"
                    : (bool?)null;

            foreach (var claim in test.Claims)
            {
                model.Proves.Add(new ProvesLink(
                    test.Name, claim, Confirm(model, test, claim), passing, Indirect(model, claim)));
            }
        }
    }

    private static bool Indirect(ProjectModel model, string claim)
    {
        if (!model.ById.TryGetValue(claim, out var claimed) || claimed.Type != "case")
        {
            return false;
        }

        return Identifiers.TrySplit(claim, out _, out var home, out _)
            && home is not null
            && UseCaseOf(model, home) is { } useCase
            && BackgroundOnly(model, useCase);
    }

    /// <summary>
    ///     Confirms a proves claim. A scenario proves a case through a when step of
    ///     the use case's steps class, asserting the result's code or status for a
    ///     refusal; a reaction or job case through a then step; an integration test
    ///     by naming the message type; and a rule test by naming the governed
    ///     record's code type.
    /// </summary>
    public static bool Confirm(ProjectModel model, ScenarioInfo test, string claim)
    {
        if (!model.ById.TryGetValue(claim, out var claimed))
        {
            return false;
        }

        if (claimed.Type == "rule")
        {
            return ConfirmRule(model, test, claimed);
        }

        if (claimed.Type != "case")
        {
            return false;
        }

        if (!Identifiers.TrySplit(claim, out _, out var home, out _)
            || home is null
            || UseCaseOf(model, home) is not { } useCase)
        {
            return false;
        }

        var refusal = RefusalOf(model, claimed);

        if (test.Steps.Count > 0)
        {
            if (BackgroundOnly(model, useCase))
            {
                return test.Steps.Any(step => step.Phase == "then");
            }

            if (!Belongs(test, home) && !Calls(model, test, home))
            {
                return false;
            }

            return refusal is null || Asserts(test, refusal);
        }

        var pascal = Naming.Pascal(home);

        if (!test.Identifiers.Contains(pascal + "Command", StringComparer.Ordinal)
            && !test.Identifiers.Contains(pascal + "Query", StringComparer.Ordinal))
        {
            return false;
        }

        if (refusal is null)
        {
            return true;
        }

        if (refusal.Field("code") is not { } code)
        {
            return false;
        }

        return test.Codes.Contains(code)
            || model.ExceptionCodes.Any(entry =>
                entry.Value.Contains(code) && test.Identifiers.Contains(entry.Key));
    }

    private static bool ConfirmRule(ProjectModel model, ScenarioInfo test, Record rule)
    {
        var codeNames = new HashSet<string>(StringComparer.Ordinal);

        foreach (var target in rule.Ids("governs"))
        {
            if (!model.ById.TryGetValue(target, out var governed))
            {
                continue;
            }

            if (governed.Type == "business-record")
            {
                if (governed.Field("codeName") is { } direct)
                {
                    codeNames.Add(direct);
                }
            }
            else if (governed.Type == "use-case"
                && BusinessRecordOf(model, governed) is { } holder
                && holder.Field("codeName") is { } held)
            {
                codeNames.Add(held);
            }
        }

        return codeNames.Count > 0
            && test.Identifiers.Any(identifier =>
                codeNames.Any(codeName =>
                    identifier.Equals(codeName, StringComparison.Ordinal)
                    || identifier.StartsWith(codeName, StringComparison.Ordinal)));
    }

    private static Record? RefusalOf(ProjectModel model, Record kase)
    {
        var resultId = kase.Ids("result").FirstOrDefault();

        return resultId is not null
            && model.ById.TryGetValue(resultId, out var result)
            && result.Field("outcome") == "refusal"
                ? result
                : null;
    }

    private static bool Calls(ProjectModel model, ScenarioInfo test, string home)
    {
        var operation = Naming.Pascal(home);

        return test.Steps.Any(step =>
            step.Phase == "when"
            && step.ReceiverType is { } type
            && model.StepCalls.TryGetValue($"{type}.{step.Method}", out var called)
            && called.Contains(operation));
    }

    private static bool Belongs(ScenarioInfo test, string home)
    {
        var stepsClass = Naming.Pascal(home) + "Steps";

        return test.Steps.Any(step =>
            step.Phase == "when"
            && (string.Equals(step.ReceiverType, stepsClass, StringComparison.Ordinal)
                || string.Equals(step.Receiver, stepsClass[..^"Steps".Length], StringComparison.OrdinalIgnoreCase)));
    }

    private static bool Asserts(ScenarioInfo test, Record refusal)
    {
        if (refusal.Field("code") is { } code && test.Codes.Contains(code))
        {
            return true;
        }

        return ResultStatus(refusal) is { } status && test.Statuses.Contains(status);
    }

    private static int? ResultStatus(Record refusal)
    {
        if (refusal.Raw.ValueKind != JsonValueKind.Object
            || !refusal.Raw.TryGetProperty("status", out var value))
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var number))
        {
            return number;
        }

        return value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), out var text)
            ? text
            : null;
    }

    private static void ComputeStatus(ProjectModel model)
    {
        var implemented = new HashSet<string>(StringComparer.Ordinal);

        foreach (var link in model.Implements)
        {
            if (link.Kind is "handler" or "reaction" or "job")
            {
                implemented.Add(link.To);
            }
        }

        var cases = model.Records.Where(record => record.Type == "case").ToList();

        foreach (var useCase in model.Records.Where(record => record.Type == "use-case"))
        {
            if (!Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
            {
                continue;
            }

            var own = cases.Where(kase =>
                Identifiers.TrySplit(kase.Id, out _, out var home, out _) && home == name).ToList();

            var verified = own.Count > 0;

            foreach (var kase in own)
            {
                var links = model.Proves.Where(link => link.Case == kase.Id).ToList();

                if (links.Count == 0 || links.Any(link => !link.Confirmed || link.Passing != true))
                {
                    verified = false;
                    break;
                }
            }

            model.Status[useCase.Id] = new UseCaseStatus(
                implemented.Contains(useCase.Id), verified);
        }
    }
}

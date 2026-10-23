using System.Text.Json;
using System.Text.RegularExpressions;
using LiteSpec.Model.Readers;
using LiteSpec.Model.Readers.Coverage;
using LiteSpec.Model.Readers.Measures;

namespace LiteSpec.Model;

/// <summary>
///     Builds the project model: reads records, code, screens, tests, the test run,
///     scenario coverage and measured-check results, then computes the implements,
///     calls and proves links and the status.
/// </summary>
static partial class ModelBuilder
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
        var stacks = StackReaders.For(config);
        model.Code = Timed("code", () => stacks.Backend.Read(config));

        var screens = Timed("screens", () => ReadScreens(config, stacks, model.Code));

        model.Screens.AddRange(screens.Screens);
        model.ScreenComments.AddRange(screens.Comments);

        var tests = Timed("tests", () => stacks.Scenarios.Read(config));

        model.Tests.AddRange(tests.Scenarios);
        model.StepCalls = tests.StepCalls;
        model.TestComments.AddRange(tests.Comments);
        model.TestRun = Timed("testrun", () => stacks.TestRuns.Read(config));

        var coverage = Timed("coverage", () => CoverageReader.Read(config));

        model.UnreachedCode.AddRange(coverage.Gaps);
        model.CoverageRead = coverage.Read;
        model.Measures.AddRange(Timed("measures", () => MeasureReader.Read(config)));

        Timed("compute", () =>
        {
            MatchEvents(model);
            ComputeImplements(model);
            ComputeCalls(model);
            ComputeRefusalCodes(model);
            ComputeProves(model);
            ComputeStatus(model);
            ComputeAuthority(model);
        });

        Timing.Report($"[time] build total {total.Elapsed.TotalSeconds:0.0}s");

        return model;
    }

    private static T Timed<T>(string name, Func<T> run)
    {
        var watch = System.Diagnostics.Stopwatch.StartNew();
        var value = run();

        Timing.Report($"[time] {name} {watch.Elapsed.TotalSeconds:0.0}s");

        return value;
    }

    private static void Timed(string name, Action run) =>
        Timed(name, () => { run(); return 0; });

    /// <summary>
    ///     Reads every frontend's routes through its own reader. Screens keep the
    ///     frontends' order; comments are ordered by file and line across frontends.
    /// </summary>
    private static ScreenRead ReadScreens(ConsumerConfig config, StackSet stacks, CodeModel code)
    {
        var screens = new List<ScreenInfo>();
        var comments = new List<CodeComment>();

        foreach (var frontend in stacks.Frontends)
        {
            var read = frontend.Read(config, code);

            screens.AddRange(read.Screens);
            comments.AddRange(read.Comments);
        }

        return new ScreenRead(
            screens,
            [.. comments
                .OrderBy(comment => comment.File, StringComparer.Ordinal)
                .ThenBy(comment => comment.Line)]);
    }

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
                || property.Name is "replaces" or "refusal" or "provision")
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
                foreach (var name in new[] { "role", "useCase", "requires", "events" })
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

            var owner = OwnerOfEventFile(model, code.File);
            var match = events.FirstOrDefault(record =>
                    Identifiers.TrySplit(record.Id, out _, out var home, out var name)
                    && name == kebab
                    && owner is not null
                    && home == owner)
                ?? events.FirstOrDefault(record =>
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

    /// <summary>
    ///     Computes each record's effective status: draft when the record is a draft, when a draft
    ///     decision decides it, or when a requirement it fulfills is effectively a draft. A result or
    ///     a scenario takes its use case's effective status.
    /// </summary>
    private static void ComputeAuthority(ProjectModel model)
    {
        var draftDecided = model.Records
            .Where(record => record.Type == "decision" && record.Status == "draft")
            .SelectMany(decision => decision.Ids("decides"))
            .ToHashSet(StringComparer.Ordinal);

        string Own(Record record) =>
            record.Status == "draft" || draftDecided.Contains(record.Id) ? "draft" : record.Status ?? "approved";

        foreach (var record in model.Records.Where(record => record.Type is "requirement" or "feature" or "constraint" or "product" or "decision"))
        {
            model.EffectiveStatus[record.Id] = Own(record);
        }

        foreach (var record in model.Records.Where(record => record.Type is "rule" or "use-case" or "journey"))
        {
            var own = Own(record);
            var inherited = record.Ids("fulfills").Any(id =>
                model.EffectiveStatus.TryGetValue(id, out var status) && status == "draft");

            model.EffectiveStatus[record.Id] = own == "approved" && inherited ? "draft" : own;
        }

        foreach (var record in model.Records.Where(record => record.Type is "result" or "scenario"))
        {
            var own = Own(record);
            var useCase = Identifiers.TrySplit(record.Id, out _, out var home, out _) && home is not null
                ? UseCaseOf(model, home)
                : null;
            var inherited = useCase is not null
                && model.EffectiveStatus.TryGetValue(useCase.Id, out var status)
                && status == "draft";

            model.EffectiveStatus[record.Id] = own == "approved" && inherited ? "draft" : own;
        }
    }

    /// <summary>
    ///     The name of the aggregate whose page folder mirrors the code folder holding
    ///     the event: <c>Domain/&lt;Module&gt;/&lt;Plural&gt;/Events/</c> beside <c>modules/&lt;module&gt;/&lt;plural&gt;/</c>.
    /// </summary>
    private static string? OwnerOfEventFile(ProjectModel model, string file)
    {
        var parts = file.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var events = Array.LastIndexOf(parts, "Events");

        if (events < 2)
        {
            return null;
        }

        var plural = Naming.Kebab(parts[events - 1]);
        var module = Naming.Kebab(parts[events - 2]);

        var owner = model.Records.FirstOrDefault(record =>
            record.Type == "aggregate"
            && Path.GetFileName(Path.GetDirectoryName(record.File)) == plural
            && Path.GetFileName(Path.GetDirectoryName(Path.GetDirectoryName(record.File))) == module);

        return owner is not null && Identifiers.TrySplit(owner.Id, out _, out _, out var name) ? name : null;
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
            else if (TriggeredUseCase(model, reaction.Class) is { } target)
            {
                model.Implements.Add(new ImplementsLink(
                    model.Config.Relative(reaction.File), target, reaction.Kind));
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

        var byRoute = new HashSet<string>(StringComparer.Ordinal);
        var byOperation = new HashSet<string>(StringComparer.Ordinal);

        foreach (var endpoint in model.Code.Endpoints)
        {
            if (endpoint.Operation.Length > 0)
            {
                byOperation.Add(endpoint.Operation);
            }

            if (endpoint.Method.Length > 0 && endpoint.Route.Length > 0)
            {
                byRoute.Add($"{endpoint.Method} {Template(endpoint.Route)}");
            }
        }

        foreach (var screen in model.Screens)
        {
            foreach (var operation in screen.Operations)
            {
                if (!byRoute.Contains($"{operation.Method} {Template(operation.Path)}")
                    && !byOperation.Contains(Naming.Pascal(operation.Name)))
                {
                    model.UnmatchedCalls.Add(new UnmatchedCall(
                        $"{screen.Frontend} {screen.Route}", operation.Name, screen.File));
                }
            }
        }

        model.UnmatchedCalls.Sort((left, right) =>
        {
            var screen = string.Compare(left.Screen, right.Screen, StringComparison.Ordinal);

            return screen != 0
                ? screen
                : string.Compare(left.Operation, right.Operation, StringComparison.Ordinal);
        });
    }

    /// <summary>
    ///     The route template with parameter constraints removed, mirroring the frontend
    ///     reader's join so unmatched calls are exactly the operations it drops.
    /// </summary>
    private static string Template(string route) => TemplateConstraint().Replace(route, "{$1}");

    [GeneratedRegex(@"\{(?<name>[^}:]+):[^}]+\}")]
    private static partial Regex TemplateConstraint();

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

    /// <summary>The aggregate whose folder holds the use case's page.</summary>
    public static Record? AggregateOf(ProjectModel model, Record useCase)
    {
        if (useCase.Type != "use-case")
        {
            return null;
        }

        var folder = Path.GetDirectoryName(useCase.File);

        return model.Records
            .Where(record => record.Type == "aggregate"
                && string.Equals(Path.GetDirectoryName(record.File), folder, StringComparison.Ordinal))
            .OrderBy(record => record.Id, StringComparer.Ordinal)
            .FirstOrDefault();
    }

    /// <summary>The use case a result or scenario home names, when one holds it.</summary>
    public static Record? UseCaseOf(ProjectModel model, string home) =>
        model.ById.Values.FirstOrDefault(record =>
            record.Type == "use-case"
            && Identifiers.TrySplit(record.Id, out _, out _, out var name)
            && name == home);

    private static void ComputeRefusalCodes(ProjectModel model)
    {
        foreach (var literal in model.Code.Literals)
        {
            if (literal.Class is null)
            {
                continue;
            }

            if (!model.RefusalCodes.TryGetValue(literal.Class, out var codes))
            {
                codes = new HashSet<string>(StringComparer.Ordinal);
                model.RefusalCodes[literal.Class] = codes;
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
        if (!model.ById.TryGetValue(claim, out var claimed) || claimed.Type != "scenario")
        {
            return false;
        }

        return Identifiers.TrySplit(claim, out _, out var home, out _)
            && home is not null
            && UseCaseOf(model, home) is { } useCase
            && BackgroundOnly(model, useCase);
    }

    /// <summary>
    ///     Confirms a proves claim. A steps test proves through the public boundary: a
    ///     when step of the use case's steps class or generated-client operation plus a
    ///     then step, asserting the refusal code for a refusal. An integration test
    ///     proves by constructing the message it sends or requesting the use case's own
    ///     endpoint, plus an assertion. No test constructs a handler, an aggregate, or a
    ///     repository directly. A rule claim confirms only through a scenario the same
    ///     test proves.
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

        if (claimed.Type != "scenario")
        {
            return false;
        }

        if (!Identifiers.TrySplit(claim, out _, out var home, out _)
            || home is null
            || UseCaseOf(model, home) is not { } useCase)
        {
            return false;
        }

        if (ConstructsInside(test, model))
        {
            return false;
        }

        var refusal = RefusalOf(model, claimed);

        if (test.Steps.Count > 0)
        {
            if (BackgroundOnly(model, useCase))
            {
                // The trigger may arrive through an entry the model does not link to the reaction, such as a
                // processor webhook, so any when step sets it off; the assertion is what ties the proof to it.
                var setOff = Triggers(model, test, useCase) || test.Steps.Any(step => step.Phase == "when");
                var asserted = refusal is null ? AssertsEffect(model, test) : Asserts(test, refusal) || AssertsEffect(model, test);

                return setOff && asserted;
            }

            if (!Belongs(test, home) && !Calls(model, test, home))
            {
                return false;
            }

            if (!test.Steps.Any(step => step.Phase == "then"))
            {
                return false;
            }

            return refusal is null || Asserts(test, refusal);
        }

        var pascal = Naming.Pascal(home);

        // An integration test constructs the message it sends, or requests the use case's own endpoint.
        var sendsMessage = test.CreatedTypes.Contains(pascal + "Command", StringComparer.Ordinal)
            || test.CreatedTypes.Contains(pascal + "Query", StringComparer.Ordinal);
        var requestsEndpoint = model.Code.Endpoints
            .Where(endpoint => endpoint.UseCaseId == useCase.Id && endpoint.Route.Length > 0)
            .Any(endpoint => test.Routes.Any(route => RouteMatches(endpoint.Route, route)));

        if (!sendsMessage && !requestsEndpoint)
        {
            return false;
        }

        if (!test.HasAssertion)
        {
            return false;
        }

        if (refusal is null)
        {
            return true;
        }

        return Asserts(test, refusal);
    }

    /// <summary>
    ///     Whether the test reaches past the public boundary: it constructs a handler,
    ///     an aggregate, or a repository directly instead of driving the use case through
    ///     its steps, its message, or its endpoint.
    /// </summary>
    private static bool ConstructsInside(ScenarioInfo test, ProjectModel model)
    {
        if (test.CreatedTypes.Count == 0)
        {
            return false;
        }

        if (test.CreatedTypes.Any(type =>
            type.EndsWith("Handler", StringComparison.Ordinal)
            || type.EndsWith("Repository", StringComparison.Ordinal)))
        {
            return true;
        }

        return model.Records.Any(record =>
            record.Type == "aggregate"
            && Identifiers.TrySplit(record.Id, out _, out _, out var aggregate)
            && aggregate is not null
            && test.CreatedTypes.Contains(Naming.Pascal(aggregate), StringComparer.Ordinal));
    }

    /// <summary>
    ///     Whether a path a test requests is the endpoint's route: the same segments, where a route
    ///     parameter matches any segment and an interpolation hole matches only a parameter. A route mapped
    ///     inside a group may omit the group's prefix, so the path may carry leading segments the route lacks.
    /// </summary>
    private static bool RouteMatches(string template, string path)
    {
        static string[] Segments(string value) => value.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);

        var route = Segments(template);
        var requested = Segments(path);

        if (route.Length == 0 || requested.Length < route.Length)
        {
            return false;
        }

        var offset = requested.Length - route.Length;

        for (var index = 0; index < route.Length; index++)
        {
            var wanted = route[index];
            var given = requested[offset + index];
            var parameter = wanted.StartsWith('{') && wanted.EndsWith('}');

            if (parameter ? given.Length == 0 : !string.Equals(wanted, given, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
        }

        // A route of parameters alone says nothing about which endpoint was asked.
        return route.Any(segment => !segment.StartsWith('{'));
    }

    /// <summary>
    ///     Confirms a rule claim through the test's own scenarios: the test proves the
    ///     rule only when it also proves a scenario of a use case the rule governs.
    /// </summary>
    private static bool ConfirmRule(ProjectModel model, ScenarioInfo test, Record rule)
    {
        var governed = rule.Ids("governs");

        if (governed.Count == 0)
        {
            return false;
        }

        foreach (var claim in test.Claims)
        {
            if (!model.ById.TryGetValue(claim, out var claimed)
                || claimed.Type != "scenario"
                || !Identifiers.TrySplit(claim, out _, out var home, out _)
                || home is null
                || UseCaseOf(model, home) is not { } useCase
                || !Confirm(model, test, claim))
            {
                continue;
            }

            if (governed.Contains(useCase.Id, StringComparer.Ordinal))
            {
                return true;
            }

            if (AggregateOf(model, useCase) is { } holder
                && governed.Contains(holder.Id, StringComparer.Ordinal))
            {
                return true;
            }
        }

        return false;
    }

    private static Record? RefusalOf(ProjectModel model, Record scenario)
    {
        var resultId = scenario.Ids("result").FirstOrDefault();

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

    /// <summary>
    ///     Whether a when step sets a background use case off: it drives a use case that raises
    ///     an event the reaction reacts to, or it is a step of a declared job trigger.
    /// </summary>
    /// <summary>The events a use case's trigger names, in every trigger shape the schema allows.</summary>
    private static HashSet<string> TriggerEvents(ProjectModel model, Record useCase)
    {
        if (useCase.Raw.ValueKind != JsonValueKind.Object
            || !useCase.Raw.TryGetProperty("trigger", out var value))
        {
            return [];
        }

        return TargetsOf(value)
            .Where(id => model.ById.TryGetValue(id, out var target) && target.Type == "event")
            .ToHashSet(StringComparer.Ordinal);
    }

    /// <summary>
    ///     The use case a reaction or job without an implements tag answers: the one
    ///     use case it names when its class names an event its trigger holds, or else
    ///     the one use case its class names. Null when nothing or more than one matches.
    /// </summary>
    private static string? TriggeredUseCase(ProjectModel model, string className)
    {
        var stem = className;

        foreach (var suffix in new[] { "BackgroundService", "HostedService", "Reaction", "Worker", "Job" })
        {
            if (stem.EndsWith(suffix, StringComparison.Ordinal) && stem.Length > suffix.Length)
            {
                stem = stem[..^suffix.Length];
                break;
            }
        }

        if (stem.StartsWith("Recurring", StringComparison.Ordinal) && stem.Length > "Recurring".Length)
        {
            stem = stem["Recurring".Length..];
        }

        var kebab = Naming.Kebab(stem);

        if (kebab.Length == 0)
        {
            return null;
        }

        var handled = model.ById.Values.FirstOrDefault(record =>
            record.Type == "event"
            && Identifiers.TrySplit(record.Id, out _, out _, out var name)
            && name == kebab);

        if (handled is not null)
        {
            var triggered = model.Records
                .Where(record => record.Type == "use-case" && TriggerEvents(model, record).Contains(handled.Id))
                .ToList();

            if (triggered.Count == 1)
            {
                return triggered[0].Id;
            }

            if (triggered.Count > 1)
            {
                return null;
            }
        }

        var named = model.Records
            .Where(record => record.Type == "use-case"
                && Identifiers.TrySplit(record.Id, out _, out _, out var operation)
                && operation == kebab)
            .ToList();

        return named.Count == 1 ? named[0].Id : null;
    }

    private static bool Triggers(ProjectModel model, ScenarioInfo test, Record useCase)
    {
        var trigger = TriggerEvents(model, useCase);

        if (trigger.Count > 0)
        {
            var producers = model.Records
                .Where(record => record.Type == "use-case" && record.Ids("raises").Any(trigger.Contains))
                .Select(record => Identifiers.TrySplit(record.Id, out _, out _, out var name) ? name : null)
                .OfType<string>();

            if (producers.Any(producer => Belongs(test, producer) || Calls(model, test, producer)))
            {
                return true;
            }
        }

        var jobs = useCase.Ids("reachedThrough").Any(entry =>
            model.ById.TryGetValue(entry, out var point) && point.Field("kind") == "job");

        return jobs && test.Steps.Any(step =>
            step.Phase == "when"
            && model.Config.JobTriggerSteps.Any(trigger =>
                string.Equals(step.ReceiverType, trigger, StringComparison.Ordinal)
                || string.Equals(step.Receiver, trigger.EndsWith("Steps", StringComparison.Ordinal) ? trigger[..^"Steps".Length] : trigger, StringComparison.OrdinalIgnoreCase)));
    }

    /// <summary>
    ///     Whether a then step asserts an effect rather than only the outcome of a request: a step of a class
    ///     named in <c>proof.outcomeOnlySteps</c> states that a call succeeded or was refused, which a job or
    ///     a reaction does not answer, so it proves nothing about what the use case did.
    /// </summary>
    private static bool AssertsEffect(ProjectModel model, ScenarioInfo test) =>
        test.Steps.Any(step =>
            step.Phase == "then"
            && !model.Config.OutcomeOnlySteps.Any(only =>
                string.Equals(step.ReceiverType, only, StringComparison.Ordinal)
                || string.Equals(step.Receiver, only.EndsWith("Steps", StringComparison.Ordinal) ? only[..^"Steps".Length] : only, StringComparison.OrdinalIgnoreCase)));

    private static bool Belongs(ScenarioInfo test, string home)
    {
        var stepsClass = Naming.Pascal(home) + "Steps";

        return test.Steps.Any(step =>
            step.Phase == "when"
            && (string.Equals(step.ReceiverType, stepsClass, StringComparison.Ordinal)
                || string.Equals(step.Receiver, stepsClass[..^"Steps".Length], StringComparison.OrdinalIgnoreCase)));
    }

    private static bool Asserts(ScenarioInfo test, Record refusal) =>
        refusal.Field("code") is { } code && test.AssertedCodes.Contains(code);

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

        var scenarios = model.Records.Where(record => record.Type == "scenario").ToList();

        foreach (var useCase in model.Records.Where(record => record.Type == "use-case"))
        {
            if (!Identifiers.TrySplit(useCase.Id, out _, out _, out var name))
            {
                continue;
            }

            var own = scenarios.Where(scenario =>
                Identifiers.TrySplit(scenario.Id, out _, out var home, out _) && home == name).ToList();

            var verified = own.Count > 0;

            foreach (var scenario in own)
            {
                var links = model.Proves.Where(link => link.Claim == scenario.Id).ToList();

                if (links.Count == 0 || links.Any(link => !link.Confirmed || link.Passing != true))
                {
                    verified = false;
                    break;
                }
            }

            model.Status[useCase.Id] = new UseCaseStatus(
                implemented.Contains(useCase.Id), verified);
        }

        ComputeRequirementStatus(model);
        ComputeReachableStates(model);
    }

    /// <summary>
    ///     Computes each requirement's status: verified when everything fulfilling it is
    ///     verified and, for a measured requirement, when its check has a passing result.
    /// </summary>
    private static void ComputeRequirementStatus(ProjectModel model)
    {
        foreach (var requirement in model.Records.Where(record => record.Type == "requirement"))
        {
            var fulfillers = model.Records
                .Where(record => record.Type is "rule" or "use-case" or "journey"
                    && record.Ids("fulfills").Contains(requirement.Id, StringComparer.Ordinal))
                .ToList();

            var satisfied = fulfillers.Count > 0 && fulfillers.All(record => FulfillerVerified(model, record));
            bool? passed = null;

            if (requirement.Has("measure"))
            {
                passed = requirement.Field("check") is { Length: > 0 } check
                    && model.Measures.Any(measure => measure.Passed && CheckMatches(check, measure));
            }

            model.RequirementStatus[requirement.Id] = new RequirementStatus(
                satisfied && (passed is null || passed.Value),
                passed);
        }
    }

    private static bool FulfillerVerified(ProjectModel model, Record fulfiller) => fulfiller.Type switch
    {
        "use-case" => model.Status.TryGetValue(fulfiller.Id, out var status) && status.Verified,
        "rule" => model.Proves.Any(link => link.Claim == fulfiller.Id && link.Confirmed && link.Passing == true),
        "journey" => JourneyVerified(model, fulfiller),
        _ => false,
    };

    private static bool JourneyVerified(ProjectModel model, Record journey)
    {
        if (journey.Raw.ValueKind != JsonValueKind.Object
            || !journey.Raw.TryGetProperty("steps", out var steps))
        {
            return false;
        }

        var stepped = TargetsOf(steps)
            .Where(id => model.ById.TryGetValue(id, out var target) && target.Type == "use-case")
            .ToList();

        return stepped.Count > 0
            && stepped.All(id => model.Status.TryGetValue(id, out var status) && status.Verified);
    }

    /// <summary>Whether a measure result answers the requirement's check.</summary>
    private static bool CheckMatches(string check, MeasureResult measure) =>
        string.Equals(check, measure.Check, StringComparison.Ordinal)
        || string.Equals(check, $"{measure.Tool} {measure.Check}", StringComparison.Ordinal)
        || check.Contains(measure.Check, StringComparison.Ordinal);

    /// <summary>
    ///     Computes each aggregate's reachable states: every state a transition leads
    ///     into, plus every state a transition leaves that nothing leads into, which
    ///     starts its lifecycle.
    /// </summary>
    private static void ComputeReachableStates(ProjectModel model)
    {
        foreach (var aggregate in model.Records.Where(record => record.Type == "aggregate"))
        {
            var entered = new HashSet<string>(StringComparer.Ordinal);
            var left = new HashSet<string>(StringComparer.Ordinal);

            if (aggregate.Raw.ValueKind == JsonValueKind.Object
                && aggregate.Raw.TryGetProperty("transitions", out var transitions)
                && transitions.ValueKind == JsonValueKind.Array)
            {
                foreach (var transition in transitions.EnumerateArray())
                {
                    if (transition.ValueKind != JsonValueKind.Object)
                    {
                        continue;
                    }

                    if (transition.TryGetProperty("from", out var from)
                        && from.ValueKind == JsonValueKind.String
                        && from.GetString() is { Length: > 0 } start)
                    {
                        left.Add(start);
                    }

                    if (transition.TryGetProperty("to", out var to)
                        && to.ValueKind == JsonValueKind.String
                        && to.GetString() is { Length: > 0 } end)
                    {
                        entered.Add(end);
                    }
                }
            }

            left.ExceptWith(entered);
            entered.UnionWith(left);
            model.ReachableStates[aggregate.Id] = entered;
        }
    }
}

using System.Text.Json;

namespace LiteSpec.Model;

/// <summary>One computed implements link: code to a record.</summary>
sealed record ImplementsLink(string Path, string To, string Kind);

/// <summary>One computed calls link: a screen to a use case.</summary>
sealed record CallsLink(string Screen, string To, string Operation);

/// <summary>One computed proves link: a test to the record it claims.</summary>
sealed record ProvesLink(string Scenario, string Claim, bool Confirmed, bool? Passing, bool Indirect);

/// <summary>One use case's computed status.</summary>
sealed record UseCaseStatus(bool Implemented, bool Verified);

/// <summary>
///     One requirement's computed status: verified when everything fulfilling it is verified,
///     and, for a measured requirement, when its measure has a passing check.
///     <see cref="MeasurePassed"/> is null for a requirement with no measure or no result yet.
/// </summary>
sealed record RequirementStatus(bool Verified, bool? MeasurePassed);

/// <summary>One code location no scenario test reaches, read from scenario-only coverage.</summary>
sealed record CoverageGap(string File, int Line, string Member);

/// <summary>One result of a measured check, read from a k6, Lighthouse CI or ZAP result file.</summary>
sealed record MeasureResult(string Tool, string Check, bool Passed, string? Value, string Source);

/// <summary>One screen operation that resolves to no backend endpoint.</summary>
sealed record UnmatchedCall(string Screen, string Operation, string File);

/// <summary>
///     The project model: written records, read code, screens, tests, the test run,
///     computed links and per use case status.
/// </summary>
sealed class ProjectModel
{
    public ConsumerConfig Config { get; init; } = null!;
    public List<Finding> Problems { get; } = [];
    public List<Record> Records { get; } = [];
    public List<PageBody> Bodies { get; } = [];
    public IReadOnlySet<string> Provisions { get; set; } = new HashSet<string>(StringComparer.Ordinal);
    public CodeModel Code { get; set; } = new();
    public List<ScreenInfo> Screens { get; } = [];
    public List<ScenarioInfo> Tests { get; } = [];

    /// <summary>The generated-client operations each steps method calls, keyed by class and method.</summary>
    public IReadOnlyDictionary<string, IReadOnlySet<string>> StepCalls { get; set; } =
        new Dictionary<string, IReadOnlySet<string>>(StringComparer.Ordinal);
    public List<CodeComment> TestComments { get; } = [];
    public List<CodeComment> ScreenComments { get; } = [];
    public TestRun? TestRun { get; set; }
    public List<ImplementsLink> Implements { get; } = [];
    public List<CallsLink> Calls { get; } = [];
    public List<ProvesLink> Proves { get; } = [];
    public Dictionary<string, UseCaseStatus> Status { get; } = new(StringComparer.Ordinal);
    public Dictionary<string, string> EffectiveStatus { get; } = new(StringComparer.Ordinal);

    /// <summary>Refusal codes by the class whose literal carries them.</summary>
    public Dictionary<string, HashSet<string>> RefusalCodes { get; } = new(StringComparer.Ordinal);

    /// <summary>Per requirement, by id: verified from what fulfills it and from its measure.</summary>
    public Dictionary<string, RequirementStatus> RequirementStatus { get; } = new(StringComparer.Ordinal);

    /// <summary>Per aggregate, by id: the states some transition leads into, or that start its lifecycle.</summary>
    public Dictionary<string, IReadOnlySet<string>> ReachableStates { get; } = new(StringComparer.Ordinal);

    /// <summary>Code no scenario test reaches; empty when no scenario-only coverage file was read.</summary>
    public List<CoverageGap> UnreachedCode { get; } = [];

    /// <summary>Whether a scenario-only coverage file was read, so an empty <see cref="UnreachedCode"/> means something.</summary>
    public bool CoverageRead { get; set; }

    /// <summary>Results of measured checks read from tool result files.</summary>
    public List<MeasureResult> Measures { get; } = [];

    /// <summary>Screen operations that resolve to no endpoint.</summary>
    public List<UnmatchedCall> UnmatchedCalls { get; } = [];

    /// <summary>Records by id.</summary>
    public IReadOnlyDictionary<string, Record> ById =>
        _byId ??= Records
            .Where(record => record.Id.Length > 0)
            .GroupBy(record => record.Id, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.Ordinal);

    private IReadOnlyDictionary<string, Record>? _byId;

    /// <summary>Writes the model as JSON.</summary>
    public string ToJson()
    {
        var options = new JsonSerializerOptions { WriteIndented = true, NewLine = "\n" };

        using var stream = new MemoryStream();
        using (var writer = new Utf8JsonWriter(stream, new JsonWriterOptions { Indented = true }))
        {
            writer.WriteStartObject();
            writer.WriteNumber("version", 1);
            writer.WriteString("root", ".");

            writer.WriteStartArray("records");

            foreach (var record in Records.OrderBy(left => left.Id, StringComparer.Ordinal))
            {
                writer.WriteStartObject();
                writer.WriteString("type", record.Type);
                writer.WriteString("id", record.Id);
                writer.WriteString("title", record.Title);
                WriteNullable(writer, "owner", record.Owner);
                WriteNullable(writer, "status", record.Status);
                WriteNullable(writer, "effectiveStatus", EffectiveStatus.GetValueOrDefault(record.Id));
                WriteNullable(writer, "decider", record.Decider);
                WriteNullable(writer, "decideBy", record.DecideBy);

                if (record.Type == "use-case")
                {
                    WriteNullable(writer, "aggregate", ModelBuilder.AggregateOf(this, record)?.Id);
                }

                writer.WriteString("file", Config.Relative(record.File));
                writer.WriteNumber("line", record.Line);
                writer.WritePropertyName("fields");
                record.Raw.WriteTo(writer);
                writer.WritePropertyName("links");
                JsonSerializer.Serialize(writer, ModelBuilder.ResolvedLinks(this, record), options);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartObject("code");

            writer.WriteStartArray("handlers");

            foreach (var handler in Code.Handlers)
            {
                writer.WriteStartObject();
                writer.WriteString("useCase", handler.UseCaseId);
                writer.WriteString("operation", handler.Operation);
                writer.WriteString("kind", handler.Kind);
                writer.WriteString("path", Config.Relative(handler.File));
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("reactions");

            foreach (var reaction in Code.Reactions.Where(left => left.Kind == "reaction"))
            {
                writer.WriteStartObject();
                writer.WriteString("class", reaction.Class);
                writer.WriteString("path", Config.Relative(reaction.File));
                WriteNullable(writer, "useCase", reaction.UseCaseId);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("jobs");

            foreach (var job in Code.Reactions.Where(left => left.Kind == "job"))
            {
                writer.WriteStartObject();
                writer.WriteString("class", job.Class);
                writer.WriteString("path", Config.Relative(job.File));
                WriteNullable(writer, "useCase", job.UseCaseId);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("codes");

            foreach (var literal in Code.Literals.OrderBy(left => left.Value, StringComparer.Ordinal))
            {
                writer.WriteStartObject();
                writer.WriteString("code", literal.Value);
                writer.WriteString("path", Config.Relative(literal.File));
                WriteNullable(writer, "class", literal.Class);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("events");

            foreach (var domainEvent in Code.Events.OrderBy(left => left.Class, StringComparer.Ordinal))
            {
                writer.WriteStartObject();
                writer.WriteString("class", domainEvent.Class);
                writer.WriteString("path", Config.Relative(domainEvent.File));
                WriteNullable(writer, "event", domainEvent.EventId);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();
            writer.WriteEndObject();

            writer.WriteStartArray("screens");

            foreach (var screen in Screens)
            {
                writer.WriteStartObject();
                writer.WriteString("frontend", screen.Frontend);
                writer.WriteString("route", screen.Route);
                writer.WriteString("file", screen.File);
                writer.WriteStartArray("operations");

                foreach (var operation in screen.Operations)
                {
                    writer.WriteStartObject();
                    writer.WriteString("name", operation.Name);
                    writer.WriteString("method", operation.Method);
                    writer.WriteString("path", operation.Path);
                    writer.WriteEndObject();
                }

                writer.WriteEndArray();
                writer.WriteStartArray("useCases");

                foreach (var useCase in screen.UseCases)
                {
                    writer.WriteStringValue(useCase);
                }

                writer.WriteEndArray();
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("tests");

            foreach (var test in Tests)
            {
                writer.WriteStartObject();
                writer.WriteString("scenario", test.Name);
                writer.WriteString("class", test.Class);
                writer.WriteString("file", Config.Relative(test.File));
                writer.WriteNumber("line", test.Line);
                writer.WriteStartArray("claims");

                foreach (var claim in test.Claims)
                {
                    writer.WriteStringValue(claim);
                }

                writer.WriteEndArray();
                writer.WriteStartArray("steps");

                foreach (var step in test.Steps)
                {
                    writer.WriteStartObject();
                    writer.WriteString("phase", step.Phase);
                    writer.WriteString("receiver", step.Receiver);
                    WriteNullable(writer, "receiverType", step.ReceiverType);
                    writer.WriteString("method", step.Method);
                    writer.WriteEndObject();
                }

                writer.WriteEndArray();
                writer.WriteStartArray("codes");

                foreach (var code in test.Codes)
                {
                    writer.WriteStringValue(code);
                }

                writer.WriteEndArray();

                if (TestRun is not null && TestRun.OutcomeByMethod.TryGetValue(test.Name, out var outcome))
                {
                    writer.WriteString("outcome", outcome);
                }
                else
                {
                    writer.WriteNull("outcome");
                }

                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            if (TestRun is null)
            {
                writer.WriteNull("testRun");
            }
            else
            {
                writer.WriteStartObject("testRun");
                writer.WriteStartArray("files");

                foreach (var file in TestRun.Files)
                {
                    writer.WriteStringValue(file);
                }

                writer.WriteEndArray();
                writer.WriteNumber("total", TestRun.Total);
                writer.WriteNumber("passed", TestRun.Passed);
                writer.WriteNumber("failed", TestRun.Failed);
                writer.WriteEndObject();
            }

            writer.WriteStartObject("links");

            writer.WriteStartArray("implements");

            foreach (var link in Implements)
            {
                writer.WriteStartObject();
                writer.WriteString("path", link.Path);
                writer.WriteString("to", link.To);
                writer.WriteString("kind", link.Kind);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("calls");

            foreach (var link in Calls)
            {
                writer.WriteStartObject();
                writer.WriteString("screen", link.Screen);
                writer.WriteString("to", link.To);
                writer.WriteString("operation", link.Operation);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("proves");

            foreach (var link in Proves)
            {
                writer.WriteStartObject();
                writer.WriteString("scenario", link.Scenario);
                writer.WriteString("claim", link.Claim);
                writer.WriteBoolean("confirmed", link.Confirmed);

                if (link.Passing is null)
                {
                    writer.WriteNull("passing");
                }
                else
                {
                    writer.WriteBoolean("passing", link.Passing.Value);
                }

                writer.WriteBoolean("indirect", link.Indirect);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();
            writer.WriteEndObject();

            writer.WriteStartObject("status");

            foreach (var entry in Status.OrderBy(left => left.Key, StringComparer.Ordinal))
            {
                writer.WriteStartObject(entry.Key);
                writer.WriteBoolean("implemented", entry.Value.Implemented);
                writer.WriteBoolean("verified", entry.Value.Verified);
                writer.WriteEndObject();
            }

            writer.WriteEndObject();

            writer.WriteStartObject("requirementStatus");

            foreach (var entry in RequirementStatus.OrderBy(left => left.Key, StringComparer.Ordinal))
            {
                writer.WriteStartObject(entry.Key);
                writer.WriteBoolean("verified", entry.Value.Verified);

                if (entry.Value.MeasurePassed is null)
                {
                    writer.WriteNull("measurePassed");
                }
                else
                {
                    writer.WriteBoolean("measurePassed", entry.Value.MeasurePassed.Value);
                }

                writer.WriteEndObject();
            }

            writer.WriteEndObject();

            writer.WriteStartObject("reachableStates");

            foreach (var entry in ReachableStates.OrderBy(left => left.Key, StringComparer.Ordinal))
            {
                writer.WriteStartArray(entry.Key);

                foreach (var state in entry.Value.OrderBy(left => left, StringComparer.Ordinal))
                {
                    writer.WriteStringValue(state);
                }

                writer.WriteEndArray();
            }

            writer.WriteEndObject();

            if (CoverageRead)
            {
                writer.WriteStartArray("unreachedCode");

                foreach (var gap in UnreachedCode)
                {
                    writer.WriteStartObject();
                    writer.WriteString("path", Config.Relative(gap.File));
                    writer.WriteNumber("line", gap.Line);
                    writer.WriteString("member", gap.Member);
                    writer.WriteEndObject();
                }

                writer.WriteEndArray();
            }
            else
            {
                writer.WriteNull("unreachedCode");
            }

            writer.WriteStartArray("measures");

            foreach (var measure in Measures)
            {
                writer.WriteStartObject();
                writer.WriteString("tool", measure.Tool);
                writer.WriteString("check", measure.Check);
                writer.WriteBoolean("passed", measure.Passed);
                WriteNullable(writer, "value", measure.Value);
                writer.WriteString("source", Config.Relative(measure.Source));
                writer.WriteEndObject();
            }

            writer.WriteEndArray();

            writer.WriteStartArray("unmatchedCalls");

            foreach (var call in UnmatchedCalls)
            {
                writer.WriteStartObject();
                writer.WriteString("screen", call.Screen);
                writer.WriteString("operation", call.Operation);
                writer.WriteString("file", call.File);
                writer.WriteEndObject();
            }

            writer.WriteEndArray();
            writer.WriteEndObject();
        }

        return System.Text.Encoding.UTF8.GetString(stream.ToArray());
    }

    private static void WriteNullable(Utf8JsonWriter writer, string name, string? value)
    {
        if (value is null)
        {
            writer.WriteNull(name);
        }
        else
        {
            writer.WriteString(name, value);
        }
    }
}

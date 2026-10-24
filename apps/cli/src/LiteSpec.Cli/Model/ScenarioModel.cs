namespace LiteSpec.Model;

/// <summary>One step call inside a scenario.</summary>
sealed record ScenarioStep(string Phase, string Receiver, string? ReceiverType, string Method);

/// <summary>One acceptance scenario and what it claims.</summary>
sealed record ScenarioInfo(
    string Name,
    string Class,
    string File,
    int Line,
    IReadOnlyList<string> Claims,
    IReadOnlyList<ScenarioStep> Steps,
    IReadOnlyList<string> Codes,
    IReadOnlyList<int> Statuses,
    IReadOnlySet<string> Identifiers,
    IReadOnlyList<string> Routes,
    IReadOnlyList<string> AssertedCodes,
    bool HasAssertion,
    IReadOnlySet<string> CreatedTypes,
    IReadOnlySet<string> ResolvedServices,
    IReadOnlySet<string> StaticCalls);

/// <summary>What the test read found: scenarios and file comments.</summary>
sealed record TestRead(
    IReadOnlyList<ScenarioInfo> Scenarios,
    IReadOnlyList<CodeComment> Comments,
    IReadOnlyDictionary<string, IReadOnlySet<string>> StepCalls);

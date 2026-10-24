namespace LiteSpec.Model;

/// <summary>One use-case handler, read out of the folder path that registers it.</summary>
sealed record HandlerInfo(
    string UseCaseId,
    string Module,
    string Name,
    string Operation,
    string Kind,
    string File,
    string Class = "",
    int Line = 1,
    IReadOnlyList<CodeRepository>? Repositories = null,
    IReadOnlyList<CodeRefusal>? Refusals = null,
    IReadOnlyList<CodeThrown>? Thrown = null,
    IReadOnlyList<CodeDispatch>? Dispatches = null);

/// <summary>One reaction or job class.</summary>
sealed record ReactionInfo(
    string Class,
    string File,
    int Line,
    string Kind,
    string? UseCaseId,
    string? RecordId = null,
    IReadOnlyList<CodeRepository>? Repositories = null,
    IReadOnlyList<CodeRefusal>? Refusals = null,
    IReadOnlyList<CodeThrown>? Thrown = null,
    IReadOnlyList<CodeDispatch>? Dispatches = null);

/// <summary>One domain event class.</summary>
sealed record DomainEventInfo(string Class, string File, int Line, string? EventId);

/// <summary>
///     One refusal code literal in code. <paramref name="Declares" /> is true when the literal
///     sits where code declares a refusal code, so an unrecorded code is reported only there;
///     any literal still counts as evidence that a recorded code is thrown.
/// </summary>
sealed record CodeLiteral(string Value, string File, int Line, string? Class, bool Declares = true);

/// <summary>One comment in code, with its line.</summary>
sealed record CodeComment(string Text, string File, int Line);

/// <summary>One endpoint operation mapped to its use case.</summary>
sealed record EndpointOperation(string Operation, string UseCaseId, string Method, string Route, string File);

/// <summary>One repository interface a handler, reaction or job class takes in its constructor.</summary>
sealed record CodeRepository(string Interface, string File, int Line);

/// <summary>One refusal code a handler, reaction or job class produces in a declaring position.</summary>
sealed record CodeRefusal(string Code, string File, int Line);

/// <summary>One exception or failure type a handler, reaction or job class constructs.</summary>
sealed record CodeThrown(string Type, string File, int Line);

/// <summary>
///     One dispatch call a handler, reaction or job class makes. <paramref name="Verb" /> is
///     <c>issues</c>, <c>publishes</c>, <c>sends</c> or <c>calls</c>. <paramref name="Target" />
///     is the message type, the template key, or the port method. <paramref name="Detail" />
///     is the port type for <c>calls</c>, <c>type</c> or <c>template</c> for <c>sends</c>,
///     and empty otherwise. <paramref name="Via" /> names the helper <c>Type.Method</c> a
///     one-hop attribution found the dispatch through, or null for a direct dispatch.
/// </summary>
sealed record CodeDispatch(string Verb, string Target, string Detail, string File, int Line, string? Via = null);

/// <summary>What the backend source says.</summary>
sealed class CodeModel
{
    public List<HandlerInfo> Handlers { get; } = [];
    public List<ReactionInfo> Reactions { get; } = [];
    public List<DomainEventInfo> Events { get; } = [];
    public List<CodeLiteral> Literals { get; } = [];
    public List<CodeComment> Comments { get; } = [];
    public List<EndpointOperation> Endpoints { get; } = [];
}

namespace LiteSpec.Model;

/// <summary>One use-case handler, read out of the folder path that registers it.</summary>
sealed record HandlerInfo(
    string UseCaseId,
    string Module,
    string Name,
    string Operation,
    string Kind,
    string File);

/// <summary>One reaction or job class.</summary>
sealed record ReactionInfo(
    string Class,
    string File,
    int Line,
    string Kind,
    string? UseCaseId);

/// <summary>One domain event class.</summary>
sealed record DomainEventInfo(string Class, string File, int Line, string? EventId);

/// <summary>One failure code literal in code.</summary>
sealed record CodeLiteral(string Value, string File, int Line, string? Class);

/// <summary>One comment in code, with its line.</summary>
sealed record CodeComment(string Text, string File, int Line);

/// <summary>One endpoint operation mapped to its use case.</summary>
sealed record EndpointOperation(string Operation, string UseCaseId, string Method, string Route, string File);

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

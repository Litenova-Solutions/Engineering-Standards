namespace Litenova.Standards.Models;

internal sealed record RepositoryDocument(
    string RelativePath,
    DocumentMetadata Metadata,
    string Content,
    int WordCount,
    IReadOnlyList<DocumentRule> Rules);

internal sealed record DocumentRule(
    string Id,
    string Title,
    string Document,
    int Line);

internal sealed record ValidationIssue(
    string Code,
    string Message,
    string? Path = null);

internal sealed class ValidationReport
{
    private readonly List<ValidationIssue> _errors = [];
    private readonly List<ValidationIssue> _warnings = [];

    public IReadOnlyList<ValidationIssue> Errors => _errors;

    public IReadOnlyList<ValidationIssue> Warnings => _warnings;

    public bool IsValid => _errors.Count == 0;

    public void Error(string code, string message, string? path = null) =>
        _errors.Add(new ValidationIssue(code, message, path));

    public void Warning(string code, string message, string? path = null) =>
        _warnings.Add(new ValidationIssue(code, message, path));
}


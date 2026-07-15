namespace Litenova.Standards.Models;

internal sealed record UseCaseMetadata(
    string Id,
    string Kind,
    string Status,
    IReadOnlyList<string> Actors,
    IReadOnlyList<string> Surfaces,
    IReadOnlyList<string> Criticality,
    IReadOnlyList<string> Recipes);

internal sealed record FeatureMetadata(
    string Id,
    string Kind,
    string Status);

internal sealed record PageMetadata(
    string Id,
    string Kind,
    string App,
    string Route,
    IReadOnlyList<string> UseCases);

internal sealed record ConsumerUseCase(
    string Path,
    UseCaseMetadata Metadata,
    IReadOnlyList<string> AcceptanceCriteria);

internal sealed record ConsumerFeature(
    string Path,
    FeatureMetadata Metadata);

internal sealed record ConsumerPage(
    string Path,
    PageMetadata Metadata);

internal sealed record AcceptanceTrace(
    string Criterion,
    string UseCase,
    string UseCasePath,
    IReadOnlyList<string> TestFiles);


using Litenova.Standards.Models;

namespace Litenova.Standards.Services;

internal static class ContextResolver
{
    public static object Resolve(
        StandardsRepository repository,
        string task,
        string? projectPath,
        string? useCase)
    {
        if (!repository.Manifest.LoadPlans.TryGetValue(task, out var plan))
        {
            throw new InvalidOperationException($"Unknown task load plan: {task}.");
        }

        ProjectContract? project = null;
        if (!string.IsNullOrWhiteSpace(projectPath))
        {
            project = JsonSupport.ReadRequired<ProjectContract>(Path.GetFullPath(projectPath));
        }

        ConsumerUseCase? useCaseDocument = null;
        if (!string.IsNullOrWhiteSpace(useCase) && !string.IsNullOrWhiteSpace(projectPath))
        {
            useCaseDocument = ConsumerRepository.Load(projectPath).UseCases.SingleOrDefault(document =>
                string.Equals(document.Metadata.Id, useCase, StringComparison.Ordinal));
        }

        var recipeIds = (project?.Recipes ?? [])
            .Concat(useCaseDocument?.Metadata.Recipes ?? [])
            .Distinct(StringComparer.Ordinal)
            .OrderBy(id => id, StringComparer.Ordinal)
            .ToArray();

        var recipeEntries = recipeIds
            .Where(repository.Recipes.ContainsKey)
            .Select(id => repository.Recipes[id].Entry)
            .ToArray();

        return new
        {
            task,
            profile = project?.Profile ?? repository.Manifest.DefaultProfile,
            useCase,
            tier0 = plan.Tier0,
            tier1 = plan.Tier1,
            tier2 = plan.Tier2,
            recipes = recipeIds,
            recipeEntries,
        };
    }
}

using System.Text.RegularExpressions;
using Litenova.Standards.Models;

namespace Litenova.Standards.Services;

internal static partial class StandardsValidator
{
    public static ValidationReport Validate(StandardsRepository repository, string? projectPath = null)
    {
        var report = new ValidationReport();
        ValidateManifest(repository, report);
        ValidateDocuments(repository, report);
        ValidateLoadPlans(repository, report);
        ValidateRecipes(repository, report);

        if (!string.IsNullOrWhiteSpace(projectPath))
        {
            ValidateProject(repository, projectPath, report);
        }

        return report;
    }

    private static void ValidateManifest(StandardsRepository repository, ValidationReport report)
    {
        var manifest = repository.Manifest;
        if (manifest.SchemaVersion != 1)
        {
            report.Error("MANIFEST_SCHEMA", $"schemaVersion must be 1, found {manifest.SchemaVersion}.", "standards.manifest.json");
        }

        if (!VersionRegex().IsMatch(manifest.Version))
        {
            report.Error("MANIFEST_VERSION", $"Version {manifest.Version} is not valid SemVer.", "standards.manifest.json");
        }

        if (!manifest.Profiles.ContainsKey(manifest.DefaultProfile))
        {
            report.Error("MANIFEST_PROFILE", $"Default profile {manifest.DefaultProfile} is not declared.", "standards.manifest.json");
        }

        ValidateExistingPath(repository, manifest.AgentsEntry, "MANIFEST_PATH", report);
        foreach (var profile in manifest.Profiles.Values)
        {
            ValidateExistingPath(repository, profile.Entry, "PROFILE_ENTRY", report);
            foreach (var document in profile.Documents)
            {
                ValidateExistingPath(repository, document, "PROFILE_DOCUMENT", report);
            }
        }

        if (manifest.Budgets.AgentsMaxWords < 1 || manifest.Budgets.Tier1MaxWords < 1 ||
            manifest.Budgets.TaskMaxDocuments < 1 || manifest.Budgets.TaskMaxWords < 1)
        {
            report.Error("MANIFEST_BUDGET", "Every load budget must be greater than zero.", "standards.manifest.json");
        }
    }

    private static void ValidateDocuments(StandardsRepository repository, ValidationReport report)
    {
        foreach (var group in repository.Documents.GroupBy(document => document.Metadata.Id, StringComparer.Ordinal))
        {
            if (group.Count() > 1)
            {
                report.Error("DOCUMENT_ID", $"Document ID {group.Key} is used by: {string.Join(", ", group.Select(item => item.RelativePath))}.");
            }
        }

        var allRules = repository.Documents.SelectMany(document => document.Rules).ToArray();
        foreach (var group in allRules.GroupBy(rule => rule.Id, StringComparer.Ordinal))
        {
            if (group.Count() > 1)
            {
                report.Error("RULE_ID", $"Rule ID {group.Key} is used by: {string.Join(", ", group.Select(rule => $"{rule.Document}:{rule.Line}"))}.");
            }
        }

        foreach (var document in repository.Documents.Where(document => document.Metadata.Normative && document.Rules.Count == 0))
        {
            report.Error("NORMATIVE_RULES", "Normative documents must declare at least one rule heading.", document.RelativePath);
        }

        var agentsPath = Path.Combine(repository.Root, repository.Manifest.AgentsEntry);
        if (File.Exists(agentsPath))
        {
            var wordCount = WordRegex().Matches(File.ReadAllText(agentsPath)).Count;
            if (wordCount > repository.Manifest.Budgets.AgentsMaxWords)
            {
                report.Error("AGENTS_BUDGET", $"AGENTS.md has {wordCount} words; the limit is {repository.Manifest.Budgets.AgentsMaxWords}.", repository.Manifest.AgentsEntry);
            }
        }
    }

    private static void ValidateLoadPlans(StandardsRepository repository, ValidationReport report)
    {
        foreach (var (name, plan) in repository.Manifest.LoadPlans)
        {
            var taskDocuments = plan.Tier0.Concat(plan.Tier1).Concat(plan.Tier2).Distinct(StringComparer.Ordinal).ToArray();
            if (taskDocuments.Length > repository.Manifest.Budgets.TaskMaxDocuments)
            {
                report.Error("LOAD_DOCUMENT_BUDGET", $"Load plan {name} selects {taskDocuments.Length} documents; the limit is {repository.Manifest.Budgets.TaskMaxDocuments}.");
            }

            foreach (var path in taskDocuments)
            {
                ValidateExistingPath(repository, StripAnchor(path), "LOAD_PATH", report);
            }

            var tier1Words = CountWords(repository, plan.Tier1);
            if (tier1Words > repository.Manifest.Budgets.Tier1MaxWords)
            {
                report.Error("LOAD_TIER1_BUDGET", $"Load plan {name} Tier 1 has {tier1Words} words; the limit is {repository.Manifest.Budgets.Tier1MaxWords}.");
            }

            var taskWords = CountWords(repository, taskDocuments);
            if (taskWords > repository.Manifest.Budgets.TaskMaxWords)
            {
                report.Error("LOAD_WORD_BUDGET", $"Load plan {name} has {taskWords} words; the limit is {repository.Manifest.Budgets.TaskMaxWords}.");
            }
        }
    }

    private static void ValidateRecipes(StandardsRepository repository, ValidationReport report)
    {
        foreach (var (id, relativePath) in repository.Manifest.Recipes)
        {
            ValidateExistingPath(repository, relativePath, "RECIPE_PATH", report);
            if (!repository.Recipes.TryGetValue(id, out var recipe))
            {
                continue;
            }

            if (!string.Equals(id, recipe.Id, StringComparison.Ordinal))
            {
                report.Error("RECIPE_ID", $"Manifest recipe {id} loads a definition with ID {recipe.Id}.", relativePath);
            }

            ValidateExistingPath(repository, recipe.Entry, "RECIPE_ENTRY", report);
            foreach (var incompatible in recipe.IncompatibleWith)
            {
                if (!repository.Manifest.Recipes.ContainsKey(incompatible))
                {
                    report.Error("RECIPE_REFERENCE", $"Recipe {id} names unknown incompatible recipe {incompatible}.", relativePath);
                }
            }
        }
    }

    private static void ValidateProject(StandardsRepository repository, string projectPath, ValidationReport report)
    {
        var fullPath = Path.GetFullPath(projectPath);
        if (!File.Exists(fullPath))
        {
            report.Error("PROJECT_PATH", "Project contract does not exist.", projectPath);
            return;
        }

        ProjectContract project;
        try
        {
            project = JsonSupport.ReadRequired<ProjectContract>(fullPath);
        }
        catch (Exception exception) when (exception is IOException or InvalidDataException or System.Text.Json.JsonException)
        {
            report.Error("PROJECT_JSON", exception.Message, projectPath);
            return;
        }

        if (!repository.Manifest.Profiles.ContainsKey(project.Profile))
        {
            report.Error("PROJECT_PROFILE", $"Project selects unknown profile {project.Profile}.", projectPath);
        }

        foreach (var recipe in project.Recipes)
        {
            if (!repository.Manifest.Recipes.ContainsKey(recipe))
            {
                report.Error("PROJECT_RECIPE", $"Project selects unknown recipe {recipe}.", projectPath);
            }
        }

        foreach (var recipeId in project.Recipes)
        {
            if (!repository.Recipes.TryGetValue(recipeId, out var recipe))
            {
                continue;
            }

            foreach (var incompatible in recipe.IncompatibleWith.Intersect(project.Recipes, StringComparer.Ordinal))
            {
                report.Error("PROJECT_RECIPE_CONFLICT", $"Recipes {recipeId} and {incompatible} cannot be enabled together.", projectPath);
            }
        }

        var knownRules = repository.Documents.SelectMany(document => document.Rules).Select(rule => rule.Id).ToHashSet(StringComparer.Ordinal);
        foreach (var projectOverride in project.Overrides)
        {
            if (!knownRules.Contains(projectOverride.RuleId))
            {
                report.Error("PROJECT_OVERRIDE", $"Override names unknown rule {projectOverride.RuleId}.", projectPath);
            }
        }
    }

    private static int CountWords(StandardsRepository repository, IEnumerable<string> paths)
    {
        var total = 0;
        foreach (var relativePath in paths.Distinct(StringComparer.Ordinal))
        {
            var path = Path.Combine(repository.Root, StripAnchor(relativePath).Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(path))
            {
                total += WordRegex().Matches(File.ReadAllText(path)).Count;
            }
        }

        return total;
    }

    private static void ValidateExistingPath(StandardsRepository repository, string relativePath, string code, ValidationReport report)
    {
        var fullPath = Path.GetFullPath(Path.Combine(repository.Root, relativePath.Replace('/', Path.DirectorySeparatorChar)));
        if (!fullPath.StartsWith(repository.Root, StringComparison.OrdinalIgnoreCase))
        {
            report.Error(code, $"Path leaves the repository: {relativePath}.", relativePath);
            return;
        }

        if (!File.Exists(fullPath) && !Directory.Exists(fullPath))
        {
            report.Error(code, $"Path does not exist: {relativePath}.", relativePath);
        }
    }

    private static string StripAnchor(string path) => path.Split('#', 2)[0];

    [GeneratedRegex(@"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$")]
    private static partial Regex VersionRegex();

    [GeneratedRegex(@"[\p{L}\p{N}_'-]+")]
    private static partial Regex WordRegex();
}


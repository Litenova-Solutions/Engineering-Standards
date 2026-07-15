using System.Text.Json.Serialization;

namespace Litenova.Standards.Models;

internal sealed record Manifest(
    int SchemaVersion,
    string Version,
    string Name,
    string AgentsEntry,
    string DefaultProfile,
    ManifestPaths Paths,
    IReadOnlyDictionary<string, ProfileDefinition> Profiles,
    IReadOnlyDictionary<string, string> Recipes,
    IReadOnlyDictionary<string, string> Stack,
    PackageCatalog Packages,
    IReadOnlyDictionary<string, LoadPlan> LoadPlans,
    LoadBudgets Budgets,
    IReadOnlyList<string> GeneratedFiles);

internal sealed record ManifestPaths(
    string Docs,
    string Templates,
    string Recipes,
    string Generated);

internal sealed record ProfileDefinition(
    string Entry,
    IReadOnlyList<string> Documents);

internal sealed record PackageCatalog(
    IReadOnlyDictionary<string, string> Nuget,
    IReadOnlyDictionary<string, string> Npm);

internal sealed record LoadPlan(
    IReadOnlyList<string> Tier0,
    IReadOnlyList<string> Tier1,
    IReadOnlyList<string> Tier2);

internal sealed record LoadBudgets(
    int AgentsMaxWords,
    int Tier1MaxWords,
    int TaskMaxDocuments,
    int TaskMaxWords);

internal sealed record DocumentMetadata(
    string Id,
    string Kind,
    bool Normative,
    IReadOnlyList<string> AppliesTo,
    IReadOnlyList<string> Recipes);

internal sealed record ProjectContract(
    ProjectIdentity Project,
    string Profile,
    ProjectPaths Paths,
    IReadOnlyList<string> Recipes,
    IReadOnlyList<ProjectOverride> Overrides);

internal sealed record ProjectIdentity(string Name);

internal sealed record ProjectPaths(
    string ApiSolution,
    string DomainDocs,
    string UiDocs,
    IReadOnlyList<FrontendPath> Frontends);

internal sealed record FrontendPath(string Name, string Path);

internal sealed record ProjectOverride(string RuleId, string Decision);

internal sealed record RecipeDefinition(
    string Id,
    string Version,
    string Entry,
    IReadOnlyList<string> Triggers,
    IReadOnlyList<string> Replaces,
    RecipePackages Packages,
    IReadOnlyList<string> Projects,
    IReadOnlyList<string> CompatibleWith,
    IReadOnlyList<string> IncompatibleWith,
    IReadOnlyList<string> Gates);

internal sealed record RecipePackages(
    IReadOnlyList<string> Nuget,
    IReadOnlyList<string> Npm);


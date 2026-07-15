using System.Text.RegularExpressions;

namespace Litenova.Standards.Services;

internal static partial class UseCaseScaffolder
{
    public static void Scaffold(
        StandardsRepository standards,
        string projectPath,
        string feature,
        string name,
        string kind,
        string actor,
        string? title)
    {
        ValidateSlug(feature, "feature");
        ValidateSlug(name, "name");
        ValidateSlug(actor, "actor");
        if (kind is not ("command" or "query"))
        {
            throw new InvalidOperationException("Use-case kind must be command or query.");
        }

        var project = JsonSupport.ReadRequired<Models.ProjectContract>(Path.GetFullPath(projectPath));
        var projectRoot = Path.GetDirectoryName(Path.GetFullPath(projectPath))!;
        var featureDirectory = Path.Combine(
            projectRoot,
            project.Paths.DomainDocs.Replace('/', Path.DirectorySeparatorChar),
            feature);
        Directory.CreateDirectory(featureDirectory);

        var featurePath = Path.Combine(featureDirectory, "README.md");
        if (!File.Exists(featurePath))
        {
            var featureTemplate = File.ReadAllText(Path.Combine(standards.Root, "templates", "docs", "feature.md"));
            File.WriteAllText(featurePath, Replace(featureTemplate, new Dictionary<string, string>
            {
                ["__FEATURE__"] = feature,
                ["__TITLE__"] = ToTitle(feature),
            }));
        }

        var useCasePath = Path.Combine(featureDirectory, $"{name}.md");
        if (File.Exists(useCasePath))
        {
            throw new InvalidOperationException($"Use-case file already exists: {useCasePath}.");
        }

        var template = File.ReadAllText(Path.Combine(standards.Root, "templates", "docs", "use-case.md"));
        File.WriteAllText(useCasePath, Replace(template, new Dictionary<string, string>
        {
            ["__FEATURE__"] = feature,
            ["__USE_CASE__"] = name,
            ["__KIND__"] = kind,
            ["__ACTOR__"] = actor,
            ["__TITLE__"] = title ?? ToTitle(name),
            ["__FEATURE_ID__"] = ToAcceptanceSegment(feature),
            ["__USE_CASE_ID__"] = ToAcceptanceSegment(name),
        }));
    }

    private static string Replace(string content, IReadOnlyDictionary<string, string> replacements)
    {
        foreach (var (token, value) in replacements)
        {
            content = content.Replace(token, value, StringComparison.Ordinal);
        }

        return content.Replace("\r\n", "\n");
    }

    private static void ValidateSlug(string value, string option)
    {
        if (!SlugRegex().IsMatch(value))
        {
            throw new InvalidOperationException($"--{option} must use lowercase kebab-case.");
        }
    }

    private static string ToTitle(string slug) =>
        string.Join(' ', slug.Split('-').Select(word => char.ToUpperInvariant(word[0]) + word[1..]));

    private static string ToAcceptanceSegment(string slug) => slug.ToUpperInvariant();

    [GeneratedRegex(@"^[a-z][a-z0-9-]*$")]
    private static partial Regex SlugRegex();
}

using System.Text.RegularExpressions;

namespace Litenova.Standards.Services;

internal static partial class ProjectScaffolder
{
    public static void Scaffold(
        StandardsRepository standards,
        string name,
        string output,
        bool withWeb)
    {
        if (!ProjectNameRegex().IsMatch(name))
        {
            throw new InvalidOperationException("--name must be a PascalCase .NET identifier without dots or separators.");
        }

        output = Path.GetFullPath(output);
        if (Directory.Exists(output) && Directory.EnumerateFileSystemEntries(output).Any())
        {
            throw new InvalidOperationException($"Output directory is not empty: {output}.");
        }

        Directory.CreateDirectory(output);
        var templateRoot = Path.Combine(standards.Root, "templates", "project");
        var replacements = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["__PROJECT__"] = name,
            ["__PROJECT_LOWER__"] = name.ToLowerInvariant(),
            ["__PROJECT_SNAKE__"] = ToSnakeCase(name),
        };

        foreach (var sourcePath in Directory.EnumerateFiles(templateRoot, "*", SearchOption.AllDirectories))
        {
            var relativePath = Path.GetRelativePath(templateRoot, sourcePath).Replace('\\', '/');
            if (!withWeb && IsWebPath(relativePath))
            {
                continue;
            }

            var targetRelativePath = Replace(relativePath, replacements);
            if (targetRelativePath.EndsWith("gitignore.template", StringComparison.Ordinal))
            {
                targetRelativePath = targetRelativePath[..^"gitignore.template".Length] + ".gitignore";
            }

            var targetPath = Path.Combine(output, targetRelativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(targetPath)!);
            var content = Replace(File.ReadAllText(sourcePath), replacements).Replace("\r\n", "\n");
            File.WriteAllText(targetPath, content);
        }

        if (withWeb)
        {
            EnableWebFrontend(Path.Combine(output, "standards.project.json"));
        }
    }

    private static bool IsWebPath(string relativePath) =>
        relativePath.StartsWith("apps/web/", StringComparison.Ordinal) ||
        relativePath.StartsWith("packages/", StringComparison.Ordinal) ||
        relativePath is "package.json" or "pnpm-workspace.yaml" or "pnpm-lock.yaml";

    private static void EnableWebFrontend(string projectPath)
    {
        var content = File.ReadAllText(projectPath);
        content = content.Replace(
            "\"frontends\": []",
            "\"frontends\": [\n      { \"name\": \"web\", \"path\": \"apps/web\" }\n    ]",
            StringComparison.Ordinal);
        File.WriteAllText(projectPath, content);
    }

    private static string Replace(string value, IReadOnlyDictionary<string, string> replacements)
    {
        foreach (var (token, replacement) in replacements)
        {
            value = value.Replace(token, replacement, StringComparison.Ordinal);
        }

        return value;
    }

    private static string ToSnakeCase(string value) =>
        PascalBoundaryRegex().Replace(value, "${first}_${second}").ToLowerInvariant();

    [GeneratedRegex(@"^[A-Z][A-Za-z0-9]*$")]
    private static partial Regex ProjectNameRegex();

    [GeneratedRegex(@"(?<first>[a-z0-9])(?<second>[A-Z])")]
    private static partial Regex PascalBoundaryRegex();
}


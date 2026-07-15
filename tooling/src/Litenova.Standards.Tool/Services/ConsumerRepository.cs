using System.Text.Json;
using System.Text.RegularExpressions;
using Litenova.Standards.Models;

namespace Litenova.Standards.Services;

internal sealed partial class ConsumerRepository
{
    private static readonly HashSet<string> TestDirectoryNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "test",
        "tests",
        "e2e",
        "__tests__",
    };

    private static readonly HashSet<string> TestExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".cs",
        ".feature",
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
    };

    private static readonly HashSet<string> SkippedDirectoryNames = new(StringComparer.OrdinalIgnoreCase)
    {
        ".git",
        ".next",
        "bin",
        "node_modules",
        "obj",
        "standards",
    };

    private ConsumerRepository(
        string root,
        string projectPath,
        ProjectContract project,
        IReadOnlyList<ConsumerFeature> features,
        IReadOnlyList<ConsumerUseCase> useCases,
        IReadOnlyList<ConsumerPage> pages,
        IReadOnlyDictionary<string, IReadOnlyList<string>> testReferences)
    {
        Root = root;
        ProjectPath = projectPath;
        Project = project;
        Features = features;
        UseCases = useCases;
        Pages = pages;
        TestReferences = testReferences;
    }

    public string Root { get; }

    public string ProjectPath { get; }

    public ProjectContract Project { get; }

    public IReadOnlyList<ConsumerFeature> Features { get; }

    public IReadOnlyList<ConsumerUseCase> UseCases { get; }

    public IReadOnlyList<ConsumerPage> Pages { get; }

    public IReadOnlyDictionary<string, IReadOnlyList<string>> TestReferences { get; }

    public static ConsumerRepository Load(string projectPath)
    {
        projectPath = Path.GetFullPath(projectPath);
        var root = Path.GetDirectoryName(projectPath)
            ?? throw new InvalidOperationException("Project contract must have a parent directory.");
        var project = JsonSupport.ReadRequired<ProjectContract>(projectPath);
        var features = ReadFeatures(root, project.Paths.DomainDocs);
        var useCases = ReadUseCases(root, project.Paths.DomainDocs);
        var pages = ReadPages(root, project.Paths.UiDocs);
        var testReferences = ReadTestReferences(root);
        return new ConsumerRepository(root, projectPath, project, features, useCases, pages, testReferences);
    }

    private static IReadOnlyList<ConsumerFeature> ReadFeatures(string root, string domainDocs)
    {
        var directory = ResolveProjectPath(root, domainDocs);
        if (!Directory.Exists(directory))
        {
            return [];
        }

        return Directory.EnumerateFiles(directory, "README.md", SearchOption.AllDirectories)
            .Select(path => TryRead<FeatureMetadata>(root, path))
            .Where(item => item is not null && item.Value.Metadata.Kind == "feature")
            .Select(item => new ConsumerFeature(item!.Value.Path, item.Value.Metadata))
            .OrderBy(feature => feature.Metadata.Id, StringComparer.Ordinal)
            .ToArray();
    }

    private static IReadOnlyList<ConsumerUseCase> ReadUseCases(string root, string domainDocs)
    {
        var directory = ResolveProjectPath(root, domainDocs);
        if (!Directory.Exists(directory))
        {
            return [];
        }

        var useCases = new List<ConsumerUseCase>();
        foreach (var path in Directory.EnumerateFiles(directory, "*.md", SearchOption.AllDirectories))
        {
            if (Path.GetFileName(path).Equals("README.md", StringComparison.OrdinalIgnoreCase) ||
                Path.GetFileName(path).StartsWith("traceability", StringComparison.OrdinalIgnoreCase) ||
                Path.GetFileName(path).Equals("use-case-index.md", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var item = TryRead<UseCaseMetadata>(root, path);
            if (item is null || item.Value.Metadata.Kind is not ("command" or "query"))
            {
                continue;
            }

            var content = File.ReadAllText(path);
            var criteria = AcceptanceIdRegex().Matches(content)
                .Select(match => match.Value)
                .Distinct(StringComparer.Ordinal)
                .OrderBy(id => id, StringComparer.Ordinal)
                .ToArray();
            useCases.Add(new ConsumerUseCase(item.Value.Path, item.Value.Metadata, criteria));
        }

        return useCases.OrderBy(useCase => useCase.Metadata.Id, StringComparer.Ordinal).ToArray();
    }

    private static IReadOnlyList<ConsumerPage> ReadPages(string root, string uiDocs)
    {
        var directory = ResolveProjectPath(root, uiDocs);
        if (!Directory.Exists(directory))
        {
            return [];
        }

        return Directory.EnumerateFiles(directory, "*.md", SearchOption.AllDirectories)
            .Select(path => TryRead<PageMetadata>(root, path))
            .Where(item => item is not null && item.Value.Metadata.Kind == "page")
            .Select(item => new ConsumerPage(item!.Value.Path, item.Value.Metadata))
            .OrderBy(page => page.Metadata.Id, StringComparer.Ordinal)
            .ToArray();
    }

    private static IReadOnlyDictionary<string, IReadOnlyList<string>> ReadTestReferences(string root)
    {
        var references = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
        foreach (var path in EnumerateTestFiles(root))
        {
            var relativePath = Path.GetRelativePath(root, path).Replace('\\', '/');
            foreach (Match match in AcceptanceIdRegex().Matches(File.ReadAllText(path)))
            {
                if (!references.TryGetValue(match.Value, out var files))
                {
                    files = new HashSet<string>(StringComparer.Ordinal);
                    references[match.Value] = files;
                }

                files.Add(relativePath);
            }
        }

        return references.ToDictionary(
            pair => pair.Key,
            pair => (IReadOnlyList<string>)pair.Value.OrderBy(path => path, StringComparer.Ordinal).ToArray(),
            StringComparer.Ordinal);
    }

    private static IEnumerable<string> EnumerateTestFiles(string root)
    {
        var pending = new Stack<string>();
        pending.Push(root);
        while (pending.Count > 0)
        {
            var directory = pending.Pop();
            foreach (var child in Directory.EnumerateDirectories(directory))
            {
                if (!SkippedDirectoryNames.Contains(Path.GetFileName(child)))
                {
                    pending.Push(child);
                }
            }

            foreach (var file in Directory.EnumerateFiles(directory))
            {
                if (!TestExtensions.Contains(Path.GetExtension(file)) || !IsTestPath(root, file))
                {
                    continue;
                }

                yield return file;
            }
        }
    }

    private static bool IsTestPath(string root, string path)
    {
        var relative = Path.GetRelativePath(root, path);
        var segments = relative.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var fileName = Path.GetFileName(path);
        return segments.Any(TestDirectoryNames.Contains) ||
            segments.Any(segment => segment.EndsWith(".Tests", StringComparison.OrdinalIgnoreCase)) ||
            fileName.Contains(".test.", StringComparison.OrdinalIgnoreCase) ||
            fileName.Contains(".spec.", StringComparison.OrdinalIgnoreCase) ||
            Path.GetExtension(fileName).Equals(".feature", StringComparison.OrdinalIgnoreCase);
    }

    private static (string Path, T Metadata)? TryRead<T>(string root, string path)
    {
        var lines = File.ReadAllLines(path);
        if (lines.Length < 3 || lines[0] != "---")
        {
            return null;
        }

        var closingLine = Array.FindIndex(lines, 1, line => line == "---");
        if (closingLine < 2)
        {
            throw new InvalidDataException($"Frontmatter is not closed in {Path.GetRelativePath(root, path)}.");
        }

        var json = string.Join('\n', lines[1..closingLine]);
        var metadata = JsonSerializer.Deserialize<T>(json, JsonSupport.ReadOptions)
            ?? throw new InvalidDataException($"Frontmatter is invalid in {Path.GetRelativePath(root, path)}.");
        return (Path.GetRelativePath(root, path).Replace('\\', '/'), metadata);
    }

    private static string ResolveProjectPath(string root, string relativePath)
    {
        var path = Path.GetFullPath(Path.Combine(root, relativePath.Replace('/', Path.DirectorySeparatorChar)));
        var rootPrefix = root.EndsWith(Path.DirectorySeparatorChar) ? root : root + Path.DirectorySeparatorChar;
        if (!path.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidDataException($"Project path leaves the repository: {relativePath}.");
        }

        return path;
    }

    [GeneratedRegex(@"AC-[A-Z0-9]+(?:-[A-Z0-9]+)+")]
    private static partial Regex AcceptanceIdRegex();
}


using Litenova.Standards.Models;

namespace Litenova.Standards.Services;

internal sealed class StandardsRepository
{
    private static readonly string[] DocumentRoots =
    [
        "docs/core",
        "docs/profile",
        "docs/recipes",
        "docs/reference",
    ];

    private StandardsRepository(
        string root,
        Manifest manifest,
        IReadOnlyList<RepositoryDocument> documents,
        IReadOnlyDictionary<string, RecipeDefinition> recipes)
    {
        Root = root;
        Manifest = manifest;
        Documents = documents;
        Recipes = recipes;
    }

    public string Root { get; }

    public Manifest Manifest { get; }

    public IReadOnlyList<RepositoryDocument> Documents { get; }

    public IReadOnlyDictionary<string, RecipeDefinition> Recipes { get; }

    public static StandardsRepository Load(string root)
    {
        root = Path.GetFullPath(root);
        var manifestPath = Path.Combine(root, "standards.manifest.json");
        var manifest = JsonSupport.ReadRequired<Manifest>(manifestPath);
        var documents = ReadDocuments(root);
        var recipes = ReadRecipes(root, manifest);
        return new StandardsRepository(root, manifest, documents, recipes);
    }

    public static string FindRoot(string start)
    {
        var directory = new DirectoryInfo(Path.GetFullPath(start));
        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "standards.manifest.json")))
            {
                return directory.FullName;
            }

            var submoduleRoot = Path.Combine(directory.FullName, "standards");
            if (File.Exists(Path.Combine(submoduleRoot, "standards.manifest.json")))
            {
                return submoduleRoot;
            }

            directory = directory.Parent;
        }

        throw new DirectoryNotFoundException("Could not find standards.manifest.json in this directory or a parent directory.");
    }

    private static IReadOnlyList<RepositoryDocument> ReadDocuments(string root)
    {
        var documents = new List<RepositoryDocument>();
        foreach (var relativeRoot in DocumentRoots)
        {
            var documentRoot = Path.Combine(root, relativeRoot.Replace('/', Path.DirectorySeparatorChar));
            if (!Directory.Exists(documentRoot))
            {
                continue;
            }

            foreach (var path in Directory.EnumerateFiles(documentRoot, "*.md", SearchOption.AllDirectories))
            {
                documents.Add(FrontMatterReader.Read(root, path));
            }
        }

        return documents.OrderBy(document => document.RelativePath, StringComparer.Ordinal).ToArray();
    }

    private static IReadOnlyDictionary<string, RecipeDefinition> ReadRecipes(string root, Manifest manifest)
    {
        var recipes = new Dictionary<string, RecipeDefinition>(StringComparer.Ordinal);
        foreach (var (id, relativePath) in manifest.Recipes.OrderBy(pair => pair.Key, StringComparer.Ordinal))
        {
            var path = Path.Combine(root, relativePath.Replace('/', Path.DirectorySeparatorChar));
            if (!File.Exists(path))
            {
                continue;
            }

            recipes[id] = JsonSupport.ReadRequired<RecipeDefinition>(path);
        }

        return recipes;
    }
}

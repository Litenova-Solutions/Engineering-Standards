namespace LiteSpec.Analyzers.Rules;

/// <summary>A LiteSpec provision a diagnostic enforces, and its published address.</summary>
internal sealed class Provision
{
    /// <summary>The release the help links point at.</summary>
    public const string Release = "3.0.0";

    private Provision(string page, string slug)
    {
        Page = page;
        Slug = slug;
    }

    /// <summary>The page path under docs/, such as <c>backend/dotnet/domain</c>.</summary>
    public string Page { get; }

    /// <summary>The heading slug, such as <c>model-every-closed-set-of-domain-values-without-enums</c>.</summary>
    public string Slug { get; }

    /// <summary>The provision ID: <c>litespec/&lt;page&gt;#&lt;slug&gt;</c>.</summary>
    public string Id => $"litespec/{Page}#{Slug}";

    /// <summary>The provision on litespec.dev.</summary>
    public string HelpLink => $"https://litespec.dev/{Release}/{Page}/#{Slug}";

    public static Provision Of(string page, string slug) => new(page, slug);
}

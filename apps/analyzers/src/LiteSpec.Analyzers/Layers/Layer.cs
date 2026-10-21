namespace LiteSpec.Analyzers.Layers;

/// <summary>
///     The application project a compilation belongs to, as
///     litespec/backend/dotnet/architecture#use-five-application-projects names them.
/// </summary>
internal enum Layer
{
    /// <summary>Not one of the five projects, or opted out with <c>LiteSpecLayer=None</c>.</summary>
    None,
    Domain,
    ApplicationAbstractions,
    Application,
    Infrastructure,
    WebApi,
}

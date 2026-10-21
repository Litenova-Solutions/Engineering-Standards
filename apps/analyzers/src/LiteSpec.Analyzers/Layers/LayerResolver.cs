using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Layers;

/// <summary>
///     Finds the layer of a compilation: the <c>LiteSpecLayer</c> MSBuild property when the
///     project sets it, otherwise the assembly name suffix (<c>Shop.Domain</c> is Domain).
/// </summary>
internal static class LayerResolver
{
    /// <summary>The analyzer config key the package's build props make visible.</summary>
    public const string PropertyKey = "build_property.LiteSpecLayer";

    public static Layer Resolve(Compilation compilation, AnalyzerOptions options)
    {
        if (options.AnalyzerConfigOptionsProvider.GlobalOptions.TryGetValue(PropertyKey, out var declared)
            && !string.IsNullOrWhiteSpace(declared))
        {
            return Parse(declared.Trim());
        }

        return FromAssemblyName(compilation.AssemblyName ?? string.Empty);
    }

    /// <summary>Reads a declared layer name; an unknown name opts the project out.</summary>
    public static Layer Parse(string value)
    {
        switch (value.Replace(".", string.Empty).ToUpperInvariant())
        {
            case "DOMAIN": return Layer.Domain;
            case "APPLICATIONABSTRACTIONS": return Layer.ApplicationAbstractions;
            case "APPLICATION": return Layer.Application;
            case "INFRASTRUCTURE": return Layer.Infrastructure;
            case "WEBAPI": return Layer.WebApi;
            default: return Layer.None;
        }
    }

    /// <summary>Reads the layer from the last segments of an assembly name.</summary>
    public static Layer FromAssemblyName(string assemblyName)
    {
        if (EndsWithSegment(assemblyName, "Application.Abstractions")) return Layer.ApplicationAbstractions;
        if (EndsWithSegment(assemblyName, "Domain")) return Layer.Domain;
        if (EndsWithSegment(assemblyName, "Application")) return Layer.Application;
        if (EndsWithSegment(assemblyName, "Infrastructure")) return Layer.Infrastructure;
        if (EndsWithSegment(assemblyName, "WebApi")) return Layer.WebApi;
        return Layer.None;
    }

    private static bool EndsWithSegment(string name, string suffix) =>
        name.Equals(suffix, StringComparison.Ordinal)
        || name.EndsWith("." + suffix, StringComparison.Ordinal);
}

using System;
using System.Collections.Immutable;
using LiteSpec.Analyzers.Layers;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace LiteSpec.Analyzers.Rules.Layers;

/// <summary>LS2003: WebApi maps operations through endpoints, never through MVC controllers.</summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class ControllerAnalyzer : LayerAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        ImmutableArray.Create(Descriptors.LS2003);

    private protected override bool AppliesTo(Layer layer) => layer == Layer.WebApi;

    private protected override void Register(CompilationStartAnalysisContext context)
    {
        var controllerBase = context.Compilation.GetTypeByMetadataName("Microsoft.AspNetCore.Mvc.ControllerBase");
        var controller = context.Compilation.GetTypeByMetadataName("Microsoft.AspNetCore.Mvc.Controller");
        var apiController = context.Compilation.GetTypeByMetadataName("Microsoft.AspNetCore.Mvc.ApiControllerAttribute");
        context.RegisterSymbolAction(
            symbol => Analyze(symbol, controllerBase, controller, apiController), SymbolKind.NamedType);
    }

    private static void Analyze(
        SymbolAnalysisContext context,
        INamedTypeSymbol? controllerBase,
        INamedTypeSymbol? controller,
        INamedTypeSymbol? apiController)
    {
        var type = (INamedTypeSymbol)context.Symbol;
        if (type.TypeKind != TypeKind.Class)
        {
            return;
        }

        for (var current = type.BaseType; current != null; current = current.BaseType)
        {
            if (Is(current, controllerBase) || Is(current, controller))
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    Descriptors.LS2003, type.Locations[0], type.Name, current.Name));
                return;
            }
        }

        foreach (var attribute in type.GetAttributes())
        {
            if (Is(attribute.AttributeClass, apiController))
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    Descriptors.LS2003, type.Locations[0], type.Name, ShortName(attribute.AttributeClass!)));
                return;
            }
        }
    }

    private static bool Is(INamedTypeSymbol? candidate, INamedTypeSymbol? known) =>
        candidate != null && known != null
        && SymbolEqualityComparer.Default.Equals(candidate.OriginalDefinition, known);

    private static string ShortName(INamedTypeSymbol attribute)
    {
        var name = attribute.Name;
        const string suffix = "Attribute";
        return name.EndsWith(suffix, StringComparison.Ordinal)
            ? name.Substring(0, name.Length - suffix.Length)
            : name;
    }
}
